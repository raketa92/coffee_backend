import { Module } from "@nestjs/common";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { EnvService } from "src/infrastructure/env";
import { DatabaseScema } from "./database.schema";

@Module({
  providers: [
    {
      provide: "DB_CONNECTION",
      useFactory: async (configService: EnvService) => {
        const db = new Kysely<DatabaseScema>({
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
  ],
  exports: ["DB_CONNECTION"],
})
export class DatabaseModule {}
