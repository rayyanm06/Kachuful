import React from 'react';
import { ClientGameState } from '../../types/index.js';
import { Sparkles, Clock } from 'lucide-react';

interface ActionBannerProps {
  gameState: ClientGameState;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({ gameState }) => {
  const { phase, players, currentTurnIndex, myPlayerId } = gameState;
  const currentPlayer = players[currentTurnIndex];

  if (phase === 'LOBBY' || phase === 'ROUND_SUMMARY' || phase === 'GAME_OVER') {
    return null;
  }

  const isMe = currentPlayer?.id === myPlayerId;

  return (
    <div className="w-full max-w-lg mx-auto px-4 my-1 flex justify-center select-none">
      <div
        className={`
          flex items-center gap-2 px-4 py-1 rounded-full text-xs font-semibold shadow-sm border transition-all duration-300
          ${
            isMe
              ? 'bg-emerald-100/90 border-emerald-300 text-emerald-900 ring-2 ring-emerald-400/30'
              : 'bg-white border-slate-200 text-slate-700'
          }
        `}
      >
        {isMe ? (
          <>
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              {phase === 'BIDDING' ? 'Your turn to place a bid' : 'Your turn to play a card'}
            </span>
          </>
        ) : (
          <>
            <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            <span>
              Waiting for <strong className="text-slate-900">{currentPlayer?.name ?? 'player'}</strong> to{' '}
              {phase === 'BIDDING' ? 'bid' : 'play'}...
            </span>
          </>
        )}
      </div>
    </div>
  );
};
