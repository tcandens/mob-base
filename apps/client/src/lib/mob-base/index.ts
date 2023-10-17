import { modelDatabase, modelEntity, types } from 'mob-base'

const users = modelEntity({
  name: types.string,
})

const programs = modelEntity({
  name: types.string,
  userId: types.reference(users),
})

const Database = modelDatabase(() => ({
  users,
  programs,
}))

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
