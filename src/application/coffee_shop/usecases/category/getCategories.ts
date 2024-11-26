import { UseCase } from "@/core/UseCase";
import { CategoriesResponseDto } from "@/infrastructure/http/dto/category/categoriesResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import { ICategoryRepository } from "@/domain/category/repository/ICategoryRepository";

@Injectable()
export class GetCategoriesUseCase
  implements UseCase<void, CategoriesResponseDto[] | null>
{
  constructor(
    @Inject(ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}
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
