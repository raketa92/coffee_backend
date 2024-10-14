import { ConfigModule, ConfigService } from "@nestjs/config";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DatabaseSchema } from "../database.schema";
import { execSync } from "child_process";

ConfigModule.forRoot({
  envFilePath: ".env",
});

const resetSqlSchema = async () => {
  const configService = new ConfigService();
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
  console.log(`Resetting SQL schema`);
  const dropQuery = db.schema
    .dropSchema("public")
    .ifExists()
    .cascade()
    .compile();
  await db.executeQuery(dropQuery);
  const createQuery = db.schema.createSchema("public").compile();
  await db.executeQuery(createQuery);
  await db.destroy();
};

const resetMigrations = async () => {
  await resetSqlSchema();
  console.log(`Running SQL migrations`);
  const execution = execSync("yarn migrate", {
    maxBuffer: 1024 * 100_000,
  });
  console.log(execution.toString());
};

resetMigrations();
