import { Module } from "@nestjs/common";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { RedisModule } from "./infrastructure/persistence/redis/redis.module";
import { RedisService } from "./infrastructure/persistence/redis/redis.service";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { RedisCacheInterceptor } from "./infrastructure/persistence/redis/redisCache.interceptor";

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== "production",
    }),
    RedisModule,
  ],
  controllers: [],
  providers: [
    RedisService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RedisCacheInterceptor,
    },
  ],
})
export class AppModule {}
