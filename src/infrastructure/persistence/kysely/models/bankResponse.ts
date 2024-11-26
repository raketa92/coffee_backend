import {
  Generated,
  Selectable,
  Insertable,
  Updateable,
  JSONColumnType,
} from "kysely";

export interface BankResponseTable {
  guid: string;
  paymentId: string;
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
export type BankResponseCreateModel = Insertable<BankResponseTable>;
export type BankResponseUpdateModel = Updateable<BankResponseTable>;
