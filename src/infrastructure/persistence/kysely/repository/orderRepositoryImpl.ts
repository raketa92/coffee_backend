import { Inject, Injectable } from "@nestjs/common";
import { Kysely, Transaction } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { OrderRepository } from "@/application/coffee_shop/ports/orderRepository";
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

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
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
    data: Order,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<Order> {
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
      await this.insertOrder(transaction, orderModelData, data.orderItems);
    } else {
      await this.kysely.transaction().execute(async (trx) => {
        const newOrder = await this.insertOrder(
          trx,
          orderModelData,
          data.orderItems
        );
        return newOrder;
      });
    }
    return data;
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
