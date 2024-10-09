import {
  Generated,
  Selectable,
  Insertable,
  Updateable,
  JSONColumnType,
} from "kysely";
import { UniqueEntityID } from "src/core/UniqueEntityID";

export interface BankResponseTable {
  guid: UniqueEntityID;
  paymentId: UniqueEntityID;
  errorCode: string | null;
  errorMessage: string | null;
  orderNumber: string;
  orderStatus: number;
  actionCode: number | null;
  amount: number;
  currency: string;
  date: string;
  ip: string | null;
  orderDescription: string | null;
  merchantOrderParams: string[] | null;
  attributes: string[] | null;
  cardAuthInfo: JSONColumnType<object> | null;
  authDateTime: string | null;
  terminalId: string | null;
  authRefNum: string | null;
  paymentAmountInfo: JSONColumnType<object> | null;
  bankInfo: JSONColumnType<object> | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type BankResponseModel = Selectable<BankResponseTable>;
export type OrderCreateModel = Insertable<BankResponseTable>;
export type OrderUpdateModel = Updateable<BankResponseTable>;
