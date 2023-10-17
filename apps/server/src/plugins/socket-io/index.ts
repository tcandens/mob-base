import fp from 'fastify-plugin'
import { Server, type ServerOptions } from 'socket.io'
import { splitJsonPath } from '../../lib/utils'
import { match, P } from 'ts-pattern'
import snakeCase from 'lodash/snakeCase'
import camelCase from 'lodash/camelCase'
import { MerkleTrie } from 'mob-base'
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
  lastPatchId: string
  hash: string,
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

    socket.on('sync:pull', async (sync_msg: SyncInitMessage) => {
      if (!socket.session) {
        throw new Error('no session available')
      }

      const user = socket.session.get('user')
      if (!user || !user.id) {
        return 
      }

      match(sync_msg)
        .with({ lastPatchId: P.nullish }, async (msg) => {
          app.log.debug('client pulling sync with no history')
          // client has no history
          const patches = await app.db.selectFrom('patches')
            .where('user_id', '=', user.id)
            .orderBy('id', 'asc')
            .select(['id', 'value', 'op', 'path'])
            .execute()

          socket.emit('sync:push', {
            patches,
          })

        })
        .with({ lastPatchId: P.string, hash: P.string }, async (msg) => {
          app.log.debug({ 
            msg: 'client pulling sync with history',
            lastPatchId: msg.lastPatchId,
            hash: msg.hash
          })
          // client has history and we need to find out if it is ahead or behind
          const patchesSince = await app.db.selectFrom('patches')
            .where(({ and, eb }) => {
              return and([
                eb('user_id', '=', user.id),
                eb('id', '>', msg.lastPatchId)
              ])
            })
            .orderBy('id', 'asc')
            .select(['id', 'value', 'op', 'path'])
            .execute()

          if (patchesSince.length === 0) {
            // we havent seen this patch so request any patches this client has since the latest patch we have





          } else {
            socket.emit('sync:push', {
              patches: patchesSince,
            })
          }



        })
        .exhaustive()
    })


    socket.on('patch', async (patch) => {
      if (!socket.session) {
        throw new Error('no session available')
      }

      const user = socket.session.get('user')

      if (!user || !user.id) {
        return 
      }

      const savedPatchId = await app.db.insertInto('patches')
        .values({
          ...patch,
          user_id: user.id,
        })
        .returning('id')
        .executeTakeFirstOrThrow()


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
