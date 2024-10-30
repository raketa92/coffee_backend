import { Kysely } from "kysely";

const tableName = "OrderItem";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.unique().primaryKey())
    .addColumn("orderGuid", "uuid", (col) =>
      col.references("Order.guid").onDelete("cascade")
    )
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("productGuid", "uuid", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
