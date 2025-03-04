import * as bcrypt from "bcrypt";
import { Kysely, PostgresDialect } from "kysely";
import { JwtService } from "@nestjs/jwt";
import { DatabaseSchema } from "../database.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { Roles } from "@/core/constants/roles";

ConfigModule.forRoot({
  envFilePath: ".env",
});

const categories = [
  {
    guid: "0d593543-11f6-4fa9-9b78-110ac15ee627",
    name: "Hot Drinks",
    iconUrl: "hot_drink.png",
  },
  {
    guid: "723169f0-c4ff-4b11-9f27-25c4e720c9bd",
    name: "Cold Drinks",
    iconUrl: "cold_drink.png",
  },
  {
    guid: "d18814f0-7a9c-4b8c-9add-1dca56f65f44",
    name: "Other Drinks",
    iconUrl: "non_coffee_drink.png",
  },
  {
    guid: "e1da8f1f-99b7-4906-ba52-94176a0fabca",
    name: "Snacks",
    iconUrl: "snacks.png",
  },
];

const shops = [
  {
    guid: "40aae5c0-5129-48d3-96c8-47f99f06d410",
    name: "Coffee Start",
    image: "coffee_start.jpg",
    rating: 4.1,
  },
  {
    guid: "6612eb6b-e3ed-4c48-b9d6-05244f39f7ff",
    name: "Kemine coffee",
    image: "kemine_coffee.jpg",
    rating: 4.5,
  },
  {
    guid: "2f05ac7c-f66e-41ea-b326-5f7a38bbabf1",
    name: "A Coffee",
    image: "a_coffee.jpg",
    rating: 3.8,
  },
];

const products = [
  {
    guid: "f7cd3818-8696-4f00-866a-34e202025a1a",
    name: "Cappucino",
    image: "cappucino.jpg",
    price: 25,
    categoryGuid: categories[0].guid,
    shopGuid: shops[0].guid,
    ingredients: ["caramel syrup", "fruit syrup"],
    rating: 4,
  },
  {
    guid: "f67fb5ee-4150-4f2a-b5a7-85639d1f08ce",
    name: "Glace",
    image: "glace.jpg",
    price: 30,
    categoryGuid: categories[1].guid,
    shopGuid: shops[0].guid,
    ingredients: ["shocolate"],
    rating: 4,
  },
  {
    guid: "ebc1045b-724d-476f-93a4-c7f561a1a291",
    name: "Frappucino",
    image: "frappucino.jpg",
    price: 30,
    categoryGuid: categories[1].guid,
    shopGuid: shops[1].guid,
    ingredients: null,
    rating: 4,
  },
  {
    guid: "df114271-cc26-4946-b0dc-d9f90e7c5d58",
    name: "Trubka",
    image: "trubka.jpg",
    price: 5,
    categoryGuid: categories[3].guid,
    shopGuid: shops[1].guid,
    rating: 4,
  },
  {
    guid: "84405e64-666c-4f25-b28f-b44b431c533d",
    name: "Biscuit",
    image: "biscuit.jpg",
    price: 8,
    categoryGuid: categories[3].guid,
    shopGuid: shops[2].guid,
    rating: 4,
  },
  {
    guid: "0b295934-2291-43de-a292-53e891eae1d0",
    name: "Lemon tea",
    image: "lemon_tea.jpg",
    price: 10,
    categoryGuid: categories[2].guid,
    shopGuid: shops[2].guid,
    rating: 4,
  },
];

const users = [
  {
    guid: "0b295934-2291-43de-a292-53e891eae1d1",
    password: "",
    refreshToken: "",
    phone: "+99364046654",
    gender: "male",
    roles: [Roles.user],
    isActive: true,
    isVerified: true,
    lastLogin: new Date(),
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

      console.log("Seeding user");
      const password = await bcrypt.hash("qwerty", 10);
      users[0].password = password;
      const payload = { sub: users[0].guid, phone: users[0].phone };
      const jwtService = new JwtService();
      const refreshToken = jwtService.sign(payload, {
        secret: configService.get("REFRESH_TOKEN_SECRET"),
        expiresIn: "7d",
      });
      users[0].refreshToken = refreshToken;
      await trx.insertInto("User").values(users).execute();
      console.log("Seeding user done");
    });
  } catch (error) {
    console.error("Error seeding :", error);
  } finally {
    await db.destroy();
  }
};

seed();
