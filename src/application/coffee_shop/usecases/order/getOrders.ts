import { UseCase } from "@/core/UseCase";
import { OrderResponseDto } from "@/infrastructure/http/dto/order/orderResponseDto";
import { OrderFilterDto } from "@/infrastructure/http/dto/order/filters";
import { Inject, Injectable } from "@nestjs/common";
import { IOrderRepository } from "@domain/order/repository/orderRepository";

@Injectable()
export class GetOrdersUseCase
  implements UseCase<OrderFilterDto, OrderResponseDto[] | null>
{
  constructor(
    @Inject(IOrderRepository) private readonly orderRepisitory: IOrderRepository
  ) {}

  public async execute(
    filter?: OrderFilterDto
  ): Promise<OrderResponseDto[] | null> {
    const orders = await this.orderRepisitory.getOrders(filter);
    if (!orders) {
      return null;
    }

    const response: OrderResponseDto[] = orders.map((item) => ({
      orderNumber: item.orderNumber,
      status: item.status,
      shopName: item.shopName,
      shopRating: item.shopRating,
      totalPrice: item.totalPrice,
      date: item.createdAt,
      OrderItems: item.OrderItems.map((item) => ({
        quantity: item.quantity,
        Product: {
          guid: item.Product?.guid,
          name: item.Product?.name,
          image: item.Product?.image,
          price: item.Product?.price,
          rating: item.Product?.rating,
          ingredients: item.Product?.ingredients ?? undefined,
        },
      })),
    }));

    return response;
  }
}
