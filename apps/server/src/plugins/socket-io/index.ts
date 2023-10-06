import fp from 'fastify-plugin'
import { Server, type ServerOptions } from 'socket.io'
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

    // socket.on('channel:join', async (msg) => {
    //   const channelId = `channel:${msg.room}`
    //   await socket.join(channelId)
    //   const allsockets = sock.of(channelId).sockets
    //   const ids = Array.from(allsockets.values()).map((s) => s.id)
    //   sock.in(channelId).emit(`room_state:${msg.room}`, {
    //     users: ids
    //   })
    // })
    //
    // socket.on('channel:leave', async (msg) => {
    //   const channelId = `channel:${msg.room}`
    //   await socket.leave(channelId)
    //   const allsockets = sock.of(channelId).sockets
    //   const ids = Array.from(allsockets.values()).map((s) => s.id)
    //   sock.in(channelId).emit(`room_state:${msg.room}`, {
    //     users: ids,
    //   })
    // })

    socket.on('action', async (action) => {
      console.log('rec action:', action)
    })

    socket.on('patch', async (patch) => {
      console.log('rec patch:', patch)
    })
  })
}

export default fp(socketIoPlugin, {
  encapsulate: false,
})
