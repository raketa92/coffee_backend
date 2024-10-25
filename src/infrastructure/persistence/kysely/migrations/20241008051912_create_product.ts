import { Kysely, sql } from "kysely";
import { withTimestamps } from "../helpers/dateColumns";

const tableName = "Product";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("image", "text", (col) => col.notNull())
    .addColumn("price", "decimal", (col) => col.notNull())
    .addColumn("categoryGuid", "uuid", (col) => col.notNull())
    .addColumn("shopGuid", "uuid", (col) => col.notNull())
    .addColumn("rating", "float4", (col) => col.notNull())
    .addColumn("ingredients", sql`text[]`)
    .$call(withTimestamps)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
