import { ProductRepository } from "@/application/coffee_shop/ports/IProductRepository";
import { Inject, Injectable } from "@nestjs/common";
import { Kysely, Transaction } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { ProductFilterDto } from "@/infrastructure/http/dto/product/params";
import { ProductModel } from "../models/product";

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  async getProductsByGuids(
    productGuids: string[],
    transaction?: Transaction<DatabaseSchema>
  ): Promise<{ guid: string }[]> {
    if (transaction) {
      return await transaction
        .selectFrom("Product")
        .where("Product.guid", "in", productGuids)
        .select("Product.guid")
        .execute();
    } else {
      return await this.kysely
        .selectFrom("Product")
        .where("Product.guid", "in", productGuids)
        .select("Product.guid")
        .execute();
    }
  }
  async getProducts(filter?: ProductFilterDto): Promise<ProductModel[] | null> {
    let query = this.kysely.selectFrom("Product").selectAll();

    if (filter?.categoryGuid) {
      query = query.where("categoryGuid", "=", filter.categoryGuid);
    }

    if (filter?.shopGuid) {
      query = query.where("shopGuid", "=", filter.shopGuid);
    }

    if (!!filter?.isNew) {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);
      query = query.where("createdAt", ">", recentDate);
    }

    if (filter?.isPopular) {
      query = query.orderBy("rating", "desc");
    }

    const products = await query.execute();

    return products;
  }
}
