import { OrderStatus } from "src/core/constants";

export class CreateOrderResponseDto {
  orderNumber: string;
  status: OrderStatus;
  constructor(orderNumber: string, status: OrderStatus) {
    this.orderNumber = orderNumber;
    this.status = status;
  }
}
