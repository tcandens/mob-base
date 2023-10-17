import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text')
    .addColumn('created_at', 'integer', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'integer', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('tombstoned', 'boolean', (col) => col.defaultTo(false))
    .execute()

  await db.schema
    .createTable('programs')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text')
    .addColumn('user_id', 'text', (col) => col.references('users.id'))
    .addColumn('created_at', 'integer', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'integer', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('tombstoned', 'boolean', (col) => col.defaultTo(false))
    .execute()

  await db.schema.createIndex('programs_users_idx').on('programs').columns(['user_id']).execute()

  await db.schema
    .createTable('patches')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.references('users.id'))
    .addColumn('client_id', 'text', (col) => col.notNull())
    .addColumn('op', 'text', (col) => col.notNull())
    .addColumn('path', 'text', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('checkpoints')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('user_id', 'text', (col) => col.references('users.id'))
    .addColumn('patch_id', 'text', (col) => col.references('patches.id'))
    .addColumn('hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'integer', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('previous_id', 'text', (col) => col.references('checkpoints.hash'))
    .execute()
  await db.schema.createIndex('checkpoints_hash_idx').on('checkpoints').columns(['hash']).execute()
  await db.schema.createIndex('checkpoints_patch_id_idx').on('checkpoints').columns(['patch_id']).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('checkpoints_patch_id_idx').execute()
  await db.schema.dropIndex('checkpoints_hash_idx').execute()
  await db.schema.dropTable('checkpoints').execute()

  await db.schema.dropTable('patches').execute()

  await db.schema.dropIndex('programs_users_idx').execute()
  await db.schema
    .dropTable('programs')
    .execute()

  await db.schema
    .dropTable('users')
    .execute()

}
