import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@core/UseCase";
import { OrderRepository } from "@application/coffee_shop/ports/order.repository";
import { CreateOrderDto } from "@infrastructure/http/dto/createOrderDto";
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
import { CreateOrderResponseDto } from "src/infrastructure/http/dto/createOrderResponseDto";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { LoggerService } from "src/infrastructure/logger/logger";

@Injectable()
export class CreateOrderUseCase
  implements UseCase<CreateOrderDto, CreateOrderResponseDto>
{
  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private bankService: BankService,
    private configService: EnvService,
    private redisService: RedisService,
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>,
    private readonly logger: LoggerService
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
          const newOrder = this.createOrderEntity(request, orderNumber);
          await this.orderRepository.save(newOrder, trx);

          if (request.paymentMethod === PaymentMethods.card) {
            await this.processPayment(newOrder, trx);
          }

          return newOrder;
        });

      return new CreateOrderResponseDto(orderNumber, createdOrder.status);
    } catch (error) {
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

  private createOrderEntity(request: CreateOrderDto, orderNumber: string) {
    const userId = request.userId ? new UniqueEntityID(request.userId) : null;
    const shopId = new UniqueEntityID(request.shopId);
    const status =
      request.paymentMethod === PaymentMethods.cash
        ? OrderStatus.pending
        : OrderStatus.waitingClientApproval;

    const orderProducts = request.orderItems.map((item) => {
      return new OrderItem({
        quantity: item.quantity,
        productId: new UniqueEntityID(item.productId),
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
