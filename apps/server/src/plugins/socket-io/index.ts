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
                a[camelCase(c)] = curr[c]
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
                eb('updated_at', '>=', msg.lastUpdate),
              ])

            }).selectAll().execute()
            entities[table] = tableEntities.reduce((acc, curr) => {
              acc[curr.id] = Object.keys(curr).reduce((a, c) => {
                a[camelCase(c)] = curr[c]
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
            acc[nk as keyof typeof p.value] = p.value[curr as keyof typeof p.value]
            return acc
          }, {} as unknown as any)
          const added = await app.db.insertInto(table as any).values(snakeCased as any).returningAll().execute()
          console.log('added', added)
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
