import { Module } from "@nestjs/common";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { EnvModule, EnvService } from "@infrastructure/env";
import { DatabaseSchema } from "./database.schema";
import { OrderRepository } from "@/application/coffee_shop/ports/orderRepository";
import { OrderRepositoryImpl } from "./repository/orderRepositoryImpl";
import { PaymentRepositoryImpl } from "./repository/paymentRepositoryImpl";
import { PaymentRepository } from "@application/coffee_shop/ports/IPaymentRepository";
import { CategoryRepository } from "@/application/coffee_shop/ports/ICategoryRepository";
import { CategoryRepositoryImpl } from "./repository/categoryRepositoryImpl";
import { ProductRepository } from "@/application/coffee_shop/ports/IProductRepository";
import { ProductRepositoryImpl } from "./repository/productRepositoryImpl";
import { ShopRepository } from "@/application/coffee_shop/ports/IShopRepository";
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
      provide: OrderRepository,
      useClass: OrderRepositoryImpl,
    },
    {
      provide: PaymentRepository,
      useClass: PaymentRepositoryImpl,
    },
    {
      provide: CategoryRepository,
      useClass: CategoryRepositoryImpl,
    },
    {
      provide: ProductRepository,
      useClass: ProductRepositoryImpl,
    },
    {
      provide: ShopRepository,
      useClass: ShopRepositoryImpl,
    },
  ],
  exports: [
    "DB_CONNECTION",
    OrderRepository,
    PaymentRepository,
    CategoryRepository,
    ProductRepository,
    ShopRepository,
  ],
})
export class DatabaseModule {}
