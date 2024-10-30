import { Kysely } from "kysely";
import { withTimestamps } from "../helpers/dateColumns";

const tableName = "Shop";
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.unique().primaryKey())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .addColumn("image", "text", (col) => col.notNull())
    .addColumn("rating", "float4", (col) => col.notNull())
    .$call(withTimestamps)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
