import { Selectable, Insertable, Updateable } from "kysely";

export interface OrderItemTable {
  guid: string;
  orderGuid: string;
  quantity: number;
  productGuid: string;
}

export type OrderItemModel = Selectable<OrderItemTable>;
export type OrderItemCreateModel = Insertable<OrderItemTable>;
export type OrderItemUpdateModel = Updateable<OrderItemTable>;
