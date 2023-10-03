import fp from 'fastify-plugin'
import { Server, type ServerOptions } from 'socket.io'
import {type FastifyPluginAsync} from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    sock: Server
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

  app.sock.on('connection', (socket) => {
    socket.on('join', async (msg) => {
      const roomId = `room:${msg.room}`
      await socket.join(roomId)
      const allsockets = await sock.in(roomId).fetchSockets()
      const ids = Array.from(allsockets.values()).map((s) => s.id)
      sock.in(roomId).emit(`room_state:${msg.room}`, {
        users: ids
      })
    })

    socket.on('leave', async (msg) => {
      const roomId = `room:${msg.room}`
      await socket.leave(roomId)
      const allsockets = await sock.in(roomId).fetchSockets()
      const ids = Array.from(allsockets.values()).map((s) => s.id)
      sock.in(roomId).emit(`room_state:${msg.room}`, {
        users: ids,
      })
    })
  })
}

export default fp(socketIoPlugin, {
  encapsulate: false,
})
