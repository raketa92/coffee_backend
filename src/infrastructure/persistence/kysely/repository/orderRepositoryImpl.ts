import { Inject, Injectable } from "@nestjs/common";
import { Kysely, Transaction } from "kysely";
import { OrderRepository } from "@application/coffee_shop/ports/order.repository";
import { Order } from "@domain/order/order";
import { DatabaseSchema } from "@infrastructure/persistence/kysely/database.schema";
import {
  OrderCreateModel,
  OrderModel,
} from "@infrastructure/persistence/kysely/models/order";
import { OrderItemCreateModel } from "@infrastructure/persistence/kysely/models/orderItem";
import { OrderItem } from "@domain/order/orderItem";

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  async save(
    data: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<OrderModel> {
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
    if (transaction) {
      return this.insertOrder(transaction, orderModelData, data.orderItems);
    } else {
      return await this.kysely.transaction().execute(async (trx) => {
        const newOrder = await this.insertOrder(
          trx,
          orderModelData,
          data.orderItems
        );
        return newOrder;
      });
    }
  }
  private async insertOrder(
    trx: Transaction<DatabaseSchema>,
    orderModelData: OrderCreateModel,
    orderItems: OrderItem[]
  ): Promise<OrderModel> {
    const newOrder = await trx
      .insertInto("Order")
      .values(orderModelData)
      .returningAll()
      .executeTakeFirstOrThrow();

    const orderItemPromises = orderItems.map((item) => {
      const orderItemModelData: OrderItemCreateModel = {
        guid: item.guid.toValue(),
        orderGuid: newOrder.guid,
        quantity: item.quantity,
        productGuid: item.productId.toValue(),
      };
      return trx.insertInto("OrderItem").values(orderItemModelData).execute();
    });

    await Promise.all(orderItemPromises);

    return newOrder;
  }
}
