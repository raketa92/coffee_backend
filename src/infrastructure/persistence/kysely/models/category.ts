import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface CategoryTable {
  guid: string;
  name: string;
  iconUrl: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type CategoryModel = Selectable<CategoryTable>;
export type CategoryCreateModel = Insertable<CategoryTable>;
export type CategoryUpdateModel = Updateable<CategoryTable>;
