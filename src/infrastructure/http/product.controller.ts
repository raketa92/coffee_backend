import { GetProductsUseCase } from "@/application/coffee_shop/usecases/product/getProducts";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductFilterDto } from "./dto/product/params";
import { GetProductUseCase } from "@/application/coffee_shop/usecases/product/getProduct";

@Controller("/product")
export class ProductController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase
  ) {}

  @Get()
  async get(@Query() filter: ProductFilterDto) {
    const response = await this.getProductsUseCase.execute(filter);
    return response;
  }

  @Get(":productGuid")
  async getOne(@Param("productGuid") productGuid: any) {
    const response = await this.getProductUseCase.execute(productGuid);
    return response;
  }
}
