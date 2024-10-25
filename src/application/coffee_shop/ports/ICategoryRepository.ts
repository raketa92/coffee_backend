import { Category } from "@/domain/category/category";

export abstract class CategoryRepository {
  abstract getCategories(): Promise<Category[] | null>;
}
