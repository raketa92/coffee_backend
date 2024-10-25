import { UseCase } from "@/core/UseCase";
import { ShopResponseDto } from "@/infrastructure/http/dto/shop/shopsResponseDto";
import { Injectable } from "@nestjs/common";
import { ShopRepository } from "../../ports/IShopRepository";

@Injectable()
export class GetShopsUseCase
  implements UseCase<void, ShopResponseDto[] | null>
{
  constructor(private readonly shopRepository: ShopRepository) {}

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
