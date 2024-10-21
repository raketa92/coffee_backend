import { Body, Controller, Post } from "@nestjs/common";
import { CreateOrderUseCase } from "@application/coffee_shop/usecases/order/createOrder";
import { CreateOrderDto } from "./dto/order/createOrderDto";

@Controller("/order")
export class OrderController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const response = await this.createOrderUseCase.execute(createOrderDto);
    return response;
  }
}
