import { GetProductsUseCase } from "@/application/coffee_shop/usecases/product/getProducts";
import { Controller, Get } from "@nestjs/common";

@Controller("/product")
export class ProductController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async get() {
    const response = await this.getProductsUseCase.execute();
    return response;
  }
}
