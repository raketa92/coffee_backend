import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { CoffeeShopModule } from "@application/coffee_shop/coffeeShop.module";
import { CategoryController } from "./category.controller";
import { ProductController } from "./product.controller";
import { ShopController } from "./shop.controller";

@Module({
  imports: [CoffeeShopModule],
  controllers: [
    OrderController,
    CategoryController,
    ProductController,
    ShopController,
  ],
  providers: [
    RedisService,
    OrderController,
    CategoryController,
    ProductController,
    ShopController,
  ],
})
export class HttpModule {}
