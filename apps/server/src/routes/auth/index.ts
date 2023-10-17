import fp from 'fastify-plugin'
import z from 'zod'
import { type FastifyPluginAsync} from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'

declare module '@fastify/secure-session' {
  interface SessionData {
    id: string
    user: undefined | {
      id: string
    }
  }
}

const signupSchema = z.object({
  email: z.string(),
  password: z.string()
})

const loginSchema = signupSchema.extend({})

const authPlugin: FastifyPluginAsync = async (app) => {

  app.withTypeProvider<ZodTypeProvider>()
    .post('/signup', {
      schema: {
        body: signupSchema,
      }
    }, async (req, reply) => {
      req.session.set('user', {
        id: '1',
      })
      return reply.send('signed up!')
    }) 
    .post('/login', {
      schema: {
        body: loginSchema,
      }
    }, async (req, reply) => {
      req.session.set('user', {
        id: '1',
      })
      return reply.send('logged in!')
    })
    .get('/user', async (req, reply) => {
      const user = req.session.get('user')

      return reply.send(user)
    })

}

export default fp(authPlugin, {
  name: '@app/auth',
  dependencies: ['@fastify/secure-session', '@fastify/cookie', '@app/db'],
  encapsulate: true
})
