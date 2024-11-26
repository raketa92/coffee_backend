import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CreateOrderUseCase } from "@application/coffee_shop/usecases/order/createOrder";
import { CreateOrderDto, createOrderSchema } from "./dto/order/createOrderDto";
import { OrderFilterDto } from "./dto/order/params";
import { GetOrdersUseCase } from "@/application/coffee_shop/usecases/order/getOrders";
import { CheckOrderUseCase } from "@/application/coffee_shop/usecases/order/checkOrderStatus";

@Controller("/order")
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
    private readonly checkOrderStatusUseCase: CheckOrderUseCase
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const body = createOrderSchema.parse(createOrderDto);
    const response = await this.createOrderUseCase.execute(body);
    return response;
  }

  @Get()
  async getOrders(@Query() filter: OrderFilterDto) {
    const response = await this.getOrdersUseCase.execute(filter);
    return response;
  }

  @Get("/status/:orderNumber")
  async checkPaymentStatus(@Param("orderNumber") orderNumber: any) {
    const response = await this.checkOrderStatusUseCase.execute(orderNumber);
    return response;
  }
}
