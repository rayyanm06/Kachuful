export type Suit = 'S' | 'D' | 'C' | 'H';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export const SUITS: Suit[] = ['S', 'D', 'C', 'H']; // Spades, Diamonds, Clubs, Hearts

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

export const SUIT_NAMES: Record<Suit, string> = {
  S: 'Spades',
  D: 'Diamonds',
  C: 'Clubs',
  H: 'Hearts',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  S: '♠',
  D: '♦',
  C: '♣',
  H: '♥',
};

/**
 * Creates one or more standard 52-card decks.
 * If 7-12 players are playing with high card counts (e.g. 8 cards * 8 players = 64 cards),
 * numDecks will be 2 or more so the deck never runs out.
 */
export function createDeck(numDecks: number = 1): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          suit,
          rank,
          id: d === 0 ? `${suit}_${rank}` : `${suit}_${rank}_d${d}`,
        });
      }
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sortHand(hand: Card[], sortBy: 'suit' | 'rank' = 'suit'): Card[] {
  const suitOrder: Record<Suit, number> = { S: 0, D: 1, C: 2, H: 3 };
  return [...hand].sort((a, b) => {
    if (sortBy === 'suit') {
      if (a.suit !== b.suit) {
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
    } else {
      if (a.rank !== b.rank) {
        return RANK_VALUES[b.rank] - RANK_VALUES[a.rank]; // High to low
      }
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
  });
}
