import { Product } from "@/domain/product/product";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { ProductModel } from "../persistence/kysely/models/product";

export class ProductMapper {
  static toDomain(productModel: ProductModel): Product {
    return new Product(
      {
        name: productModel.name,
        image: productModel.image,
        price: productModel.price,
        categoryGuid: new UniqueEntityID(productModel.categoryGuid),
        shopGuid: new UniqueEntityID(productModel.shopGuid),
        rating: productModel.rating,
        ingredients: productModel.ingredients,
      },
      new UniqueEntityID(productModel.guid)
    );
  }
}
