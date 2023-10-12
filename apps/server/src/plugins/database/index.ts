import fp from 'fastify-plugin'
import { db } from '../../lib/sqlite'
import type { FastifyPluginAsync } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db
  }
}

const db_plugin: FastifyPluginAsync = async (app) => {
  app.decorate('db', db) 
}

export default fp(db_plugin, {
  name: '@app/db',
  encapsulate: false,
})
