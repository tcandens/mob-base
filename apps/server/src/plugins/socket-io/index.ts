import fp from 'fastify-plugin'
import { Server, type ServerOptions } from 'socket.io'
import { splitJsonPath } from '../../lib/utils'
import { match } from 'ts-pattern'
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

    socket.on('sync:init', async (sync_msg) => {
      console.log('initializing sync', sync_msg)
    })

    socket.on('action', async (action) => {
    })

    socket.on('patch', async (patch) => {
      match(patch)
        .with({ op: 'add' }, (p) => {
          console.log('we caught the add', p, socket.session?.id)
        })
        .otherwise((p) => {
          console.log('unhandled patch', p)
        })
    })
  })
}

export default fp(socketIoPlugin, {
  encapsulate: false,
})
