import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { CoffeeShopModule } from "@application/coffee_shop/coffeeShop.module";
import { CategoryController } from "./category.controller";
import { ProductController } from "./product.controller";
import { ShopController } from "./shop.controller";
import { AuthConfigModule } from "../auth/authConfig.module";
import { AuthController } from "./auth.controller";
import { AuthModule } from "@/application/auth/auth.module";
import { UserController } from "./user.controller";

@Module({
  imports: [CoffeeShopModule, AuthConfigModule, AuthModule],
  controllers: [
    OrderController,
    CategoryController,
    ProductController,
    ShopController,
    AuthController,
    UserController,
  ],
  providers: [
    RedisService,
    OrderController,
    CategoryController,
    ProductController,
    ShopController,
    AuthController,
    UserController,
  ],
})
export class HttpModule {}
