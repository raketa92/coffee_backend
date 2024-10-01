import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { CreateOrderUseCase } from "src/application/coffee_shop/usecases/createOrder";

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [CreateOrderUseCase],
})
export class HttpModule {}
