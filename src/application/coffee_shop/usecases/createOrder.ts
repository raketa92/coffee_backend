import { Injectable } from "@nestjs/common";
import { UseCase } from "../../../core/UseCase";
import { OrderRepository } from "../ports/order.repository";
import { CreateOrderDto } from "../../../infrastructure/http/dto/createOrder.dto";
import { UniqueEntityID } from "../../../core/UniqueEntityID";
import {
  OrderStatus,
  PaymentMethods,
  PaytmentFor,
} from "../../../core/constants";
import { Product } from "../../../domain/order/product";
import { Card } from "../../../domain/order/card";
import { BankService } from "../../../application/coffee_shop/ports/IBankService";
import { PaymentDto } from "../../../infrastructure/payment/bankService/dto/paymentDto";
import { Payment } from "../../../domain/payment/payment";
import { PaymentRepository } from "../ports/IPaymentRepository";
import { RedisService } from "../../../infrastructure/persistence/redis/redis.service";
import { Order } from "../../../domain/order/order";
import { OrderProduct } from "../../../domain/order/orderProduct";
import { EnvService } from "../../../infrastructure/env";

@Injectable()
export class CreateOrderUseCase implements UseCase<CreateOrderDto, Order> {
  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private bankService: BankService,
    private configService: EnvService,
    private redisService: RedisService
  ) {}
  public async execute(request?: CreateOrderDto): Promise<Order> {
    if (!request) {
      throw new Error("CreateOrderDto is required.");
    }

    const orderNumber = await this.redisService.generateOrderNumber();

    const newOrder = this.createOrderEntity(request, orderNumber);

    const savedOrder = await this.orderRepository.save(newOrder);

    if (request.paymentMethod === PaymentMethods.card) {
      await this.processPayment(newOrder);
    }

    return savedOrder;
  }

  private async processPayment(newOrder: Order) {
    const hostApi = this.configService.get("HOST_API");
    const returnUrl = `${hostApi}/payment-service/orderStatus?orderNumber=${newOrder.orderNumber}&lang=${"ru"}`;
    const USERNAME = "test";
    const PASSWORD = "test";
    const paymentData: PaymentDto = {
      currency: 934,
      language: "ru",
      orderNumber: newOrder.orderNumber,
      userName: USERNAME,
      password: PASSWORD,
      amount: parseInt((newOrder.totalPrice * 100).toFixed()),
      returnUrl,
    };
    const paymentResponse = await this.bankService.makePayment(paymentData);

    const newPayment = new Payment({
      paymentFor: PaytmentFor.product,
      cardProvider: newOrder.card!.cardProvider,
      status: OrderStatus.waitingClientApproval,
      orderNumber: newOrder.orderNumber,
      bankOrderId: paymentResponse.data.bankOrderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
    });

    await this.paymentRepository.save(newPayment);
  }

  private createOrderEntity(request: CreateOrderDto, orderNumber: string) {
    const userId = request.userId ? new UniqueEntityID(request.userId) : null;
    const shopId = new UniqueEntityID(request.shopId);
    const status =
      request.paymentMethod === PaymentMethods.cash
        ? OrderStatus.pending
        : OrderStatus.waitingClientApproval;

    const orderProducts = request.orderItems.map((item) => {
      const { product } = item;
      const newProduct = new Product({
        name: product.name,
        price: product.price,
        categoryId: new UniqueEntityID(product.categoryId),
        shopId: new UniqueEntityID(request.shopId),
        rating: product.rating,
        ingredients: product.ingredients,
      });
      return new OrderProduct({
        quantity: item.quantity,
        product: newProduct,
      });
    });

    let orderCard = null;
    if (request.card && request.paymentMethod === PaymentMethods.card) {
      const { card } = request;
      orderCard = new Card({
        cardNumber: card.cardNumber,
        month: card.month,
        year: card.year,
        name: card.name,
        cvv: card.cvv,
        cardProvider: card.cardProvider,
      });
    }

    const newOrder = new Order({
      orderNumber,
      userId,
      shopId,
      phone: request.phone,
      address: request.address,
      totalPrice: request.totalPrice,
      status,
      paymentMethod: request.paymentMethod,
      card: orderCard,
      orderProducts,
    });
    return newOrder;
  }
}
