import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface ShopTable {
  guid: string;
  name: string;
  image: string;
  rating: number;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type ShopModel = Selectable<ShopTable>;
export type ShopCreateModel = Insertable<ShopTable>;
export type ShopUpdateModel = Updateable<ShopTable>;
