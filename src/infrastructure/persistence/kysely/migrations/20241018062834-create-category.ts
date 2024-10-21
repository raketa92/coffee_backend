import { Kysely } from "kysely";
import { withTimestamps } from "../helpers/dateColumns";

const tableName = "Category";
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("iconUrl", "text", (col) => col.notNull())
    .$call(withTimestamps)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
