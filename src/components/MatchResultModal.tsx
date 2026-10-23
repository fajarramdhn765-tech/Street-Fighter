import React from 'react';
import { Trophy, RotateCcw, Home, Users } from 'lucide-react';
import { MatchState } from '../types/game';

interface MatchResultModalProps {
  matchState: MatchState;
  playerName: string;
  cpuName: string;
  playerRounds: number;
  cpuRounds: number;
  highestCombo: number;
  onRematch: () => void;
  onCharacterSelect: () => void;
  onMainMenu: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  matchState,
  playerName,
  cpuName,
  playerRounds,
  cpuRounds,
  highestCombo,
  onRematch,
  onCharacterSelect,
  onMainMenu,
}) => {
  const isPlayerWinner = matchState.winner === 'player';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 select-none">
      <div className="relative w-full max-w-lg bg-neutral-900 border-2 rounded-2xl p-6 md:p-8 text-center text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Glow border according to result */}
        <div
          className={`absolute -inset-0.5 rounded-2xl blur-lg -z-10 ${
            isPlayerWinner ? 'bg-yellow-500/40' : 'bg-red-600/40'
          }`}
        />

        {/* Victory / Defeat Badge */}
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-neutral-950 border border-neutral-700 shadow-inner">
          <Trophy
            size={32}
            className={isPlayerWinner ? 'text-yellow-400 animate-bounce' : 'text-neutral-500'}
          />
        </div>

        {/* Big Outcome Header */}
        <h1
          className={`font-arcade text-3xl sm:text-4xl md:text-5xl font-black mb-2 ${
            isPlayerWinner ? 'text-yellow-400 neon-glow-yellow' : 'text-red-500 neon-glow-red'
          }`}
        >
          {isPlayerWinner ? 'VICTORY!' : 'DEFEATED'}
        </h1>

        <p className="font-orbitron text-xs sm:text-sm font-bold text-neutral-300 uppercase tracking-widest mb-6">
          {isPlayerWinner
            ? `${playerName} HAS DOMINATED THE NEON ARENA`
            : `${cpuName} WON THE CLASH`}
        </p>

        {/* Round Score Breakdown */}
        <div className="p-4 rounded-xl bg-black/70 border border-neutral-800 flex justify-around items-center mb-6">
          <div className="flex flex-col items-center">
            <span className="text-xs font-chakra font-bold text-red-400">{playerName}</span>
            <span className="font-arcade text-3xl text-white mt-1">{playerRounds}</span>
          </div>

          <span className="font-arcade text-neutral-500 text-lg">- VS -</span>

          <div className="flex flex-col items-center">
            <span className="text-xs font-chakra font-bold text-cyan-400">{cpuName}</span>
            <span className="font-arcade text-3xl text-white mt-1">{cpuRounds}</span>
          </div>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-xs font-chakra">
          <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/60 flex flex-col">
            <span className="text-neutral-400">TOTAL SCORE</span>
            <span className="font-orbitron font-bold text-base text-yellow-400 mt-0.5">
              {matchState.playerScore} PTS
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/60 flex flex-col">
            <span className="text-neutral-400">MAX COMBO HIT</span>
            <span className="font-orbitron font-bold text-base text-cyan-400 mt-0.5">
              {highestCombo}x STRIKES
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRematch}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-black font-orbitron font-black text-sm md:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.6)] hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw size={18} className="stroke-[2.5]" />
            <span>REMATCH (PLAY AGAIN)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onCharacterSelect}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Users size={15} />
              <span>FIGHTERS</span>
            </button>

            <button
              onClick={onMainMenu}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Home size={15} />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
