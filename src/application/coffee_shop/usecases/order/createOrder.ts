import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@core/UseCase";
import { OrderRepository } from "@/application/coffee_shop/ports/orderRepository";
import { CreateOrderDto } from "@/infrastructure/http/dto/order/createOrderDto";
import { UniqueEntityID } from "@core/UniqueEntityID";
import { OrderStatus, PaymentMethods, PaytmentFor } from "@core/constants";
import { Card } from "@domain/order/card";
import { BankService } from "@application/coffee_shop/ports/IBankService";
import { PaymentDto } from "@infrastructure/payment/bankService/dto/paymentDto";
import { Payment } from "@domain/payment/payment";
import { PaymentRepository } from "../../ports/IPaymentRepository";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { Order } from "@domain/order/order";
import { OrderItem } from "@domain/order/orderItem";
import { EnvService } from "@infrastructure/env";
import { DatabaseSchema } from "src/infrastructure/persistence/kysely/database.schema";
import { Kysely, Transaction } from "kysely";
import { CreateOrderResponseDto } from "@/infrastructure/http/dto/order/orderResponseDto";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "@application/coffee_shop/exception";
import { ProductRepository } from "../../ports/IProductRepository";

@Injectable()
export class CreateOrderUseCase
  implements UseCase<CreateOrderDto, CreateOrderResponseDto>
{
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly productRepository: ProductRepository,
    private readonly bankService: BankService,
    private readonly configService: EnvService,
    private readonly redisService: RedisService,
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  public async execute(
    request?: CreateOrderDto
  ): Promise<CreateOrderResponseDto> {
    try {
      if (!request) {
        throw new UseCaseError({
          code: UseCaseErrorCode.BAD_REQUEST,
          message: UseCaseErrorMessage.payload_required,
        });
      }

      const orderNumber = await this.redisService.generateOrderNumber();

      const createdOrder = await this.kysely
        .transaction()
        .execute(async (trx) => {
          const newOrder = await this.createOrderEntity(request, orderNumber);
          await this.orderRepository.save(newOrder, trx);

          if (request.paymentMethod === PaymentMethods.card) {
            await this.processPayment(newOrder, trx);
          }

          return newOrder;
        });

      const response: CreateOrderResponseDto = {
        orderNumber,
        status: createdOrder.status,
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
  ) {
    const hostApi = this.configService.get("HOST_API");
    const returnUrl = `${hostApi}/payment-service/orderStatus?orderNumber=${newOrder.orderNumber}&lang=${"ru"}`;
    const USERNAME = this.configService.get("HALK_BANK_LOGIN");
    const PASSWORD = this.configService.get("HALK_BANK_PASSWORD");
    const paymentData: PaymentDto = {
      currency: 934,
      language: "ru",
      orderNumber: newOrder.orderNumber,
      userName: USERNAME,
      password: PASSWORD,
      amount: parseInt((newOrder.totalPrice * 100).toFixed()),
      returnUrl,
    };
    const paymentResponse = await this.bankService.makePayment(paymentData);

    const newPayment = new Payment({
      paymentFor: PaytmentFor.product,
      cardProvider: newOrder.card!.cardProvider,
      status: OrderStatus.waitingClientApproval,
      orderGuid: newOrder.guid,
      bankOrderId: paymentResponse.data.bankOrderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
    });

    await this.paymentRepository.save(newPayment, trx);
  }

  private async createOrderEntity(
    request: CreateOrderDto,
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
        productId: new UniqueEntityID(item.productGuid),
      });
    });

    let orderCard = null;
    if (request.card && request.paymentMethod === PaymentMethods.card) {
      const { card } = request;
      orderCard = new Card({
        cardNumber: card.cardNumber,
        month: card.month,
        year: card.year,
        name: card.name,
        cvv: card.cvv,
        cardProvider: card.cardProvider,
      });
    }

    const newOrder = new Order({
      orderNumber,
      userGuid: userId,
      shopGuid: shopId,
      phone: request.phone,
      address: request.address,
      totalPrice: request.totalPrice,
      status,
      paymentMethod: request.paymentMethod,
      card: orderCard,
      orderItems: orderProducts,
    });
    return newOrder;
  }
}
