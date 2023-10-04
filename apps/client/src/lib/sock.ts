import { io } from 'socket.io-client'

const sockProto = import.meta.env.SOCK_PROTO || location.protocol
const sockHost = import.meta.env.SOCK_HOST || location.hostname
const sockPort = import.meta.env.SOCK_PORT || location.port
const sockPath = import.meta.env.SOCK_PATH || '/api/sock'
const sockUrl = `${sockProto}//${sockHost}:${sockPort}`
export const socket = io(sockUrl, {path: sockPath})

// const SOCKET_SESSION_ID_KEY = 'socketSessionID'

fetch('/api/session/id').then(res => res.json()).then(({ id }) => {
  socket.auth = {
    sessionID: id
  }
  socket.connect()
})

// socket.on('session', (msg) => {
//   console.log('recieved session info', msg)
//   socket.auth = {
//     sessionID: msg.sessionId,
//   }
//   localStorage.setItem(SOCKET_SESSION_ID_KEY, msg.sessionId)
// })
// socket.on('session_restart', (msg) => {
//   console.log('session restarting', msg)
// })
