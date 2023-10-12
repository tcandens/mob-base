import { Kysely, SqliteDialect } from 'kysely'
import Database from 'better-sqlite3'
import env from '../env'
import type { DB } from './db.d.ts'

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: new Database(env.DATABASE_URL)
  })
})

