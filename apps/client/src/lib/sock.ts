import { io } from 'socket.io-client'

const sockProto = import.meta.env.SOCK_PROTO || location.protocol
const sockHost = import.meta.env.SOCK_HOST || location.hostname
const sockPort = import.meta.env.SOCK_PORT || location.port
const sockPath = import.meta.env.SOCK_PATH || '/api/sock'
const sockUrl = `${sockProto}//${sockHost}:${sockPort}`
export const socket = io(sockUrl, {path: sockPath})
