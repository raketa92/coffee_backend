import { UseCase } from "@/core/UseCase";
import { ProductRepository } from "@application/coffee_shop/ports/IProductRepository";
import { ProductResponseDto } from "@/infrastructure/http/dto/product/productsResponseDto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../exception";

@Injectable()
export class GetProductUseCase implements UseCase<string, ProductResponseDto> {
  constructor(private readonly productRepository: ProductRepository) {}

  public async execute(productGuid: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.getProduct(productGuid);
    if (!product) {
      throw new NotFoundException({
        message: UseCaseErrorMessage.product_not_found,
      });
    }

    const response: ProductResponseDto = {
      guid: product.guid.toString(),
      name: product.name,
      image: product.image,
      price: product.price,
      categoryGuid: product.categoryGuid.toString(),
      shopGuid: product.shopGuid.toString(),
      rating: product.rating,
      ingredients: product.ingredients,
    };
    return response;
  }
}
