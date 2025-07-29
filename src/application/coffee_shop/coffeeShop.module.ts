import { Module } from "@nestjs/common";
import { RedisModule } from "@infrastructure/persistence/redis/redis.module";
import { RedisService } from "@infrastructure/persistence/redis/redis.service";
import { EnvModule } from "@infrastructure/env";
import { DatabaseModule } from "@infrastructure/persistence/kysely/database.module";
import { CreateOrderUseCase } from "@application/coffee_shop/usecases/order/createOrder";
import { PaymentModule } from "@infrastructure/payment/payment.module";
import { IBankService } from "../shared/ports/IBankService";
import { BankServiceImpl } from "@infrastructure/payment/bankService/bank.service";
import { GetCategoriesUseCase } from "./usecases/category/getCategories";
import { GetProductsUseCase } from "./usecases/product/getProducts";
import { GetShopsUseCase } from "./usecases/shop/getShops";
import { GetOrdersUseCase } from "./usecases/order/getOrders";
import { GetProductUseCase } from "./usecases/product/getProduct";
import { GetShopUseCase } from "./usecases/shop/getShop";
import { CheckOrderUseCase } from "./usecases/order/checkOrderStatus";
import { UserService } from "@/domain/user/user.service";
import { UpdateProfileUseCase } from "./usecases/user/updateProfile";
import { IUserService } from "../shared/ports/IUserService";
import { ChangePhoneUseCase } from "./usecases/user/changePhone";
import { IKafkaService } from "../shared/ports/IkafkaService";
import { KafkaService } from "@/infrastructure/kafka/kafka.service";
import { KafkaModule } from "@/infrastructure/kafka/kafka.module";
import { ChangePasswordUseCase } from "./usecases/user/changePassword";
import { IAuthService } from "../shared/ports/IAuthService";
import { AuthServiceImpl } from "@/infrastructure/auth/auth.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [RedisModule, EnvModule, DatabaseModule, PaymentModule, KafkaModule],
  providers: [
    RedisService,
    JwtService,
    CreateOrderUseCase,
    CheckOrderUseCase,
    GetOrdersUseCase,
    GetCategoriesUseCase,
    GetProductsUseCase,
    GetProductUseCase,
    GetShopsUseCase,
    GetShopUseCase,
    UpdateProfileUseCase,
    ChangePhoneUseCase,
    ChangePasswordUseCase,
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IAuthService,
      useClass: AuthServiceImpl,
    },
    {
      provide: IBankService,
      useClass: BankServiceImpl,
    },
    {
      provide: IKafkaService,
      useClass: KafkaService,
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
    ChangePhoneUseCase,
    ChangePasswordUseCase,
  ],
})
export class CoffeeShopModule {}
