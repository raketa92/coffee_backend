import { Category } from "@/domain/category/category";

export interface ICategoryRepository {
  getCategories(): Promise<Category[] | null>;
}

export const ICategoryRepository = Symbol("ICategoryRepository");
