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

const shops = [
  {
    guid: new UniqueEntityID().toString(),
    name: "Coffee Start",
    image: "coffee_start.jpg",
    rating: 4.1,
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Kemine coffee",
    image: "kemine_coffee.jpg",
    rating: 4.5,
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "A Coffee",
    image: "a_coffee.jpg",
    rating: 3.8,
  },
];

const products = [
  {
    guid: new UniqueEntityID().toString(),
    name: "Cappucino",
    image: "cappucino.jpg",
    price: 25,
    categoryGuid: categories[0].guid,
    shopGuid: shops[0].guid,
    ingredients: ["caramel syrup", "fruit syrup"],
    rating: 4,
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Glace",
    image: "glace.jpg",
    price: 30,
    categoryGuid: categories[1].guid,
    shopGuid: shops[0].guid,
    ingredients: ["shocolate"],
    rating: 4,
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Frappucino",
    image: "frappucino.jpg",
    price: 30,
    categoryGuid: categories[1].guid,
    shopGuid: shops[1].guid,
    ingredients: null,
    rating: 4,
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Trubka",
    image: "trubka.jpg",
    price: 5,
    categoryGuid: categories[3].guid,
    shopGuid: shops[1].guid,
    rating: 4,
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Biscuit",
    image: "biscuit.jpg",
    price: 8,
    categoryGuid: categories[3].guid,
    shopGuid: shops[2].guid,
    rating: 4,
  },
  {
    guid: new UniqueEntityID().toString(),
    name: "Lemon tea",
    image: "lemon_tea.jpg",
    price: 10,
    categoryGuid: categories[2].guid,
    shopGuid: shops[2].guid,
    rating: 4,
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
    await db.transaction().execute(async (trx) => {
      console.log("Seeding category");
      await trx.insertInto("Category").values(categories).execute();
      console.log("Seeding category done");

      console.log("Seeding shop");
      await trx.insertInto("Shop").values(shops).execute();
      console.log("Seeding shop done");

      console.log("Seeding product");
      await trx.insertInto("Product").values(products).execute();
      console.log("Seeding product done");
    });
  } catch (error) {
    console.error("Error seeding :", error);
  } finally {
    await db.destroy();
  }
};

seed();
