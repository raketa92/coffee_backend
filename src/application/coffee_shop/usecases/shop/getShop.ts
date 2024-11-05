import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ShopResponseDto } from "@/infrastructure/http/dto/shop/shopsResponseDto";
import { ShopRepository } from "../../ports/IShopRepository";
import { UseCaseErrorMessage } from "../../exception";

@Injectable()
export class GetShopUseCase implements UseCase<string, ShopResponseDto> {
  constructor(private readonly shopRepository: ShopRepository) {}

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
