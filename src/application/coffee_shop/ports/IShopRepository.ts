import { Shop } from "@/domain/shop/shop";
import { ShopModel } from "@/infrastructure/persistence/kysely/models/shop";

export abstract class ShopRepository {
  abstract getShops(): Promise<Shop[] | null>;
  abstract getShop(shopGuid: string): Promise<ShopModel | null>;
}
