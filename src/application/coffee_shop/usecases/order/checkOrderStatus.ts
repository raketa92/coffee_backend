import { UseCase } from "@/core/UseCase";
import { CheckOrderResponseDto } from "@/infrastructure/http/dto/order/orderResponseDto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IOrderRepository } from "@domain/order/repository/orderRepository";
import { BankService } from "@application/coffee_shop/ports/IBankService";
import { IPaymentRepository } from "@domain/payment/repository/IPaymentRepository";
import { UseCaseErrorMessage } from "@application/coffee_shop/exception";
import { ICheckPaymentData } from "@/infrastructure/payment/bankService/dto/paymentDto";
import { OrderStatus } from "@/core/constants";
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

  public async execute(orderNumber: string): Promise<CheckOrderResponseDto> {
    const orderModel = await this.orderRepisitory.getOrder(orderNumber);
    if (!orderModel) {
      throw new NotFoundException({
        message: UseCaseErrorMessage.order_not_found,
      });
    }
    if (
      [OrderStatus.completed, OrderStatus.canceled].includes(orderModel.status)
    ) {
      return { status: orderModel.status };
    }
    const order = OrderMapper.toDomain(orderModel);

    const paymentModel = await this.paymentRepository.getPayment(orderNumber);
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

    const bankResponse = await this.bankService.checkPaymentStatus(bankPayload);

    const newPaymentStatus = this.bankService.mapStatus(
      parseInt(bankResponse.errorCode),
      bankResponse.orderStatus
    );
    OrderDomainService.processPaymentStatus(payment, order, newPaymentStatus);

    await this.kysely.transaction().execute(async (trx) => {
      await Promise.all([
        this.orderRepisitory.save(order, trx),
        this.paymentRepository.save(payment, trx),
      ]);
    });

    return { status: order.status };
  }
}
