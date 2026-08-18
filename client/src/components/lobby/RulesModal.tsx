import React from 'react';
import { X } from 'lucide-react';
import { SuitIcon } from '../ui/SuitIcon.js';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              ♠
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              How to Play Kachuful
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-2.5 my-4">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs sm:text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <span>Create or join a private room with a code (up to 12 players).</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs sm:text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <span>Bid exactly what you expect to win.</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs sm:text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <span>Follow suit, win tricks, and hit your bid for points.</span>
          </div>
        </div>

        {/* Round Flow Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 text-xs sm:text-sm">
          <h3 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">Round Flow</h3>
          <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
            <li><strong>3 to 12 players</strong> can join a room.</li>
            <li><strong>Round pattern:</strong> 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1 cards.</li>
            <li><strong>Trump rotates every round:</strong> Spades (♠) → Diamonds (♦) → Clubs (♣) → Hearts (♥).</li>
            <li><strong>Round 1 is blind:</strong> bids lock first, then cards are revealed. In all subsequent rounds, you see your cards while bidding!</li>
            <li><strong>Dealer hook rule:</strong> Dealer cannot make the final bid that makes total bids equal total tricks.</li>
            <li><strong>Lead suit:</strong> You must follow lead suit whenever possible.</li>
            <li><strong>Completed tricks:</strong> Stay visible for 2 seconds with winner highlight.</li>
          </ul>
        </div>

        {/* Trick Example Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 text-xs sm:text-sm">
          <h3 className="font-bold text-slate-900 mb-3 text-sm sm:text-base">Trick example (Trump: Spades)</h3>
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1">
            {/* Lead */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-slate-600 font-medium">Lead</span>
              <div className="w-14 h-20 bg-white rounded-xl border border-slate-300 p-1 flex flex-col justify-between text-red-600 shadow-sm">
                <span className="font-bold text-xs leading-none">9</span>
                <span className="text-center text-lg">♥</span>
                <span className="font-bold text-xs leading-none rotate-180 self-end">9</span>
              </div>
            </div>

            {/* Follow */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-slate-600 font-medium">Follow</span>
              <div className="w-14 h-20 bg-white rounded-xl border border-slate-300 p-1 flex flex-col justify-between text-red-600 shadow-sm">
                <span className="font-bold text-xs leading-none">Q</span>
                <span className="text-center text-lg">♥</span>
                <span className="font-bold text-xs leading-none rotate-180 self-end">Q</span>
              </div>
            </div>

            {/* Trump Wins */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-emerald-800 font-bold">Trump wins</span>
              <div className="w-14 h-20 bg-white rounded-xl border-2 border-emerald-500 ring-2 ring-emerald-500/30 p-1 flex flex-col justify-between text-slate-900 shadow-md">
                <span className="font-bold text-xs leading-none">2</span>
                <span className="text-center text-lg">♠</span>
                <span className="font-bold text-xs leading-none rotate-180 self-end">2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Winning & Scoring */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
          <h3 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">Winning & Scoring</h3>
          <ul className="space-y-1 text-slate-700 list-disc pl-4 mb-3">
            <li>Highest trump wins the trick; if no trump is played, highest lead suit wins.</li>
            <li>Exact bid scores <strong>10 + tricks won</strong>; miss scores <strong>0</strong> for that round.</li>
          </ul>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Bid</th>
                  <th className="py-2 px-3">Won</th>
                  <th className="py-2 px-3">Result</th>
                  <th className="py-2 px-3">Round Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-3">2</td>
                  <td className="py-2 px-3">2</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">✓ Hit</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">+12</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">2</td>
                  <td className="py-2 px-3">1</td>
                  <td className="py-2 px-3 text-rose-600 font-bold">✕ Miss</td>
                  <td className="py-2 px-3 text-slate-400 font-bold">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition"
        >
          Got it, let's play!
        </button>
      </div>
    </div>
  );
};
