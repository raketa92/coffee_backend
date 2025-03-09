import { Module } from "@nestjs/common";
import { RedisModule } from "@infrastructure/persistence/redis/redis.module";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { EnvModule } from "@infrastructure/env";
import { DatabaseModule } from "@infrastructure/persistence/kysely/database.module";
import { CreateOrderUseCase } from "@application/coffee_shop/usecases/order/createOrder";
import { PaymentModule } from "@infrastructure/payment/payment.module";
import { IBankService } from "./ports/IBankService";
import { BankServiceImpl } from "@infrastructure/payment/bankService/bank.service";
import { GetCategoriesUseCase } from "./usecases/category/getCategories";
import { GetProductsUseCase } from "./usecases/product/getProducts";
import { GetShopsUseCase } from "./usecases/shop/getShops";
import { GetOrdersUseCase } from "./usecases/order/getOrders";
import { GetProductUseCase } from "./usecases/product/getProduct";
import { GetShopUseCase } from "./usecases/shop/getShop";
import { CheckOrderUseCase } from "./usecases/order/checkOrderStatus";
import { UserModule } from "@/domain/user/user.module";
import { UserService } from "@/domain/user/user.service";
import { UpdateProfileUseCase } from "./usecases/user/updateProfile";

@Module({
  imports: [RedisModule, EnvModule, DatabaseModule, PaymentModule, UserModule],
  providers: [
    RedisService,
    CreateOrderUseCase,
    CheckOrderUseCase,
    GetOrdersUseCase,
    GetCategoriesUseCase,
    GetProductsUseCase,
    GetProductUseCase,
    GetShopsUseCase,
    GetShopUseCase,
    UpdateProfileUseCase,
    UserService,
    {
      provide: IBankService,
      useClass: BankServiceImpl,
    },
  ],
  exports: [
    CreateOrderUseCase,
    GetOrdersUseCase,
    CheckOrderUseCase,
    GetCategoriesUseCase,
    GetProductsUseCase,
    GetProductUseCase,
    GetShopsUseCase,
    GetShopUseCase,
    UpdateProfileUseCase,
  ],
})
export class CoffeeShopModule {}
