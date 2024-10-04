import { CreateTableBuilder, sql } from "kysely";

export function withTimestamps(
  qb: CreateTableBuilder<string>
): CreateTableBuilder<string> {
  return qb
    .addColumn("createdAt", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    );
}
