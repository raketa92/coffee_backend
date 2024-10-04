import { Generated, Selectable, Insertable, Updateable } from "kysely";
import { OrderStatus, PaymentMethods } from "src/core/constants";
import { UniqueEntityID } from "src/core/UniqueEntityID";

export interface OrderTable {
  guid: UniqueEntityID;
  orderNumber: string;
  userId?: UniqueEntityID | null;
  shopId: UniqueEntityID;
  phone: string;
  address: string;
  totalPrice: number;
  status: OrderStatus;
  paymentId?: UniqueEntityID | null;
  paymentMethod: PaymentMethods;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type OrderModel = Selectable<OrderTable>;
export type OrderCreateModel = Insertable<OrderTable>;
export type OrderUpdateModel = Updateable<OrderTable>;
