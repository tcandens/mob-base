import fp from 'fastify-plugin'
import { Server, type ServerOptions } from 'socket.io'
import { splitJsonPath } from '../../lib/utils'
import { match, P } from 'ts-pattern'
import snakeCase from 'lodash/snakeCase'
import camelCase from 'lodash/camelCase'
import {type FastifyPluginAsync} from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    sock: Server
  }
}
import { type Session, type SessionData } from '@fastify/secure-session'
import { isBoolean } from 'lodash'

declare module 'socket.io' {
  interface Socket {
    session: Session<SessionData> | null
  }
}

type SyncInitMessage = {
  lastUpdate: number
  tables: string[]
}

const socketIoPlugin: FastifyPluginAsync<Partial<ServerOptions>> = async (app, opt) => {
  const sock = new Server(app.server, {
    path: '/api/sock',
    ...opt,
    
  });
  app.decorate('sock', sock)
  app.addHook('onClose', (f, done) => {
    f.sock.close();
    done()
  })

  sock.use((socket, next) => {
    try {
      const cookies = app.parseCookie(socket.request.headers.cookie || '')
      socket.session = app.decodeSecureSession(cookies['session'])
    } catch (e) {
      socket.session = null
    }
    next()
  })

  app.sock.on('connection', (socket) => {

    if (!socket.session) {
      socket.emit('error', {
        reason: 'UNSESSIONED',
      })
    } else {
      const user = socket.session.get('user')
      const sessionId = socket.session.get('id')

      if (sessionId !== socket.handshake.auth.sessionID) {
        socket.emit('session', {
          sessionId,
          userId: user?.id
        })
      } else {
        socket.emit('session_restart', {
          sessionId,
          userId: user?.id,
        })
      }
    }

    socket.on('sync:init', async (sync_msg: SyncInitMessage) => {
      match(sync_msg)
        .with({ lastUpdate: 0, tables: P.when(t => t.length > 0) }, async (msg) => {
          // get all entities from db

          const entities = {} as Record<string, any>
          for (const table of msg.tables) {
            let tableEntities = await app.db.selectFrom(table as any).selectAll().execute()
            entities[table] = tableEntities.reduce((acc, curr) => {
              acc[curr.id] = Object.keys(curr).reduce((a, c) => {
                const col = camelCase(c)
                let v = curr[c]
                if (c === 'tombstoned') {
                  v = v === 1
                }
                a[col] = v
                return a
              }, {} as any)
              return acc
            }, {} as any)
          }

          socket.emit('sync:in', {
            from: 0,
            entities,
          })

        })
        .with({ lastUpdate: P.number.positive() }, async (msg) => {
          // look for the entities updated after the latest update
          const entities = {} as Record<string, any>
          for (const table of msg.tables) {
            let tableEntities = await app.db.selectFrom(table as any).where(({ and, eb }) => {
              return and([
                eb('updated_at', '>', msg.lastUpdate),
              ])

            }).selectAll().execute()
            entities[table] = tableEntities.reduce((acc, curr) => {
              acc[curr.id] = Object.keys(curr).reduce((a, c) => {
                const col = camelCase(c)
                let v = curr[c]
                // convert sqlite boolean integer flag into proper boolean
                if (c === 'tombstoned') {
                  v = v === 1
                }
                a[col] = v
                return a
              }, {} as any)
              return acc
            }, {} as any)
          }

          socket.emit('sync:in', {
            from: msg.lastUpdate,
            entities,
          })
        })
        .with({ lastUpdate: P.number }, () => {
          // 
        })
        .exhaustive()
    })

    socket.on('action', async (action) => {
    })

    socket.on('patch', async (patch) => {
      return match(patch)
        .with({ op: 'add', path: P.string, value: P.shape({ id: P.string, updatedAt: P.number }) }, async (p) => {
          const [table, _, id] = splitJsonPath(p.path)
          const snakeCased = Object.keys(p.value).reduce((acc, curr) => {
            const nk = snakeCase(curr)
            let v = p.value[curr as keyof typeof p.value]
            // convert booleans to integer for sqlite
            if (isBoolean(v)) {
              v = v ? 1 : 0
            }
            acc[nk as keyof typeof p.value] = v
            return acc
          }, {} as unknown as any)
          const added = await app.db.insertInto(table as any).values(snakeCased as any).returningAll().execute()
          console.log('patch added', added)
        })
        .with({ op: 'replace', path: P.string.endsWith('/tombstoned'), value: P.boolean }, async (p) => {
          const [table, _, id] = splitJsonPath(p.path)
          await app.db.updateTable(table as any)
            .where('id', '=', id)
            .set({ 
              tombstoned: p.value ? 1 : 0,
            })
            .execute()
        })
        .with({ op: 'replace', path: P.string.endsWith('/updatedAt'), value: P.number }, async (p) => {
          const [table, _, id, column] = splitJsonPath(p.path)
          const snakecase_col = snakeCase(column)
          const updated = await app.db.updateTable(table as any)
            .where('id', '=', id)
            .set({ 
              [snakecase_col]: p.value,
            })
            .returningAll()
            .execute()
          console.log('patch updated', updated)
        })
        .otherwise((p) => {
          console.log('unhandled patch', p)
        })
    })
  })
}

export default fp(socketIoPlugin, {
  name: '@app/socket-io',
  dependencies: ['@app/db'],
  encapsulate: false,
})
