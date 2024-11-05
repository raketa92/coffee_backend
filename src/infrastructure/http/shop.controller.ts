import { GetShopUseCase } from "@/application/coffee_shop/usecases/shop/getShop";
import { GetShopsUseCase } from "@/application/coffee_shop/usecases/shop/getShops";
import { Controller, Get, Param } from "@nestjs/common";

@Controller("/shop")
export class ShopController {
  constructor(
    private readonly getShopsUseCase: GetShopsUseCase,
    private readonly getShopUseCase: GetShopUseCase
  ) {}

  @Get()
  async get() {
    const response = await this.getShopsUseCase.execute();
    return response;
  }

  @Get(":shopGuid")
  async getOne(@Param("shopGuid") shopGuid: any) {
    const response = await this.getShopUseCase.execute(shopGuid);
    return response;
  }
}
