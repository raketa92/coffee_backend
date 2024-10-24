import { Category } from "@/domain/category/category";
import { CategoryModel } from "../models/category";
import { UniqueEntityID } from "@/core/UniqueEntityID";

export class CategoryMapper {
  static toDomain(categoryModel: CategoryModel): Category {
    return new Category(
      {
        name: categoryModel.name,
        iconUrl: categoryModel.iconUrl,
        createdAt: categoryModel.createdAt,
        updatedAt: categoryModel.updatedAt,
      },
      new UniqueEntityID(categoryModel.guid)
    );
  }
}
