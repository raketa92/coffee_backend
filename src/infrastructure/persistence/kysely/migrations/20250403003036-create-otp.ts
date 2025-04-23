import { Kysely, sql } from "kysely";

const tableName = "Otp";
const enumType = "otp_purpose_enum";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType(enumType)
    .asEnum(["userRegister", "userChangePassword", "userChangePhone"])
    .execute();

  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.unique().primaryKey())
    .addColumn("phone", "varchar(20)", (col) => col.notNull())
    .addColumn("otp", "varchar(20)", (col) => col.notNull())
    .addColumn("payload", "varchar(100)", (col) => col.notNull())
    .addColumn("purpose", sql`otp_purpose_enum`, (col) => col.notNull())
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
