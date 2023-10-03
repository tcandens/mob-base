import fp from 'fastify-plugin';
import {match} from 'ts-pattern';
import {randomUUID} from 'node:crypto'
import {Buffer} from 'node:buffer';
import {type FastifyPluginAsync} from 'fastify';
import {type WebSocket} from 'ws';

type ID = string

export type ChannelSocket = {
  socket: WebSocket
  id: ID
  userId?: string
}

function createChannelSocket(socket: WebSocket, sessionId: string): ChannelSocket {
  return {
    socket,
    id: sessionId,
  }
}

type SocketMessageWithPayload<T = string, P = Record<string, unknown>> = {
	type: T;
	payload: P;
};
type SocketMessageNoPayload<T = string> = {
	type: T;
};

type SocketMessage<T = string, P = undefined> = P extends undefined ? SocketMessageNoPayload<T> : SocketMessageWithPayload<T, P>;

type AppSocketMessage =
| SocketMessage<'join', {room: number}>
| SocketMessage<'leave', {room: number}>
| SocketMessage<'broadcast', {room: number; message: SocketMessage}>;

type AppSocketReply =
| SocketMessage<'room_state', {roomId: number; users: string[]}>
| SocketMessage<'broadcasting', {from: string; message: SocketMessage}>
| SocketMessage<'error', {reason: string}>;

type RoomID = number | string
export const sockets = new Map<string, ChannelSocket>();
export const rooms = new Map<RoomID, Set<ID>>();
export const socketsByRoom = new Map<ID, Set<RoomID>>

function joinRoom(roomId: RoomID, channelSocket: ChannelSocket) {
	let room = rooms.get(roomId);
	if (room && room.size > 0) {
		room.add(channelSocket.id);
	} else {
		room = new Set([channelSocket.id]);
	}
	rooms.set(roomId, room);

  const socketRooms = socketsByRoom.get(channelSocket.id)
  if (socketRooms) {
    socketRooms.add(roomId)
    socketsByRoom.set(channelSocket.id, socketRooms)
  } else {
    socketsByRoom.set(channelSocket.id, new Set([roomId]))
  }

}

function leaveRoom(roomId: RoomID, channelSocket: ChannelSocket) {
	const room = rooms.get(roomId);
	if (room) {
		room.delete(channelSocket.id);
		rooms.set(roomId, room);
	}

  const socketRooms = socketsByRoom.get(channelSocket.id)
  if (socketRooms) {
    socketRooms.delete(roomId)
    socketsByRoom.set(channelSocket.id, socketRooms)
  }
}

function getRoomUsers(roomId: string | number): Array<ID> {
	const room = rooms.get(roomId);
	if (!room) {
		return []
	}

  return Array.from(room)
}

function getUserRooms(userId: string) {
  return socketsByRoom.get(userId) ?? [];
}

function getRoomSockets(roomId: string | number): ChannelSocket[] {
  const socketIds = getRoomUsers(roomId)
  return Array.from(socketIds).map(id => {
    return sockets.get(id)!
  })

}

export function socketReply(socket: WebSocket, message: AppSocketReply) {
	socket.send(JSON.stringify(message));
}

function broadcastToRoom(channelSocket: ChannelSocket, roomId: RoomID, message: AppSocketReply, includeSelf = false) {
  const roomChannelSockets = getRoomSockets(roomId)
  roomChannelSockets.forEach(cs => {
    if (!cs || !cs.socket) {
      return
    }
    if (!includeSelf && cs.id === channelSocket.id) {
      return
    }

    socketReply(cs.socket, message)
  })
}

function assertSocketMessage(message: unknown): asserts message is AppSocketMessage {
	if (
		!message
    || typeof message !== 'object'
    || !('type' in message)
	) {
		throw new Error('Invalid message type');
	}
}

const websocketPlugin: FastifyPluginAsync = async (app, opt) => {

  // const pingInterval = setInterval(() => {
  //   for (const [id, client] of sockets.entries()) {
  //     if (client.readyState === 1) {
  //       client.ping('{"ack": true}', undefined, (err) => {
  //         if (err) {
  //           client.terminate()
  //           sockets.delete(id)
  //         }
  //       })
  //     } else {
  //       client.terminate()
  //       sockets.delete(id)
  //     }
  //   }
  // }, 3_000)

	app.get('/', {websocket: true}, (conn, req) => {
		conn.setEncoding('utf-8');

    let sessionId = req.session.get('id') as string
    if (!sessionId || typeof sessionId !== 'string') {
      conn.socket.send(JSON.stringify({ type: 'disconnect' }))
      return conn.socket.terminate()
    }

    const channelSocket = createChannelSocket(conn.socket, sessionId)

    const user = req.session.get('user')
    if (user) {
      channelSocket.userId = user.id
    }
		sockets.set(channelSocket.id, channelSocket);

		conn.socket.addEventListener('close', event => {
			if (channelSocket.id) {
				sockets.delete(channelSocket.id);
			}
		});

		conn.socket.on('message', (data, isBinary) => {
			if (isBinary || !data) {
				return;
			}

			let message: AppSocketMessage;

			try {
				let raw = '';
				if (data instanceof Buffer) {
					raw = data.toString();
				}

				const json = JSON.parse(raw) as unknown;
				assertSocketMessage(json);
				message = json;
			} catch (e) {
				return;
			}


			match(message)
				.with({type: 'join'}, msg => {
          if (!user) {
            return socketReply(conn.socket, {
              type: 'error',
              payload: {
                reason: 'unauthorized'
              }
            })
          }
          const roomId = msg.payload.room
					joinRoom(roomId, channelSocket);
					const users = getRoomUsers(roomId);
          broadcastToRoom(channelSocket, roomId, {
            type: 'room_state',
            payload: {
              roomId,
              users,
            }
          }, true)
				})
				.with({type: 'leave'}, msg => {
          const roomId = msg.payload.room
					app.log.info('leaving room', msg, channelSocket.id);
					leaveRoom(roomId, channelSocket);

          broadcastToRoom(channelSocket, roomId, {
            type: 'room_state',
            payload: {
              roomId,
              users: getRoomUsers(roomId)
            }
          })
				})
				.with({type: 'broadcast'}, msg => {
					// parse out and validate the payload to distribute
					// collect room sockets to send to
					// filter self out
					// send message
				});
		});
	});

	// app.get('/sock', (req, reply) => reply.send({msg: 'Hello'}));
};

export default fp(websocketPlugin, {
	dependencies: ['@fastify/websocket', '@fastify/cookie'],
	encapsulate: true,
});
