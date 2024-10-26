import { ProductRepository } from "@/application/coffee_shop/ports/IProductRepository";
import { Product } from "@/domain/product/product";
import { Inject, Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { ProductMapper } from "../mappers/productMapper";
import { ProductFilterDto } from "@/infrastructure/http/dto/product/params";

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  async getProducts(filter?: ProductFilterDto): Promise<Product[] | null> {
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

    const result = products.map((item) => {
      return ProductMapper.toDomain(item);
    });
    return result;
  }
}
