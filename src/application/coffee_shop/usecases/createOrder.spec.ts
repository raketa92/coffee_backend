import { RedisService } from "../../../infrastructure/persistence/redis/redis.service";
import { BankService } from "../ports/IBankService";
import { PaymentRepository } from "../ports/IPaymentRepository";
import { OrderRepository } from "../ports/order.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateOrderDto } from "../../../infrastructure/http/dto/createOrder.dto";
import {
  CardProvider,
  OrderStatus,
  PaymentMethods,
  PaytmentFor,
} from "../../../core/constants";
import { Order } from "../../../domain/order/order";
import { Product } from "../../../domain/order/product";
import { UniqueEntityID } from "../../../core/UniqueEntityID";
import { OrderItem } from "../../../domain/order/orderItem";
import { Card } from "../../../domain/order/card";
import { Payment } from "../../../domain/payment/payment";
import { CreateOrderUseCase } from "./createOrder";
import { PaymentDto } from "../../../infrastructure/payment/bankService/dto/paymentDto";
import { EnvService } from "../../../infrastructure/env";

describe("Create order use case", () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: OrderRepository;
  let paymentRepository: PaymentRepository;
  let bankService: BankService;
  let redisService: RedisService;
  let configService: EnvService;

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
      ],
    }).compile();

    useCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    paymentRepository = module.get<PaymentRepository>(PaymentRepository);
    bankService = module.get<BankService>(BankService);
    redisService = module.get<RedisService>(RedisService);
    configService = module.get<EnvService>(EnvService);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw an error if CreateOrderDto is not provided", async () => {
    await expect(useCase.execute()).rejects.toThrow(
      "CreateOrderDto is required."
    );
  });

  it("should create an order and process payment when payment method is card", async () => {
    const orderNumber = "290924873425";
    const createOrderDto: CreateOrderDto = {
      userId: "1",
      shopId: "2",
      orderItems: [
        {
          product: {
            name: "Product 1",
            price: 100,
            categoryId: "1",
            rating: 5,
            ingredients: [],
          },
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
      const { product } = item;
      const newProduct = new Product({
        name: product.name,
        price: product.price,
        categoryGuid: new UniqueEntityID(product.categoryId),
        shopGuid: new UniqueEntityID(createOrderDto.shopId),
        rating: product.rating,
        ingredients: product.ingredients,
      });
      return new OrderItem({
        quantity: item.quantity,
        product: newProduct,
      });
    });

    const newOrder = new Order({
      orderNumber,
      userGuid: new UniqueEntityID(createOrderDto.userId),
      shopGuid: new UniqueEntityID(createOrderDto.shopId),
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

    const paymentData: PaymentDto = {
      currency: 934,
      language: "ru",
      orderNumber: newOrder.orderNumber,
      userName: "test",
      password: "test",
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

    (redisService.generateOrderNumber as jest.Mock).mockResolvedValue(
      orderNumber
    );
    (orderRepository.save as jest.Mock).mockResolvedValue(newOrder);
    (bankService.makePayment as jest.Mock).mockResolvedValue(paymentResponse);
    (paymentRepository.save as jest.Mock).mockResolvedValue(newPayment);

    const result = await useCase.execute(createOrderDto);

    expect(redisService.generateOrderNumber).toHaveBeenCalled();
    expect(orderRepository.save).toHaveBeenCalledWith(newOrder);
    expect(bankService.makePayment).toHaveBeenCalledWith(paymentData);
    expect(paymentRepository.save).toHaveBeenCalledWith(newPayment);
    expect(result).toMatchObject(newOrder);
  });

  it("should create an order and process payment when payment method is cash", async () => {
    const orderNumber = "290924873425";
    const createOrderDto: CreateOrderDto = {
      userId: "1",
      shopId: "2",
      orderItems: [
        {
          product: {
            name: "Product 1",
            price: 100,
            categoryId: "1",
            rating: 5,
            ingredients: [],
          },
          quantity: 1,
        },
      ],
      totalPrice: 100,
      paymentMethod: PaymentMethods.cash,
      phone: "1112",
      address: "kemine",
    };

    const orderProducts = createOrderDto.orderItems.map((item) => {
      const { product } = item;
      const newProduct = new Product({
        name: product.name,
        price: product.price,
        categoryGuid: new UniqueEntityID(product.categoryId),
        shopGuid: new UniqueEntityID(createOrderDto.shopId),
        rating: product.rating,
        ingredients: product.ingredients,
      });
      return new OrderItem({
        quantity: item.quantity,
        product: newProduct,
      });
    });

    const newOrder = new Order({
      orderNumber,
      userGuid: new UniqueEntityID(createOrderDto.userId),
      shopGuid: new UniqueEntityID(createOrderDto.shopId),
      phone: createOrderDto.phone,
      address: createOrderDto.address,
      totalPrice: createOrderDto.totalPrice,
      status: OrderStatus.pending,
      paymentMethod: createOrderDto.paymentMethod,
      orderItems: orderProducts,
    });

    (redisService.generateOrderNumber as jest.Mock).mockResolvedValue(
      orderNumber
    );
    (orderRepository.save as jest.Mock).mockResolvedValue(newOrder);

    const result = await useCase.execute(createOrderDto);

    expect(redisService.generateOrderNumber).toHaveBeenCalled();
    expect(orderRepository.save).toHaveBeenCalledWith(newOrder);
    expect(result).toMatchObject(newOrder);
  });
});
