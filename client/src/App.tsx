import { useState } from 'react';
import { useSocket } from './hooks/useSocket.js';
import { useAudio } from './hooks/useAudio.js';
import { LandingPage } from './components/lobby/LandingPage.js';
import { WaitingRoom } from './components/lobby/WaitingRoom.js';
import { GameHeader } from './components/hud/GameHeader.js';
import { ActionBanner } from './components/hud/ActionBanner.js';
import { PortableTable } from './components/table/PortableTable.js';
import { ScoreboardModal } from './components/modals/ScoreboardModal.js';
import { GameOverModal } from './components/modals/GameOverModal.js';
import { AlertCircle } from 'lucide-react';

export function App() {
  const { muted, setMuted, playSound } = useAudio();
  const [showScoreboard, setShowScoreboard] = useState(false);

  const {
    gameState,
    errorMessage,
    clearError,
    createRoom,
    joinRoom,
    transferSeat,
    leaveRoom,
    startGame,
    addBot,
    removeBot,
    kickPlayer,
    makeBid,
    playCard,
    nextRound,
    restartGame,
  } = useSocket(playSound);

  // Phase Router
  if (!gameState) {
    return (
      <LandingPage
        onCreateRoom={(name, customMaxCards) => createRoom(name, customMaxCards)}
        onJoinRoom={(roomId, name) => joinRoom(roomId, name)}
        onTransferSeat={(code) => transferSeat(code)}
      />
    );
  }

  if (gameState.phase === 'LOBBY') {
    return (
      <WaitingRoom
        gameState={gameState}
        onStartGame={startGame}
        onAddBot={addBot}
        onRemoveBot={removeBot}
        onKickPlayer={kickPlayer}
        onLeaveRoom={leaveRoom}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#f4f7f5] text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Toast Error Alert */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold shadow-lg animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={clearError} className="ml-2 opacity-70 hover:opacity-100 font-bold">✕</button>
        </div>
      )}

      {/* Top Game Header */}
      <GameHeader
        gameState={gameState}
        muted={muted}
        onToggleMute={() => setMuted(!muted)}
        onOpenScoreboard={() => setShowScoreboard(true)}
        onLeaveRoom={leaveRoom}
      />

      {/* Action Banner */}
      <ActionBanner gameState={gameState} />

      {/* Center Portable Table */}
      <main className="flex-1 flex items-center justify-center relative w-full">
        <PortableTable
          gameState={gameState}
          onMakeBid={makeBid}
          onPlayCard={playCard}
        />
      </main>

      {/* Scoreboard Modal (Manual Toggle or Round Summary) */}
      {(showScoreboard || gameState.phase === 'ROUND_SUMMARY') && (
        <ScoreboardModal
          gameState={gameState}
          onClose={() => setShowScoreboard(false)}
          onNextRound={nextRound}
          isRoundSummary={gameState.phase === 'ROUND_SUMMARY'}
        />
      )}

      {/* Game Over Victory Modal */}
      {gameState.phase === 'GAME_OVER' && (
        <GameOverModal
          gameState={gameState}
          onRestart={restartGame}
        />
      )}
    </div>
  );
}
export default App;
