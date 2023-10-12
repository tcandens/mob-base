import { modelDatabase } from 'mob-base'

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
    path: import.meta.env.SOCK_PATH,
  },
  meta: {
    mode: 'persistent',
  }
})

globalThis.db = db


// fetch('/api/session').then(res => res.json()).then(({ id }) => {
//   // db.socket.connect({ sessionId: id })
// })
