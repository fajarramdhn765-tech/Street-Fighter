import React from 'react';
import { Play, Users, HelpCircle, Volume2, VolumeX, Trophy, ShieldAlert } from 'lucide-react';
import { UserStats } from '../types/game';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenCharacterSelect: () => void;
  onOpenHowToPlay: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  userStats: UserStats;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenCharacterSelect,
  onOpenHowToPlay,
  soundEnabled,
  onToggleSound,
  userStats,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-6 md:p-10 select-none overflow-hidden z-20">
      {/* Dynamic Animated Cyber Background Grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/40 via-neutral-950 to-black pointer-events-none" />
      
      {/* Background Animated Neon Beam */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[450px] h-[250px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header: Stats & Sound */}
      <div className="w-full max-w-5xl flex justify-between items-center text-xs md:text-sm font-chakra text-neutral-400">
        <div className="flex items-center gap-3 bg-neutral-900/80 px-4 py-1.5 rounded-full border border-neutral-800">
          <Trophy size={16} className="text-yellow-400" />
          <span className="font-bold text-neutral-300">
            WINS: <span className="text-yellow-400 font-arcade text-xs">{userStats.wins}</span>
          </span>
          <span className="text-neutral-600">|</span>
          <span>BEST COMBO: <span className="text-cyan-400 font-bold">{userStats.highestCombo}x</span></span>
        </div>

        <button
          onClick={onToggleSound}
          className="flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 px-4 py-1.5 rounded-full border border-neutral-700 hover:border-cyan-400 text-neutral-300 transition cursor-pointer"
        >
          {soundEnabled ? (
            <>
              <Volume2 size={16} className="text-cyan-400" />
              <span>SOUND ON</span>
            </>
          ) : (
            <>
              <VolumeX size={16} className="text-red-400" />
              <span>SOUND OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Center Hero Lockup: Game Logo & Icon */}
      <div className="flex flex-col items-center text-center my-auto max-w-3xl">
        {/* Game Icon Badge */}
        <div className="mb-4 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-cyan-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-cyan-400/80 bg-neutral-950 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.4)]">
            <img
              src="https://i.postimg.cc/9Q2Z2W5T/image.png"
              alt="Street Fighter Neon Clash Icon"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to stylized arcade SVG icon if external image host blocked
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {/* Fallback internal icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-red-600 to-purple-900">
              <ShieldAlert size={36} className="text-yellow-300 mb-1" />
              <span className="font-arcade text-[8px] text-white tracking-tighter">NEON CLASH</span>
            </div>
          </div>
        </div>

        {/* Title Lockup */}
        <div className="flex flex-col items-center">
          <div className="text-xs md:text-sm font-arcade tracking-[0.35em] text-cyan-400 uppercase mb-2 neon-glow-blue">
            ARCADE 3D FIGHTING SERIES
          </div>

          <h1 className="font-orbitron font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white uppercase italic drop-shadow-[0_0_35px_rgba(255,42,85,0.8)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300">
              STREET FIGHTER
            </span>
          </h1>

          <div className="font-arcade text-2xl sm:text-4xl md:text-5xl text-cyan-300 neon-glow-blue tracking-widest mt-1">
            NEON CLASH
          </div>

          <p className="mt-4 text-xs md:text-sm text-neutral-400 max-w-md font-chakra">
            High-speed 3D cybernetic martial arts combat with frame-perfect parries and neon combo overdrive.
          </p>
        </div>

        {/* Action Menu Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-8 w-full max-w-md justify-center">
          <button
            onClick={onStartGame}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-black font-orbitron font-black text-sm md:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,59,48,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={20} className="fill-black" />
            <span>PLAY GAME</span>
          </button>

          <button
            onClick={onOpenCharacterSelect}
            className="flex-1 py-3.5 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 border-2 border-cyan-500 hover:border-cyan-300 text-cyan-300 hover:text-white font-orbitron font-bold text-sm md:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Users size={18} />
            <span>FIGHTERS</span>
          </button>
        </div>

        {/* Secondary How-To-Play Button */}
        <button
          onClick={onOpenHowToPlay}
          className="mt-3 py-2 px-5 text-neutral-400 hover:text-white font-chakra text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
        >
          <HelpCircle size={15} />
          <span>HOW TO PLAY & MOVELIST</span>
        </button>
      </div>

      {/* Flat Control Hint Line */}
      <div className="w-full flex justify-center text-center">
        <p className="text-[11px] md:text-xs font-chakra tracking-widest text-neutral-500 uppercase">
          [ A / D ] MOVE &bull; [ W / S / SPACE ] JUMP &bull; [ J / P ] PUNCH &bull; [ K ] KICK &bull; [ L / T ] BLOCK &bull; [ U / B ] SPECIAL
        </p>
      </div>
    </div>
  );
};
