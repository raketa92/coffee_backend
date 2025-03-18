import { Order } from "@domain/order/order";
import {
  OrderCreateModel,
  OrderModelFull,
} from "@infrastructure/persistence/kysely/models/order";
import { Card } from "@domain/order/card";
import { OrderItem } from "@domain/order/orderItem";
import { UniqueEntityID } from "@core/UniqueEntityID";
import {
  OrderItemModel,
  OrderItemModelFull,
} from "../persistence/kysely/models/orderItem";

export class OrderMapper {
  static toDomain(orderModel: OrderModelFull): Order {
    let card = null;
    if (orderModel.card) {
      card = new Card({
        cardNumber: orderModel.card.cardNumber,
        month: orderModel.card.month,
        year: orderModel.card.year,
        name: orderModel.card.name,
        cvv: orderModel.card.cvv,
        cardProvider: orderModel.card.cardProvider,
      });
    }

    const orderItems = this.toOrderItemDomain(orderModel.OrderItems);

    const order = new Order(
      {
        orderNumber: orderModel.orderNumber,
        userGuid: orderModel.userGuid
          ? new UniqueEntityID(orderModel.userGuid)
          : null,
        shopGuid: new UniqueEntityID(orderModel.shopGuid),
        phone: orderModel.phone,
        address: orderModel.address,
        totalPrice: orderModel.totalPrice,
        status: orderModel.status,
        paymentGuid: orderModel.paymentGuid
          ? new UniqueEntityID(orderModel.paymentGuid)
          : null,
        paymentMethod: orderModel.paymentMethod,
        card,
        orderItems,
        deliveryDateTime: orderModel.deliveryDateTime,
      },
      new UniqueEntityID(orderModel.guid)
    );
    return order;
  }

  static toDbModel(order: Order): OrderCreateModel {
    const orderDbModel: OrderCreateModel = {
      guid: order.guid.toValue(),
      orderNumber: order.orderNumber,
      shopGuid: order.shopGuid.toValue(),
      userGuid: order.userGuid?.toValue(),
      phone: order.phone,
      address: order.address,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentGuid: order.paymentGuid?.toValue(),
      paymentMethod: order.paymentMethod,
      card: order.card,
      deliveryDateTime: order.deliveryDateTime,
    };

    return orderDbModel;
  }

  static toOrderItemDomain(orderModel: OrderItemModelFull[]): OrderItem[] {
    const orderItems = orderModel
      .map((item) => {
        const currentProduct = item.Product;
        if (!currentProduct) {
          return undefined;
        }

        return new OrderItem(
          {
            quantity: item.quantity,
            productGuid: new UniqueEntityID(item.productGuid),
          },
          new UniqueEntityID(item.guid)
        );
      })
      .filter((el): el is OrderItem => el !== undefined);
    return orderItems;
  }

  static toOrderItemDbModel(
    orderItems: OrderItem[],
    orderGuid: string
  ): OrderItemModel[] {
    const orderItemModels = orderItems.map((item) => ({
      guid: item.guid.toValue(),
      orderGuid,
      quantity: item.quantity,
      productGuid: item.productGuid.toValue(),
    }));
    return orderItemModels;
  }
}
