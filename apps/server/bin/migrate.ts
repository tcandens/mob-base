#!/usr/bin/env ts-node

import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import env from '../src/env'
import Database from 'better-sqlite3'
import {
  Kysely,
  Migrator,
  SqliteDialect,
  FileMigrationProvider
} from 'kysely'

const root = path.join(__dirname, '../')
const migrationDir = path.join(root, 'src/migrations')
const databaseFilename = path.join(root, env.DATABASE_URL)
const databaseDirectory = path.parse(databaseFilename).dir

async function migrateToLatest() {

  await fs.lstat(migrationDir)
    .catch((e) => {
      return fs.mkdir(migrationDir)
    })

  await fs.lstat(databaseDirectory)
    .catch((e) => {
      return fs.mkdir(databaseDirectory)
    })

  const db = new Kysely({
    dialect: new SqliteDialect({
      database: new Database(databaseFilename),
    })
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({ 
      fs,
      path,
      migrationFolder: path.join(root, 'src/migrations')
    })
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrateToLatest()
