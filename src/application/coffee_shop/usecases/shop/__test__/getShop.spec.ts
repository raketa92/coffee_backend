import { UseCaseErrorMessage } from "@/application/coffee_shop/exception";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { Test, TestingModule } from "@nestjs/testing";
import { GetShopUseCase } from "../getShop";
import { ShopRepository } from "@/application/coffee_shop/ports/IShopRepository";
import { NotFoundException } from "@nestjs/common";

describe("Get shop use case", () => {
  let useCase: GetShopUseCase;
  let shopRepository: ShopRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetShopUseCase,
        {
          provide: ShopRepository,
          useValue: {
            getShop: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetShopUseCase>(GetShopUseCase);
    shopRepository = module.get<ShopRepository>(ShopRepository);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if shop not found", async () => {
    const randomProductGuid = new UniqueEntityID().toString();
    (shopRepository.getShop as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(randomProductGuid)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.shop_not_found,
      })
    );
    expect(shopRepository.getShop).toHaveBeenCalled();
  });

  it("should return shop", async () => {
    const mockShop = {
      guid: new UniqueEntityID().toString(),
      name: "shop 1",
      image: "some.jpg",
      rating: 4.5,
    };

    (shopRepository.getShop as jest.Mock).mockResolvedValue(mockShop);

    const expectedResponse = {
      guid: mockShop.guid,
      name: "shop 1",
      image: "some.jpg",
      rating: 4.5,
    };
    const result = await useCase.execute(mockShop.guid);

    expect(shopRepository.getShop).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });
});
