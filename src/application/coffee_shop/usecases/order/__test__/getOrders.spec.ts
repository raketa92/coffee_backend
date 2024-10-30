import { OrderRepository } from "@/application/coffee_shop/ports/orderRepository";
import { GetOrdersUseCase } from "../getOrders";
import { Test, TestingModule } from "@nestjs/testing";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { CardProvider, OrderStatus, PaymentMethods } from "@/core/constants";

describe("Get orders use case", () => {
  let useCase: GetOrdersUseCase;
  let orderRepository: OrderRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrdersUseCase,
        {
          provide: OrderRepository,
          useValue: {
            getOrders: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetOrdersUseCase>(GetOrdersUseCase);
    orderRepository = module.get<OrderRepository>(OrderRepository);
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
        orderItems: [
          {
            productGuid: new UniqueEntityID().toString(),
            quantity: 1,
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
        card: {
          cardNumber: "1234567812345678",
          month: 12,
          year: 25,
          name: "John Doe",
          cvv: 123,
          cardProvider: CardProvider.halkBank,
        },
        orderItems: [
          {
            productGuid: new UniqueEntityID().toString(),
            quantity: 1,
          },
        ],
      },
    ];

    (orderRepository.getOrders as jest.Mock).mockResolvedValue(mockOrders);

    const expectedResponse = [
      {
        guid: mockOrders[0].guid,
        status: mockOrders[0].status,
        orderItems: mockOrders[0].orderItems,
      },
      {
        guid: mockOrders[1].guid,
        status: mockOrders[1].status,
        orderItems: mockOrders[1].orderItems,
      },
    ];

    const result = await useCase.execute();

    expect(orderRepository.getOrders).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });
});
