import { CategoryRepository } from "@/application/coffee_shop/ports/ICategoryRepository";
import { Inject, Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { CategoryMapper } from "../mappers/categoryMapper";
import { Category } from "@/domain/category/category";

@Injectable()
export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}

  async getCategories(): Promise<Category[] | null> {
    const categories = await this.kysely
      .selectFrom("Category")
      .selectAll()
      .execute();

    const result = categories.map((item) => {
      return CategoryMapper.toDomain({
        guid: item.guid,
        name: item.name,
        iconUrl: item.iconUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    });

    return result;
  }
}
