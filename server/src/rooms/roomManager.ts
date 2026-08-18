import { Server, Socket } from 'socket.io';
import { GameEngine } from '../engine/gameEngine.js';
import { chooseBotBid, chooseBotCard } from '../engine/botLogic.js';
import { getValidBids } from '../engine/rules.js';

interface Room {
  id: string;
  engine: GameEngine;
  createdAt: number;
  customMaxCards?: number;
}

export class RoomManager {
  private io: Server;
  private rooms: Map<string, Room> = new Map();
  private socketToPlayerMap: Map<string, { roomId: string; playerId: string }> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  public createRoom(
    socket: Socket,
    playerName: string,
    customMaxCards?: number
  ): { roomId: string; sessionToken: string; playerId: string } {
    let roomId = '';
    do {
      roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(roomId));

    const sessionToken = Math.random().toString(36).substring(2, 15);
    const transferCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerId = socket.id;

    const engine = new GameEngine(roomId, customMaxCards);
    engine.addPlayer(playerId, playerName, true, false, sessionToken, transferCode);

    this.rooms.set(roomId, {
      id: roomId,
      engine,
      createdAt: Date.now(),
      customMaxCards,
    });

    this.socketToPlayerMap.set(socket.id, { roomId, playerId });
    socket.join(roomId);

    // Broadcast initial LOBBY state so client transitions off landing page
    setTimeout(() => this.broadcastGameState(roomId), 50);

    return { roomId, sessionToken, playerId };
  }

  public joinRoom(
    socket: Socket,
    roomId: string,
    playerName: string,
    existingSessionToken?: string
  ): { roomId: string; sessionToken: string; playerId: string } {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) {
      throw new Error('Room not found');
    }

    const playerId = socket.id;

    // Check if player is reconnecting with an existing sessionToken
    if (existingSessionToken) {
      const existingPlayer = room.engine.state.players.find(
        p => p.sessionToken === existingSessionToken
      );

      if (existingPlayer) {
        // Swap socket mapping to the reconnected socket
        this.socketToPlayerMap.delete(existingPlayer.id);
        existingPlayer.id = playerId;
        existingPlayer.isConnected = true;
        this.socketToPlayerMap.set(playerId, { roomId: room.id, playerId });
        socket.join(room.id);
        this.broadcastGameState(room.id);
        return { roomId: room.id, sessionToken: existingSessionToken, playerId };
      }
    }

    if (room.engine.state.phase !== 'LOBBY') {
      throw new Error('Game already started');
    }

    if (room.engine.state.players.length >= 12) {
      throw new Error('Room is full (max 12 players)');
    }

    const sessionToken = Math.random().toString(36).substring(2, 15);
    const transferCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    room.engine.addPlayer(playerId, playerName, false, false, sessionToken, transferCode);
    this.socketToPlayerMap.set(playerId, { roomId: room.id, playerId });
    socket.join(room.id);

    this.broadcastGameState(room.id);
    return { roomId: room.id, sessionToken, playerId };
  }

  public reconnectSeat(
    socket: Socket,
    roomId: string,
    sessionToken: string
  ): boolean {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) return false;

    const existingPlayer = room.engine.state.players.find(
      p => p.sessionToken === sessionToken
    );
    if (!existingPlayer) return false;

    this.socketToPlayerMap.delete(existingPlayer.id);
    existingPlayer.id = socket.id;
    existingPlayer.isConnected = true;
    this.socketToPlayerMap.set(socket.id, { roomId: room.id, playerId: socket.id });
    socket.join(room.id);
    this.broadcastGameState(room.id);
    return true;
  }

  public transferSeat(
    socket: Socket,
    transferCode: string
  ): { roomId: string; sessionToken: string; playerId: string } | null {
    for (const room of this.rooms.values()) {
      const targetPlayer = room.engine.state.players.find(
        p => p.transferCode === transferCode.toUpperCase()
      );
      if (targetPlayer) {
        const newSessionToken = Math.random().toString(36).substring(2, 15);
        this.socketToPlayerMap.delete(targetPlayer.id);
        targetPlayer.id = socket.id;
        targetPlayer.sessionToken = newSessionToken;
        targetPlayer.isConnected = true;

        this.socketToPlayerMap.set(socket.id, { roomId: room.id, playerId: socket.id });
        socket.join(room.id);
        this.broadcastGameState(room.id);

        return { roomId: room.id, sessionToken: newSessionToken, playerId: socket.id };
      }
    }
    return null;
  }

  public addBot(roomId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const host = room.engine.state.players.find(p => p.id === requesterSocketId);
    if (!host || !host.isHost) {
      throw new Error('Only the host can add bots');
    }

    if (room.engine.state.phase !== 'LOBBY') {
      throw new Error('Cannot add bots after game start');
    }

    if (room.engine.state.players.length >= 12) {
      throw new Error('Maximum 12 players allowed');
    }

    const botCount = room.engine.state.players.filter(p => p.isBot).length + 1;
    const botId = `bot_${Math.random().toString(36).substring(2, 9)}`;
    const botNames = ['Karan (AI)', 'Pooja (AI)', 'Amit (AI)', 'Neha (AI)', 'Rohan (AI)', 'Simran (AI)', 'Vikram (AI)', 'Ananya (AI)'];
    const botName = botNames[(botCount - 1) % botNames.length] || `Bot ${botCount}`;

    room.engine.addPlayer(botId, botName, false, true, `bot_token_${botId}`, '');
    this.broadcastGameState(roomId);
  }

  public removeBot(roomId: string, botId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const host = room.engine.state.players.find(p => p.id === requesterSocketId);
    if (!host || !host.isHost) {
      throw new Error('Only the host can remove bots');
    }

    room.engine.removePlayer(botId);
    this.broadcastGameState(roomId);
  }

  public kickPlayer(roomId: string, targetPlayerId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const host = room.engine.state.players.find(p => p.id === requesterSocketId);
    if (!host || !host.isHost) {
      throw new Error('Only the host can kick players');
    }

    room.engine.removePlayer(targetPlayerId);
    this.socketToPlayerMap.delete(targetPlayerId);
    this.broadcastGameState(roomId);
  }

  public startGame(roomId: string, requesterSocketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

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
          text: `🏆 ${result.winner.playerName} won with ${result.winner.card.rank}${result.winner.card.suit}`,
          timestamp: Date.now(),
          isSystem: true,
        });
        this.io.to(session.roomId).emit('soundTrigger', 'trickWin');
      }

      if (result.roundComplete) {
        // Hold completed trick on table for 2.5s before transitioning to ROUND_SUMMARY
        setTimeout(() => {
          const activeRoom = this.rooms.get(session.roomId);
          if (activeRoom) {
            const finalResult = activeRoom.engine.finalizeRound();
            this.broadcastGameState(session.roomId);
            if (finalResult.gameComplete) {
              this.io.to(session.roomId).emit('soundTrigger', 'gameWin');
            } else {
              this.io.to(session.roomId).emit('soundTrigger', 'roundSuccess');
            }
          }
        }, 2500);
      } else {
        // Hold completed trick on table for 2s so players can see the winner highlight
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
                text: `🏆 ${result.winner.playerName} won with ${result.winner.card.rank}${result.winner.card.suit}`,
                timestamp: Date.now(),
                isSystem: true,
              });
              this.io.to(roomId).emit('soundTrigger', 'trickWin');
            }

            if (result.roundComplete) {
              setTimeout(() => {
                const refreshedRoom = this.rooms.get(roomId);
                if (refreshedRoom) {
                  const finalResult = refreshedRoom.engine.finalizeRound();
                  this.broadcastGameState(roomId);
                  if (finalResult.gameComplete) {
                    this.io.to(roomId).emit('soundTrigger', 'gameWin');
                  } else {
                    this.io.to(roomId).emit('soundTrigger', 'roundSuccess');
                  }
                }
              }, 2500);
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
