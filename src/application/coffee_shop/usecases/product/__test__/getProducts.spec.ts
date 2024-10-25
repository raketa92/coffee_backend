import { ProductRepository } from "@/application/coffee_shop/ports/IProductRepository";
import { GetProductsUseCase } from "../getProducts";
import { Test, TestingModule } from "@nestjs/testing";
import { UniqueEntityID } from "@/core/UniqueEntityID";

describe("Get products use case", () => {
  let useCase: GetProductsUseCase;
  let productRepository: ProductRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductsUseCase,
        {
          provide: ProductRepository,
          useValue: {
            getProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetProductsUseCase>(GetProductsUseCase);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return null if products not found", async () => {
    (productRepository.getProducts as jest.Mock).mockResolvedValue(null);
    const result = await useCase.execute();

    expect(productRepository.getProducts).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("should return products", async () => {
    const mockProducts = [
      {
        guid: new UniqueEntityID().toString(),
        name: "Cappucino",
        image: "cappucino.jpg",
        price: 25,
        categoryGuid: new UniqueEntityID().toString(),
        shopGuid: new UniqueEntityID().toString(),
        ingredients: ["caramel syrup", "fruit syrup"],
        rating: 4,
      },
      {
        guid: new UniqueEntityID().toString(),
        name: "Glace",
        image: "glace.jpg",
        price: 30,
        categoryGuid: new UniqueEntityID().toString(),
        shopGuid: new UniqueEntityID().toString(),
        ingredients: ["shocolate"],
        rating: 4,
      },
    ];

    (productRepository.getProducts as jest.Mock).mockResolvedValue(
      mockProducts
    );

    const expectedResponse = [
      {
        guid: mockProducts[0].guid,
        name: "Cappucino",
        image: "cappucino.jpg",
        price: 25,
        categoryGuid: mockProducts[0].categoryGuid,
        shopGuid: mockProducts[0].shopGuid,
        ingredients: ["caramel syrup", "fruit syrup"],
        rating: 4,
      },
      {
        guid: mockProducts[1].guid,
        name: "Glace",
        image: "glace.jpg",
        price: 30,
        categoryGuid: mockProducts[1].categoryGuid,
        shopGuid: mockProducts[1].shopGuid,
        ingredients: ["shocolate"],
        rating: 4,
      },
    ];

    const result = await useCase.execute();

    expect(productRepository.getProducts).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });
});
