import { Category } from "@/domain/category/category";

export abstract class CategoryRepository {
  getCategories: () => Promise<Category[] | null>;
}
