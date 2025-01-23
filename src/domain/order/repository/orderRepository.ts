import { OrderFilterDto } from "@/infrastructure/http/dto/order/filters";
import { OrderModelFull } from "@/infrastructure/persistence/kysely/models/order";
import { Transaction } from "kysely";
import { Order } from "src/domain/order/order";
import { DatabaseSchema } from "src/infrastructure/persistence/kysely/database.schema";

export interface IOrderRepository {
  save(data: Order, transaction?: Transaction<DatabaseSchema>): Promise<Order>;
  saveOrder(
    data: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void>;
  getOrders(filter?: OrderFilterDto): Promise<OrderModelFull[] | null>;
  getOrder(orderNumber: string): Promise<OrderModelFull | null>;
}

export const IOrderRepository = Symbol("IOrderRepository");
