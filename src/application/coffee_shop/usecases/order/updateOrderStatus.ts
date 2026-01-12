import { UseCaseEither } from "@/core/UseCase";
import {
  CheckOrderResponseDto,
  UpdateOrder,
} from "@/infrastructure/http/dto/order/orderResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import { IOrderRepository } from "@domain/order/repository/orderRepository";
import { UseCaseErrorMessage } from "@application/coffee_shop/exception";
import { OrderStatus, PaymentMethods } from "@/core/constants";
import {
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception/useCaseError";
import { OrderMapper } from "@/infrastructure/dataMappers/orderMapper";
import { Either, left, right } from "@/core/Either";
import { OrdersGateway } from "@/infrastructure/websocket/orders.gateway";

@Injectable()
export class UpdateOrderStatusUseCase
  implements UseCaseEither<UpdateOrder, CheckOrderResponseDto>
{
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepisitory: IOrderRepository,
    @Inject("IOrderStatusBroadcaster")
    private readonly orderGateway: OrdersGateway
  ) {}

  public async execute(
    payload: UpdateOrder
  ): Promise<Either<UseCaseError, CheckOrderResponseDto>> {
    const { orderGuid, status } = payload;
    const orderModel = await this.orderRepisitory.getOrder(orderGuid);
    if (!orderModel) {
      return left(
        new UseCaseError({
          code: UseCaseErrorCode.NOT_FOUND,
          message: UseCaseErrorMessage.order_not_found,
        })
      );
    }

    if (orderModel.paymentMethod !== PaymentMethods.card) {
      return right({ status: orderModel.status });
    }

    if (
      [OrderStatus.completed, OrderStatus.canceled].includes(orderModel.status)
    ) {
      return right({ status: orderModel.status });
    }
    const order = OrderMapper.toDomain(orderModel);

    order.changeStatus(status);
    await this.orderRepisitory.save(order);
    this.orderGateway.notifyOrderStatusChanged({
      orderGuid: order.guid,
      status,
      userGuid: order.userGuid,
    });

    return right({ status: order.status });
  }
}
