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
import { IUserRepository } from "@/domain/user/user.repository";
import { UserRepositoryImpl } from "./repository/userRepositoryImpl";

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: "DB_CONNECTION",
      useFactory: async (configService: EnvService) => {
        const pool = new Pool({
          host: configService.get("POSTGRES_HOST"),
          port: configService.get("POSTGRES_PORT"),
          user: configService.get("POSTGRES_USER"),
          password: configService.get("POSTGRES_PASSWORD"),
          database: configService.get("POSTGRES_DB"),
        });

        const db = new Kysely<DatabaseSchema>({
          log: ["query", "error"],
          dialect: new PostgresDialect({
            pool,
          }),
        });

        try {
          await pool.query("SELECT 1");
          console.log("Database connection is healthy.");
        } catch (error) {
          console.error("Database connection failed!", error);
          process.exit(1);
        }

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
    {
      provide: IUserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [
    "DB_CONNECTION",
    IOrderRepository,
    IPaymentRepository,
    ICategoryRepository,
    IProductRepository,
    IShopRepository,
    IUserRepository,
  ],
})
export class DatabaseModule {}
