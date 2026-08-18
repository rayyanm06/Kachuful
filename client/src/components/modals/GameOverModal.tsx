import React, { useEffect } from 'react';
import { ClientGameState } from '../../types/index.js';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  gameState: ClientGameState;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ gameState, onRestart }) => {
  const { players, myPlayerId } = gameState;
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const isMeWinner = winner?.id === myPlayerId;
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;

  useEffect(() => {
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0b5b49', '#10b981', '#f59e0b', '#ef4444'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0b5b49', '#10b981', '#f59e0b', '#ef4444'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Trophy */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 shadow-sm flex items-center justify-center text-amber-600">
            <Trophy className="w-10 h-10 fill-amber-500" />
          </div>
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200 mb-2">
          Game Over
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {isMeWinner ? '🎉 You are the Champion!' : `👑 ${winner?.name} Wins!`}
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Final victory with a total of <span className="text-emerald-800 font-bold font-mono">{winner?.score} points</span>!
        </p>

        {/* Final Standings */}
        <div className="w-full mt-5 space-y-2 max-h-52 overflow-y-auto pr-1">
          {ranked.map((p, idx) => {
            const isMe = p.id === myPlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                  idx === 0
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : isMe
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-sm font-bold">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div className="text-left">
                    <span className="font-bold text-xs sm:text-sm block">
                      {p.name} {isMe && <span className="text-xs text-emerald-700 font-semibold">(You)</span>}
                    </span>
                  </div>
                </div>

                <div className="font-mono text-sm font-black text-emerald-800">
                  {p.score} pts
                </div>
              </div>
            );
          })}
        </div>

        {/* Restart Button */}
        {isHost ? (
          <button
            onClick={onRestart}
            className="w-full mt-6 py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm shadow-sm flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        ) : (
          <div className="mt-6 text-xs text-slate-500">
            Waiting for host to restart game...
          </div>
        )}
      </div>
    </div>
  );
};
