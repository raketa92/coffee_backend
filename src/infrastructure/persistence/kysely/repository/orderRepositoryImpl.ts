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
  OrderUpdateModel,
} from "@infrastructure/persistence/kysely/models/order";
import { OrderItemCreateModel } from "@infrastructure/persistence/kysely/models/orderItem";
import { OrderItem } from "@domain/order/orderItem";
import { OrderFilterDto } from "@/infrastructure/http/dto/order/filters";
import { OrderMapper } from "../mappers/orderMapper";

@Injectable()
export class OrderRepositoryImpl implements IOrderRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  async getOrder(orderGuid: string): Promise<OrderModelFull | null> {
    const query = this.kysely
      .selectFrom("Order")
      .innerJoin("Shop", "Shop.guid", "Order.shopGuid")
      .selectAll("Order")
      .select(["Shop.name as shopName", "Shop.rating as shopRating"])
      .where("Order.guid", "=", orderGuid)
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
      .innerJoin("Shop", "Shop.guid", "Order.shopGuid")
      .selectAll("Order")
      .select(["Shop.name as shopName", "Shop.rating as shopRating"])
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

    if (filter?.orderGuids) {
      query = query.where("guid", "in", filter.orderGuids);
    }

    const orders: OrderModelFull[] = await query.execute();
    return orders;
  }
  async save(
    order: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<Order> {
    const orderModelData = OrderMapper.toDbModel(order);

    if (transaction) {
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
    const orderItemModels = OrderMapper.toOrderItemDbModel(
      orderItems,
      orderGuid
    );

    await transaction.insertInto("OrderItem").values(orderItemModels).execute();
  }

  async saveOrder(
    order: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void> {
    const orderModelData = OrderMapper.toDbModel(order);
    const query = transaction || this.kysely;
    let updateData: OrderUpdateModel = {};
    if (order.changedFields.length) {
      updateData = order.changedFields.reduce(
        (acc, field) => {
          acc[field] = order[field as keyof Order];
          return acc;
        },
        {} as Record<string, any>
      );
    }

    if (order.changedFields.length) {
      await this.updateOrder(query, updateData, order.guid.toValue());
    } else {
      await this.upsertOrder(query, orderModelData);
    }
    order.clearChangedFields();
  }

  private async upsertOrder(
    query: Kysely<DatabaseSchema>,
    orderModelData: OrderCreateModel
  ) {
    await query
      .insertInto("Order")
      .values(orderModelData)
      .onConflict((conflict) =>
        conflict.column("guid").doUpdateSet(orderModelData)
      )
      .execute();
  }
  private async updateOrder(
    query: Kysely<DatabaseSchema>,
    updateData: OrderUpdateModel,
    orderGuid: string
  ) {
    await query
      .updateTable("Order")
      .set(updateData)
      .where("guid", "=", orderGuid)
      .execute();
  }
}
