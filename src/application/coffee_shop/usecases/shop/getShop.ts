import { UseCase } from "@/core/UseCase";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ShopResponseDto } from "@/infrastructure/http/dto/shop/shopsResponseDto";
import { IShopRepository } from "@domain/shop/repository/IShopRepository";
import { UseCaseErrorMessage } from "@application/coffee_shop/exception";

@Injectable()
export class GetShopUseCase implements UseCase<string, ShopResponseDto> {
  constructor(
    @Inject(IShopRepository) private readonly shopRepository: IShopRepository
  ) {}

  public async execute(shopGuid: string): Promise<ShopResponseDto> {
    const shop = await this.shopRepository.getShop(shopGuid);
    if (!shop) {
      throw new NotFoundException({
        message: UseCaseErrorMessage.shop_not_found,
      });
    }

    const response: ShopResponseDto = {
      guid: shop.guid.toString(),
      name: shop.name,
      image: shop.image,
      rating: shop.rating,
    };
    return response;
  }
}
