import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CreateOrderUseCase } from "@application/coffee_shop/usecases/order/createOrder";
import { CreateOrderDto, createOrderSchema } from "./dto/order/createOrderDto";
import { OrderFilterDto } from "./dto/order/filters";
import { GetOrdersUseCase } from "@/application/coffee_shop/usecases/order/getOrders";
import { CheckOrderUseCase } from "@/application/coffee_shop/usecases/order/checkOrderStatus";
import { UpdateOrderStatusUseCase } from "@/application/coffee_shop/usecases/order/updateOrderStatus";
import { UpdateOrderStatusDto } from "./dto/order/updateOrderDto";

@Controller("/order")
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
    private readonly checkOrderStatusUseCase: CheckOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase
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

  @Get("/guids")
  async getOrdersByGuid(@Query() filter: OrderFilterDto) {
    const response = await this.getOrdersUseCase.execute(filter);
    return response;
  }

  @Get("/status/:orderGuid")
  async checkOrderStatus(@Param("orderGuid") orderGuid: any) {
    const response = await this.checkOrderStatusUseCase.execute(orderGuid);
    return response;
  }

  @Patch("/status/:orderGuid")
  async updateOrderStatus(
    @Param("orderGuid") orderGuid: any,
    @Body("status") status: UpdateOrderStatusDto["status"]
  ) {
    await this.updateOrderStatusUseCase.execute({ orderGuid, status });
    return { message: "Update order status endpoint" };
  }
}
