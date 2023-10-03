import fp from 'fastify-plugin'
import {type FastifyPluginAsync} from 'fastify'

const userPlugin: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => {
    const user = req.session.get('user')
    return reply.send({ user })
  })
}

export default fp(userPlugin, {
  name: '@fastify/secure-session',
  encapsulate: true,
})
