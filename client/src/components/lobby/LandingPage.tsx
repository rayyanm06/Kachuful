import React, { useState } from 'react';
import { RulesModal } from './RulesModal.js';
import { ArrowRight, Smartphone, Layers, Shield } from 'lucide-react';

interface LandingPageProps {
  onCreateRoom: (playerName: string, customMaxCards?: number) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  onTransferSeat: (transferCode: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateRoom,
  onJoinRoom,
  onTransferSeat,
}) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('kachuful_player_name') || '');
  const [roomCode, setRoomCode] = useState('');
  const [transferCode, setTransferCode] = useState('');
  const [maxCardsChoice, setMaxCardsChoice] = useState<number>(8);
  const [showRules, setShowRules] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    onCreateRoom(playerName.trim(), maxCardsChoice === 8 ? undefined : maxCardsChoice);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferCode.trim()) return;
    onTransferSeat(transferCode.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 bg-[#f1f5f9] text-slate-900 selection:bg-indigo-600 selection:text-white font-sans antialiased">
      
      {/* Brand Header */}
      <header className="w-full max-w-[96%] xl:max-w-[1600px] flex items-center justify-between py-4 px-2">
        <div className="flex items-center gap-3">
          {/* Logo Icon - Redesigned with royal indigo & gold card theme */}
          <div className="w-12 h-12 rounded-2xl bg-[#1e1b4b] border border-amber-500/30 flex items-center justify-center shadow-lg shrink-0">
            <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="25" y="20" width="50" height="60" rx="8" fill="white" stroke="#f59e0b" strokeWidth="2" />
              <path d="M50 32 C56 42, 64 48, 59 54 C55 58, 51 56, 50 56 C49 56, 45 58, 41 54 C36 48, 44 42, 50 32 Z" fill="#1e1b4b" />
              <path d="M50 54 C50 54, 51 61, 54 62 L46 62 C49 61, 50 54, 50 54 Z" fill="#1e1b4b" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-indigo-700 font-extrabold uppercase tracking-widest leading-none">
              Everyone's game
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-none tracking-tight">
              Kachuful by Rayyan
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Banner Section (Midnight Indigo / Purple & Gold themed card) */}
      <section className="w-full max-w-[96%] xl:max-w-[1600px] my-4 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#2e1065] rounded-[2.5rem] p-6 sm:p-10 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl border border-indigo-500/20">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <div className="max-w-2xl text-center md:text-left z-10">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-500/20">
            YOUR TABLE IS ONE CODE AWAY
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mt-4">
            Call your bid.<br />Take your tricks.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg mt-4 font-normal max-w-xl leading-relaxed">
            A fast private table for game night, whether everyone is across the room or across the country.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-5 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-amber-400" /> 3–12 players</span>
            <span className="text-slate-500">•</span>
            <span>No signup</span>
            <span className="text-slate-500">•</span>
            <span>Rejoin anytime</span>
          </div>

          <button
            onClick={() => setShowRules(true)}
            className="mt-6 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-amber-500/20"
          >
            How to Play
          </button>
        </div>

        {/* Hero Card Graphic Art (Matches screenshot styling with dark backing) */}
        <div className="relative w-64 h-48 flex items-center justify-center z-10 scale-90 sm:scale-100">
          {/* Dark backing card with gold accent */}
          <div className="absolute w-24 h-34 bg-[#1f2937] rounded-2xl border border-amber-500/40 -rotate-12 -translate-x-12 shadow-2xl flex items-center justify-center text-amber-500 text-xl font-bold">
            ♠
          </div>
          {/* 2 of Diamonds */}
          <div className="absolute w-24 h-34 bg-white rounded-2xl border border-slate-200 -rotate-6 -translate-x-4 shadow-2xl p-2 flex flex-col justify-between text-red-600 select-none">
            <div className="font-bold text-xs leading-none">2 ♦</div>
            <div className="text-center text-xl flex flex-col items-center">
              <span>♦</span>
              <span className="-mt-1 text-xs">♦</span>
            </div>
            <div className="font-bold text-xs leading-none rotate-180 self-end">2 ♦</div>
          </div>
          {/* Ace of Spades */}
          <div className="absolute w-24 h-34 bg-white rounded-2xl border border-slate-200 rotate-12 translate-x-8 shadow-2xl p-2 flex flex-col justify-between text-slate-900 select-none">
            <div className="font-bold text-xs leading-none">A ♠</div>
            <div className="text-center text-3xl">♠</div>
            <div className="font-bold text-xs leading-none rotate-180 self-end">A ♠</div>
          </div>
        </div>
      </section>

      {/* Main Lobby Container */}
      <section className="w-full max-w-[96%] xl:max-w-[1600px] bg-white border border-slate-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-md mt-4">
        <div className="mb-6 text-left">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Take a seat
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Join a table or deal a new one
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Use the same player name whether you join a friend or host the room.
          </p>
        </div>

        {/* Player Name Input */}
        <div className="mb-6 max-w-md">
          <label htmlFor="player-name" className="block text-xs font-extrabold text-slate-700 mb-2">
            Player name
          </label>
          <input
            id="player-name"
            type="text"
            required
            maxLength={16}
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition"
          />
        </div>

        {/* Lobby Grid: Join Room Card + Create Room Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Join Room */}
          <form onSubmit={handleJoin} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300 transition duration-200 min-h-[220px]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                I have a code
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-1">Join a room</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter the code your host shared.
              </p>

              <div className="mt-4">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-black text-center tracking-widest uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!playerName.trim() || !roomCode.trim()}
              className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              <span>Join room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Create Room */}
          <form onSubmit={handleCreate} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300 transition duration-200 min-h-[220px]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                I'm hosting
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-1">Create a room</h4>
              <p className="text-xs text-slate-500 mt-1">
                Open a private table, then send the room code to your group.
              </p>

              {/* Game Length Choice */}
              <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Max Cards in Round (Game Length)</span>
                </label>
                <select
                  value={maxCardsChoice}
                  onChange={(e) => setMaxCardsChoice(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={8}>Standard (1 up to 8 down to 1 = 15 rounds)</option>
                  <option value={6}>Medium (1 up to 6 down to 1 = 11 rounds)</option>
                  <option value={4}>Quick Game (1 up to 4 down to 1 = 7 rounds)</option>
                  <option value={3}>Lightning (1 up to 3 down to 1 = 5 rounds)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!playerName.trim()}
              className="mt-6 w-full py-3 rounded-xl bg-[#1e1b4b] hover:bg-[#2e2a72] disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              <span>Create room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Transfer Seat Disclosure */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowTransfer(!showTransfer)}
            className="text-xs text-slate-600 hover:text-indigo-800 flex items-center gap-1.5 font-medium transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-700" />
            <span>Switching from another device? Move seat with transfer code</span>
          </button>

          {showTransfer && (
            <form onSubmit={handleTransfer} className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2 animate-fade-in">
              <input
                type="text"
                placeholder="6-Letter Transfer code"
                value={transferCode}
                onChange={(e) => setTransferCode(e.target.value.toUpperCase())}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-center tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase"
              />
              <button
                type="submit"
                disabled={!transferCode.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition"
              >
                Use transfer code
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-[96%] xl:max-w-[1600px] py-6 text-center text-xs text-slate-500 font-medium font-sans">
        Kachuful / Judgement • Built for 3 to 12 players • Mobile-friendly
      </footer>

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
};
