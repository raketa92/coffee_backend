import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { CoffeeShopModule } from "@application/coffee_shop/coffeeShop.module";
import { CategoryController } from "./category.controller";
import { ProductController } from "./product.controller";

@Module({
  imports: [CoffeeShopModule],
  controllers: [OrderController, CategoryController, ProductController],
  providers: [RedisService],
})
export class HttpModule {}
