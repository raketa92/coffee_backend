import { Generated, Selectable, Insertable, Updateable } from "kysely";
import { CardProvider, OrderStatus, PaymentMethods } from "@core/constants";
import { OrderItemModelFull } from "./orderItem";

export interface OrderTable {
  guid: string;
  orderNumber: string;
  userGuid?: string | null;
  shopGuid: string;
  phone: string;
  address: string;
  totalPrice: number;
  status: OrderStatus;
  paymentGuid?: string | null;
  paymentMethod: PaymentMethods;
  card?: CardModel | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type OrderModel = Selectable<OrderTable>;
export type OrderCreateModel = Insertable<OrderTable>;
export type OrderUpdateModel = Updateable<OrderTable>;

export type OrderModelFull = OrderModel & {
  shopName: string;
  shopRating: number;
  OrderItems: OrderItemModelFull[];
};

type CardModel = {
  cardNumber: string;
  month: number;
  year: number;
  name: string;
  cvv: number;
  cardProvider: CardProvider;
};
