import { ProductRepository } from "@/application/coffee_shop/ports/IProductRepository";
import { Product } from "@/domain/product/product";
import { Inject, Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { ProductMapper } from "../mappers/productMapper";

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  async getProducts(): Promise<Product[] | null> {
    const products = await this.kysely
      .selectFrom("Product")
      .selectAll()
      .execute();

    const result = products.map((item) => {
      return ProductMapper.toDomain(item);
    });
    return result;
  }
}
