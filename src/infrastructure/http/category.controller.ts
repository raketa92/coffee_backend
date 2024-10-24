import { Controller, Get } from "@nestjs/common";
import { GetCategoriesUseCase } from "@/application/coffee_shop/usecases/category/getCategories";

@Controller("/category")
export class CategoryController {
  constructor(private getCategoriesUseCase: GetCategoriesUseCase) {}

  @Get()
  async get() {
    const response = await this.getCategoriesUseCase.execute();
    return response;
  }
}
