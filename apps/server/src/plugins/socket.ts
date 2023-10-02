import fp from 'fastify-plugin';
import {match} from 'ts-pattern';
import {type FastifyPluginAsync} from 'fastify';
import {type WebSocket} from 'ws';

type SocketMessage<T = string, P = unknown> = {
	type: T;
	payload: P;
};

type AppSocketMessage =
| SocketMessage<'join'>
| SocketMessage<'leave'>;

type AppSocketReply =
| SocketMessage<'joined'>;

export const rooms = new Map<string, Set<string>>();

export function socketReply(socket: WebSocket, message: AppSocketReply) {
	socket.send(JSON.stringify(message));
}

const websocketPlugin: FastifyPluginAsync = async (app, opt) => {
	app.get('/sock', {websocket: true}, (conn, req) => {
		conn.socket.on('open', a => {
			console.dir('opened', a);
		});
		conn.socket.on('message', (message: SocketMessage) => {
			match(message)
				.with({type: 'join'}, msg => {
					socketReply(conn.socket, {
						type: 'joined',
						payload: 'You did it!',
					});
				});
		});
	});

	// app.get('/sock', (req, reply) => reply.send({msg: 'Hello'}));
};

export default fp(websocketPlugin, {
	dependencies: ['@fastify/websocket'],
	encapsulate: true,
});
