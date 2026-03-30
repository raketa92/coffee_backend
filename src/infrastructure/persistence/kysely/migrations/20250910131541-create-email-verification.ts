import { Kysely, sql } from "kysely";

const tableName = "EmailVerification";
const enumType = "email_verification_purpose_enum";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType(enumType).asEnum(["userChangeEmail"]).execute();

  await db.schema
    .createTable(tableName)
    .addColumn("guid", "uuid", (col) => col.unique().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("otp", "varchar(10)", (col) => col.notNull())
    .addColumn("email", "varchar(60)", (col) => col.notNull())
    .addColumn("purpose", sql`email_verification_purpose_enum`, (col) =>
      col.notNull()
    )
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
