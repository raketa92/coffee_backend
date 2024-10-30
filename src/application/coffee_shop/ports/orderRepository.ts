import { OrderFilterDto } from "@/infrastructure/http/dto/order/params";
import { OrderModelFull } from "@/infrastructure/persistence/kysely/models/order";
import { Transaction } from "kysely";
import { Order } from "src/domain/order/order";
import { DatabaseSchema } from "src/infrastructure/persistence/kysely/database.schema";

export abstract class OrderRepository {
  abstract save(
    data: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<Order>;

  abstract getOrders(filter?: OrderFilterDto): Promise<OrderModelFull[] | null>;
}
