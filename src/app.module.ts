import { Module } from "@nestjs/common";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { RedisModule } from "@infrastructure/persistence/redis/redis.module";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { RedisCacheInterceptor } from "@infrastructure/persistence/redis/redisCache.interceptor";
import { OrderController } from "@infrastructure/http/order.controller";
import { CoffeeShopModule } from "@application/coffee_shop/coffeeShop.module";
import { EnvModule } from "@infrastructure/env";
import { LoggerModule } from "@infrastructure/logger/logger.module";
import { CategoryController } from "./infrastructure/http/category.controller";

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== "production",
    }),
    CoffeeShopModule,
    RedisModule,
    EnvModule,
    LoggerModule,
  ],
  controllers: [OrderController, CategoryController],
  providers: [
    RedisService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RedisCacheInterceptor,
    },
  ],
})
export class AppModule {}
