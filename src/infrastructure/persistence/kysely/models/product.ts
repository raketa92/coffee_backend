import { Generated, Selectable, Insertable, Updateable } from "kysely";
import { UniqueEntityID } from "src/core/UniqueEntityID";

export interface ProductTable {
  guid: UniqueEntityID;
  name: string;
  price: number;
  categoryId: UniqueEntityID;
  shopId: UniqueEntityID;
  rating: number;
  ingredients: string[];
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type ProductModel = Selectable<ProductTable>;
export type ProductCreateModel = Insertable<ProductTable>;
export type ProductUpdateModel = Updateable<ProductTable>;
