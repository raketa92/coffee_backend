import { GetShopsUseCase } from "@/application/coffee_shop/usecases/shop/getShops";
import { Controller, Get } from "@nestjs/common";

@Controller("/shop")
export class ShopController {
  constructor(private readonly getShopsUseCase: GetShopsUseCase) {}

  @Get()
  async get() {
    const response = await this.getShopsUseCase.execute();
    return response;
  }
}
