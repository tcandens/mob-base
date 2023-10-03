import fp from 'fastify-plugin'
import { randomUUID } from 'node:crypto'
import {type FastifyPluginAsync} from 'fastify'

declare module '@fastify/secure-session' {
  interface SessionData {
    id: string
    user: undefined | {
      id: string
    }
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {

  app.post('/signup', async (req, reply) => {
    req.session.set('user', {
      id: '1',
    })
    return reply.send('signed up!')
  }) 

  app.post('/login', async (req, reply) => {
    req.session.set('user', {
      id: '1',
    })
    return reply.send('logged in!')
  })

  app.get('/user', async (req, reply) => {
    const user = req.session.get('user')

    return reply.send(user)
  })

}

export default fp(authPlugin, {
  name: '@app/auth',
  dependencies: ['@fastify/secure-session', '@fastify/cookie'],
  encapsulate: true
})
