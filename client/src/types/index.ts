export type Suit = 'S' | 'D' | 'C' | 'H'; // Spades, Diamonds, Clubs, Hearts

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export type GamePhase = 'LOBBY' | 'DEALING' | 'BIDDING' | 'PLAYING' | 'TRICK_RESOLVING' | 'ROUND_SUMMARY' | 'GAME_OVER';

export interface PlayerPublic {
  id: string;
  name: string;
  avatarSeed: string;
  seatIndex: number;
  isHost: boolean;
  isBot: boolean;
  isConnected: boolean;
  consecutiveZeroBids?: number;
  score: number;
  currentBid: number | null;
  tricksWon: number;
}

export interface PlayedCard {
  playerId: string;
  playerName: string;
  card: Card;
  seatIndex: number;
}

export interface Trick {
  trickNumber: number;
  leadSuit: Suit | null;
  cards: PlayedCard[];
  winnerId: string | null;
  winnerName: string | null;
}

export interface RoundScore {
  playerId: string;
  bid: number;
  tricksWon: number;
  roundScore: number;
  cumulativeScore: number;
}

export interface RoundHistory {
  roundNumber: number;
  cardsCount: number;
  trumpSuit: Suit;
  dealerId: string;
  scores: RoundScore[];
}

export interface GameSettings {
  maxCardsPerRound: number;
  customMaxCards?: number;
}

export interface ClientGameState {
  roomId: string;
  phase: GamePhase;
  players: PlayerPublic[];
  dealerIndex: number;
  currentTurnIndex: number;
  roundIndex: number;
  totalRounds: number;
  roundsStructure: number[];
  currentCardsCount: number;
  trumpSuit: Suit;
  isBlind: boolean;
  isBlindBidding: boolean;
  currentTrick: Trick;
  completedTricks: Trick[];
  roundScores: RoundHistory[];
  settings: GameSettings;
  hookBidForDealer: number | null;
  roundStartTime?: number;
  lastTrickWinner?: {
    playerId: string;
    playerName: string;
    card: Card;
  } | null;
  myPlayerId: string;
  myTransferCode: string;
  myHand: Card[];
  legalCardIds: string[];
  isMyTurn: boolean;
  canBid: boolean;
  validBids: number[];
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}
