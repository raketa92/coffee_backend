import { Inject, Injectable } from "@nestjs/common";
import { Kysely, Transaction } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { IOrderRepository } from "@/domain/order/repository/orderRepository";
import { Order } from "@domain/order/order";
import { DatabaseSchema } from "@infrastructure/persistence/kysely/database.schema";
import {
  OrderCreateModel,
  OrderModel,
  OrderModelFull,
} from "@infrastructure/persistence/kysely/models/order";
import { OrderItemCreateModel } from "@infrastructure/persistence/kysely/models/orderItem";
import { OrderItem } from "@domain/order/orderItem";
import { OrderFilterDto } from "@/infrastructure/http/dto/order/params";
import { OrderMapper } from "../mappers/orderMapper";

@Injectable()
export class OrderRepositoryImpl implements IOrderRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  async getOrder(orderNumber: string): Promise<OrderModelFull | null> {
    const query = this.kysely
      .selectFrom("Order")
      .selectAll("Order")
      .where("orderNumber", "=", orderNumber)
      .select((oi) =>
        jsonArrayFrom(
          oi
            .selectFrom("OrderItem")
            .whereRef("OrderItem.orderGuid", "=", "Order.guid")
            .selectAll("OrderItem")
            .select((p) =>
              jsonObjectFrom(
                p
                  .selectFrom("Product")
                  .limit(1)
                  .whereRef("Product.guid", "=", "OrderItem.productGuid")
                  .selectAll("Product")
              ).as("Product")
            )
        ).as("OrderItems")
      );

    const order = await query.executeTakeFirst();
    return order ?? null;
  }
  async getOrders(filter?: OrderFilterDto): Promise<OrderModelFull[] | null> {
    let query = this.kysely
      .selectFrom("Order")
      .selectAll("Order")
      .select((oi) =>
        jsonArrayFrom(
          oi
            .selectFrom("OrderItem")
            .whereRef("OrderItem.orderGuid", "=", "Order.guid")
            .selectAll("OrderItem")
            .select((p) =>
              jsonObjectFrom(
                p
                  .selectFrom("Product")
                  .limit(1)
                  .whereRef("Product.guid", "=", "OrderItem.productGuid")
                  .selectAll("Product")
              ).as("Product")
            )
        ).as("OrderItems")
      );

    if (filter?.orderNumbers) {
      query = query.where("orderNumber", "in", filter.orderNumbers);
    }

    const orders: OrderModelFull[] = await query.selectAll().execute();
    return orders;
  }
  async save(
    order: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<Order> {
    const orderModelData = OrderMapper.toDbModel(order);
    if (transaction) {
      // await this.insertOrder(transaction, orderModelData, order.orderItems);
      await this.saveOrder(order, transaction);
      await this.saveOrderItems(
        order.orderItems,
        orderModelData.guid,
        transaction
      );
    } else {
      await this.kysely.transaction().execute(async (trx) => {
        await this.saveOrder(order, trx);
        await this.saveOrderItems(order.orderItems, orderModelData.guid, trx);
        // const newOrder = await this.insertOrder(
        //   trx,
        //   orderModelData,
        //   order.orderItems
        // );
        // return newOrder;
      });
    }
    return order;
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
        productGuid: item.productGuid.toValue(),
      };
      return trx.insertInto("OrderItem").values(orderItemModelData).execute();
    });

    await Promise.all(orderItemPromises);

    return newOrder;
  }

  private async saveOrderItems(
    orderItems: OrderItem[],
    orderGuid: string,
    transaction: Transaction<DatabaseSchema>
  ): Promise<void> {
    const orderItemModels = orderItems.map((item) => ({
      guid: item.guid.toValue(),
      orderGuid,
      quantity: item.quantity,
      productGuid: item.productGuid.toValue(),
    }));

    await transaction.insertInto("OrderItem").values(orderItemModels).execute();
  }

  async saveOrder(
    order: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void> {
    const orderModelData = OrderMapper.toDbModel(order);
    const query = transaction || this.kysely;
    if (order.isDirty) {
      await query
        .updateTable("Order")
        .set(orderModelData)
        .where("guid", "=", order.guid.toValue())
        .executeTakeFirstOrThrow();
    } else {
      await query
        .insertInto("Order")
        .values(orderModelData)
        .executeTakeFirstOrThrow();
    }
  }
}
