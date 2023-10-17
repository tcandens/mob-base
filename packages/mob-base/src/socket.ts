import { types } from 'mobx-state-tree'
import { Socket as PhoenixSocket, type Channel } from 'phoenix'
import { io, Socket as IoSocket, type SocketOptions, type ManagerOptions } from 'socket.io-client'

export interface IMobBaseTransport {
  connect: (auth?: { sessionId: string }) => void
  disconnect: () => void
  emit: (eventName: string, payload: any) => void
  on: (eventName: string, callback: (message: any) => void) => void
}

const sock = new PhoenixSocket('ws://localhost:4000/socket')
sock.connect()

export class MobBaseChannelSocket implements IMobBaseTransport {
  transport: Channel
  constructor({ baseSocket, sessionId }: { baseSocket: PhoenixSocket, sessionId: string }) {
    if (!sessionId) {
      // throw new Error('sessionId is required')
    }
    this.transport = (baseSocket || sock).channel(`sync:${sessionId}`)

    return this
  }
  connect(_auth?: { sessionId: string }) {
    console.log('calling connect')
    this.transport.join()
  }
  disconnect() {
    this.transport.leave()
  }
  emit(eventName: string, payload: any) {
    this.transport.push(eventName, payload)
  }
  on(eventName: string, callback: (message: any) => void) {
    this.transport.on(eventName, callback)
  }
}

export class MobBaseSocket implements IMobBaseTransport {
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
    console.log('setting volitile state')
    return {
      transport: new MobBaseChannelSocket({ baseSocket: sock, sessionId: self.sessionId }),
      // transport: new MobBaseSocket({
      //   path: self.path,
      // })
    }
  })
  .actions((self) => ({
    connect({ sessionId }: { sessionId: string }) {
      self.transport.connect({ sessionId })
    }
  }))
