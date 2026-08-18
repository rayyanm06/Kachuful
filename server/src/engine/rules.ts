import { Card, Suit, RANK_VALUES, SUITS } from './deck.js';

export interface PlayedCard {
  playerId: string;
  playerName: string;
  card: Card;
  seatIndex: number;
}

/**
 * Generates round structure matching Kachuful / Rishabh Doshi flow:
 * Starts at 1, goes up to maxCards (min(8, floor(52 / numPlayers))), then goes back down to 1.
 * E.g. for max 8: [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1]
 * For 10 players (max 5): [1, 2, 3, 4, 5, 4, 3, 2, 1]
 * For 12 players (max 4): [1, 2, 3, 4, 3, 2, 1]
 */
export function generateRoundsStructure(numPlayers: number, customMaxCards?: number): number[] {
  const calculatedMax = Math.min(8, Math.floor(52 / Math.max(2, Math.min(12, numPlayers))));
  const maxCards = customMaxCards && customMaxCards >= 1 && customMaxCards <= 13
    ? customMaxCards
    : calculatedMax;

  const rounds: number[] = [];
  // Ascending from 1 up to maxCards
  for (let c = 1; c <= maxCards; c++) {
    rounds.push(c);
  }
  // Descending from maxCards - 1 down to 1
  for (let c = maxCards - 1; c >= 1; c--) {
    rounds.push(c);
  }
  return rounds;
}

/**
 * Trump suit rotates every round:
 * Spades (♠) -> Diamonds (♦) -> Clubs (♣) -> Hearts (♥)
 */
export function getTrumpSuit(roundIndex: number): Suit {
  return SUITS[roundIndex % SUITS.length];
}

/**
 * Check if round is Blind (Round 1 is always blind: bids lock first, then cards are revealed)
 */
export function isBlindRound(roundIndex: number): boolean {
  return roundIndex === 0;
}

/**
 * Calculate the hook bid for the dealer.
 * Dealer cannot make the final bid that makes total bids equal total tricks in that round.
 * Dealer Hook Bid = cardsInRound - sumOfPriorBids
 */
export function getDealerHookBid(cardsInRound: number, priorBidsSum: number): number | null {
  const forbiddenBid = cardsInRound - priorBidsSum;
  if (forbiddenBid >= 0 && forbiddenBid <= cardsInRound) {
    return forbiddenBid;
  }
  return null;
}

/**
 * Get all valid bids for a player given the current round state.
 */
export function getValidBids(
  cardsInRound: number,
  isDealer: boolean,
  priorBidsSum: number
): { validBids: number[]; hookBid: number | null } {
  const hookBid = isDealer ? getDealerHookBid(cardsInRound, priorBidsSum) : null;

  let validBids: number[] = [];
  for (let b = 0; b <= cardsInRound; b++) {
    if (isDealer && hookBid !== null && b === hookBid) {
      continue; // Blocked by hook rule
    }
    validBids.push(b);
  }

  // Edge case safety: if all bids were somehow blocked, fallback so game never freezes
  if (validBids.length === 0) {
    for (let b = 0; b <= cardsInRound; b++) {
      if (isDealer && hookBid !== null && b === hookBid) continue;
      validBids.push(b);
    }
  }

  return { validBids, hookBid };
}

/**
 * Determine which cards in player's hand are legal to play.
 * If leadSuit is null (player leads), all cards in hand are legal.
 * If leadSuit is present and player holds at least 1 card of leadSuit,
 * player MUST play a card of leadSuit.
 * Otherwise, player can play any card.
 */
export function getLegalCards(hand: Card[], leadSuit: Suit | null): Card[] {
  if (!leadSuit) {
    return hand;
  }
  const matchingSuitCards = hand.filter(c => c.suit === leadSuit);
  if (matchingSuitCards.length > 0) {
    return matchingSuitCards;
  }
  return hand;
}

/**
 * Determine the winner of a trick.
 * 1. If any trump suit cards were played, highest trump card wins.
 * 2. Otherwise, highest card of the led suit wins.
 */
export function determineTrickWinner(playedCards: PlayedCard[], trumpSuit: Suit): PlayedCard {
  if (playedCards.length === 0) {
    throw new Error('Cannot determine winner of empty trick');
  }

  const leadSuit = playedCards[0].card.suit;
  const trumpPlays = playedCards.filter(p => p.card.suit === trumpSuit);

  if (trumpPlays.length > 0) {
    let best = trumpPlays[0];
    for (let i = 1; i < trumpPlays.length; i++) {
      if (RANK_VALUES[trumpPlays[i].card.rank] > RANK_VALUES[best.card.rank]) {
        best = trumpPlays[i];
      }
    }
    return best;
  }

  const leadPlays = playedCards.filter(p => p.card.suit === leadSuit);
  let best = leadPlays[0];
  for (let i = 1; i < leadPlays.length; i++) {
    if (RANK_VALUES[leadPlays[i].card.rank] > RANK_VALUES[best.card.rank]) {
      best = leadPlays[i];
    }
  }
  return best;
}

/**
 * Scoring calculation for Kachuful:
 * Exact bid met: 10 + bid (e.g. bid 2, won 2 = 12 pts; bid 0, won 0 = 10 pts)
 * Miss (over or under): 0 pts
 */
export function calculatePlayerRoundScore(bid: number, tricksWon: number): number {
  if (bid === tricksWon) {
    return 10 + bid;
  }
  return 0;
}
