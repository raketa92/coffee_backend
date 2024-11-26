import { UseCase } from "@/core/UseCase";
import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository } from "@/domain/product/repository/IProductRepository";
import { ProductResponseDto } from "@/infrastructure/http/dto/product/productsResponseDto";
import { ProductFilterDto } from "@/infrastructure/http/dto/product/params";

@Injectable()
export class GetProductsUseCase
  implements UseCase<ProductFilterDto, ProductResponseDto[] | null>
{
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository
  ) {}

  public async execute(
    filter?: ProductFilterDto
  ): Promise<ProductResponseDto[] | null> {
    const products = await this.productRepository.getProducts(filter);
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
