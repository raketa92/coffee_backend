import { Generated, Selectable, Insertable, Updateable } from "kysely";
import { CardProvider, PaytmentFor } from "src/core/constants";
import { UniqueEntityID } from "src/core/UniqueEntityID";

export interface PaymentTable {
  guid: UniqueEntityID;
  paymentFor: PaytmentFor;
  cardProvider: CardProvider;
  status: string;
  orderNumber: string;
  bankOrderId: string;
  amount: number;
  currency: number;
  description?: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type PaymentModel = Selectable<PaymentTable>;
export type PaymentCreateModel = Insertable<PaymentTable>;
export type PaymentUpdateModel = Updateable<PaymentTable>;
