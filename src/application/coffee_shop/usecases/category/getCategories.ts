import { UseCase } from "@/core/UseCase";
import { CategoriesResponseDto } from "@/infrastructure/http/dto/category/categoriesResponseDto";
import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "@application/coffee_shop/ports/ICategoryRepository";

@Injectable()
export class GetCategoriesUseCase
  implements UseCase<void, CategoriesResponseDto[] | null>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}
  public async execute(): Promise<CategoriesResponseDto[] | null> {
    const categories = await this.categoryRepository.getCategories();
    if (!categories) {
      return null;
    }
    const response: CategoriesResponseDto[] = categories.map((item) => ({
      guid: item.guid.toString(),
      name: item.name,
      iconUrl: item.iconUrl,
    }));
    return response;
  }
}
