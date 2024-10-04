import { Selectable, Insertable, Updateable } from "kysely";
import { UniqueEntityID } from "src/core/UniqueEntityID";

export interface OrderItemTable {
  guid: UniqueEntityID;
  orderGuid: UniqueEntityID;
  quantity: number;
  productGuid: UniqueEntityID;
}

export type OrderItemModel = Selectable<OrderItemTable>;
export type OrderItemCreateModel = Insertable<OrderItemTable>;
export type OrderItemUpdateModel = Updateable<OrderItemTable>;
