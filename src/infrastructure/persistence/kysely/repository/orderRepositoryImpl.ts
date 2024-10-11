import { Inject, Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { OrderRepository } from "src/application/coffee_shop/ports/order.repository";
import { Order } from "src/domain/order/order";
import { DatabaseScema } from "../database.schema";
import { OrderCreateModel } from "../models/order";
import { OrderItemCreateModel } from "../models/orderItem";

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseScema>
  ) {}
  async save(data: Order): Promise<Order> {
    return await this.kysely.transaction().execute(async (trx) => {
      const orderModelData: OrderCreateModel = {
        guid: data.guid.toValue(),
        orderNumber: data.orderNumber,
        shopGuid: data.shopGuid.toValue(),
        userGuid: data.userGuid?.toValue(),
        phone: data.phone,
        address: data.address,
        totalPrice: data.totalPrice,
        status: data.status,
        paymentGuid: data.paymentGuid?.toValue(),
        paymentMethod: data.paymentMethod,
        card: data.card,
      };
      const newOrder = await trx
        .insertInto("Order")
        .values(orderModelData)
        .returningAll()
        .executeTakeFirstOrThrow();

      const orderItemPromises = [];
      for (const item of data.orderItems) {
        const orderItemModelData: OrderItemCreateModel = {
          guid: item.guid.toValue(),
          orderGuid: newOrder.guid,
          quantity: item.quantity,
          productGuid: item.productId.toValue(),
        };
        orderItemPromises.push(
          trx.insertInto("OrderItem").values(orderItemModelData).execute()
        );
      }
      await Promise.all(orderItemPromises);

      return data;
    });
  }
}
