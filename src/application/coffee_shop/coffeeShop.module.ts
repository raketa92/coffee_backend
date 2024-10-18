import { Module } from "@nestjs/common";
import { RedisModule } from "@infrastructure/persistence/redis/redis.module";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { EnvModule } from "@infrastructure/env";
import { DatabaseModule } from "src/infrastructure/persistence/kysely/database.module";
import { CreateOrderUseCase } from "@application/coffee_shop/usecases/order/createOrder";
import { PaymentModule } from "src/infrastructure/payment/payment.module";
import { BankService as IBankService } from "./ports/IBankService";
import { BankService } from "src/infrastructure/payment/bankService/bank.service";

@Module({
  imports: [RedisModule, EnvModule, DatabaseModule, PaymentModule],
  providers: [
    RedisService,
    CreateOrderUseCase,
    {
      provide: IBankService,
      useClass: BankService,
    },
  ],
  exports: [CreateOrderUseCase],
})
export class CoffeeShopModule {}
