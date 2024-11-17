import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { BankService } from "@application/coffee_shop/ports/IBankService";
import { PaymentRepository } from "@application/coffee_shop/ports/IPaymentRepository";
import { OrderRepository } from "@/application/coffee_shop/ports/orderRepository";
import { ProductRepository } from "@/application/coffee_shop/ports/IProductRepository";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateOrderDto } from "@/infrastructure/http/dto/order/createOrderDto";
import {
  CardProvider,
  OrderStatus,
  PaymentMethods,
  PaytmentFor,
} from "@core/constants";
import { Order } from "@domain/order/order";
import { UniqueEntityID } from "@core/UniqueEntityID";
import { OrderItem } from "@domain/order/orderItem";
import { Card } from "@domain/order/card";
import { Payment } from "@domain/payment/payment";
import { CreateOrderUseCase } from "../createOrder";
import { EnvService } from "@infrastructure/env";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Kysely } from "kysely";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "@/application/coffee_shop/exception";
import { IPaymentData } from "@/infrastructure/payment/bankService/dto/paymentDto";

describe("Create order use case", () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: OrderRepository;
  let paymentRepository: PaymentRepository;
  let productRepository: ProductRepository;
  let bankService: BankService;
  let redisService: RedisService;
  let configService: EnvService;
  let kysely: Kysely<DatabaseSchema>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        {
          provide: OrderRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: PaymentRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            getProductsByGuids: jest.fn(),
          },
        },
        {
          provide: BankService,
          useValue: {
            makePayment: jest.fn(),
          },
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockReturnValue("http://fake-host-api.com"),
          },
        },
        {
          provide: RedisService,
          useValue: {
            generateOrderNumber: jest.fn(),
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

    useCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    paymentRepository = module.get<PaymentRepository>(PaymentRepository);
    productRepository = module.get<ProductRepository>(ProductRepository);
    bankService = module.get<BankService>(BankService);
    redisService = module.get<RedisService>(RedisService);
    configService = module.get<EnvService>(EnvService);
    kysely = module.get("DB_CONNECTION");
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw an error if CreateOrderDto is not provided", async () => {
    await expect(useCase.execute()).rejects.toThrow(
      new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: UseCaseErrorMessage.payload_required,
      })
    );
  });

  it("should create an order and process payment when payment method is card", async () => {
    const orderNumber = "290924873425";
    const createOrderDto: CreateOrderDto = {
      userGuid: new UniqueEntityID().toString(),
      shopGuid: new UniqueEntityID().toString(),
      orderItems: [
        {
          productGuid: new UniqueEntityID().toString(),
          quantity: 1,
        },
      ],
      totalPrice: 100,
      paymentMethod: PaymentMethods.card,
      card: {
        cardNumber: "1234567812345678",
        month: 12,
        year: 25,
        name: "John Doe",
        cvv: 123,
        cardProvider: CardProvider.halkBank,
      },
      phone: "1123",
      address: "mir",
    };

    const orderProducts = createOrderDto.orderItems.map((item) => {
      return new OrderItem({
        quantity: item.quantity,
        productId: new UniqueEntityID(item.productGuid),
      });
    });

    const newOrder = new Order({
      orderNumber,
      userGuid: createOrderDto.userGuid
        ? new UniqueEntityID(createOrderDto.userGuid)
        : new UniqueEntityID(),
      shopGuid: new UniqueEntityID(createOrderDto.shopGuid),
      phone: createOrderDto.phone,
      address: createOrderDto.address,
      totalPrice: createOrderDto.totalPrice,
      status: OrderStatus.waitingClientApproval,
      paymentMethod: createOrderDto.paymentMethod,
      card: new Card(createOrderDto.card!),
      orderItems: orderProducts,
    });
    const paymentResponse = { data: { bankOrderId: "bank123" } };
    const hostApi = configService.get("HOST_API");
    const returnUrl = `${hostApi}/payment-service/orderStatus?orderNumber=${newOrder.orderNumber}&lang=${"ru"}`;

    const paymentData: IPaymentData = {
      currency: 934,
      language: "ru",
      orderNumber: newOrder.orderNumber,
      amount: parseInt((newOrder.totalPrice * 100).toFixed()),
      returnUrl,
    };
    const newPayment = new Payment({
      paymentFor: PaytmentFor.product,
      cardProvider: newOrder.card!.cardProvider,
      status: OrderStatus.waitingClientApproval,
      orderGuid: newOrder.guid,
      bankOrderId: paymentResponse.data.bankOrderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
    });

    const productsInDb = [
      {
        guid: createOrderDto.orderItems[0].productGuid,
      },
      {
        guid: new UniqueEntityID().toString(),
      },
    ];

    const trxMock: any = {
      execute: jest.fn().mockImplementation((callback) => callback(trxMock)),
    };
    jest.spyOn(kysely, "transaction").mockReturnValue(trxMock);

    (redisService.generateOrderNumber as jest.Mock).mockResolvedValue(
      orderNumber
    );
    (orderRepository.save as jest.Mock).mockResolvedValue(newOrder);
    (productRepository.getProductsByGuids as jest.Mock).mockResolvedValue(
      productsInDb
    );
    (bankService.makePayment as jest.Mock).mockResolvedValue(paymentResponse);
    (paymentRepository.save as jest.Mock).mockResolvedValue(newPayment);

    const result = await useCase.execute(createOrderDto);

    expect(redisService.generateOrderNumber).toHaveBeenCalled();
    expect(orderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        orderNumber: newOrder.orderNumber,
        totalPrice: 100,
      }),
      trxMock
    );
    expect(orderRepository.save).toHaveBeenCalledTimes(1);
    expect(productRepository.getProductsByGuids).toHaveBeenCalledTimes(1);
    expect(bankService.makePayment).toHaveBeenCalledWith(paymentData);
    expect(paymentRepository.save).toHaveBeenCalledTimes(1);
    expect(paymentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentFor: PaytmentFor.product,
        cardProvider: newOrder.card!.cardProvider,
        status: OrderStatus.waitingClientApproval,
        bankOrderId: paymentResponse.data.bankOrderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
      }),
      trxMock
    );
    expect(result).toMatchObject({ orderNumber, status: newOrder.status });
  });

  it("should create an order and process payment when payment method is cash", async () => {
    const orderNumber = "290924873425";
    const createOrderDto: CreateOrderDto = {
      userGuid: "1",
      shopGuid: "2",
      orderItems: [
        {
          productGuid: "c1f0012a-d013-4969-b440-5864e53c8778",
          quantity: 1,
        },
      ],
      totalPrice: 100,
      paymentMethod: PaymentMethods.cash,
      phone: "1112",
      address: "kemine",
    };

    const orderProducts = createOrderDto.orderItems.map((item) => {
      return new OrderItem({
        quantity: item.quantity,
        productId: new UniqueEntityID(item.productGuid),
      });
    });

    const newOrder = new Order({
      orderNumber,
      userGuid: createOrderDto.userGuid
        ? new UniqueEntityID(createOrderDto.userGuid)
        : new UniqueEntityID(),
      shopGuid: new UniqueEntityID(createOrderDto.shopGuid),
      phone: createOrderDto.phone,
      address: createOrderDto.address,
      totalPrice: createOrderDto.totalPrice,
      status: OrderStatus.pending,
      paymentMethod: createOrderDto.paymentMethod,
      orderItems: orderProducts,
    });

    const productsInDb = [
      {
        guid: createOrderDto.orderItems[0].productGuid,
      },
      {
        guid: new UniqueEntityID().toString(),
      },
    ];

    const trxMock: any = {
      execute: jest.fn().mockImplementation((callback) => callback(trxMock)),
    };
    jest.spyOn(kysely, "transaction").mockReturnValue(trxMock);

    (redisService.generateOrderNumber as jest.Mock).mockResolvedValue(
      orderNumber
    );
    (orderRepository.save as jest.Mock).mockResolvedValue(newOrder);
    (productRepository.getProductsByGuids as jest.Mock).mockResolvedValue(
      productsInDb
    );

    const result = await useCase.execute(createOrderDto);

    expect(redisService.generateOrderNumber).toHaveBeenCalled();
    expect(productRepository.getProductsByGuids).toHaveBeenCalled();
    expect(orderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        orderNumber: newOrder.orderNumber,
        totalPrice: 100,
      }),
      trxMock
    );
    expect(result).toMatchObject({ orderNumber, status: newOrder.status });
  });
});
