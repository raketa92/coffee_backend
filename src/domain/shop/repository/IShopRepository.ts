import { Shop } from "@/domain/shop/shop";
import { ShopModel } from "@/infrastructure/persistence/kysely/models/shop";

export interface IShopRepository {
  getShops(): Promise<Shop[] | null>;
  getShop(shopGuid: string): Promise<ShopModel | null>;
}

export const IShopRepository = Symbol("IShopRepository");
