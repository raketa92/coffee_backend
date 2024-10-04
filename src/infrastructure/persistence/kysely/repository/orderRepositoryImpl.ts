import { Inject, Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { OrderRepository } from "src/application/coffee_shop/ports/order.repository";
import { Order } from "src/domain/order/order";
import { DatabaseScema } from "../database.schema";
import { OrderCreateModel } from "../models/order";
import { CardCreateModel } from "../models/card";
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
        guid: data.guid,
        orderNumber: data.orderNumber,
        shopId: data.shopId,
        userId: data.userId,
        phone: data.phone,
        address: data.address,
        totalPrice: data.totalPrice,
        status: data.status,
        paymentId: data.paymentId,
        paymentMethod: data.paymentMethod,
      };
      const newOrder = await trx
        .insertInto("order")
        .values(orderModelData)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (data.card) {
        const cardModelData: CardCreateModel = {
          guid: data.card.guid,
          orderGuid: newOrder.guid,
          cardNumber: data.card.cardNumber,
          month: data.card.month,
          year: data.card.year,
          name: data.card.name,
          cvv: data.card.cvv,
          cardProvider: data.card.cardProvider,
        };
        await trx.insertInto("card").values(cardModelData).execute();
      }
      const orderItemPromises = [];
      for (const item of data.orderItems) {
        const orderItemModelData: OrderItemCreateModel = {
          guid: item.guid,
          orderGuid: newOrder.guid,
          quantity: item.quantity,
          productGuid: item.product.guid,
        };
        orderItemPromises.push(
          trx.insertInto("orderItems").values(orderItemModelData).execute()
        );
      }
      await Promise.all(orderItemPromises);

      return data;
    });
  }
}
