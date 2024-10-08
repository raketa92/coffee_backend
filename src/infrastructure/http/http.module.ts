import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { RedisService } from "../persistence/redis/redis.service";
import { CoffeeShopModule } from "src/application/coffee_shop/coffeeShop.module";

@Module({
  imports: [CoffeeShopModule],
  controllers: [OrderController],
  providers: [RedisService],
})
export class HttpModule {}
