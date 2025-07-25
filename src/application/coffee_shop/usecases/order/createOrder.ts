import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { UseCase } from "@core/UseCase";
import { IOrderRepository } from "@/domain/order/repository/orderRepository";
import { CreateOrderDto } from "@/infrastructure/http/dto/order/createOrderDto";
import { UniqueEntityID } from "@core/UniqueEntityID";
import {
  OrderStatus,
  PaymentMethods,
  PaymentStatus,
  PaytmentFor,
} from "@core/constants";
import { IBankService } from "@/application/shared/ports/IBankService";
import { Payment } from "@domain/payment/payment";
import { IPaymentRepository } from "@domain/payment/repository/IPaymentRepository";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { Order } from "@domain/order/order";
import { OrderItem } from "@domain/order/orderItem";
import { EnvService } from "@infrastructure/env";
import { DatabaseSchema } from "src/infrastructure/persistence/kysely/database.schema";
import { Kysely, Transaction } from "kysely";
import { CreateOrderResponseDto } from "@/infrastructure/http/dto/order/orderResponseDto";
import { UseCaseErrorMessage } from "@application/coffee_shop/exception";
import { IProductRepository } from "@domain/product/repository/IProductRepository";
import { IPaymentData } from "@/infrastructure/payment/bankService/dto/paymentDto";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";

@Injectable()
export class CreateOrderUseCase
  implements UseCase<CreateOrderDto, CreateOrderResponseDto>
{
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
    private readonly bankService: IBankService,
    private readonly configService: EnvService,
    private readonly redisService: RedisService,
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  public async execute(
    request: CreateOrderDto
  ): Promise<CreateOrderResponseDto> {
    try {
      const orderNumber = await this.redisService.generateOrderNumber();
      let formUrl: string | undefined;
      const orderGuid = randomUUID();

      const createdOrder = await this.kysely
        .transaction()
        .execute(async (trx) => {
          const newOrder = await this.createOrderEntity(
            request,
            orderGuid,
            orderNumber
          );
          await this.orderRepository.save(newOrder, trx);

          if (request.paymentMethod === PaymentMethods.card) {
            formUrl = await this.processPayment(newOrder, trx);
          }

          return newOrder;
        });

      const response: CreateOrderResponseDto = {
        guid: orderGuid,
        orderNumber,
        status: createdOrder.status,
        totalPrice: createdOrder.totalPrice,
        formUrl,
        deliveryTime: request.deliveryTime,
      };

      return response;
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.create_order_error,
      });
    }
  }

  private async processPayment(
    newOrder: Order,
    trx?: Transaction<DatabaseSchema>
  ): Promise<string> {
    const hostApi = this.configService.get("HOST_API");
    const returnUrl = `${hostApi}/order/status?orderNumber=${newOrder.orderNumber}&lang=${"ru"}`;
    const paymentData: IPaymentData = {
      currency: 934,
      language: "ru",
      orderNumber: newOrder.orderNumber,
      amount: parseInt((newOrder.totalPrice * 100).toFixed()),
      returnUrl,
    };
    const paymentResponse = await this.bankService.makePayment(paymentData);

    const newPayment = new Payment({
      paymentFor: PaytmentFor.product,
      status: PaymentStatus.waitingClientApproval,
      orderGuid: newOrder.guid,
      bankOrderId: paymentResponse.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
    });

    await this.paymentRepository.save(newPayment, trx);
    return paymentResponse.formUrl;
  }

  private async createOrderEntity(
    request: CreateOrderDto,
    orderGuid: string,
    orderNumber: string
  ) {
    const userId = request.userGuid
      ? new UniqueEntityID(request.userGuid)
      : null;
    const shopId = new UniqueEntityID(request.shopGuid);
    const status =
      request.paymentMethod === PaymentMethods.cash
        ? OrderStatus.pending
        : OrderStatus.waitingClientApproval;

    const productsFromDb = await this.productRepository.getProductsByGuids(
      request.orderItems.map((item) => item.productGuid)
    );

    const existingProductGuids = new Set(
      productsFromDb.map((item) => item.guid)
    );

    request.orderItems.forEach((item) => {
      if (!existingProductGuids.has(item.productGuid)) {
        throw new UseCaseError({
          code: UseCaseErrorCode.BAD_REQUEST,
          message: UseCaseErrorMessage.productNotExist(item.productGuid),
        });
      }
    });

    const orderProducts = request.orderItems.map((item) => {
      return new OrderItem({
        quantity: item.quantity,
        productGuid: new UniqueEntityID(item.productGuid),
      });
    });

    const newOrder = new Order(
      {
        orderNumber,
        userGuid: userId,
        shopGuid: shopId,
        phone: request.phone,
        address: request.address,
        totalPrice: request.totalPrice,
        status,
        paymentMethod: request.paymentMethod,
        orderItems: orderProducts,
        deliveryTime: request.deliveryTime,
      },
      new UniqueEntityID(orderGuid)
    );
    return newOrder;
  }
}
