import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateOrderUseCase } from "@application/coffee_shop/usecases/order/createOrder";
import { CreateOrderDto, createOrderSchema } from "./dto/order/createOrderDto";
import { OrderFilterDto } from "./dto/order/params";
import { GetOrdersUseCase } from "@/application/coffee_shop/usecases/order/getOrders";

@Controller("/order")
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase
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
}
