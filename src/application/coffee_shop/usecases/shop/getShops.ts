import { UseCase } from "@/core/UseCase";
import { ShopResponseDto } from "@/infrastructure/http/dto/shop/shopsResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import { IShopRepository } from "@domain/shop/repository/IShopRepository";

@Injectable()
export class GetShopsUseCase
  implements UseCase<void, ShopResponseDto[] | null>
{
  constructor(
    @Inject(IShopRepository) private readonly shopRepository: IShopRepository
  ) {}

  public async execute(): Promise<ShopResponseDto[] | null> {
    const shops = await this.shopRepository.getShops();
    if (!shops) {
      return null;
    }

    const response: ShopResponseDto[] = shops.map((item) => ({
      guid: item.guid.toString(),
      name: item.name,
      image: item.image,
      rating: item.rating,
    }));
    return response;
  }
}
