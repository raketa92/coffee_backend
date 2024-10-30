import { Order } from "@domain/order/order";
import { OrderModelFull } from "@infrastructure/persistence/kysely/models/order";
import { Card } from "@domain/order/card";
import { OrderItem } from "@domain/order/orderItem";
import { UniqueEntityID } from "@core/UniqueEntityID";

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

    const orderItems = orderModel.OrderItems.map((item) => {
      const currentProduct = item.Product;
      if (!currentProduct) {
        return undefined;
      }

      return new OrderItem({
        quantity: item.quantity,
        productId: new UniqueEntityID(item.productGuid),
      });
    }).filter((el): el is OrderItem => el !== undefined);

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
    console.log(`✅  order:`, JSON.stringify(order));
    return order;
  }
}
