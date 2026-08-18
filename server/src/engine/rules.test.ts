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
import { Card } from './deck.js';

describe('Kachuful Rules Engine (play.rishabhdoshi.me standard)', () => {
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

  describe('Trump Suit Rotation (♠ → ♦ → ♣ → ♥)', () => {
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
      // In 4-card round, if prior bids sum to 3, hook bid is 1
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
});
