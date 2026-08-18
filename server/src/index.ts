import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './rooms/roomManager.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager(io);

// Health check and room query API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

app.get('/api/room/:roomId', (req, res) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    roomId: room.id,
    phase: room.engine.state.phase,
    playerCount: room.engine.state.players.length,
    isFull: room.engine.state.players.length >= 12,
  });
});

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('createRoom', (data: { playerName: string; customMaxCards?: number }, callback) => {
    try {
      const { roomId, sessionToken, playerId } = roomManager.createRoom(socket, data.playerName, data.customMaxCards);
      socket.emit('roomCreated', { roomId, sessionToken, playerId });
      if (callback) callback({ success: true, roomId });
    } catch (err: any) {
      console.error('Error creating room:', err);
      socket.emit('errorNotification', err.message || 'Failed to create room');
      if (callback) callback({ success: false, error: err.message });
    }
  });

  socket.on('joinRoom', (data: { roomId: string; playerName: string; sessionToken?: string }, callback) => {
    try {
      const { roomId, sessionToken, playerId } = roomManager.joinRoom(socket, data.roomId, data.playerName, data.sessionToken);
      socket.emit('roomJoined', { roomId, sessionToken, playerId });
      if (callback) callback({ success: true });
    } catch (err: any) {
      console.error('Error joining room:', err);
      socket.emit('errorNotification', err.message || 'Failed to join room');
      if (callback) callback({ success: false, error: err.message });
    }
  });

  socket.on('reconnectSeat', (data: { roomId: string; sessionToken: string }, callback) => {
    try {
      const success = roomManager.reconnectSeat(socket, data.roomId, data.sessionToken);
      if (callback) callback({ success });
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  socket.on('transferSeat', (data: { transferCode: string }, callback) => {
    try {
      const result = roomManager.transferSeat(socket, data.transferCode);
      if (result) {
        socket.emit('roomJoined', { roomId: result.roomId, sessionToken: result.sessionToken, playerId: result.playerId });
        if (callback) callback({ success: true, roomId: result.roomId });
      } else {
        socket.emit('errorNotification', 'Invalid transfer code');
        if (callback) callback({ success: false, error: 'Invalid transfer code' });
      }
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  socket.on('startGame', () => {
    try {
      for (const [roomId, room] of (roomManager as any).rooms.entries()) {
        const player = room.engine.state.players.find((p: any) => p.id === socket.id);
        if (player) {
          roomManager.startGame(roomId, socket.id);
          break;
        }
      }
    } catch (err: any) {
      socket.emit('errorNotification', err.message);
    }
  });

  socket.on('addBot', (callback) => {
    try {
      for (const [roomId, room] of (roomManager as any).rooms.entries()) {
        const player = room.engine.state.players.find((p: any) => p.id === socket.id);
        if (player) {
          roomManager.addBot(roomId, socket.id);
          if (callback) callback({ success: true });
          break;
        }
      }
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  socket.on('removeBot', (botId: string) => {
    try {
      for (const [roomId, room] of (roomManager as any).rooms.entries()) {
        const player = room.engine.state.players.find((p: any) => p.id === socket.id);
        if (player) {
          roomManager.removeBot(roomId, botId, socket.id);
          break;
        }
      }
    } catch (err: any) {
      socket.emit('errorNotification', err.message);
    }
  });

  socket.on('kickPlayer', (playerId: string) => {
    try {
      for (const [roomId, room] of (roomManager as any).rooms.entries()) {
        const player = room.engine.state.players.find((p: any) => p.id === socket.id);
        if (player) {
          roomManager.kickPlayer(roomId, playerId, socket.id);
          break;
        }
      }
    } catch (err: any) {
      socket.emit('errorNotification', err.message);
    }
  });

  socket.on('makeBid', (bid: number) => {
    try {
      roomManager.makeBid(socket.id, bid);
    } catch (err: any) {
      socket.emit('errorNotification', err.message);
    }
  });

  socket.on('playCard', (cardId: string) => {
    try {
      roomManager.playCard(socket.id, cardId);
    } catch (err: any) {
      socket.emit('errorNotification', err.message);
    }
  });

  socket.on('nextRound', () => {
    try {
      for (const [roomId, room] of (roomManager as any).rooms.entries()) {
        const player = room.engine.state.players.find((p: any) => p.id === socket.id);
        if (player) {
          roomManager.nextRound(roomId, socket.id);
          break;
        }
      }
    } catch (err: any) {
      socket.emit('errorNotification', err.message);
    }
  });

  socket.on('restartGame', () => {
    try {
      for (const [roomId, room] of (roomManager as any).rooms.entries()) {
        const player = room.engine.state.players.find((p: any) => p.id === socket.id);
        if (player) {
          roomManager.restartGame(roomId, socket.id);
          break;
        }
      }
    } catch (err: any) {
      socket.emit('errorNotification', err.message);
    }
  });

  socket.on('sendChat', (text: string) => {
    try {
      for (const [roomId, room] of (roomManager as any).rooms.entries()) {
        const player = room.engine.state.players.find((p: any) => p.id === socket.id);
        if (player) {
          io.to(roomId).emit('chatMessage', {
            sender: player.name,
            text,
            timestamp: Date.now(),
          });
          break;
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    roomManager.handleDisconnect(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🃏 Kachuful Game Server running on http://0.0.0.0:${PORT}`);
});
