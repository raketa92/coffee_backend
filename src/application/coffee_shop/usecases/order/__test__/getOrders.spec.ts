import { IOrderRepository } from "@/domain/order/repository/orderRepository";
import { GetOrdersUseCase } from "../getOrders";
import { Test, TestingModule } from "@nestjs/testing";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { CardProvider, OrderStatus, PaymentMethods } from "@/core/constants";

describe("Get orders use case", () => {
  let useCase: GetOrdersUseCase;
  let orderRepository: IOrderRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrdersUseCase,
        {
          provide: IOrderRepository,
          useValue: {
            getOrders: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetOrdersUseCase>(GetOrdersUseCase);
    orderRepository = module.get<IOrderRepository>(IOrderRepository);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return null if products not found", async () => {
    (orderRepository.getOrders as jest.Mock).mockResolvedValue(null);
    const result = await useCase.execute();

    expect(orderRepository.getOrders).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("should return products", async () => {
    const mockOrders = [
      {
        guid: new UniqueEntityID().toString(),
        orderNumber: "01",
        userGuid: new UniqueEntityID().toString(),
        shopGuid: new UniqueEntityID().toString(),
        phone: "993",
        address: "mir1",
        totalPrice: 100,
        status: OrderStatus.completed,
        paymentGuid: new UniqueEntityID().toString(),
        paymentMethod: PaymentMethods.cash,
        card: null,
        shopName: "shop 1",
        shopRating: 4.5,
        createdAt: new Date(),
        OrderItems: [
          {
            quantity: 1,
            Product: {
              guid: new UniqueEntityID().toString(),
              name: "coffee",
              image: "coffee.png",
              price: 11.2,
              rating: 4,
              ingredients: [],
            },
          },
        ],
      },
      {
        guid: new UniqueEntityID().toString(),
        orderNumber: "01",
        userGuid: new UniqueEntityID().toString(),
        shopGuid: new UniqueEntityID().toString(),
        phone: "993",
        address: "mir1",
        totalPrice: 100,
        status: OrderStatus.completed,
        paymentGuid: new UniqueEntityID().toString(),
        paymentMethod: PaymentMethods.card,
        shopName: "shop 1",
        shopRating: 4.5,
        createdAt: new Date(),
        card: {
          cardNumber: "1234567812345678",
          month: 12,
          year: 25,
          name: "John Doe",
          cvv: 123,
          cardProvider: CardProvider.halkBank,
        },
        OrderItems: [
          {
            quantity: 1,
            Product: {
              guid: new UniqueEntityID().toString(),
              name: "coffee2",
              image: "coffee.png",
              price: 14.2,
              rating: 4.5,
              ingredients: ["ice"],
            },
          },
        ],
      },
    ];

    (orderRepository.getOrders as jest.Mock).mockResolvedValue(mockOrders);

    const expectedResponse = [
      {
        guid: mockOrders[0].guid,
        orderNumber: mockOrders[0].orderNumber,
        status: mockOrders[0].status,
        shopName: mockOrders[0].shopName,
        shopRating: mockOrders[0].shopRating,
        totalPrice: mockOrders[0].totalPrice,
        date: mockOrders[0].createdAt,
        OrderItems: [
          {
            quantity: mockOrders[0].OrderItems[0].quantity,
            Product: {
              guid: mockOrders[0].OrderItems[0].Product.guid,
              name: mockOrders[0].OrderItems[0].Product.name,
              image: mockOrders[0].OrderItems[0].Product.image,
              price: mockOrders[0].OrderItems[0].Product.price,
              rating: mockOrders[0].OrderItems[0].Product.rating,
              ingredients:
                mockOrders[0].OrderItems[0].Product.ingredients ?? undefined,
            },
          },
        ],
      },
      {
        guid: mockOrders[1].guid,
        orderNumber: mockOrders[1].orderNumber,
        status: mockOrders[1].status,
        shopName: mockOrders[0].shopName,
        shopRating: mockOrders[0].shopRating,
        totalPrice: mockOrders[0].totalPrice,
        date: mockOrders[0].createdAt,
        OrderItems: [
          {
            quantity: mockOrders[1].OrderItems[0].quantity,
            Product: {
              guid: mockOrders[1].OrderItems[0].Product.guid,
              name: mockOrders[1].OrderItems[0].Product.name,
              image: mockOrders[1].OrderItems[0].Product.image,
              price: mockOrders[1].OrderItems[0].Product.price,
              rating: mockOrders[1].OrderItems[0].Product.rating,
              ingredients:
                mockOrders[1].OrderItems[0].Product.ingredients ?? undefined,
            },
          },
        ],
      },
    ];

    const result = await useCase.execute();

    expect(orderRepository.getOrders).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });
});
