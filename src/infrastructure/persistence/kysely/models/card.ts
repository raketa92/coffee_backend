import { Selectable, Insertable, Updateable } from "kysely";
import { CardProvider } from "src/core/constants";
import { UniqueEntityID } from "src/core/UniqueEntityID";

export interface CardTable {
  guid: UniqueEntityID;
  orderGuid: UniqueEntityID;
  cardNumber: string;
  month: number;
  year: number;
  name: string;
  cvv: number;
  cardProvider: CardProvider;
}

export type CardModel = Selectable<CardTable>;
export type CardCreateModel = Insertable<CardTable>;
export type CardUpdateModel = Updateable<CardTable>;
