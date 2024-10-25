import { ShopRepository } from "@/application/coffee_shop/ports/IShopRepository";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { ShopResponseDto } from "@/infrastructure/http/dto/shop/shopsResponseDto";
import { TestingModule, Test } from "@nestjs/testing";
import { GetShopsUseCase } from "../getShops";

describe("Get shops use case", () => {
  let useCase: GetShopsUseCase;
  let shopRepository: ShopRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetShopsUseCase,
        {
          provide: ShopRepository,
          useValue: {
            getShops: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetShopsUseCase>(GetShopsUseCase);
    shopRepository = module.get<ShopRepository>(ShopRepository);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return null if shops not found", async () => {
    (shopRepository.getShops as jest.Mock).mockResolvedValue(null);
    const result = await useCase.execute();

    expect(shopRepository.getShops).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("should return shops", async () => {
    const mockShops = [
      {
        guid: new UniqueEntityID().toString(),
        name: "Coffee Start",
        image: "coffee_start.jpg",
        rating: 4.1,
      },
      {
        guid: new UniqueEntityID().toString(),
        name: "Kemine coffee",
        image: "kemine_coffee.jpg",
        rating: 4.5,
      },
    ];

    (shopRepository.getShops as jest.Mock).mockResolvedValue(mockShops);

    const expectedResponse: ShopResponseDto[] = [
      {
        guid: mockShops[0].guid,
        name: "Coffee Start",
        image: "coffee_start.jpg",
        rating: 4.1,
      },
      {
        guid: mockShops[1].guid,
        name: "Kemine coffee",
        image: "kemine_coffee.jpg",
        rating: 4.5,
      },
    ];

    const result = await useCase.execute();

    expect(shopRepository.getShops).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });
});
