import { Inject, Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { Shop } from "@/domain/shop/shop";
import { ShopRepository } from "@/application/coffee_shop/ports/IShopRepository";
import { ShopMapper } from "../mappers/shopMapper";
import { ShopModel } from "../models/shop";

@Injectable()
export class ShopRepositoryImpl implements ShopRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  async getShop(shopGuid: string): Promise<ShopModel | null> {
    const shop = await this.kysely
      .selectFrom("Shop")
      .selectAll()
      .where("guid", "=", shopGuid)
      .executeTakeFirst();

    return shop ?? null;
  }
  async getShops(): Promise<Shop[] | null> {
    const shops = await this.kysely.selectFrom("Shop").selectAll().execute();

    const result = shops.map((item) => {
      return ShopMapper.toDomain(item);
    });
    return result;
  }
}
