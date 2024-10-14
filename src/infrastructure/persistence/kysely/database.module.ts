import { Module } from "@nestjs/common";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { EnvModule, EnvService } from "src/infrastructure/env";
import { DatabaseSchema } from "./database.schema";
import { OrderRepository } from "src/application/coffee_shop/ports/order.repository";
import { OrderRepositoryImpl } from "./repository/orderRepositoryImpl";
import { PaymentRepositoryImpl } from "./repository/paymentRepositoryImpl";
import { PaymentRepository } from "src/application/coffee_shop/ports/IPaymentRepository";

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: "DB_CONNECTION",
      useFactory: async (configService: EnvService) => {
        const db = new Kysely<DatabaseSchema>({
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
  ],
  exports: ["DB_CONNECTION", OrderRepository, PaymentRepository],
})
export class DatabaseModule {}
