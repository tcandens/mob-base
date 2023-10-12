import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text')
    .addColumn('created_at', 'numeric', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'numeric', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('tombstoned', 'boolean', (col) => col.defaultTo(false))
    .execute()

  await db.schema
    .createTable('programs')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text')
    .addColumn('created_at', 'numeric', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'numeric', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('tombstoned', 'boolean', (col) => col.defaultTo(false))
    .execute()

  await db.schema
    .createTable('merkles')
    .addColumn('user_id', 'text', (col) => col.references('users.id'))
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('created_at', 'numeric', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('previous', 'text', (col) => col.references('merkles.value'))
    .execute()

  await db.schema
    .createIndex('merkles_values_idx')
    .on('merkles')
    .columns(['user_id', 'value'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .dropTable('programs')
    .execute()

  await db.schema
    .dropTable('users')
    .execute()

  await db.schema.dropIndex('merkles_values_idx').execute()
  await db.schema.dropTable('merkles').execute()
}
