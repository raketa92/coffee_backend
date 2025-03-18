import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { IBankService } from "@application/coffee_shop/ports/IBankService";
import { IPaymentRepository } from "@/domain/payment/repository/IPaymentRepository";
import { IOrderRepository } from "@/domain/order/repository/orderRepository";
import { IProductRepository } from "@/domain/product/repository/IProductRepository";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateOrderDto } from "@/infrastructure/http/dto/order/createOrderDto";
import {
  OrderStatus,
  PaymentMethods,
  PaymentStatus,
  PaytmentFor,
} from "@core/constants";
import { Order } from "@domain/order/order";
import { UniqueEntityID } from "@core/UniqueEntityID";
import { OrderItem } from "@domain/order/orderItem";
import { Payment } from "@domain/payment/payment";
import { CreateOrderUseCase } from "../createOrder";
import { EnvService } from "@infrastructure/env";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Kysely } from "kysely";
import { IPaymentData } from "@/infrastructure/payment/bankService/dto/paymentDto";

describe("Create order use case", () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: IOrderRepository;
  let paymentRepository: IPaymentRepository;
  let productRepository: IProductRepository;
  let bankService: IBankService;
  let redisService: RedisService;
  let configService: EnvService;
  let kysely: Kysely<DatabaseSchema>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        {
          provide: IOrderRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: IPaymentRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: IProductRepository,
          useValue: {
            getProductsByGuids: jest.fn(),
          },
        },
        {
          provide: IBankService,
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
    orderRepository = module.get<IOrderRepository>(IOrderRepository);
    paymentRepository = module.get<IPaymentRepository>(IPaymentRepository);
    productRepository = module.get<IProductRepository>(IProductRepository);
    bankService = module.get<IBankService>(IBankService);
    redisService = module.get<RedisService>(RedisService);
    configService = module.get<EnvService>(EnvService);
    kysely = module.get("DB_CONNECTION");
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
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
      phone: "1123",
      address: "mir",
      deliveryDateTime: new Date(),
    };

    const orderProducts = createOrderDto.orderItems.map((item) => {
      return new OrderItem({
        quantity: item.quantity,
        productGuid: new UniqueEntityID(item.productGuid),
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
      orderItems: orderProducts,
      deliveryDateTime: createOrderDto.deliveryDateTime,
    });
    const bankResponse = { orderId: "bank123", formUrl: "testUrl" };
    const hostApi = configService.get("HOST_API");
    const returnUrl = `${hostApi}/order/status?orderNumber=${newOrder.orderNumber}&lang=${"ru"}`;

    const paymentData: IPaymentData = {
      currency: 934,
      language: "ru",
      orderNumber: newOrder.orderNumber,
      amount: parseInt((newOrder.totalPrice * 100).toFixed()),
      returnUrl,
    };
    const newPayment = new Payment({
      paymentFor: PaytmentFor.product,
      status: PaymentStatus.waitingClientApproval,
      orderGuid: newOrder.guid,
      bankOrderId: bankResponse.orderId,
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
    (bankService.makePayment as jest.Mock).mockResolvedValue(bankResponse);
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
        status: OrderStatus.waitingClientApproval,
        bankOrderId: bankResponse.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
      }),
      trxMock
    );
    expect(result).toMatchObject({
      orderNumber,
      totalPrice: newOrder.totalPrice,
      status: newOrder.status,
    });
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
      deliveryDateTime: new Date(),
    };

    const orderProducts = createOrderDto.orderItems.map((item) => {
      return new OrderItem({
        quantity: item.quantity,
        productGuid: new UniqueEntityID(item.productGuid),
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
      deliveryDateTime: createOrderDto.deliveryDateTime,
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
