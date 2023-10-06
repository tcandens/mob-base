import { modelDatabase } from 'mob-base'

// const sockProto = import.meta.env.SOCK_PROTO || location.protocol
// const sockHost = import.meta.env.SOCK_HOST || location.hostname
// const sockPort = import.meta.env.SOCK_PORT || location.port
const sockPath = import.meta.env.SOCK_PATH || '/api/sock'
// const sockUrl = `${sockProto}//${sockHost}:${sockPort}`

const Database = modelDatabase((t, u) => {
  const users = u.entity({
    name: t.string,
  })
  const programs = u.entity({
    name: t.string,
    userId: t.reference(users)
  })

  return {
    users,
    programs,
  }
})

export const db = Database.create({
  socket: {
    path: sockPath,
  },
})

fetch('/api/session/id').then(res => res.json()).then(({ id }) => {
  db.socket.connect({ sessionId: id })
})
