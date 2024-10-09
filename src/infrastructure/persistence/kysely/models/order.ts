import { Generated, Selectable, Insertable, Updateable } from "kysely";
import { CardProvider, OrderStatus, PaymentMethods } from "src/core/constants";
import { UniqueEntityID } from "src/core/UniqueEntityID";

export interface OrderTable {
  guid: UniqueEntityID;
  orderNumber: string;
  userGuid?: UniqueEntityID | null;
  shopGuid: UniqueEntityID;
  phone: string;
  address: string;
  totalPrice: number;
  status: OrderStatus;
  paymentGuid?: UniqueEntityID | null;
  paymentMethod: PaymentMethods;
  card?: CardModel | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type OrderModel = Selectable<OrderTable>;
export type OrderCreateModel = Insertable<OrderTable>;
export type OrderUpdateModel = Updateable<OrderTable>;

type CardModel = {
  cardNumber: string;
  month: number;
  year: number;
  name: string;
  cvv: number;
  cardProvider: CardProvider;
};
