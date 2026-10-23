import React from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';
import { CombatEngine } from '../game/combatEngine';

interface FightHUDProps {
  combatEngine: CombatEngine;
  isPaused: boolean;
  onTogglePause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onForfeit: () => void;
}

export const FightHUD: React.FC<FightHUDProps> = ({
  combatEngine,
  isPaused,
  onTogglePause,
  soundEnabled,
  onToggleSound,
  onForfeit,
}) => {
  const { player, cpu, match } = combatEngine;

  const playerHpPercent = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
  const cpuHpPercent = Math.max(0, Math.min(100, (cpu.health / cpu.maxHealth) * 100));

  const playerSuperPercent = Math.max(0, Math.min(100, player.superMeter));
  const cpuSuperPercent = Math.max(0, Math.min(100, cpu.superMeter));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* --- TOP HUD BAR: HEALTH, TIMER, ROUNDS --- */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Match Controls & Header */}
        <div className="w-full flex justify-between items-center mb-1 text-xs md:text-sm font-chakra uppercase tracking-wider text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-bold">P1</span>
            <span className="text-white font-orbitron font-bold text-sm md:text-base">{player.name}</span>
            {/* Player Round Win Indicators */}
            <div className="flex gap-1 ml-2">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border border-yellow-400/80 ${
                    idx < player.roundsWon ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : 'bg-black/60'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick HUD Action Buttons (Pause & Sound) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded bg-black/60 border border-neutral-700 text-neutral-300 hover:text-white hover:border-cyan-400 transition cursor-pointer"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-400" />}
            </button>
            <button
              onClick={onTogglePause}
              className="p-1.5 rounded bg-black/60 border border-neutral-700 text-neutral-300 hover:text-white hover:border-yellow-400 transition cursor-pointer"
              title="Pause Match"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              onClick={onForfeit}
              className="p-1.5 rounded bg-black/60 border border-neutral-700 text-neutral-300 hover:text-red-400 hover:border-red-500 transition cursor-pointer"
              title="Return to Menu"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* CPU Round Win Indicators */}
            <div className="flex gap-1 mr-2">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border border-yellow-400/80 ${
                    idx < cpu.roundsWon ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : 'bg-black/60'
                  }`}
                />
              ))}
            </div>
            <span className="text-white font-orbitron font-bold text-sm md:text-base">{cpu.name}</span>
            <span className="text-cyan-400 font-bold">CPU</span>
          </div>
        </div>

        {/* Dual Health Bars & Center Countdown Timer */}
        <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
          {/* Player 1 Health Bar (Left to Right depletion) */}
          <div className="relative h-5 md:h-7 bg-neutral-900 border-2 border-red-500/80 rounded-sm overflow-hidden box-neon-red">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 transition-all duration-100 ease-out"
              style={{ width: `${playerHpPercent}%`, marginLeft: 'auto' }}
            />
            <div className="absolute inset-0 flex items-center px-2 text-[10px] md:text-xs font-mono font-bold text-white drop-shadow">
              {Math.ceil(player.health)} HP
            </div>
          </div>

          {/* Center 99s Countdown Timer */}
          <div className="px-3 py-1 bg-black/85 border-2 border-yellow-400 rounded flex flex-col items-center justify-center min-w-[54px] md:min-w-[68px] shadow-[0_0_12px_rgba(250,204,21,0.5)]">
            <span className="font-arcade text-lg md:text-2xl text-yellow-300 tabular-nums">
              {Math.ceil(match.timer)}
            </span>
          </div>

          {/* CPU Health Bar (Right to Left depletion) */}
          <div className="relative h-5 md:h-7 bg-neutral-900 border-2 border-cyan-500/80 rounded-sm overflow-hidden box-neon-blue">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-cyan-400 to-blue-600 transition-all duration-100 ease-out"
              style={{ width: `${cpuHpPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-end px-2 text-[10px] md:text-xs font-mono font-bold text-white drop-shadow">
              {Math.ceil(cpu.health)} HP
            </div>
          </div>
        </div>

        {/* Bottom Super Meter Gauges */}
        <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4 mt-1.5">
          {/* Player Super Meter */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[9px] md:text-xs font-orbitron font-extrabold tracking-wider ${
                playerSuperPercent >= 100 ? 'text-yellow-400 neon-glow-yellow animate-pulse' : 'text-neutral-400'
              }`}
            >
              {playerSuperPercent >= 100 ? 'SUPER READY' : 'EX GAUGE'}
            </span>
            <div className="flex-1 h-2 md:h-3 bg-neutral-900/90 border border-neutral-700 rounded-sm overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  playerSuperPercent >= 100
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${playerSuperPercent}%` }}
              />
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="text-[10px] font-chakra font-bold text-neutral-400 px-2 uppercase">
            {combatEngine.difficulty}
          </div>

          {/* CPU Super Meter */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-2 md:h-3 bg-neutral-900/90 border border-neutral-700 rounded-sm overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ml-auto ${
                  cpuSuperPercent >= 100
                    ? 'bg-gradient-to-l from-yellow-400 via-orange-500 to-red-500'
                    : 'bg-gradient-to-l from-purple-500 to-pink-500'
                }`}
                style={{ width: `${cpuSuperPercent}%` }}
              />
            </div>
            <span
              className={`text-[9px] md:text-xs font-orbitron font-extrabold tracking-wider ${
                cpuSuperPercent >= 100 ? 'text-yellow-400 neon-glow-yellow' : 'text-neutral-400'
              }`}
            >
              {cpuSuperPercent >= 100 ? 'SUPER' : 'EX'}
            </span>
          </div>
        </div>
      </div>

      {/* --- CENTER ANNOUNCEMENTS & FLOATING COMBO BANNERS --- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Combo Counter Left (Player) */}
        {player.comboCount > 1 && (
          <div className="absolute left-6 top-28 md:top-36 flex flex-col items-start animate-bounce">
            <span className="font-arcade text-3xl md:text-5xl text-yellow-300 neon-glow-yellow">
              {player.comboCount}
            </span>
            <span className="font-orbitron font-black text-sm md:text-xl text-red-500 tracking-widest neon-glow-red">
              HITS COMBO!
            </span>
          </div>
        )}

        {/* Combo Counter Right (CPU) */}
        {cpu.comboCount > 1 && (
          <div className="absolute right-6 top-28 md:top-36 flex flex-col items-end animate-bounce">
            <span className="font-arcade text-3xl md:text-5xl text-cyan-300 neon-glow-blue">
              {cpu.comboCount}
            </span>
            <span className="font-orbitron font-black text-sm md:text-xl text-purple-400 tracking-widest neon-glow-purple">
              HITS COMBO!
            </span>
          </div>
        )}

        {/* Main Center Match Announcement (ROUND 1, FIGHT, K.O., etc.) */}
        {match.announcement && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <h1 className="font-arcade text-4xl sm:text-6xl md:text-8xl font-black text-white neon-glow-red tracking-wider animate-pulse drop-shadow-[0_0_30px_rgba(255,42,85,0.9)]">
              {match.announcement}
            </h1>
            {match.announcementSub && (
              <p className="font-orbitron font-extrabold text-lg sm:text-2xl text-yellow-300 neon-glow-yellow mt-2 tracking-widest uppercase">
                {match.announcementSub}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Empty bottom spacer for mobile controls */}
      <div className="h-1" />
    </div>
  );
};
