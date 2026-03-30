import { Module } from "@nestjs/common";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { RedisModule } from "@infrastructure/persistence/redis/redis.module";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { RedisCacheInterceptor } from "@infrastructure/persistence/redis/redisCache.interceptor";
import { CoffeeShopModule } from "@application/coffee_shop/coffeeShop.module";
import { EnvModule } from "@infrastructure/env";
import { LoggerModule } from "@infrastructure/logger/logger.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { HttpModule } from "./infrastructure/http/http.module";
import { AuthConfigModule } from "./infrastructure/auth/authConfig.module";
import { AuthModule } from "./application/auth/auth.module";
import { OtpModule } from "./application/otp/otp.module";
import { EmailVerificationModule } from "./application/email_verification/emailVerification.module";
import { KafkaConsumerModule } from "./infrastructure/kafka/kafka_consumer.module";
import { KafkaProducerModule } from "./infrastructure/kafka/kafka_producer.module";
import { WebsocketModule } from "./infrastructure/websocket/websocket.module";

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== "production",
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads/images"),
      serveRoot: "/images",
    }),
    AuthModule,
    RedisModule,
    EnvModule,
    LoggerModule,
    HttpModule,
    AuthConfigModule,
    KafkaConsumerModule,
    KafkaProducerModule,
    WebsocketModule,
    CoffeeShopModule,
    OtpModule,
    EmailVerificationModule,
  ],
  providers: [
    RedisService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RedisCacheInterceptor,
    },
  ],
})
export class AppModule {}
