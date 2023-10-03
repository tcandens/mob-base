import fastify from 'fastify';
import env from './env';
import { randomUUID } from 'node:crypto'
import {serializerCompiler, validatorCompiler, type ZodTypeProvider} from 'fastify-type-provider-zod';
import z from 'zod';
import path from 'node:path';

const app = fastify({
	logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

void app.register(import('@fastify/cookie'));
void app.register(import('@fastify/jwt'), {
  secret: 'supersecret',
});
void app.register(import('@fastify/secure-session'), {
  secret: 'supersecret_which_is_not_so_secret',
  salt: Array(16).fill(0).join(''),
  sessionName: 'session',
  cookieName: 'session',
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    path: '/'
  }
})
void app.register(import('@fastify/websocket'));

void app.register(import('@fastify/autoload'), {
	dir: path.resolve(__dirname, './routes'),
	options: {
		prefix: '/api',
	},
})
void app.register(import('@fastify/autoload'), {
	dir: path.resolve(__dirname, './plugins'),
	options: {
		prefix: '/api',
	},
});

void app.addHook('onRequest', (req, reply, done) => {
  const sessionId = req.session.get('id')
  if (!sessionId) {
    req.session.set('id', randomUUID())
  }
  done()
})

app.listen({
	port: env.SERVER_PORT,
	host: '0.0.0.0',
}).catch(err => {
	app.log.fatal(err);
});
