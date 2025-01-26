import { Kysely, sql } from "kysely";
import { withTimestamps } from "../helpers/dateColumns";

const tableName = "User";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.unique().primaryKey())
    .addColumn("password", "text", (col) => col.notNull())
    .addColumn("email", "varchar(60)")
    .addColumn("phone", "varchar(20)", (col) => col.notNull())
    .addColumn("userName", "varchar(30)")
    .addColumn("firstName", "varchar(30)")
    .addColumn("lastName", "varchar(30)")
    .addColumn("gender", "varchar(20)", (col) => col.notNull())
    .addColumn("roles", sql`text[]`, (col) => col.notNull())
    .addColumn("refreshToken", "text")
    .$call(withTimestamps)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
