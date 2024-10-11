import { Generated, Selectable, Insertable, Updateable } from "kysely";
import { CardProvider, PaytmentFor } from "src/core/constants";

export interface PaymentTable {
  guid: string;
  orderGuid: string;
  paymentFor: PaytmentFor;
  cardProvider: CardProvider;
  status: string;
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
