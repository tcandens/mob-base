import {type FastifyPluginAsync} from 'fastify'

const userPlugin: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => {
    const id = req.session.get('id')
    return reply.send({ id })
  })
}

export default userPlugin
