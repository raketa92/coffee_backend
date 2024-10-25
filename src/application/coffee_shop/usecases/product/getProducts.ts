import { UseCase } from "@/core/UseCase";
import { Injectable } from "@nestjs/common";
import { ProductRepository } from "@application/coffee_shop/ports/IProductRepository";
import { ProductResponseDto } from "@/infrastructure/http/dto/product/productsResponseDto";

@Injectable()
export class GetProductsUseCase
  implements UseCase<void, ProductResponseDto[] | null>
{
  constructor(private readonly productRepository: ProductRepository) {}

  public async execute(): Promise<ProductResponseDto[] | null> {
    const products = await this.productRepository.getProducts();
    if (!products) {
      return null;
    }

    const response: ProductResponseDto[] = products.map((item) => ({
      guid: item.guid.toString(),
      name: item.name,
      image: item.image,
      price: item.price,
      categoryGuid: item.categoryGuid.toString(),
      shopGuid: item.shopGuid.toString(),
      rating: item.rating,
      ingredients: item.ingredients,
    }));
    return response;
  }
}
