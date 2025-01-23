import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { CoffeeShopModule } from "@application/coffee_shop/coffeeShop.module";
import { CategoryController } from "./category.controller";
import { ProductController } from "./product.controller";
import { ShopController } from "./shop.controller";
import { UserController } from "./user.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [CoffeeShopModule, AuthModule],
  controllers: [
    OrderController,
    CategoryController,
    ProductController,
    ShopController,
    UserController,
  ],
  providers: [
    RedisService,
    OrderController,
    CategoryController,
    ProductController,
    ShopController,
    UserController,
  ],
})
export class HttpModule {}
