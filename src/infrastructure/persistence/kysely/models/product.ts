import { Generated, Selectable, Insertable, Updateable } from "kysely";
import { UniqueEntityID } from "@core/UniqueEntityID";

export interface ProductTable {
  guid: UniqueEntityID;
  name: string;
  price: number;
  categoryGuid: UniqueEntityID;
  shopGuid: UniqueEntityID;
  rating: number;
  ingredients: string[] | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type ProductModel = Selectable<ProductTable>;
export type ProductCreateModel = Insertable<ProductTable>;
export type ProductUpdateModel = Updateable<ProductTable>;
