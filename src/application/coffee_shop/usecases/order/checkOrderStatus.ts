import { UseCase } from "@/core/UseCase";
import { CheckOrderResponseDto } from "@/infrastructure/http/dto/order/orderResponseDto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IOrderRepository } from "@domain/order/repository/orderRepository";
import { BankService } from "@application/coffee_shop/ports/IBankService";
import { IPaymentRepository } from "@domain/payment/repository/IPaymentRepository";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "@application/coffee_shop/exception";
import { ICheckPaymentData } from "@/infrastructure/payment/bankService/dto/paymentDto";
import { OrderStatus, PaymentMethods } from "@/core/constants";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Kysely } from "kysely";
import { OrderMapper } from "@/infrastructure/persistence/kysely/mappers/orderMapper";
import { PaymentMapper } from "@/infrastructure/persistence/kysely/mappers/paymentMapper";
import { OrderDomainService } from "@/domain/order/service/OrderDomainService";

@Injectable()
export class CheckOrderUseCase
  implements UseCase<string, CheckOrderResponseDto>
{
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepisitory: IOrderRepository,
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    private readonly bankService: BankService,
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}

  public async execute(orderGuid: string): Promise<CheckOrderResponseDto> {
    try {
      const orderModel = await this.orderRepisitory.getOrder(orderGuid);
      if (!orderModel) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.order_not_found,
        });
      }

      if (orderModel.paymentMethod !== PaymentMethods.card) {
        return { status: orderModel.status };
      }

      if (
        [OrderStatus.completed, OrderStatus.canceled].includes(
          orderModel.status
        )
      ) {
        return { status: orderModel.status };
      }
      const order = OrderMapper.toDomain(orderModel);

      const paymentModel = await this.paymentRepository.getPayment(
        order.guid.toString()
      );
      if (!paymentModel) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.payment_not_found,
        });
      }

      const payment = PaymentMapper.toDomain(paymentModel);

      const bankPayload: ICheckPaymentData = {
        orderId: paymentModel.bankOrderId,
        language: "ru",
      };

      const bankResponse =
        await this.bankService.checkPaymentStatus(bankPayload);

      const newPaymentStatus = this.bankService.mapStatus(
        parseInt(bankResponse.errorCode),
        bankResponse.orderStatus
      );

      OrderDomainService.processPaymentStatus(payment, order, newPaymentStatus);

      await this.kysely.transaction().execute(async (trx) => {
        await Promise.all([
          this.orderRepisitory.saveOrder(order, trx),
          this.paymentRepository.save(payment, trx),
        ]);
      });

      return { status: order.status };
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.create_order_error,
      });
    }
  }
}
