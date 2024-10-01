import { Body, Controller, Post } from "@nestjs/common";
import { CreateOrderUseCase } from "src/application/coffee_shop/usecases/createOrder";
import { CreateOrderDto } from "./dto/createOrder.dto";

@Controller("/order")
export class OrderController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const response = await this.createOrderUseCase.execute(createOrderDto);
    return response;
  }
}
