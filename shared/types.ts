export type Suit = 'S' | 'D' | 'C' | 'H'; // Spades, Diamonds, Clubs, Hearts

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // e.g. "S_A", "H_10"
}

export type GamePhase = 'LOBBY' | 'DEALING' | 'BIDDING' | 'PLAYING' | 'ROUND_SUMMARY' | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  avatarSeed: string;
  seatIndex: number;
  isHost: boolean;
  isBot: boolean;
  isConnected: boolean;
  consecutiveZeroBids: number; // For 6+ players house rule
  score: number;
  currentBid: number | null;
  tricksWon: number;
  sessionToken: string;
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
  maxCardsPerRound: number; // default floor(52 / numPlayers)
  customMaxCards?: number;  // optional quick game override
  consecutiveZeroLimit: number; // default 5 (for >=6 players)
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: Player[];
  dealerIndex: number;
  currentTurnIndex: number;
  roundIndex: number; // 0-based
  totalRounds: number;
  roundsStructure: number[]; // array of card counts, e.g. [5, 4, 3, 2, 1, 2, 3, 4, 5]
  currentCardsCount: number;
  trumpSuit: Suit;
  currentTrick: Trick;
  completedTricks: Trick[];
  roundScores: RoundHistory[];
  settings: GameSettings;
  hookBidForDealer: number | null; // What bid the dealer cannot make
  roundStartTime?: number;
  lastTrickWinner?: {
    playerId: string;
    playerName: string;
    card: Card;
  } | null;
}

// Client-specific view of the game state (player hand is private to that player)
export interface ClientGameState extends Omit<GameState, 'players'> {
  players: Array<Omit<Player, 'sessionToken'>>;
  myPlayerId: string;
  myHand: Card[];
  legalCardIds: string[]; // List of card IDs the current player is allowed to play right now
  isMyTurn: boolean;
  canBid: boolean;
  validBids: number[]; // Bids the current player is allowed to choose
}

export interface CreateRoomOptions {
  playerName: string;
  customMaxCards?: number;
}

export interface JoinRoomOptions {
  roomId: string;
  playerName: string;
  sessionToken?: string;
}

// Socket Events
export interface ServerToClientEvents {
  gameStateUpdated: (state: ClientGameState) => void;
  roomCreated: (data: { roomId: string; sessionToken: string; playerId: string }) => void;
  roomJoined: (data: { roomId: string; sessionToken: string; playerId: string }) => void;
  errorNotification: (message: string) => void;
  soundTrigger: (sound: 'deal' | 'playCard' | 'trickWin' | 'roundSuccess' | 'roundFail' | 'gameWin') => void;
  chatMessage: (data: { sender: string; text: string; timestamp: number; isSystem?: boolean }) => void;
}

export interface ClientToServerEvents {
  createRoom: (options: CreateRoomOptions, callback?: (res: { success: boolean; roomId?: string; error?: string }) => void) => void;
  joinRoom: (options: JoinRoomOptions, callback?: (res: { success: boolean; error?: string }) => void) => void;
  reconnectSeat: (data: { roomId: string; sessionToken: string }, callback?: (res: { success: boolean; error?: string }) => void) => void;
  startGame: () => void;
  addBot: (callback?: (res: { success: boolean; error?: string }) => void) => void;
  removeBot: (botId: string) => void;
  kickPlayer: (playerId: string) => void;
  makeBid: (bid: number) => void;
  playCard: (cardId: string) => void;
  nextRound: () => void;
  restartGame: () => void;
  sendChat: (text: string) => void;
}
