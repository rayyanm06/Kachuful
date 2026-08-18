import React from 'react';
import { ClientGameState } from '../../types/index.js';
import { SuitIcon } from '../ui/SuitIcon.js';
import { Trophy, X, Sparkles } from 'lucide-react';

interface ScoreboardModalProps {
  gameState: ClientGameState;
  onClose: () => void;
  onNextRound?: () => void;
  isRoundSummary?: boolean;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  gameState,
  onClose,
  onNextRound,
  isRoundSummary = false,
}) => {
  const { players, roundScores, myPlayerId, roundIndex, totalRounds } = gameState;

  const rankedPlayers = [...players].sort((a, b) => b.score - a.score);
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {isRoundSummary ? `Round ${roundIndex + 1} Summary` : 'Live Scoreboard'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Round {Math.min(roundIndex + 1, totalRounds)} of {totalRounds} • Kachuful
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Standings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
          {rankedPlayers.slice(0, 4).map((p, idx) => (
            <div
              key={p.id}
              className={`p-2 rounded-xl border flex items-center gap-2 ${
                idx === 0
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-xs font-bold w-5 text-center">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
              </span>
              <div className="truncate text-left">
                <div className="text-xs font-bold truncate text-slate-900">{p.name}</div>
                <div className="text-[11px] font-mono font-bold text-emerald-700">{p.score} pts</div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Matrix Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto border border-slate-200 rounded-2xl bg-white">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Rnd</th>
                <th className="py-2.5 px-2">Cards</th>
                <th className="py-2.5 px-2">Trump</th>
                {players.map((p) => (
                  <th
                    key={p.id}
                    className={`py-2.5 px-3 text-center whitespace-nowrap ${
                      p.id === myPlayerId ? 'text-emerald-800 bg-emerald-50 font-bold' : ''
                    }`}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roundScores.length === 0 ? (
                <tr>
                  <td colSpan={3 + players.length} className="py-8 text-center text-slate-400 font-sans">
                    No completed rounds yet.
                  </td>
                </tr>
              ) : (
                roundScores.map((rh) => (
                  <tr key={rh.roundNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-800">R{rh.roundNumber}</td>
                    <td className="py-2 px-2 text-slate-500">{rh.cardsCount}</td>
                    <td className="py-2 px-2">
                      <SuitIcon suit={rh.trumpSuit} size="sm" />
                    </td>
                    {players.map((p) => {
                      const scoreEntry = rh.scores.find((s) => s.playerId === p.id);
                      if (!scoreEntry) return <td key={p.id} className="py-2 px-3 text-center text-slate-300">-</td>;

                      const metBid = scoreEntry.bid === scoreEntry.tricksWon;
                      return (
                        <td
                          key={p.id}
                          className={`py-2 px-3 text-center ${
                            p.id === myPlayerId ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-slate-500 text-[10px]">
                              {scoreEntry.bid}/{scoreEntry.tricksWon}
                            </span>
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                metBid
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'text-rose-600'
                              }`}
                            >
                              {metBid ? `+${scoreEntry.roundScore}` : '0'}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
            {/* Total Row */}
            <tfoot className="bg-slate-50 font-bold border-t border-slate-300 sticky bottom-0 text-slate-900">
              <tr>
                <td colSpan={3} className="py-3 px-3 uppercase text-[11px] font-sans text-slate-600">
                  Total
                </td>
                {players.map((p) => (
                  <td
                    key={p.id}
                    className={`py-3 px-3 text-center font-mono text-xs text-emerald-800 ${
                      p.id === myPlayerId ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
                    }`}
                  >
                    {p.score} pts
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
          >
            Close
          </button>

          {isRoundSummary && onNextRound && isHost && (
            <button
              onClick={onNextRound}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 animate-bounce-short"
            >
              <Sparkles className="w-4 h-4" />
              <span>Next Round</span>
            </button>
          )}

          {isRoundSummary && !isHost && (
            <div className="text-xs text-emerald-800 animate-pulse font-medium">
              Waiting for host to start next round...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
