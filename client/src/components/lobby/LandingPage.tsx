import React, { useState } from 'react';
import { RulesModal } from './RulesModal.js';
import { ArrowRight, Smartphone, Layers, Shield, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface LandingPageProps {
  onCreateRoom: (playerName: string, customMaxCards?: number) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  onTransferSeat: (transferCode: string) => void;
  errorMessage?: string | null;
  onClearError?: () => void;
  connected?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateRoom,
  onJoinRoom,
  onTransferSeat,
  errorMessage,
  onClearError,
  connected = true,
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
          {/* Logo Icon */}
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
              Kachuful
            </h1>
          </div>
        </div>

        {/* Top Header Actions (Connection Status + How to Play) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Server Indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            connected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{connected ? 'Server Online' : 'Connecting to Server...'}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-extrabold shadow-sm transition"
          >
            How to play
          </button>
        </div>
      </header>

      {/* Hero Banner Area */}
      <section className="w-full max-w-[96%] xl:max-w-[1600px] bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] rounded-[2.5rem] p-6 sm:p-10 md:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 my-2 border border-emerald-500/20">
        
        {/* Felt Watermark Texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />

        <div className="z-10 max-w-xl text-left">
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-amber-400">
            Private Tables • Real-Time Multiplayer
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-2 leading-[1.05] tracking-tight">
            Call your bid. Take your tricks.
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-3 font-normal leading-relaxed">
            The traditional Gujarati Judgement card game. Create a private table, invite friends with a room code, and play anywhere.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6">
            <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[11px] font-bold text-emerald-200">
              👥 3 to 12 Players
            </span>
            <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[11px] font-bold text-emerald-200">
              ⚡ Instant Rejoin
            </span>
            <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[11px] font-bold text-emerald-200">
              📱 Mobile Friendly
            </span>
          </div>
        </div>

        {/* Decorative Graphic Fanned Cards */}
        <div className="relative w-48 h-40 hidden md:flex items-center justify-center pointer-events-none">
          {/* Card 1 Back */}
          <div className="absolute w-24 h-34 bg-[#b91c1c] rounded-2xl border-2 border-white -rotate-12 -translate-x-8 shadow-2xl p-2 flex items-center justify-center">
            <div className="w-full h-full border border-white/30 rounded-xl bg-red-900/40" />
          </div>
          {/* Card 2 Ace of Spades */}
          <div className="absolute w-24 h-34 bg-white rounded-2xl border border-slate-200 rotate-12 translate-x-8 shadow-2xl p-2 flex flex-col justify-between text-slate-900 select-none">
            <div className="font-bold text-xs leading-none">A ♠</div>
            <div className="text-center text-3xl">♠</div>
            <div className="font-bold text-xs leading-none rotate-180 self-end">A ♠</div>
          </div>
        </div>
      </section>

      {/* Main Lobby Container */}
      <section className="w-full max-w-[96%] xl:max-w-[1600px] bg-white border border-slate-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-md mt-4">
        
        {/* Red Warning Line Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 text-xs sm:text-sm font-bold flex items-center justify-between shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="ml-3 text-rose-600 hover:text-rose-900 font-black text-sm px-2 py-1 rounded-lg hover:bg-rose-100 transition"
              >
                ✕
              </button>
            )}
          </div>
        )}

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
        <div className="mb-6 max-w-md text-left">
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
            onChange={(e) => {
              setPlayerName(e.target.value);
              if (errorMessage && onClearError) onClearError();
            }}
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
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    if (errorMessage && onClearError) onClearError();
                  }}
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
                onChange={(e) => {
                  setTransferCode(e.target.value.toUpperCase());
                  if (errorMessage && onClearError) onClearError();
                }}
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
