import { IOrderRepository } from "@/domain/order/repository/orderRepository";
import { Test, TestingModule } from "@nestjs/testing";
import { CheckOrderUseCase } from "../checkOrderStatus";
import { UseCaseErrorMessage } from "@/application/coffee_shop/exception";
import { NotFoundException } from "@nestjs/common";
import {
  OrderStatus,
  PaymentMethods,
  CardProvider,
  PaytmentFor,
  PaymentStatus,
} from "@/core/constants";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { BankService } from "@/application/coffee_shop/ports/IBankService";
import { ICheckPaymentData } from "@/infrastructure/payment/bankService/dto/paymentDto";
import { IPaymentRepository } from "@/domain/payment/repository/IPaymentRepository";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Kysely } from "kysely";
import { Payment } from "@/domain/payment/payment";
import { Order } from "@/domain/order/order";
import { OrderItem } from "@/domain/order/orderItem";
import { Card } from "@/domain/order/card";
import { ProductCreateModel } from "@/infrastructure/persistence/kysely/models/product";

describe("Check order status use case", () => {
  let useCase: CheckOrderUseCase;
  let orderRepository: IOrderRepository;
  let bankService: BankService;
  let paymentRepository: IPaymentRepository;
  let kysely: Kysely<DatabaseSchema>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckOrderUseCase,
        {
          provide: IOrderRepository,
          useValue: {
            getOrder: jest.fn(),
            saveOrder: jest.fn(),
          },
        },
        {
          provide: BankService,
          useValue: {
            checkPaymentStatus: jest.fn(),
            mapStatus: jest.fn(),
          },
        },
        {
          provide: IPaymentRepository,
          useValue: {
            getPayment: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: "DB_CONNECTION",
          useValue: {
            transaction: jest.fn().mockReturnThis(),
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CheckOrderUseCase>(CheckOrderUseCase);
    orderRepository = module.get<IOrderRepository>(IOrderRepository);
    paymentRepository = module.get<IPaymentRepository>(IPaymentRepository);
    bankService = module.get<BankService>(BankService);
    kysely = module.get("DB_CONNECTION");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if ordernumber is wrong", async () => {
    (orderRepository.getOrder as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute("112233")).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.order_not_found,
      })
    );
    expect(orderRepository.getOrder).toHaveBeenCalled();
  });
  it("should check status and return order status", async () => {
    const orderNumber = "121212";
    const product: ProductCreateModel = {
      name: "cake",
      guid: new UniqueEntityID().toString(),
      image: "aaa",
      price: 0,
      categoryGuid: new UniqueEntityID().toString(),
      shopGuid: new UniqueEntityID().toString(),
      rating: 0,
      ingredients: null,
    };

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
        paymentMethod: PaymentMethods.cash,
        card: null,
        OrderItems: [
          {
            guid: new UniqueEntityID().toString(),
            quantity: 1,
            productGuid: product.guid,
            Product: product,
          },
        ],
      },
      {
        guid: new UniqueEntityID().toString(),
        orderNumber,
        userGuid: new UniqueEntityID().toString(),
        shopGuid: new UniqueEntityID().toString(),
        phone: "99322",
        address: "mir1",
        totalPrice: 100,
        status: OrderStatus.waitingClientApproval,
        paymentMethod: PaymentMethods.card,
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
            guid: new UniqueEntityID().toString(),
            quantity: 1,
            productGuid: product.guid,
            Product: product,
          },
        ],
      },
    ];

    const mockPayment = {
      guid: new UniqueEntityID().toString(),
      orderGuid: mockOrders[1].guid.toString(),
      paymentFor: PaytmentFor.product,
      cardProvider: CardProvider.halkBank,
      status: PaymentStatus.waitingClientApproval,
      bankOrderId: new UniqueEntityID().toString(),
      amount: 100,
      currency: 934,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const paymentDomain: Payment = new Payment(
      {
        paymentFor: mockPayment.paymentFor,
        cardProvider: mockPayment.cardProvider,
        status: mockPayment.status,
        orderGuid: new UniqueEntityID(mockPayment.orderGuid.toString()),
        bankOrderId: mockPayment.bankOrderId,
        amount: mockPayment.amount,
        currency: mockPayment.currency,
      },
      new UniqueEntityID(mockPayment.guid)
    );

    const orderDomain = new Order(
      {
        orderNumber,
        userGuid: mockOrders[1].userGuid
          ? new UniqueEntityID(mockOrders[1].userGuid)
          : null,
        shopGuid: new UniqueEntityID(mockOrders[1].shopGuid),
        phone: mockOrders[1].phone,
        address: mockOrders[1].address,
        totalPrice: mockOrders[1].totalPrice,
        status: mockOrders[1].status,
        paymentGuid: null,
        paymentMethod: mockOrders[1].paymentMethod,
        card: mockOrders[1].card ? new Card(mockOrders[1].card) : null,
        orderItems: mockOrders[1].OrderItems.map(
          (item) =>
            new OrderItem(
              {
                productGuid: new UniqueEntityID(item.productGuid),
                quantity: item.quantity,
              },
              new UniqueEntityID(item.guid)
            )
        ),
      },
      new UniqueEntityID(mockOrders[1].guid)
    );

    const bankResponse = {
      errorCode: "0",
      errorMessage: "Успешно",
      orderNumber: "g12",
      orderStatus: 0,
      actionCode: -100,
      actionCodeDescription: "",
      amount: 100,
      currency: "934",
      date: 1731904618820,
      attributes: [
        {
          name: "mdOrder",
          value: "9c07beee-2b65-44ed-ae84-8f3e4d820d87",
        },
      ],
    };

    (orderRepository.getOrder as jest.Mock).mockResolvedValue(mockOrders[1]);
    (paymentRepository.getPayment as jest.Mock).mockResolvedValue(mockPayment);
    (bankService.checkPaymentStatus as jest.Mock).mockResolvedValue(
      bankResponse
    );
    (bankService.mapStatus as jest.Mock).mockReturnValue(PaymentStatus.paid);
    const checkPaymentData: ICheckPaymentData = {
      language: "ru",
      orderId: mockPayment.bankOrderId,
    };

    const trxMock: any = {
      execute: jest.fn().mockImplementation((callback) => callback(trxMock)),
    };
    jest.spyOn(kysely, "transaction").mockReturnValue(trxMock);
    const result = await useCase.execute(orderNumber);

    expect(bankService.checkPaymentStatus).toHaveBeenCalledWith(
      checkPaymentData
    );

    paymentDomain.changeStatus(PaymentStatus.paid);
    expect(paymentRepository.save).toHaveBeenCalledTimes(1);
    expect(paymentRepository.save).toHaveBeenCalledWith(paymentDomain, trxMock);
    expect(paymentDomain.status).toEqual(PaymentStatus.paid);

    orderDomain.changeStatus(OrderStatus.inProgress);
    orderDomain.assignPayment(paymentDomain.guid);
    expect(orderRepository.saveOrder).toHaveBeenCalledTimes(1);
    expect(orderRepository.saveOrder).toHaveBeenCalledWith(
      orderDomain,
      trxMock
    );
    expect(orderDomain.status).toEqual(OrderStatus.inProgress);
    expect(orderDomain.paymentGuid).toEqual(paymentDomain.guid);

    expect(result).toEqual({
      status: OrderStatus.inProgress,
    });
  });

  it("should return order status without checking with bankservice if status is completed", async () => {
    const orderNumber = "121212";
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
        paymentMethod: PaymentMethods.cash,
        card: null,
        OrderItems: [
          {
            guid: new UniqueEntityID().toString(),
            quantity: 1,
            productGuid: new UniqueEntityID().toString(),
          },
        ],
      },
      {
        guid: new UniqueEntityID().toString(),
        orderNumber,
        userGuid: new UniqueEntityID().toString(),
        shopGuid: new UniqueEntityID().toString(),
        phone: "99322",
        address: "mir1",
        totalPrice: 100,
        status: OrderStatus.completed,
        paymentMethod: PaymentMethods.card,
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
            guid: new UniqueEntityID().toString(),
            quantity: 1,
            productGuid: new UniqueEntityID().toString(),
          },
        ],
      },
    ];

    (orderRepository.getOrder as jest.Mock).mockResolvedValue(mockOrders[1]);

    const result = await useCase.execute(orderNumber);

    expect(result).toEqual({
      status: OrderStatus.completed,
    });
  });
});
