import { Product } from "@/domain/product/product";

export abstract class ProductRepository {
  abstract getProducts(): Promise<Product[] | null>;
}
