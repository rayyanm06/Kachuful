import React, { useState } from 'react';
import { ClientGameState } from '../../types/index.js';
import {
  Users,
  Bot,
  UserPlus,
  Play,
  Copy,
  Check,
  Crown,
  Trash2,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';

interface WaitingRoomProps {
  gameState: ClientGameState;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onKickPlayer: (playerId: string) => void;
  onLeaveRoom: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameState,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onKickPlayer,
  onLeaveRoom,
}) => {
  const { roomId, players, myPlayerId, myTransferCode } = gameState;
  const [copied, setCopied] = useState(false);
  const [copiedTransfer, setCopiedTransfer] = useState(false);

  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;
  const canStart = players.length >= 2 && players.length <= 12;

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTransfer = () => {
    if (!myTransferCode) return;
    navigator.clipboard.writeText(myTransferCode);
    setCopiedTransfer(true);
    setTimeout(() => setCopiedTransfer(false), 2000);
  };

  const calculatedMaxCards = Math.min(8, Math.floor(52 / Math.max(2, players.length)));
  const calculatedTotalRounds = calculatedMaxCards * 2 - 1;

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col justify-between text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-800">
            Lobby • Private Room
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-wider">
              {roomId}
            </h1>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 transition"
              title="Copy invite link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={onLeaveRoom}
          className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition"
          title="Leave Room"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main Players Grid */}
      <div className="my-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Players Seated ({players.length}/12)
            </h2>
          </div>
          {isHost && players.length < 12 && (
            <button
              onClick={onAddBot}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 transition shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>+ Add AI Bot</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {players.map((p, idx) => {
            const isMe = p.id === myPlayerId;
            return (
              <div
                key={p.id}
                className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400/40 shadow-sm'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-800">
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    {p.isHost && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                        <Crown className="w-2.5 h-2.5 fill-slate-950" />
                      </div>
                    )}
                    {p.isBot && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow">
                        <Bot className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  <div className="truncate text-left">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {p.name} {isMe && <span className="text-[10px] text-emerald-700 font-semibold">(You)</span>}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Seat #{idx + 1}</span>
                  </div>
                </div>

                {isHost && !isMe && (
                  <button
                    onClick={() => (p.isBot ? onRemoveBot(p.id) : onKickPlayer(p.id))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                    title={p.isBot ? 'Remove Bot' : 'Kick Player'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Empty Seats */}
          {Array.from({ length: Math.max(0, 12 - players.length) }, (_, i) => (
            <div
              key={`empty_${i}`}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-3 flex items-center justify-center gap-2 text-slate-400 text-xs"
            >
              <UserPlus className="w-4 h-4 opacity-50" />
              <span>Empty Seat</span>
            </div>
          ))}
        </div>
      </div>

      {/* Game Structure Preview & Start Button */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="font-bold text-slate-900 block">Round Structure</span>
              <span className="text-slate-600 font-mono">1 → {calculatedMaxCards} → 1 cards ({calculatedTotalRounds} rounds)</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="font-bold text-slate-900 block">Round 1 Rule</span>
              <span className="text-slate-600">Blind Bidding</span>
            </div>
          </div>
        </div>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{canStart ? 'Start Kachuful Game' : 'Need 2+ Players to Start'}</span>
          </button>
        ) : (
          <div className="text-xs text-emerald-800 animate-pulse font-medium">
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
};
