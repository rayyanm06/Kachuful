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

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${suit}_${rank}`,
      });
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

export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { S: 0, D: 1, C: 2, H: 3 };
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
  });
}
