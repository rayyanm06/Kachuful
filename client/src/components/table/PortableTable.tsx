import React, { useState } from 'react';
import { ClientGameState, Card, Suit, RANK_VALUES } from '../../types/index.js';
import { PlayingCard } from '../ui/PlayingCard.js';
import { SuitIcon } from '../ui/SuitIcon.js';
import { Sparkles, Bot, Crown, ArrowUpDown, Lock, Play } from 'lucide-react';

interface PortableTableProps {
  gameState: ClientGameState;
  onMakeBid: (bid: number) => void;
  onPlayCard: (cardId: string) => void;
  onNextRound?: () => void;
}

export const PortableTable: React.FC<PortableTableProps> = ({
  gameState,
  onMakeBid,
  onPlayCard,
  onNextRound,
}) => {
  const {
    players,
    dealerIndex,
    currentTurnIndex,
    roundIndex,
    totalRounds,
    currentCardsCount,
    trumpSuit,
    currentTrick,
    phase,
    myPlayerId,
    myHand,
    isBlindBidding,
    legalCardIds,
    isMyTurn,
    canBid,
    validBids,
    hookBidForDealer,
    lastTrickWinner,
  } = gameState;

  // Sorting state for player hand ('suit' = Suit & Rank, 'rank' = Rank High-to-Low)
  const [sortBy, setSortBy] = useState<'suit' | 'rank'>('suit');

  const myPlayer = players.find((p) => p.id === myPlayerId);
  const mySeatIndex = myPlayer?.seatIndex ?? 0;
  const isDealer = currentTurnIndex === dealerIndex && isMyTurn;
  const isBiddingPhase = phase === 'BIDDING';
  const isPlayingPhase = phase === 'PLAYING';
  const isRoundSummary = phase === 'ROUND_SUMMARY';
  const isHost = myPlayer?.isHost ?? false;

  // Re-order other players relative to local player (so local player is always bottom)
  const numPlayers = players.length;
  const orderedOpponents = Array.from({ length: numPlayers - 1 }, (_, i) => {
    const seatIdx = (mySeatIndex + 1 + i) % numPlayers;
    return players.find((p) => p.seatIndex === seatIdx)!;
  }).filter(Boolean);

  // Dynamic circular seat layout positions based on player count
  const getOpponentPositionStyle = (index: number, total: number) => {
    // Distribute opponents along the top half ellipse
    const angleStep = Math.PI / (total + 1);
    const angle = Math.PI - (index + 1) * angleStep; // from PI to 0
    const xRadius = total > 6 ? 44 : total > 4 ? 42 : 40; // % from center
    const yRadius = total > 6 ? 34 : 30; // % from center

    const left = 50 + xRadius * Math.cos(angle);
    const top = 40 - yRadius * Math.sin(angle);

    return {
      left: `${left}%`,
      top: `${top}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  // Sort hand cards based on active sorting choice
  const sortedHand = [...myHand].sort((a, b) => {
    const suitOrder: Record<Suit, number> = { S: 0, D: 1, C: 2, H: 3 };
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

  const toggleSort = () => {
    setSortBy((prev) => (prev === 'suit' ? 'rank' : 'suit'));
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-between p-2 sm:p-4 min-h-[560px] md:min-h-[640px]">
      
      {/* 1. TABLE FELT & OPPONENT POSITIONS */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[460px] bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#065f46] rounded-[2.5rem] sm:rounded-[3.5rem] border-8 sm:border-[12px] border-[#3f200c] shadow-2xl overflow-hidden flex items-center justify-center p-4">
        
        {/* Felt Texture Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
        {/* Gold Table Inset Ring */}
        <div className="absolute inset-3 sm:inset-5 rounded-[2rem] sm:rounded-[3rem] border border-amber-400/30 pointer-events-none" />

        {/* OPPONENTS AROUND THE FELT */}
        {orderedOpponents.map((opp, idx) => {
          const isCurrentTurn = currentTurnIndex === opp.seatIndex && (isBiddingPhase || isPlayingPhase);
          const isOppDealer = opp.seatIndex === dealerIndex;

          return (
            <div
              key={opp.id}
              style={getOpponentPositionStyle(idx, orderedOpponents.length)}
              className="absolute z-10 flex flex-col items-center gap-1 transition-all duration-300 pointer-events-none"
            >
              {/* Turn Glow Ring */}
              <div
                className={`relative flex items-center justify-center rounded-2xl p-1 transition-all duration-300 ${
                  isCurrentTurn
                    ? 'ring-4 ring-amber-400 shadow-amber-400/50 shadow-xl scale-105 bg-amber-400/20'
                    : 'bg-black/30'
                }`}
              >
                {/* Avatar Badge */}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm relative shadow-md">
                  {opp.isBot ? <Bot className="w-5 h-5 text-indigo-400" /> : opp.name.slice(0, 2).toUpperCase()}

                  {/* Dealer Crown Badge */}
                  {isOppDealer && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow" title="Dealer">
                      <Crown className="w-3 h-3 fill-slate-950" />
                    </div>
                  )}
                </div>
              </div>

              {/* Opponent Info Chip */}
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 rounded-lg px-2 py-0.5 text-center shadow-lg text-white max-w-[85px] sm:max-w-[100px] truncate">
                <div className="text-[10px] sm:text-[11px] font-bold truncate leading-tight">{opp.name}</div>
                <div className="text-[9px] sm:text-[10px] text-amber-300 font-mono font-black flex items-center justify-center gap-1">
                  <span>Bid: {opp.currentBid ?? '-'}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-emerald-400">Won: {opp.tricksWon}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* CENTER TABLE FELT: PLAYED CARDS / ROUND SUMMARY */}
        {isRoundSummary ? (
          /* ROUND SUMMARY INTERACTIVE BANNER DIRECTLY ON FELT */
          <div className="z-20 flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-slate-950/90 rounded-3xl border border-amber-500/40 shadow-2xl backdrop-blur-md max-w-md animate-fade-in text-white">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight">
              Round {roundIndex + 1} Complete!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {roundIndex + 1 < totalRounds
                ? `Next Up: Round ${roundIndex + 2} (${gameState.roundsStructure[roundIndex + 1]} cards each)`
                : 'Final Round Finished!'}
            </p>

            {isHost && onNextRound && (
              <button
                type="button"
                onClick={onNextRound}
                className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Deal Next Round</span>
              </button>
            )}

            {!isHost && (
              <div className="mt-4 text-xs text-amber-300/80 font-medium animate-pulse">
                Waiting for host to deal next round...
              </div>
            )}
          </div>
        ) : isBlindBidding ? (
          /* BLIND BIDDING NOTICE */
          <div className="z-20 text-center text-white flex flex-col items-center bg-black/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-amber-400/40 shadow-2xl max-w-xs animate-fade-in">
            <span className="text-3xl mb-1">🙈</span>
            <span className="font-black text-amber-300 text-sm sm:text-base">Round 1 is Blind!</span>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              Place your bid without seeing your card. Cards will be revealed once all bids are locked!
            </p>
          </div>
        ) : (
          /* PLAYED CARDS IN CURRENT TRICK */
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-auto z-10">
            {currentTrick.cards.length === 0 ? (
              <div className="text-center text-xs text-emerald-200/60 font-medium py-8">
                {isBiddingPhase ? 'Bidding in progress...' : 'Waiting for lead card...'}
              </div>
            ) : (
              currentTrick.cards.map((played) => {
                const isWinner =
                  currentTrick.winnerId === played.playerId ||
                  lastTrickWinner?.playerId === played.playerId;

                return (
                  <div
                    key={`${played.playerId}_${played.card.id}`}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                      isWinner ? 'scale-110 z-20' : ''
                    }`}
                  >
                    <div
                      className={`relative rounded-xl transition-all ${
                        isWinner ? 'ring-4 ring-amber-400 shadow-amber-400/50 shadow-2xl' : ''
                      }`}
                    >
                      <PlayingCard card={played.card} size="md" />
                      {isWinner && (
                        <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow font-black text-xs">
                          👑
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700 truncate max-w-[90px] shadow">
                      {played.playerName}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2.5-SECOND TRICK WINNER BANNER */}
        {lastTrickWinner && currentTrick.cards.length === 0 && !isRoundSummary && (
          <div className="absolute bottom-3 z-20 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black shadow-xl border border-amber-200 flex items-center gap-2 animate-bounce-short">
            <span>👑 {lastTrickWinner.playerName} won trick with</span>
            <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded text-[11px]">
              {lastTrickWinner.card.rank}{lastTrickWinner.card.suit}
            </span>
          </div>
        )}
      </div>

      {/* 2. BOTTOM ACTION AREA (Bidding Selector & Player Hand) */}
      <div className="w-full flex flex-col items-center gap-2 mt-3">
        
        {/* A. BIDDING CONTROLS (Displayed when it's your turn to bid) */}
        {isBiddingPhase && isMyTurn && (
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-lg animate-fade-in text-slate-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  Place Your Bid ({isBlindBidding ? 'Blind Round' : `${currentCardsCount} ${currentCardsCount === 1 ? 'Card' : 'Cards'}`})
                </span>
              </div>

              {isDealer && hookBidForDealer !== null && (
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300 font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Hook: cannot bid {hookBidForDealer}
                </span>
              )}
            </div>

            {/* Quick Number Selector Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {Array.from({ length: currentCardsCount + 1 }, (_, i) => i).map((num) => {
                const isValid = validBids.includes(num);
                const isHooked = isDealer && hookBidForDealer === num;

                return (
                  <button
                    key={num}
                    type="button"
                    disabled={!isValid}
                    onClick={() => onMakeBid(num)}
                    className={`
                      w-10 h-11 sm:w-12 sm:h-13 rounded-xl font-mono text-sm sm:text-base font-black transition-all duration-150
                      flex flex-col items-center justify-center
                      ${
                        isValid
                          ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                      }
                    `}
                  >
                    <span>{num}</span>
                    {isHooked && <Lock className="w-2.5 h-2.5 text-amber-300" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* B. BIDDING WAITING STATUS */}
        {isBiddingPhase && !isMyTurn && (
          <div className="py-1 text-xs text-slate-600 font-medium">
            Waiting for other players to bid...
          </div>
        )}

        {/* C. PLAYER'S HAND (VISIBLE IN BOTH BIDDING (if not blind) AND PLAYING PHASES!) */}
        {!isBlindBidding && (
          <div className="w-full flex flex-col items-center">
            
            {/* Hand Header: Turn Indicator + Order Hand Button */}
            <div className="w-full max-w-2xl flex items-center justify-between px-2 mb-1.5">
              {isPlayingPhase && isMyTurn ? (
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Your turn to play a card!</span>
                  {currentTrick.leadSuit && (
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                      Must follow: <SuitIcon suit={currentTrick.leadSuit} size="xs" />
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-600">Your Hand</div>
              )}

              {/* Order Hand Toggle Button */}
              {myHand.length > 1 && (
                <button
                  type="button"
                  onClick={toggleSort}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-sm flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{sortBy === 'suit' ? 'Sorted by Suit ♠♦♣♥' : 'Sorted by Rank (A..2)'}</span>
                </button>
              )}
            </div>

            {/* Hand Cards Container */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 max-w-full p-2.5 sm:p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-md">
              {sortedHand.length === 0 ? (
                <div className="py-3 px-6 text-xs text-slate-400 font-medium">No cards in hand</div>
              ) : (
                sortedHand.map((card) => {
                  const isLegal = isPlayingPhase ? legalCardIds.includes(card.id) : true;
                  const isPlayable = isPlayingPhase && isMyTurn;
                  const isTrump = card.suit === trumpSuit;

                  return (
                    <div key={card.id} className="relative">
                      {isTrump && (
                        <div
                          title="Trump card"
                          className="absolute -top-1 -right-1 z-30 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow pointer-events-none"
                        >
                          ★
                        </div>
                      )}
                      <PlayingCard
                        card={card}
                        isLegal={isLegal}
                        isPlayable={isPlayable}
                        size="md"
                        onClick={() => onPlayCard(card.id)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
