import { UniqueEntityID } from "@/core/UniqueEntityID";
import { ShopModel } from "../models/shop";
import { Shop } from "@/domain/shop/shop";

export class ShopMapper {
  static toDomain(shopModel: ShopModel): Shop {
    return new Shop(
      {
        name: shopModel.name,
        image: shopModel.image,
        rating: shopModel.rating,
      },
      new UniqueEntityID(shopModel.guid)
    );
  }
}
