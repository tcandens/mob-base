import { types } from 'mobx-state-tree'
import { io, Socket as IoSocket, type SocketOptions, type ManagerOptions } from 'socket.io-client'

export class MobBaseSocket {
  transport: IoSocket
  constructor(opt?: Partial<SocketOptions & ManagerOptions>) {

    const defaultOpt: typeof opt = {
      path: '/api/sock',
    }
    const options = Object.assign(defaultOpt, opt)

    this.transport = io(options)
  }
  connect(auth?: { sessionId: string }) {
    this.transport.auth = auth
    this.transport.connect()
  }
  disconnect() {
    this.transport.disconnect()
  }
  emit(eventName: string, message: any) {
    this.transport.emit(eventName, message)
  }
  on(eventName: string, callback: (message: any) => void) {
    this.transport.on(eventName, callback)
  }
}

export const Socket = types.model({
  path: types.optional(types.string, '/api/sock'),
  sessionId: types.maybe(types.string),
})
  .volatile((self) => {
    return {
      transport: new MobBaseSocket({
        path: self.path,
      })
    }
  })
  .actions((self) => ({
    connect({ sessionId }: { sessionId: string }) {
      self.transport.connect({ sessionId })
    }
  }))
