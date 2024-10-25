import { Shop } from "@/domain/shop/shop";

export abstract class ShopRepository {
  abstract getShops(): Promise<Shop[] | null>;
}
