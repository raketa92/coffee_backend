import { ICategoryRepository } from "@/domain/category/repository/ICategoryRepository";
import { GetCategoriesUseCase } from "../getCategories";
import { Test, TestingModule } from "@nestjs/testing";
import { UniqueEntityID } from "@/core/UniqueEntityID";

describe("Get categories use case", () => {
  let useCase: GetCategoriesUseCase;
  let categoryRepository: ICategoryRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoriesUseCase,
        {
          provide: ICategoryRepository,
          useValue: {
            getCategories: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetCategoriesUseCase>(GetCategoriesUseCase);
    categoryRepository = module.get<ICategoryRepository>(ICategoryRepository);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return null if categories not found", async () => {
    (categoryRepository.getCategories as jest.Mock).mockResolvedValue(null);
    const result = await useCase.execute();

    expect(categoryRepository.getCategories).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("should return categories", async () => {
    const mockCategories = [
      {
        guid: new UniqueEntityID().toString(),
        name: "Category 1",
        iconUrl: "http://example.com/icon1.png",
      },
      {
        guid: new UniqueEntityID().toString(),
        name: "Category 2",
        iconUrl: "http://example.com/icon2.png",
      },
    ];

    (categoryRepository.getCategories as jest.Mock).mockResolvedValue(
      mockCategories
    );

    const expectedResponse = [
      {
        guid: mockCategories[0].guid,
        name: "Category 1",
        iconUrl: "http://example.com/icon1.png",
      },
      {
        guid: mockCategories[1].guid,
        name: "Category 2",
        iconUrl: "http://example.com/icon2.png",
      },
    ];

    const result = await useCase.execute();

    expect(categoryRepository.getCategories).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });
});
