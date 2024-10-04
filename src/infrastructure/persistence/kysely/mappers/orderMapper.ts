import { Order } from "src/domain/order/order";
import { OrderTable } from "../models/order";
import { Card } from "src/domain/order/card";
import { CardTable } from "../models/card";
import { OrderItemTable } from "../models/orderItem";
import { OrderItem } from "src/domain/order/orderItem";
import { ProductTable } from "../models/product";
import { Product } from "src/domain/order/product";

export class OrderMapper {
  static toDomain(
    orderModel: OrderTable,
    cardModel: CardTable,
    orderItemModel: OrderItemTable[],
    productModel: ProductTable[]
  ): Order | null {
    const card = new Card({
      cardNumber: cardModel.cardNumber,
      month: cardModel.month,
      year: cardModel.year,
      name: cardModel.name,
      cvv: cardModel.cvv,
      cardProvider: cardModel.cardProvider,
    });

    const orderItems = orderItemModel
      .map((item) => {
        const currentProduct = productModel.find(
          (el) => el.guid.toString() === item.productGuid.toString()
        );
        if (!currentProduct) {
          return undefined;
        }

        const product = new Product({
          name: currentProduct.name,
          price: currentProduct.price,
          categoryId: currentProduct.categoryId,
          shopId: currentProduct.shopId,
          rating: currentProduct.rating,
          ingredients: currentProduct.ingredients,
        });

        return new OrderItem({
          orderGuid: item.orderGuid,
          quantity: item.quantity,
          product,
        });
      })
      .filter((el): el is OrderItem => el !== undefined);

    if (!orderItems.length) {
      return null;
    }

    const order = new Order({
      orderNumber: orderModel.orderNumber,
      userId: orderModel.userId,
      shopId: orderModel.shopId,
      phone: orderModel.phone,
      address: orderModel.address,
      totalPrice: orderModel.totalPrice,
      status: orderModel.status,
      paymentId: orderModel.paymentId,
      paymentMethod: orderModel.paymentMethod,
      card,
      orderItems,
    });
    return order;
  }
}
