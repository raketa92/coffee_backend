import { Kysely } from "kysely";
import { withTimestamps } from "../helpers/dateColumns";

const tableName = "Payment";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.unique().primaryKey())
    .addColumn("orderGuid", "uuid", (col) => col.references("Order.guid"))
    .addColumn("paymentFor", "varchar(50)", (col) => col.notNull())
    .addColumn("cardProvider", "varchar(50)", (col) => col.notNull())
    .addColumn("status", "varchar(50)", (col) => col.notNull())
    .addColumn("bankOrderId", "varchar(50)", (col) => col.notNull())
    .addColumn("amount", "decimal", (col) => col.notNull())
    .addColumn("currency", "integer", (col) => col.notNull())
    .addColumn("description", "text")
    .$call(withTimestamps)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
