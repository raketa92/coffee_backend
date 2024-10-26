import { GetProductsUseCase } from "@/application/coffee_shop/usecases/product/getProducts";
import { Controller, Get, Query } from "@nestjs/common";
import { ProductFilterDto } from "./dto/product/params";

@Controller("/product")
export class ProductController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async get(@Query() filter: ProductFilterDto) {
    const response = await this.getProductsUseCase.execute(filter);
    return response;
  }
}
