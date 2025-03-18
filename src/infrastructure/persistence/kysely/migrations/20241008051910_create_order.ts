import { Kysely } from "kysely";
import { withTimestamps } from "../helpers/dateColumns";

const tableName = "Order";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.unique().primaryKey())
    .addColumn("orderNumber", "varchar(50)", (col) => col.notNull().unique())
    .addColumn("userGuid", "uuid")
    .addColumn("shopGuid", "uuid", (col) => col.notNull())
    .addColumn("phone", "varchar(15)", (col) => col.notNull())
    .addColumn("address", "text", (col) => col.notNull())
    .addColumn("totalPrice", "decimal", (col) => col.notNull())
    .addColumn("status", "varchar(50)", (col) => col.notNull())
    .addColumn("paymentGuid", "uuid")
    .addColumn("paymentMethod", "varchar(50)")
    .addColumn("card", "json")
    .addColumn("deliveryDateTime", "timestamptz")
    .$call(withTimestamps)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
