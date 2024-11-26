import { ProductFilterDto } from "@/infrastructure/http/dto/product/params";
import { ProductModel } from "@/infrastructure/persistence/kysely/models/product";

export interface IProductRepository {
  getProducts(filter?: ProductFilterDto): Promise<ProductModel[] | null>;
  getProductsByGuids(productGuids: string[]): Promise<{ guid: string }[]>;

  getProduct(productGuid: string): Promise<ProductModel | null>;
}

export const IProductRepository = Symbol("IProductRepository");
