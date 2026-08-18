import { Card, Suit, RANK_VALUES } from './deck.js';
import { getLegalCards, determineTrickWinner, PlayedCard } from './rules.js';

export function chooseBotBid(
  hand: Card[],
  trumpSuit: Suit,
  validBids: number[]
): number {
  let estimatedTricks = 0;

  for (const card of hand) {
    const rankVal = RANK_VALUES[card.rank];
    const isTrump = card.suit === trumpSuit;

    if (isTrump) {
      if (rankVal >= 13) estimatedTricks += 0.95; // Trump K, A
      else if (rankVal >= 10) estimatedTricks += 0.75;
      else estimatedTricks += 0.45;
    } else {
      if (rankVal === 14) estimatedTricks += 0.85; // Off-suit Ace
      else if (rankVal === 13) estimatedTricks += 0.4;  // Off-suit King
      else if (rankVal === 12) estimatedTricks += 0.15; // Off-suit Queen
    }
  }

  const targetBid = Math.round(estimatedTricks);

  if (validBids.includes(targetBid)) {
    return targetBid;
  }

  // Pick closest valid bid
  let bestBid = validBids[0];
  let minDiff = Math.abs(bestBid - targetBid);
  for (const b of validBids) {
    const diff = Math.abs(b - targetBid);
    if (diff < minDiff) {
      minDiff = diff;
      bestBid = b;
    }
  }
  return bestBid;
}

export function chooseBotCard(
  hand: Card[],
  currentTrickCards: PlayedCard[],
  leadSuit: Suit | null,
  trumpSuit: Suit,
  bid: number,
  tricksWon: number
): Card {
  const legalCards = getLegalCards(hand, leadSuit);
  if (legalCards.length === 1) {
    return legalCards[0];
  }

  const wantsToWin = tricksWon < bid;

  // If leading
  if (!leadSuit || currentTrickCards.length === 0) {
    if (wantsToWin) {
      // Lead highest card
      return [...legalCards].sort((a, b) => {
        const valA = RANK_VALUES[a.rank] + (a.suit === trumpSuit ? 20 : 0);
        const valB = RANK_VALUES[b.rank] + (b.suit === trumpSuit ? 20 : 0);
        return valB - valA;
      })[0];
    } else {
      // Lead lowest non-trump card
      return [...legalCards].sort((a, b) => {
        const valA = RANK_VALUES[a.rank] + (a.suit === trumpSuit ? 20 : 0);
        const valB = RANK_VALUES[b.rank] + (b.suit === trumpSuit ? 20 : 0);
        return valA - valB;
      })[0];
    }
  }

  // Following a trick
  const currentWinner = determineTrickWinner(currentTrickCards, trumpSuit);

  if (wantsToWin) {
    // Find all legal cards that would win over currentWinner
    const winningCards = legalCards.filter(card => {
      const simulatedTrick: PlayedCard[] = [
        ...currentTrickCards,
        { playerId: 'bot', playerName: 'Bot', card, seatIndex: -1 }
      ];
      const winner = determineTrickWinner(simulatedTrick, trumpSuit);
      return winner.card.id === card.id;
    });

    if (winningCards.length > 0) {
      // Pick lowest winning card to conserve high cards
      return winningCards.sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank])[0];
    }

    // Can't win: dump lowest value card
    return [...legalCards].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank])[0];
  } else {
    // Doesn't want to win: find all legal cards that do NOT win
    const losingCards = legalCards.filter(card => {
      const simulatedTrick: PlayedCard[] = [
        ...currentTrickCards,
        { playerId: 'bot', playerName: 'Bot', card, seatIndex: -1 }
      ];
      const winner = determineTrickWinner(simulatedTrick, trumpSuit);
      return winner.card.id !== card.id;
    });

    if (losingCards.length > 0) {
      // Throw away highest losing card to get rid of danger cards
      return losingCards.sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])[0];
    }

    // Forced to win: play lowest winning card
    return [...legalCards].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank])[0];
  }
}
