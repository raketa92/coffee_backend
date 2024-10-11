import { Order } from "src/domain/order/order";
import { OrderTable } from "../models/order";
import { Card } from "src/domain/order/card";
import { OrderItemTable } from "../models/orderItem";
import { OrderItem } from "src/domain/order/orderItem";
import { ProductTable } from "../models/product";
import { UniqueEntityID } from "src/core/UniqueEntityID";

export class OrderMapper {
  static toDomain(
    orderModel: OrderTable,
    orderItemModel: OrderItemTable[],
    productModel: ProductTable[]
  ): Order | null {
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

    const orderItems = orderItemModel
      .map((item) => {
        const currentProduct = productModel.find(
          (el) => el.guid.toString() === item.productGuid.toString()
        );
        if (!currentProduct) {
          return undefined;
        }

        return new OrderItem({
          quantity: item.quantity,
          productId: new UniqueEntityID(item.productGuid),
        });
      })
      .filter((el): el is OrderItem => el !== undefined);

    if (!orderItems.length) {
      return null;
    }

    const order = new Order({
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
    });
    return order;
  }
}
