import React from 'react';
import { ClientGameState } from '../../types/index.js';
import { PlayingCard } from '../ui/PlayingCard.js';
import { SuitIcon } from '../ui/SuitIcon.js';
import { Crown, Bot, WifiOff, Lock, Sparkles, Layers } from 'lucide-react';

interface PortableTableProps {
  gameState: ClientGameState;
  onMakeBid: (bid: number) => void;
  onPlayCard: (cardId: string) => void;
}

export const PortableTable: React.FC<PortableTableProps> = ({
  gameState,
  onMakeBid,
  onPlayCard,
}) => {
  const {
    players,
    dealerIndex,
    currentTurnIndex,
    currentTrick,
    trumpSuit,
    currentCardsCount,
    roundIndex,
    totalRounds,
    isBlindBidding,
    lastTrickWinner,
    myPlayerId,
    myHand,
    legalCardIds,
    isMyTurn,
    canBid,
    validBids,
    hookBidForDealer,
    phase,
  } = gameState;

  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isDealer = myPlayer?.seatIndex === dealerIndex;
  const isPlayingPhase = phase === 'PLAYING';
  const isBiddingPhase = phase === 'BIDDING';

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-between min-h-[calc(100vh-65px)] px-2 sm:px-4 py-2 select-none">
      {/* 1. TOP PLAYERS STRIP (Clean light-themed card badges for 3 to 12 players) */}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {players.map((player) => {
            const isMe = player.id === myPlayerId;
            const isPlayerDealer = player.seatIndex === dealerIndex;
            const isPlayerTurn =
              (phase === 'BIDDING' || phase === 'PLAYING') &&
              player.seatIndex === currentTurnIndex;

            return (
              <div
                key={player.id}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all text-xs
                  ${
                    isPlayerTurn
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                      : isMe
                      ? 'bg-emerald-50/80 border-emerald-300'
                      : 'bg-slate-50 border-slate-200'
                  }
                `}
              >
                {/* Avatar with Badges */}
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-[11px] shadow-sm">
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>

                  {isPlayerDealer && (
                    <div
                      title="Dealer"
                      className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] flex items-center justify-center shadow"
                    >
                      D
                    </div>
                  )}

                  {player.isHost && (
                    <div
                      title="Host"
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow"
                    >
                      <Crown className="w-2 h-2 fill-slate-950" />
                    </div>
                  )}

                  {player.isBot && (
                    <div
                      title="Bot"
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[8px] shadow"
                    >
                      <Bot className="w-2 h-2" />
                    </div>
                  )}

                  {!player.isConnected && (
                    <div
                      title="Disconnected"
                      className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow"
                    >
                      <WifiOff className="w-2 h-2" />
                    </div>
                  )}
                </div>

                {/* Player Name & Score / Bid */}
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-900 text-[11px] truncate max-w-[80px]">
                    {player.name} {isMe && <span className="text-[9px] text-emerald-700 font-semibold">(You)</span>}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className="text-emerald-700 font-bold">{player.score} pts</span>
                    {isPlayingPhase && (
                      <span className="text-slate-500 font-semibold">
                        {player.tricksWon}/{player.currentBid ?? '?'}
                      </span>
                    )}
                    {isBiddingPhase && (
                      <span className="text-slate-500">
                        {player.currentBid !== null ? `Bid: ${player.currentBid}` : (isPlayerTurn ? 'Bidding...' : '...')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER PLAY ARENA (High-contrast emerald felt table) */}
      <div className="relative my-3 flex-1 flex flex-col items-center justify-center rounded-3xl light-felt-table border-4 border-[#084739] p-4 min-h-[260px] sm:min-h-[320px]">
        {/* Felt Watermark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-15">
          <SuitIcon suit={trumpSuit} size="xl" className="w-36 h-36" />
        </div>

        {/* Center Round / Trick Info HUD */}
        <div className="absolute top-3 flex items-center gap-2 text-xs font-mono bg-slate-950/80 px-3.5 py-1 rounded-full border border-emerald-400/30 text-slate-100 shadow-md">
          <span className="font-bold text-amber-300">Trick {currentTrick.trickNumber} of {currentCardsCount}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Trump: <SuitIcon suit={trumpSuit} size="sm" />
          </span>
          {currentTrick.leadSuit && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-300">
                Lead: <SuitIcon suit={currentTrick.leadSuit} size="sm" />
              </span>
            </>
          )}
        </div>

        {/* BLIND ROUND 1 INDICATOR (ONLY on Round 1 bidding) */}
        {isBlindBidding ? (
          <div className="flex flex-col items-center justify-center p-5 bg-slate-950/80 border border-amber-400/50 rounded-2xl text-center max-w-sm shadow-xl animate-pulse">
            <span className="text-3xl mb-1">🙈</span>
            <span className="font-black text-amber-300 text-sm sm:text-base">Round 1 is Blind!</span>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              Place your bid without seeing your card. Cards will be revealed once all bids are locked!
            </p>
          </div>
        ) : (
          /* PLAYED CARDS IN CURRENT TRICK */
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 my-auto">
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
                      isWinner ? 'scale-110' : ''
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

        {/* 2-SECOND TRICK WINNER BANNER */}
        {lastTrickWinner && currentTrick.cards.length === 0 && (
          <div className="absolute bottom-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black shadow-xl border border-amber-200 flex items-center gap-2 animate-bounce-short">
            <span>👑 {lastTrickWinner.playerName} won trick with</span>
            <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded text-[11px]">
              {lastTrickWinner.card.rank}{lastTrickWinner.card.suit}
            </span>
          </div>
        )}
      </div>

      {/* 3. BOTTOM ACTION AREA (Bidding Selector & Player Hand) */}
      <div className="w-full flex flex-col items-center gap-2">
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
            {/* Play Turn Indicator */}
            {isPlayingPhase && isMyTurn && (
              <div className="mb-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your turn to play a card!</span>
                {currentTrick.leadSuit && (
                  <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                    Must follow: <SuitIcon suit={currentTrick.leadSuit} size="xs" />
                  </span>
                )}
              </div>
            )}

            {/* Hand Container */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-full p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              {myHand.length === 0 ? (
                <div className="py-3 px-6 text-xs text-slate-400 font-medium">No cards in hand</div>
              ) : (
                myHand.map((card) => {
                  const isLegal = isPlayingPhase ? legalCardIds.includes(card.id) : true;
                  const isPlayable = isPlayingPhase && isMyTurn;
                  const isTrump = card.suit === trumpSuit;

                  return (
                    <div key={card.id} className="relative">
                      {isTrump && (
                        <div
                          title="Trump card"
                          className="absolute -top-1 -right-1 z-20 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow pointer-events-none"
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
