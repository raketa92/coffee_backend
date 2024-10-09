import { Kysely } from "kysely";
import { withTimestamps } from "../helpers/dateColumns";

const tableName = "BankResponse";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.primaryKey())
    .addColumn("paymentId", "uuid", (col) => col.references("Payment.guid"))
    .addColumn("errorCode", "varchar(50)")
    .addColumn("errorMessage", "varchar")
    .addColumn("orderNumber", "varchar(50)", (col) => col.notNull())
    .addColumn("orderStatus", "integer", (col) => col.notNull())
    .addColumn("actionCode", "integer")
    .addColumn("amount", "decimal", (col) => col.notNull())
    .addColumn("currency", "integer", (col) => col.notNull())
    .addColumn("date", "varchar", (col) => col.notNull())
    .addColumn("ip", "varchar")
    .addColumn("orderDescription", "text")
    .addColumn("merchantOrderParams", "text")
    .addColumn("attributes", "text")
    .addColumn("cardAuthInfo", "json")
    .addColumn("authDateTime", "varchar")
    .addColumn("terminalId", "varchar")
    .addColumn("authRefNum", "varchar")
    .addColumn("paymentAmountInfo", "json")
    .addColumn("bankInfo", "json")
    .$call(withTimestamps)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
