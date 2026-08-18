import React, { useState } from 'react';
import { ClientGameState } from '../../types/index.js';
import { SuitIcon } from '../ui/SuitIcon.js';
import {
  Trophy,
  Volume2,
  VolumeX,
  Copy,
  Check,
  LogOut,
  Smartphone,
  Layers,
} from 'lucide-react';

interface GameHeaderProps {
  gameState: ClientGameState;
  muted: boolean;
  onToggleMute: () => void;
  onOpenScoreboard: () => void;
  onLeaveRoom: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  gameState,
  muted,
  onToggleMute,
  onOpenScoreboard,
  onLeaveRoom,
}) => {
  const {
    roomId,
    roundIndex,
    totalRounds,
    currentCardsCount,
    trumpSuit,
    myTransferCode,
    phase,
  } = gameState;

  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedTransfer, setCopiedTransfer] = useState(false);

  const handleCopyRoom = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  const handleCopyTransfer = () => {
    if (!myTransferCode) return;
    navigator.clipboard.writeText(myTransferCode);
    setCopiedTransfer(true);
    setTimeout(() => setCopiedTransfer(false), 2000);
  };

  return (
    <header className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-2 select-none border-b border-slate-200 bg-white/80 backdrop-blur-md">
      {/* Left: Brand & Room Code + Transfer Code */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl shadow-sm text-xs">
          <span className="text-emerald-700 font-bold text-sm">♠</span>
          <button
            onClick={handleCopyRoom}
            className="flex items-center gap-1 font-mono font-bold text-slate-800 hover:text-emerald-700 transition"
            title="Click to copy room code"
          >
            <span>{roomId}</span>
            {copiedRoom ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        </div>

        {myTransferCode && (
          <button
            onClick={handleCopyTransfer}
            className="hidden sm:flex items-center gap-1 text-[11px] font-mono bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 px-2 py-1 rounded-xl transition"
            title="Your one-time seat transfer code"
          >
            <Smartphone className="w-3 h-3 text-emerald-700" />
            <span>Transfer: <strong>{myTransferCode}</strong></span>
            {copiedTransfer && <Check className="w-2.5 h-2.5 text-emerald-600" />}
          </button>
        )}
      </div>

      {/* Center: Round / Trump status */}
      {phase !== 'LOBBY' && (
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-100/90 border border-slate-200 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono">
          <span className="font-bold text-slate-900">
            Rnd {roundIndex + 1}/{totalRounds}
          </span>
          <span className="text-slate-400">•</span>
          <span className="flex items-center gap-1 text-slate-900 font-bold">
            <Layers className="w-3 h-3 text-emerald-700" />
            {currentCardsCount} {currentCardsCount === 1 ? 'Card' : 'Cards'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="flex items-center gap-1 font-bold">
            <SuitIcon suit={trumpSuit} size="sm" />
          </span>
        </div>
      )}

      {/* Right: Scores & Audio & Leave */}
      <div className="flex items-center gap-1 sm:gap-2">
        {phase !== 'LOBBY' && (
          <button
            onClick={onOpenScoreboard}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold transition shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Scores</span>
          </button>
        )}

        <button
          onClick={onToggleMute}
          className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
        </button>

        <button
          onClick={onLeaveRoom}
          className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
          title="Leave Room"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
