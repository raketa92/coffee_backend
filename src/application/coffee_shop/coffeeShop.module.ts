import { Module } from "@nestjs/common";
import { RedisModule } from "@infrastructure/persistence/redis/redis.module";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { EnvModule } from "@infrastructure/env";
import { DatabaseModule } from "@infrastructure/persistence/kysely/database.module";
import { CreateOrderUseCase } from "@application/coffee_shop/usecases/order/createOrder";
import { PaymentModule } from "@infrastructure/payment/payment.module";
import { BankService as IBankService } from "./ports/IBankService";
import { BankService } from "@infrastructure/payment/bankService/bank.service";
import { GetCategoriesUseCase } from "./usecases/category/getCategories";
import { GetProductsUseCase } from "./usecases/product/getProducts";

@Module({
  imports: [RedisModule, EnvModule, DatabaseModule, PaymentModule],
  providers: [
    RedisService,
    CreateOrderUseCase,
    GetCategoriesUseCase,
    GetProductsUseCase,
    {
      provide: IBankService,
      useClass: BankService,
    },
  ],
  exports: [CreateOrderUseCase, GetCategoriesUseCase, GetProductsUseCase],
})
export class CoffeeShopModule {}
