import { Kysely, PostgresDialect } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { UniqueEntityID } from "@/core/UniqueEntityID";

ConfigModule.forRoot({
  envFilePath: ".env",
});

const categories = [
  {
    guid: new UniqueEntityID().toString(),
    name: "Hot Drinks",
    iconUrl: "hot_drink.png",
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Cold Drinks",
    iconUrl: "cold_drink.png",
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Other Drinks",
    iconUrl: "non_coffee_drink.png",
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Snacks",
    iconUrl: "snacks.png",
  },
];

const seed = async () => {
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

  try {
    console.log("Seeding category");
    await db.insertInto("Category").values(categories).execute();
    console.log("Seeding category done");
  } catch (error) {
    console.error("Error seeding :", error);
  } finally {
    await db.destroy();
  }
};

seed();
