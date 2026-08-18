import { Server } from 'socket.io';
import { GameEngine, Player } from '../engine/gameEngine.js';
import { chooseBotBid, chooseBotCard } from '../engine/botLogic.js';
import { getValidBids } from '../engine/rules.js';
import { Card } from '../engine/deck.js';

const BOT_NAMES = [
  'Arya (Bot)',
  'Diya (Bot)',
  'Kabir (Bot)',
  'Rohan (Bot)',
  'Ananya (Bot)',
  'Vikram (Bot)',
  'Meera (Bot)',
  'Arjun (Bot)',
  'Tara (Bot)',
  'Siddharth (Bot)',
  'Neha (Bot)',
];

export interface Room {
  id: string;
  engine: GameEngine;
  createdAt: number;
  lastActive: number;
  trickHoldTimer?: NodeJS.Timeout;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private socketToPlayerMap: Map<string, { roomId: string; playerId: string; sessionToken: string }> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (this.rooms.has(code)) {
      return this.generateRoomCode();
    }
    return code;
  }

  public generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  public createRoom(hostName: string, socketId: string, customMaxCards?: number): { roomId: string; sessionToken: string; playerId: string } {
    const roomId = this.generateRoomCode();
    const engine = new GameEngine(roomId, customMaxCards);
    const sessionToken = this.generateSessionToken();

    const host = engine.addPlayer(socketId, hostName || 'Host', `avatar_${socketId}`, true, false, sessionToken);

    this.rooms.set(roomId, {
      id: roomId,
      engine,
      createdAt: Date.now(),
      lastActive: Date.now(),
    });

    this.socketToPlayerMap.set(socketId, { roomId, playerId: socketId, sessionToken });

    return { roomId, sessionToken, playerId: host.id };
  }

  public joinRoom(
    roomId: string,
    playerName: string,
    socketId: string,
    existingSessionToken?: string
  ): { success: boolean; sessionToken?: string; playerId?: string; error?: string } {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) {
      return { success: false, error: `Room ${roomId} does not exist` };
    }

    room.lastActive = Date.now();

    if (existingSessionToken) {
      const existingPlayer = room.engine.reconnectPlayer(existingSessionToken, socketId);
      if (existingPlayer) {
        this.socketToPlayerMap.set(socketId, { roomId: room.id, playerId: existingPlayer.id, sessionToken: existingSessionToken });
        this.broadcastGameState(room.id);
        return { success: true, sessionToken: existingSessionToken, playerId: existingPlayer.id };
      }
    }

    if (room.engine.state.phase !== 'LOBBY') {
      return { success: false, error: 'Game is already in progress' };
    }

    if (room.engine.state.players.length >= 12) {
      return { success: false, error: 'Room capacity reached (12 max)' };
    }

    const sessionToken = this.generateSessionToken();
    try {
      const player = room.engine.addPlayer(
        socketId,
        playerName || `Player ${room.engine.state.players.length + 1}`,
        `avatar_${socketId}`,
        false,
        false,
        sessionToken
      );

      this.socketToPlayerMap.set(socketId, { roomId: room.id, playerId: player.id, sessionToken });
      this.broadcastGameState(room.id);

      return { success: true, sessionToken, playerId: player.id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Could not join room' };
    }
  }

  public transferSeat(
    transferCode: string,
    socketId: string
  ): { success: boolean; roomId?: string; sessionToken?: string; playerId?: string; error?: string } {
    const code = transferCode.trim().toUpperCase();
    for (const [roomId, room] of this.rooms.entries()) {
      const sessionToken = this.generateSessionToken();
      const player = room.engine.transferSeat(code, socketId, sessionToken);
      if (player) {
        this.socketToPlayerMap.set(socketId, { roomId, playerId: player.id, sessionToken });
        this.broadcastGameState(roomId);
        return { success: true, roomId, sessionToken, playerId: player.id };
      }
    }
    return { success: false, error: 'Invalid or expired transfer code' };
  }

  public addBot(roomId: string, requesterSocketId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };

    const host = room.engine.state.players.find(p => p.id === requesterSocketId);
    if (!host || !host.isHost) {
      return { success: false, error: 'Only host can add bots' };
    }

    if (room.engine.state.players.length >= 12) {
      return { success: false, error: 'Maximum 12 players' };
    }

    const botIndex = room.engine.state.players.filter(p => p.isBot).length;
    const botName = BOT_NAMES[botIndex % BOT_NAMES.length];
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    room.engine.addPlayer(botId, botName, `avatar_${botId}`, false, true, `bot_token_${botId}`);
    this.broadcastGameState(roomId);
    return { success: true };
  }

  public removeBot(roomId: string, botId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const host = room.engine.state.players.find(p => p.id === requesterSocketId);
    if (!host || !host.isHost) return;

    room.engine.removePlayer(botId);
    this.broadcastGameState(roomId);
  }

  public kickPlayer(roomId: string, targetPlayerId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const host = room.engine.state.players.find(p => p.id === requesterSocketId);
    if (!host || !host.isHost) return;

    room.engine.removePlayer(targetPlayerId);
    this.broadcastGameState(roomId);
  }

  public startGame(roomId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const host = room.engine.state.players.find(p => p.id === requesterSocketId);
    if (!host || !host.isHost) {
      throw new Error('Only the host can start the game');
    }

    room.engine.startGame();
    this.broadcastGameState(roomId);
    this.io.to(roomId).emit('soundTrigger', 'deal');
    this.checkAndProcessBotTurn(roomId);
  }

  public makeBid(socketId: string, bid: number): void {
    const session = this.socketToPlayerMap.get(socketId);
    if (!session) throw new Error('Session not found');

    const room = this.rooms.get(session.roomId);
    if (!room) throw new Error('Room not found');

    room.engine.makeBid(session.playerId, bid);
    this.broadcastGameState(session.roomId);

    if (room.engine.state.phase === 'PLAYING') {
      this.io.to(session.roomId).emit('soundTrigger', 'playCard');
    }

    this.checkAndProcessBotTurn(session.roomId);
  }

  public playCard(socketId: string, cardId: string): void {
    const session = this.socketToPlayerMap.get(socketId);
    if (!session) throw new Error('Session not found');

    const room = this.rooms.get(session.roomId);
    if (!room) throw new Error('Room not found');

    const result = room.engine.playCard(session.playerId, cardId);
    this.io.to(session.roomId).emit('soundTrigger', 'playCard');
    this.broadcastGameState(session.roomId);

    if (result.trickComplete) {
      if (result.winner) {
        this.io.to(session.roomId).emit('chatMessage', {
          sender: 'System',
          text: `👑 ${result.winner.playerName} won with ${result.winner.card.rank}${result.winner.card.suit}`,
          timestamp: Date.now(),
          isSystem: true,
        });
        this.io.to(session.roomId).emit('soundTrigger', 'trickWin');
      }

      if (result.roundComplete) {
        // Hold 2 seconds before showing round summary
        setTimeout(() => {
          this.broadcastGameState(session.roomId);
          if (result.gameComplete) {
            this.io.to(session.roomId).emit('soundTrigger', 'gameWin');
          } else {
            this.io.to(session.roomId).emit('soundTrigger', 'roundSuccess');
          }
        }, 2000);
      } else {
        // Hold completed trick on table for 2 seconds so players can see the winner highlight
        setTimeout(() => {
          const activeRoom = this.rooms.get(session.roomId);
          if (activeRoom && activeRoom.engine.state.phase === 'PLAYING') {
            const winnerPlayer = activeRoom.engine.state.players.find(p => p.id === result.winner?.playerId);
            if (winnerPlayer) {
              activeRoom.engine.prepareNextTrick(winnerPlayer.seatIndex);
              this.broadcastGameState(session.roomId);
              this.checkAndProcessBotTurn(session.roomId);
            }
          }
        }, 2000);
      }
    } else {
      this.checkAndProcessBotTurn(session.roomId);
    }
  }

  public nextRound(roomId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.engine.nextRound();
    this.broadcastGameState(roomId);
    this.io.to(roomId).emit('soundTrigger', 'deal');
    this.checkAndProcessBotTurn(roomId);
  }

  public restartGame(roomId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const host = room.engine.state.players.find(p => p.id === requesterSocketId);
    if (!host || !host.isHost) return;

    room.engine.startGame();
    this.broadcastGameState(roomId);
    this.checkAndProcessBotTurn(roomId);
  }

  public handleDisconnect(socketId: string): void {
    const session = this.socketToPlayerMap.get(socketId);
    if (!session) return;

    const room = this.rooms.get(session.roomId);
    if (!room) return;

    const player = room.engine.state.players.find(p => p.id === session.playerId);
    if (player) {
      player.isConnected = false;
      this.broadcastGameState(session.roomId);
    }
  }

  private checkAndProcessBotTurn(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const phase = room.engine.state.phase;
    if (phase !== 'BIDDING' && phase !== 'PLAYING') return;

    const currentPlayer = room.engine.state.players[room.engine.state.currentTurnIndex];
    if (!currentPlayer || !currentPlayer.isBot) return;

    setTimeout(() => {
      const activeRoom = this.rooms.get(roomId);
      if (!activeRoom) return;

      const activePlayer = activeRoom.engine.state.players[activeRoom.engine.state.currentTurnIndex];
      if (!activePlayer || !activePlayer.isBot || activePlayer.id !== currentPlayer.id) return;

      if (activeRoom.engine.state.phase === 'BIDDING') {
        const isDealer = activeRoom.engine.state.currentTurnIndex === activeRoom.engine.state.dealerIndex;
        const priorBidsSum = activeRoom.engine.state.players.reduce((sum, p) => sum + (p.currentBid ?? 0), 0);
        const { validBids } = getValidBids(
          activeRoom.engine.state.currentCardsCount,
          isDealer,
          priorBidsSum
        );

        const botHand = activeRoom.engine.getPlayerHand(activePlayer.id);
        const botBid = chooseBotBid(botHand, activeRoom.engine.state.trumpSuit, validBids);

        try {
          activeRoom.engine.makeBid(activePlayer.id, botBid);
          this.broadcastGameState(roomId);
          this.checkAndProcessBotTurn(roomId);
        } catch (err) {
          console.error('Bot bid error:', err);
        }
      } else if (activeRoom.engine.state.phase === 'PLAYING') {
        const botHand = activeRoom.engine.getPlayerHand(activePlayer.id);
        const cardToPlay = chooseBotCard(
          botHand,
          activeRoom.engine.state.currentTrick.cards,
          activeRoom.engine.state.currentTrick.leadSuit,
          activeRoom.engine.state.trumpSuit,
          activePlayer.currentBid ?? 0,
          activePlayer.tricksWon
        );

        try {
          const result = activeRoom.engine.playCard(activePlayer.id, cardToPlay.id);
          this.io.to(roomId).emit('soundTrigger', 'playCard');
          this.broadcastGameState(roomId);

          if (result.trickComplete) {
            if (result.winner) {
              this.io.to(roomId).emit('chatMessage', {
                sender: 'System',
                text: `👑 ${result.winner.playerName} won with ${result.winner.card.rank}${result.winner.card.suit}`,
                timestamp: Date.now(),
                isSystem: true,
              });
              this.io.to(roomId).emit('soundTrigger', 'trickWin');
            }

            if (result.roundComplete) {
              setTimeout(() => {
                this.broadcastGameState(roomId);
                if (result.gameComplete) {
                  this.io.to(roomId).emit('soundTrigger', 'gameWin');
                } else {
                  this.io.to(roomId).emit('soundTrigger', 'roundSuccess');
                }
              }, 2000);
            } else {
              setTimeout(() => {
                const refreshedRoom = this.rooms.get(roomId);
                if (refreshedRoom && refreshedRoom.engine.state.phase === 'PLAYING') {
                  const winnerPlayer = refreshedRoom.engine.state.players.find(p => p.id === result.winner?.playerId);
                  if (winnerPlayer) {
                    refreshedRoom.engine.prepareNextTrick(winnerPlayer.seatIndex);
                    this.broadcastGameState(roomId);
                    this.checkAndProcessBotTurn(roomId);
                  }
                }
              }, 2000);
            }
          } else {
            this.checkAndProcessBotTurn(roomId);
          }
        } catch (err) {
          console.error('Bot card play error:', err);
        }
      }
    }, 700);
  }

  public broadcastGameState(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const player of room.engine.state.players) {
      if (player.isBot) continue;

      const clientState = room.engine.getClientGameState(player.id);
      this.io.to(player.id).emit('gameStateUpdated', clientState);
    }
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId.toUpperCase());
  }
}
