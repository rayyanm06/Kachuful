import {
  Card,
  Suit,
  createDeck,
  shuffleDeck,
  sortHand,
} from './deck.js';
import {
  generateRoundsStructure,
  getTrumpSuit,
  getValidBids,
  getLegalCards,
  determineTrickWinner,
  calculatePlayerRoundScore,
  isBlindRound,
  PlayedCard,
} from './rules.js';

export interface Player {
  id: string;
  name: string;
  avatarSeed: string;
  seatIndex: number;
  isHost: boolean;
  isBot: boolean;
  isConnected: boolean;
  score: number;
  currentBid: number | null;
  tricksWon: number;
  sessionToken: string;
  transferCode: string;
}

export type GamePhase = 'LOBBY' | 'DEALING' | 'BIDDING' | 'PLAYING' | 'TRICK_RESOLVING' | 'ROUND_SUMMARY' | 'GAME_OVER';

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

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: Player[];
  dealerIndex: number;
  currentTurnIndex: number;
  roundIndex: number;
  totalRounds: number;
  roundsStructure: number[];
  currentCardsCount: number;
  trumpSuit: Suit;
  isBlind: boolean;
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
}

export interface ClientGameState extends Omit<GameState, 'players'> {
  players: Array<Omit<Player, 'sessionToken' | 'transferCode'>>;
  myPlayerId: string;
  myTransferCode: string;
  myHand: Card[];
  isBlindBidding: boolean;
  legalCardIds: string[];
  isMyTurn: boolean;
  canBid: boolean;
  validBids: number[];
}

export class GameEngine {
  public state: GameState;
  private playerHands: Map<string, Card[]> = new Map();

  constructor(roomId: string, customMaxCards?: number) {
    this.state = {
      roomId,
      phase: 'LOBBY',
      players: [],
      dealerIndex: 0,
      currentTurnIndex: 0,
      roundIndex: 0,
      totalRounds: 0,
      roundsStructure: [],
      currentCardsCount: 0,
      trumpSuit: 'S',
      isBlind: true,
      currentTrick: {
        trickNumber: 1,
        leadSuit: null,
        cards: [],
        winnerId: null,
        winnerName: null,
      },
      completedTricks: [],
      roundScores: [],
      settings: {
        maxCardsPerRound: 8,
        customMaxCards,
      },
      hookBidForDealer: null,
      lastTrickWinner: null,
    };
  }

  private generateTransferCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public setCustomMaxCards(maxCards: number): void {
    if (this.state.phase === 'LOBBY') {
      this.state.settings.customMaxCards = Math.max(1, Math.min(8, maxCards));
    }
  }

  public addPlayer(
    id: string,
    name: string,
    avatarSeed: string,
    isHost: boolean = false,
    isBot: boolean = false,
    sessionToken: string = ''
  ): Player {
    if (this.state.players.length >= 12) {
      throw new Error('Room is full (max 12 players)');
    }
    if (this.state.phase !== 'LOBBY') {
      throw new Error('Game already started');
    }

    const player: Player = {
      id,
      name,
      avatarSeed,
      seatIndex: this.state.players.length,
      isHost,
      isBot,
      isConnected: true,
      score: 0,
      currentBid: null,
      tricksWon: 0,
      sessionToken,
      transferCode: this.generateTransferCode(),
    };

    this.state.players.push(player);
    return player;
  }

  public removePlayer(playerId: string): void {
    if (this.state.phase !== 'LOBBY') {
      const player = this.state.players.find(p => p.id === playerId);
      if (player) {
        player.isConnected = false;
      }
      return;
    }

    this.state.players = this.state.players.filter(p => p.id !== playerId);
    this.state.players.forEach((p, idx) => {
      p.seatIndex = idx;
    });

    if (!this.state.players.some(p => p.isHost) && this.state.players.length > 0) {
      const nextReal = this.state.players.find(p => !p.isBot) || this.state.players[0];
      nextReal.isHost = true;
    }
  }

  public reconnectPlayer(sessionToken: string, newSocketId: string): Player | null {
    const player = this.state.players.find(p => p.sessionToken === sessionToken);
    if (!player) return null;

    player.id = newSocketId;
    player.isConnected = true;
    return player;
  }

  public transferSeat(transferCode: string, newSocketId: string, newSessionToken: string): Player | null {
    const player = this.state.players.find(p => p.transferCode.toUpperCase() === transferCode.toUpperCase());
    if (!player) return null;

    player.id = newSocketId;
    player.sessionToken = newSessionToken;
    player.isConnected = true;
    player.transferCode = this.generateTransferCode();
    return player;
  }

  public startGame(): void {
    if (this.state.players.length < 2) {
      throw new Error('Need at least 2 players to start Kachuful');
    }
    if (this.state.players.length > 12) {
      throw new Error('Maximum 12 players allowed');
    }

    const numPlayers = this.state.players.length;
    this.state.roundsStructure = generateRoundsStructure(numPlayers, this.state.settings.customMaxCards);
    this.state.totalRounds = this.state.roundsStructure.length;
    this.state.settings.maxCardsPerRound = Math.max(...this.state.roundsStructure);
    this.state.roundIndex = 0;
    this.state.dealerIndex = 0;
    this.state.roundScores = [];

    for (const p of this.state.players) {
      p.score = 0;
    }

    this.startRound(0);
  }

  public startRound(roundIdx: number): void {
    this.state.roundIndex = roundIdx;
    this.state.currentCardsCount = this.state.roundsStructure[roundIdx];
    this.state.trumpSuit = getTrumpSuit(roundIdx);
    this.state.isBlind = isBlindRound(roundIdx); // ONLY round 0 is blind!
    this.state.lastTrickWinner = null;
    this.state.completedTricks = [];
    this.state.currentTrick = {
      trickNumber: 1,
      leadSuit: null,
      cards: [],
      winnerId: null,
      winnerName: null,
    };
    this.state.roundStartTime = Date.now();

    for (const p of this.state.players) {
      p.currentBid = null;
      p.tricksWon = 0;
    }

    // Deal cards
    const deck = shuffleDeck(createDeck());
    this.playerHands.clear();

    for (let i = 0; i < this.state.players.length; i++) {
      const p = this.state.players[i];
      const hand: Card[] = [];
      for (let c = 0; c < this.state.currentCardsCount; c++) {
        hand.push(deck.pop()!);
      }
      this.playerHands.set(p.id, sortHand(hand));
    }

    // Bidding starts left of dealer
    this.state.currentTurnIndex = (this.state.dealerIndex + 1) % this.state.players.length;
    this.state.phase = 'BIDDING';
    this.updateHookBid();
  }

  private updateHookBid(): void {
    const priorBidsSum = this.state.players.reduce((sum, p) => sum + (p.currentBid ?? 0), 0);
    const isDealerTurn = this.state.currentTurnIndex === this.state.dealerIndex;
    if (isDealerTurn) {
      const hook = this.state.currentCardsCount - priorBidsSum;
      this.state.hookBidForDealer = (hook >= 0 && hook <= this.state.currentCardsCount) ? hook : null;
    } else {
      this.state.hookBidForDealer = null;
    }
  }

  public makeBid(playerId: string, bid: number): void {
    if (this.state.phase !== 'BIDDING') {
      throw new Error('Not currently in bidding phase');
    }

    const currentPlayer = this.state.players[this.state.currentTurnIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error("It's not your turn to bid");
    }

    const isDealer = this.state.currentTurnIndex === this.state.dealerIndex;
    const priorBidsSum = this.state.players.reduce((sum, p) => sum + (p.currentBid ?? 0), 0);

    const { validBids, hookBid } = getValidBids(
      this.state.currentCardsCount,
      isDealer,
      priorBidsSum
    );

    if (!validBids.includes(bid)) {
      if (isDealer && bid === hookBid) {
        throw new Error(`Dealer cannot bid ${hookBid} (total bids cannot equal ${this.state.currentCardsCount})`);
      }
      throw new Error(`Invalid bid ${bid}. Valid bids: ${validBids.join(', ')}`);
    }

    currentPlayer.currentBid = bid;

    const allBid = this.state.players.every(p => p.currentBid !== null);
    if (allBid) {
      this.state.phase = 'PLAYING';
      this.state.currentTurnIndex = (this.state.dealerIndex + 1) % this.state.players.length;
      this.state.hookBidForDealer = null;
    } else {
      this.state.currentTurnIndex = (this.state.currentTurnIndex + 1) % this.state.players.length;
      this.updateHookBid();
    }
  }

  public playCard(playerId: string, cardId: string): { trickComplete: boolean; roundComplete: boolean; gameComplete: boolean; winner?: PlayedCard } {
    if (this.state.phase !== 'PLAYING') {
      throw new Error('Not currently in playing phase');
    }

    const currentPlayer = this.state.players[this.state.currentTurnIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error("It's not your turn to play a card");
    }

    const hand = this.playerHands.get(playerId) || [];
    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not in hand');
    }

    const card = hand[cardIndex];
    const legalCards = getLegalCards(hand, this.state.currentTrick.leadSuit);
    if (!legalCards.some(c => c.id === cardId)) {
      throw new Error(`Must follow lead suit (${this.state.currentTrick.leadSuit}) if held`);
    }

    hand.splice(cardIndex, 1);
    this.playerHands.set(playerId, hand);

    if (this.state.currentTrick.cards.length === 0) {
      this.state.currentTrick.leadSuit = card.suit;
    }

    const playedCard: PlayedCard = {
      playerId,
      playerName: currentPlayer.name,
      card,
      seatIndex: currentPlayer.seatIndex,
    };

    this.state.currentTrick.cards.push(playedCard);

    if (this.state.currentTrick.cards.length === this.state.players.length) {
      const winner = determineTrickWinner(this.state.currentTrick.cards, this.state.trumpSuit);
      const winnerPlayer = this.state.players.find(p => p.id === winner.playerId)!;
      winnerPlayer.tricksWon += 1;

      this.state.currentTrick.winnerId = winner.playerId;
      this.state.currentTrick.winnerName = winner.playerName;
      this.state.lastTrickWinner = {
        playerId: winner.playerId,
        playerName: winner.playerName,
        card: winner.card,
      };

      this.state.completedTricks.push({ ...this.state.currentTrick });

      const roundComplete = this.state.completedTricks.length === this.state.currentCardsCount;
      let gameComplete = false;

      if (roundComplete) {
        this.finishRound();
        if (this.state.roundIndex >= this.state.totalRounds - 1) {
          this.state.phase = 'GAME_OVER';
          gameComplete = true;
        } else {
          this.state.phase = 'ROUND_SUMMARY';
        }
      } else {
        this.state.currentTurnIndex = winnerPlayer.seatIndex;
      }

      return { trickComplete: true, roundComplete, gameComplete, winner };
    } else {
      this.state.currentTurnIndex = (this.state.currentTurnIndex + 1) % this.state.players.length;
      return { trickComplete: false, roundComplete: false, gameComplete: false };
    }
  }

  public prepareNextTrick(winnerSeatIndex: number): void {
    this.state.currentTurnIndex = winnerSeatIndex;
    this.state.currentTrick = {
      trickNumber: this.state.completedTricks.length + 1,
      leadSuit: null,
      cards: [],
      winnerId: null,
      winnerName: null,
    };
  }

  private finishRound(): void {
    const scores: RoundScore[] = [];

    for (const p of this.state.players) {
      const bid = p.currentBid ?? 0;
      const roundScore = calculatePlayerRoundScore(bid, p.tricksWon);
      p.score += roundScore;

      scores.push({
        playerId: p.id,
        bid,
        tricksWon: p.tricksWon,
        roundScore,
        cumulativeScore: p.score,
      });
    }

    const roundRecord: RoundHistory = {
      roundNumber: this.state.roundIndex + 1,
      cardsCount: this.state.currentCardsCount,
      trumpSuit: this.state.trumpSuit,
      dealerId: this.state.players[this.state.dealerIndex].id,
      scores,
    };

    this.state.roundScores.push(roundRecord);
  }

  public nextRound(): void {
    if (this.state.phase !== 'ROUND_SUMMARY') {
      throw new Error('Round is not finished yet');
    }
    if (this.state.roundIndex >= this.state.totalRounds - 1) {
      this.state.phase = 'GAME_OVER';
      return;
    }

    this.state.dealerIndex = (this.state.dealerIndex + 1) % this.state.players.length;
    this.startRound(this.state.roundIndex + 1);
  }

  public getPlayerHand(playerId: string): Card[] {
    return this.playerHands.get(playerId) || [];
  }

  public getClientGameState(playerId: string): ClientGameState {
    const rawHand = this.getPlayerHand(playerId);
    // ONLY Round 0 (1 card) during bidding is blind!
    // In rounds 1, 2, 3, etc. (2 cards, 3 cards...), isBlindBidding is FALSE and rawHand is sent!
    const isBlindBidding = this.state.roundIndex === 0 && this.state.phase === 'BIDDING';
    const myHand = isBlindBidding ? [] : rawHand;

    const isMyTurn =
      (this.state.phase === 'BIDDING' || this.state.phase === 'PLAYING') &&
      this.state.players[this.state.currentTurnIndex]?.id === playerId;

    let legalCardIds: string[] = [];
    if (this.state.phase === 'PLAYING' && isMyTurn) {
      legalCardIds = getLegalCards(rawHand, this.state.currentTrick.leadSuit).map(c => c.id);
    } else {
      legalCardIds = rawHand.map(c => c.id);
    }

    let validBids: number[] = [];
    const canBid = this.state.phase === 'BIDDING' && isMyTurn;

    if (canBid) {
      const isDealer = this.state.currentTurnIndex === this.state.dealerIndex;
      const priorBidsSum = this.state.players.reduce((sum, p) => sum + (p.currentBid ?? 0), 0);

      const calc = getValidBids(
        this.state.currentCardsCount,
        isDealer,
        priorBidsSum
      );
      validBids = calc.validBids;
    }

    const myPlayer = this.state.players.find(p => p.id === playerId);
    const myTransferCode = myPlayer?.transferCode || '';
    const publicPlayers = this.state.players.map(({ sessionToken, transferCode, ...rest }) => rest);

    return {
      ...this.state,
      players: publicPlayers,
      myPlayerId: playerId,
      myTransferCode,
      myHand,
      isBlindBidding,
      legalCardIds,
      isMyTurn,
      canBid,
      validBids,
    };
  }
}
