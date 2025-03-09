import { UniqueEntityID } from "@/core/UniqueEntityID";
import { Shop } from "@/domain/shop/shop";
import { ShopModel } from "../persistence/kysely/models/shop";

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
