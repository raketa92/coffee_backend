import { Product } from "@/domain/product/product";
import { ProductFilterDto } from "@/infrastructure/http/dto/product/params";

export abstract class ProductRepository {
  abstract getProducts(filter?: ProductFilterDto): Promise<Product[] | null>;
}
