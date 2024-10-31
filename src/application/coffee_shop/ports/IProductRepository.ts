import { ProductFilterDto } from "@/infrastructure/http/dto/product/params";
import { ProductModel } from "@/infrastructure/persistence/kysely/models/product";

export abstract class ProductRepository {
  abstract getProducts(
    filter?: ProductFilterDto
  ): Promise<ProductModel[] | null>;
  abstract getProductsByGuids(
    productGuids: string[]
  ): Promise<{ guid: string }[]>;
}
