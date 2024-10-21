import { UniqueEntityID } from "@/core/UniqueEntityID";
import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface CategoryTable {
  guid: UniqueEntityID;
  name: string;
  iconUrl: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type CategoryModel = Selectable<CategoryTable>;
export type CategoryCreateModel = Insertable<CategoryTable>;
export type CategoryUpdateModel = Updateable<CategoryTable>;
