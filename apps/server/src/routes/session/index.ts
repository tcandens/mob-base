import fp from 'fastify-plugin'
import {type FastifyPluginAsync} from 'fastify'

const userPlugin: FastifyPluginAsync = async (app) => {
  app.get('/id', async (req, reply) => {
    const id = req.session.get('id')
    return reply.send({ id })
  })
}

export default fp(userPlugin, {
  name: '@fastify/secure-session',
  encapsulate: true,
})
