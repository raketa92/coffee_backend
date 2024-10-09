import * as path from "path";
import { Pool } from "pg";
import { promises as fs } from "fs";
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from "kysely";
import { DatabaseScema } from "./database.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";

ConfigModule.forRoot({
  envFilePath: ".env",
});

async function migrateToLatest() {
  const configService = new ConfigService();
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

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "./migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
