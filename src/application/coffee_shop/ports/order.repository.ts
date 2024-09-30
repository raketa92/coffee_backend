import { Order } from "src/domain/order/order";

export abstract class OrderRepository {
  abstract save(data: Order): Promise<Order>;
}
