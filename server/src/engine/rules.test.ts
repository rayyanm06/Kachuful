import { describe, it, expect } from 'vitest';
import {
  generateRoundsStructure,
  getTrumpSuit,
  getDealerHookBid,
  getValidBids,
  getLegalCards,
  determineTrickWinner,
  calculatePlayerRoundScore,
  isBlindRound,
} from './rules.js';
import { GameEngine } from './gameEngine.js';

describe('Kachuful Rules Engine', () => {
  describe('Round Structure (1..8..1)', () => {
    it('generates 1 up to 8 down to 1 for 4 players (15 rounds total)', () => {
      const rounds = generateRoundsStructure(4);
      expect(rounds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1]);
      expect(rounds.length).toBe(15);
    });

    it('generates 1 up to 5 down to 1 for 10 players (max 5 cards)', () => {
      const rounds = generateRoundsStructure(10);
      expect(rounds).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1]);
      expect(rounds.length).toBe(9);
    });

    it('generates 1 up to 4 down to 1 for 12 players (max 4 cards)', () => {
      const rounds = generateRoundsStructure(12);
      expect(rounds).toEqual([1, 2, 3, 4, 3, 2, 1]);
      expect(rounds.length).toBe(7);
    });
  });

  describe('Blind Round 1', () => {
    it('identifies round index 0 as blind round', () => {
      expect(isBlindRound(0)).toBe(true);
      expect(isBlindRound(1)).toBe(false);
      expect(isBlindRound(2)).toBe(false);
    });
  });

  describe('Trump Suit Rotation', () => {
    it('rotates through Spades, Diamonds, Clubs, Hearts', () => {
      expect(getTrumpSuit(0)).toBe('S');
      expect(getTrumpSuit(1)).toBe('D');
      expect(getTrumpSuit(2)).toBe('C');
      expect(getTrumpSuit(3)).toBe('H');
      expect(getTrumpSuit(4)).toBe('S');
    });
  });

  describe('Dealer Hook Rule', () => {
    it('blocks the bid that makes total bids equal cards in round', () => {
      expect(getDealerHookBid(4, 3)).toBe(1);
      const { validBids, hookBid } = getValidBids(4, true, 3);
      expect(hookBid).toBe(1);
      expect(validBids).toEqual([0, 2, 3, 4]); // 1 is excluded
    });
  });

  describe('Scoring Logic', () => {
    it('awards 10 + bid on exact match and 0 on miss', () => {
      expect(calculatePlayerRoundScore(2, 2)).toBe(12);
      expect(calculatePlayerRoundScore(0, 0)).toBe(10);
      expect(calculatePlayerRoundScore(3, 2)).toBe(0);
      expect(calculatePlayerRoundScore(1, 2)).toBe(0);
    });
  });

  describe('Seamless Player Reconnection & Hand Transfer', () => {
    it('transfers active hand and allows card play with new socket ID after reconnecting in playing phase', () => {
      const engine = new GameEngine('TEST1');
      engine.addPlayer('socket_old', 'Rayyan', true, false, 'token123', 'TRANS1');
      engine.addPlayer('bot_1', 'Bot 1', false, true, 'tokenBot', 'TRANS2');

      engine.startGame(); // Starts round 0 (1 card each), BIDDING phase
      expect(engine.getPlayerHand('socket_old').length).toBe(1);

      // Complete bidding in round 0 (Bot 1 bids 0, Dealer Rayyan bids 0 due to hook rule)
      engine.makeBid('bot_1', 0);
      engine.makeBid('socket_old', 0);

      expect(engine.state.phase).toBe('PLAYING');

      // Reconnect during PLAYING phase: old socket disconnects, new socket arrives
      engine.updatePlayerId('socket_old', 'socket_new');

      // Hand must be intact and visible in client state for the new socket ID
      const newHand = engine.getPlayerHand('socket_new');
      expect(newHand.length).toBe(1);
      expect(engine.getPlayerHand('socket_old').length).toBe(0);

      const clientState = engine.getClientGameState('socket_new');
      expect(clientState.myPlayerId).toBe('socket_new');
      expect(clientState.myHand.length).toBe(1);

      // Turn starts left of dealer (index 1 = bot_1)
      const botCard = engine.getPlayerHand('bot_1')[0];
      engine.playCard('bot_1', botCard.id);

      // Now it's Rayyan's turn (socket_new)
      const rayyanState = engine.getClientGameState('socket_new');
      expect(rayyanState.isMyTurn).toBe(true);
      expect(rayyanState.legalCardIds).toContain(newHand[0].id);

      // Play card with new socket ID!
      const cardToPlay = newHand[0];
      const result = engine.playCard('socket_new', cardToPlay.id);
      expect(result).toBeDefined();
      expect(engine.getPlayerHand('socket_new').length).toBe(0);
    });

    it('handles seamless transition to subsequent rounds after reconnection', () => {
      const engine = new GameEngine('TEST2');
      engine.addPlayer('socket_old', 'Rayyan', true, false, 'token123', 'TRANS1');
      engine.addPlayer('bot_1', 'Bot 1', false, true, 'tokenBot', 'TRANS2');

      engine.startGame();
      engine.updatePlayerId('socket_old', 'socket_new');

      // Finish round 0
      engine.makeBid('bot_1', 0);
      engine.makeBid('socket_new', 0);
      engine.playCard('bot_1', engine.getPlayerHand('bot_1')[0].id);
      engine.playCard('socket_new', engine.getPlayerHand('socket_new')[0].id);
      engine.finalizeRound();

      // Start round 1 (2 cards each)
      engine.nextRound();

      // New socket ID must automatically receive the 2 cards for round 1
      expect(engine.getPlayerHand('socket_new').length).toBe(2);
      const clientState = engine.getClientGameState('socket_new');
      expect(clientState.myHand.length).toBe(2);
    });
  });
});
