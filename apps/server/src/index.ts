import fastify from 'fastify';
import env from './env';
import {serializerCompiler, validatorCompiler, type ZodTypeProvider} from 'fastify-type-provider-zod';
import z from 'zod';
import path from 'node:path';

const app = fastify({
	logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

void app.register(import('@fastify/websocket'));

void app.register(import('@fastify/autoload'), {
	dir: path.resolve(__dirname, './plugins'),
	// Encapsulate: false,
	options: {
		prefix: '/api',
	},
});

app.listen({
	port: env.SERVER_PORT,
	host: '0.0.0.0',
}).catch(err => {
	app.log.fatal(err);
});
