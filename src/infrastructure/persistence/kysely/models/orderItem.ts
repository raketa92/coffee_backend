import { Selectable, Insertable, Updateable } from "kysely";
import { ProductModel } from "./product";

export interface OrderItemTable {
  guid: string;
  orderGuid: string;
  quantity: number;
  productGuid: string;
}

export type OrderItemModel = Selectable<OrderItemTable>;
export type OrderItemCreateModel = Insertable<OrderItemTable>;
export type OrderItemUpdateModel = Updateable<OrderItemTable>;

export type OrderItemModelFull = OrderItemModel & {
  Product: ProductModel | null;
};
