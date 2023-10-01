import fastify from 'fastify';
import env from './env';
import {serializerCompiler, validatorCompiler, type ZodTypeProvider} from 'fastify-type-provider-zod';
import z from 'zod';

const app = fastify({
	logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

void app.register(import('@fastify/autoload'));
void app.register(import('@fastify/websocket'));

app.get('/', (req, reply) => reply.send('Hello world!'));

app.get('/api/:name', {
	schema: {
		params: z.object({
			name: z.string(),
		}),
	},
}, (req, reply) => {
	console.log(req.params);
	return reply.send(`Love you, ${req.params.name}!`);
});

app.listen({
	port: env.SERVER_PORT,
	host: '0.0.0.0',
}).catch(err => {
	app.log.fatal(err);
});
