import { Generated, Selectable, Insertable, Updateable } from "kysely";

export interface ProductTable {
  guid: string;
  name: string;
  price: number;
  categoryGuid: string;
  shopGuid: string;
  rating: number;
  ingredients: string[] | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type ProductModel = Selectable<ProductTable>;
export type ProductCreateModel = Insertable<ProductTable>;
export type ProductUpdateModel = Updateable<ProductTable>;
