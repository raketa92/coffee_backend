import { Module } from "@nestjs/common";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { EnvModule, EnvService } from "@infrastructure/env";
import { DatabaseSchema } from "./database.schema";
import { IOrderRepository } from "@/domain/order/repository/orderRepository";
import { OrderRepositoryImpl } from "./repository/orderRepositoryImpl";
import { PaymentRepositoryImpl } from "./repository/paymentRepositoryImpl";
import { IPaymentRepository } from "@/domain/payment/repository/IPaymentRepository";
import { ICategoryRepository } from "@/domain/category/repository/ICategoryRepository";
import { CategoryRepositoryImpl } from "./repository/categoryRepositoryImpl";
import { IProductRepository } from "@/domain/product/repository/IProductRepository";
import { ProductRepositoryImpl } from "./repository/productRepositoryImpl";
import { IShopRepository } from "@/domain/shop/repository/IShopRepository";
import { ShopRepositoryImpl } from "./repository/shopRepositoryImpl";

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: "DB_CONNECTION",
      useFactory: async (configService: EnvService) => {
        const db = new Kysely<DatabaseSchema>({
          log: ["query", "error"],
          dialect: new PostgresDialect({
            pool: new Pool({
              host: configService.get("POSTGRES_HOST"),
              port: configService.get("POSTGRES_PORT"),
              user: configService.get("POSTGRES_USER"),
              password: configService.get("POSTGRES_PASSWORD"),
              database: configService.get("POSTGRES_DB"),
            }),
          }),
        });
        return db;
      },
      inject: [EnvService],
    },
    {
      provide: IOrderRepository,
      useClass: OrderRepositoryImpl,
    },
    {
      provide: IPaymentRepository,
      useClass: PaymentRepositoryImpl,
    },
    {
      provide: ICategoryRepository,
      useClass: CategoryRepositoryImpl,
    },
    {
      provide: IProductRepository,
      useClass: ProductRepositoryImpl,
    },
    {
      provide: IShopRepository,
      useClass: ShopRepositoryImpl,
    },
  ],
  exports: [
    "DB_CONNECTION",
    IOrderRepository,
    IPaymentRepository,
    ICategoryRepository,
    IProductRepository,
    IShopRepository,
  ],
})
export class DatabaseModule {}
