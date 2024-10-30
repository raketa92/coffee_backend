import { UseCase } from "@/core/UseCase";
import { OrderResponseDto } from "@/infrastructure/http/dto/order/orderResponseDto";
import { OrderFilterDto } from "@/infrastructure/http/dto/order/params";
import { Injectable } from "@nestjs/common";
import { OrderRepository } from "../../ports/orderRepository";

@Injectable()
export class GetOrdersUseCase
  implements UseCase<OrderFilterDto, OrderResponseDto[] | null>
{
  constructor(private readonly orderRepisitory: OrderRepository) {}

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
      OrderItems: item.OrderItems.map((item) => ({
        quantity: item.quantity,
        Product: {
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
