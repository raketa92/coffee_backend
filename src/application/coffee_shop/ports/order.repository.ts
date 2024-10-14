import { Transaction } from "kysely";
import { Order } from "src/domain/order/order";
import { DatabaseSchema } from "src/infrastructure/persistence/kysely/database.schema";
import { OrderModel } from "src/infrastructure/persistence/kysely/models/order";

export abstract class OrderRepository {
  abstract save(
    data: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<OrderModel>;
}
