import { useEffect } from 'react'
import { nanoid } from 'nanoid'

export function send(socket: WebSocket, payload: Record<string, unknown>) {
  socket.send(JSON.stringify(payload))
}
export function parseEvent(event: MessageEvent) {
  return JSON.parse(event.data)
}
export function createMessageHandler<T = string>(handler: (message: Record<string, T>) => void) {
  return (event: MessageEvent) => {
    const data = parseEvent(event)
    handler(data)
  }
}

const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
// const host = import.meta.env.SERVER_HOST ?? location.host

let innerSocket: WebSocket
export function createSocket() {
  const s = new WebSocket(`${protocol}//${location.host}/api/socket`)
  s.id = nanoid()
  console.log('creating socket', s.id)
  return s
}
innerSocket = createSocket()

export function restartSocket() {
  if (innerSocket) innerSocket.close()
  innerSocket = createSocket()
}

export const socket = innerSocket


type UseSocketConfigEventHandler = (message: Record<string, unknown> | undefined, socket: WebSocket) => void
export const useSocket = (sock: WebSocket, config: Record<string, UseSocketConfigEventHandler>) => {
  console.log('socketid', sock.id)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = parseEvent(event)
      console.log('incoming message', data)
      if (data.type in config) {
        config[data.type](data.payload, socket)
      }
    }

    function handleOpen() {
      if (typeof config.open === 'function') {
        config.open(undefined, socket)
        sock.addEventListener('message', handleMessage)
      }
    }
    function handleClose() {
      if (typeof config.close === 'function') {
        config.close(undefined, socket)
      }
    }

    sock.addEventListener('open', handleOpen)
    sock.addEventListener('close', handleClose)
    console.log('running effect')

    return () => {
      console.log('cleaning up')
      sock.removeEventListener('message', handleMessage)
      sock.removeEventListener('open', handleOpen)
      sock.removeEventListener('close', handleClose)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sock.id])

  function send(payload: Record<string, unknown>) {
    if (sock && sock.readyState === 1) {
      sock.send(JSON.stringify(payload))
    }
  }

  window.addEventListener('beforeunload', () => {
    if (typeof config.close === 'function') {
      config.close(undefined, socket)
    }
    sock.close()
  })


  return [send]
}
