// src/server/websocketServer.ts
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http'; // Use HTTP server; HTTPS handled by Vercel

interface Room {
  players: WebSocket[];
  state: string;
  player1?: string;
  player2?: string;
}

interface MessageData {
  type: string;
  roomId?: string;
  player?: 'player1' | 'player2';
  secret?: string;
  [key: string]: any;
}

const server = createServer();
const wss = new WebSocketServer({ server });
const rooms: { [key: string]: Room } = {};

wss.on('connection', (ws: WebSocket) => {
  (ws as any).roomId = null;

  ws.on('message', (message: string) => {
    const data: MessageData = JSON.parse(message);

    switch (data.type) {
      case 'CREATE_ROOM':
        const roomId = uuidv4();
        rooms[roomId] = { players: [ws], state: 'waiting' };
        (ws as any).roomId = roomId;
        ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId }));
        break;
      case 'JOIN_ROOM':
        const room = rooms[data.roomId!];
        if (room) {
          room.players.push(ws);
          (ws as any).roomId = data.roomId!;
          room.players.forEach((player: WebSocket) =>
            player.send(JSON.stringify({ type: 'PLAYER_JOINED', roomId: data.roomId }))
          );
        } else {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
        }
        break;
      case 'SET_SECRET':
        const currentRoom = rooms[data.roomId!];
        if (data.player && data.secret) {
          currentRoom[data.player] = data.secret;
          if (currentRoom.player1 && currentRoom.player2) {
            currentRoom.state = 'ready';
            currentRoom.players.forEach((player: WebSocket) =>
              player.send(JSON.stringify({ type: 'GAME_READY', roomId: data.roomId }))
            );
          }
        }
        break;
      case 'LEAVE_ROOM':
        const leaveRoom = rooms[(ws as any).roomId];
        if (leaveRoom) {
          leaveRoom.players = leaveRoom.players.filter((player: WebSocket) => player !== ws);
          if (leaveRoom.players.length === 0) {
            delete rooms[(ws as any).roomId];
          } else {
            leaveRoom.players.forEach((player: WebSocket) =>
              player.send(JSON.stringify({ type: 'PLAYER_LEFT', roomId: (ws as any).roomId }))
            );
          }
        }
        break;
    }
  });

  ws.on('close', () => {
    const room = rooms[(ws as any).roomId];
    if (room) {
      room.players = room.players.filter((player: WebSocket) => player !== ws);
      if (room.players.length === 0) {
        delete rooms[(ws as any).roomId];
      } else {
        room.players.forEach((player: WebSocket) =>
          player.send(JSON.stringify({ type: 'PLAYER_DISCONNECTED', roomId: (ws as any).roomId }))
        );
      }
    }
  });
});

export { server, wss };
