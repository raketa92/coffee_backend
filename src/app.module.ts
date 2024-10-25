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
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { ProductController } from "./infrastructure/http/product.controller";

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== "production",
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads/images"),
      serveRoot: "/images",
    }),
    CoffeeShopModule,
    RedisModule,
    EnvModule,
    LoggerModule,
  ],
  controllers: [OrderController, CategoryController, ProductController],
  providers: [
    RedisService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RedisCacheInterceptor,
    },
  ],
})
export class AppModule {}
