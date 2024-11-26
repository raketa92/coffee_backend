import { UseCaseErrorMessage } from "@/application/coffee_shop/exception";
import { IProductRepository } from "@/domain/product/repository/IProductRepository";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { Test, TestingModule } from "@nestjs/testing";
import { GetProductUseCase } from "../getProduct";
import { NotFoundException } from "@nestjs/common";

describe("Get product use case", () => {
  let useCase: GetProductUseCase;
  let productRepository: IProductRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductUseCase,
        {
          provide: IProductRepository,
          useValue: {
            getProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetProductUseCase>(GetProductUseCase);
    productRepository = module.get<IProductRepository>(IProductRepository);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if product not found", async () => {
    const randomProductGuid = new UniqueEntityID().toString();
    (productRepository.getProduct as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(randomProductGuid)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.product_not_found,
      })
    );
    expect(productRepository.getProduct).toHaveBeenCalled();
  });

  it("should return proudct", async () => {
    const mockProduct = {
      guid: new UniqueEntityID().toString(),
      name: "Cappucino",
      image: "cappucino.jpg",
      price: 25,
      categoryGuid: new UniqueEntityID().toString(),
      shopGuid: new UniqueEntityID().toString(),
      ingredients: ["caramel syrup", "fruit syrup"],
      rating: 4,
    };

    (productRepository.getProduct as jest.Mock).mockResolvedValue(mockProduct);

    const expectedResponse = {
      guid: mockProduct.guid,
      name: "Cappucino",
      image: "cappucino.jpg",
      price: 25,
      categoryGuid: mockProduct.categoryGuid,
      shopGuid: mockProduct.shopGuid,
      ingredients: ["caramel syrup", "fruit syrup"],
      rating: 4,
    };
    const result = await useCase.execute(mockProduct.guid);

    expect(productRepository.getProduct).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });
});
