import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shield, Zap, Flame, Footprints } from 'lucide-react';
import { CombatInputs } from '../game/combatEngine';

interface VirtualControlsProps {
  playerInputsRef: React.MutableRefObject<CombatInputs>;
  superMeterFull: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  playerInputsRef,
  superMeterFull,
}) => {
  const setKey = (key: keyof CombatInputs, value: boolean) => {
    playerInputsRef.current[key] = value;
  };

  const bindTouch = (key: keyof CombatInputs) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      setKey(key, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      setKey(key, false);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      setKey(key, true);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      setKey(key, false);
    },
    onMouseLeave: () => {
      setKey(key, false);
    },
  });

  return (
    <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-between items-end px-3 sm:px-6 pb-2 pointer-events-none select-none">
      {/* --- LEFT D-PAD (MOVEMENT & JUMP) --- */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 bg-black/40 p-2 rounded-2xl border border-neutral-800/60 backdrop-blur-xs">
        <div className="flex justify-center">
          <button
            {...bindTouch('jump')}
            className="w-13 h-13 rounded-full bg-neutral-900/80 active:bg-cyan-500/80 border border-neutral-700 active:border-cyan-300 flex items-center justify-center text-cyan-300 active:text-white shadow-lg active:scale-95 transition-transform"
          >
            <ArrowUp size={24} />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            {...bindTouch('left')}
            className="w-13 h-13 rounded-full bg-neutral-900/80 active:bg-cyan-500/80 border border-neutral-700 active:border-cyan-300 flex items-center justify-center text-cyan-300 active:text-white shadow-lg active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            {...bindTouch('crouch')}
            className="w-13 h-13 rounded-full bg-neutral-900/80 active:bg-cyan-500/80 border border-neutral-700 active:border-cyan-300 flex items-center justify-center text-cyan-300 active:text-white shadow-lg active:scale-95 transition-transform"
          >
            <ArrowDown size={24} />
          </button>
          <button
            {...bindTouch('right')}
            className="w-13 h-13 rounded-full bg-neutral-900/80 active:bg-cyan-500/80 border border-neutral-700 active:border-cyan-300 flex items-center justify-center text-cyan-300 active:text-white shadow-lg active:scale-95 transition-transform"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      {/* --- RIGHT ACTION BUTTONS (PUNCH, KICK, BLOCK, SPECIAL) --- */}
      <div className="pointer-events-auto grid grid-cols-2 gap-2 bg-black/40 p-2 rounded-2xl border border-neutral-800/60 backdrop-blur-xs">
        {/* Light Punch */}
        <button
          {...bindTouch('punch_light')}
          className="w-13 h-13 rounded-full bg-gradient-to-br from-red-600/80 to-red-800/90 active:from-red-400 active:to-red-600 border border-red-500/60 flex flex-col items-center justify-center text-white font-orbitron font-bold text-xs shadow-lg active:scale-95 transition-transform"
        >
          <Flame size={16} />
          <span>JAB</span>
        </button>

        {/* Heavy Punch */}
        <button
          {...bindTouch('punch_heavy')}
          className="w-13 h-13 rounded-full bg-gradient-to-br from-orange-600/80 to-red-900/90 active:from-orange-400 active:to-red-700 border border-orange-500/60 flex flex-col items-center justify-center text-white font-orbitron font-bold text-xs shadow-lg active:scale-95 transition-transform"
        >
          <Zap size={16} />
          <span>HVY</span>
        </button>

        {/* Kick */}
        <button
          {...bindTouch('kick')}
          className="w-13 h-13 rounded-full bg-gradient-to-br from-purple-600/80 to-indigo-900/90 active:from-purple-400 active:to-indigo-700 border border-purple-500/60 flex flex-col items-center justify-center text-white font-orbitron font-bold text-xs shadow-lg active:scale-95 transition-transform"
        >
          <Footprints size={16} />
          <span>KICK</span>
        </button>

        {/* Block */}
        <button
          {...bindTouch('block')}
          className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-600/80 to-cyan-900/90 active:from-blue-400 active:to-cyan-700 border border-blue-500/60 flex flex-col items-center justify-center text-white font-orbitron font-bold text-xs shadow-lg active:scale-95 transition-transform"
        >
          <Shield size={16} />
          <span>GUARD</span>
        </button>

        {/* Special Attack (spans 2 columns) */}
        <button
          {...bindTouch('special')}
          className={`col-span-2 h-11 rounded-xl flex items-center justify-center gap-2 text-white font-orbitron font-black text-xs tracking-wider border transition-all active:scale-95 ${
            superMeterFull
              ? 'bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 border-yellow-300 shadow-[0_0_15px_#facc15] animate-pulse'
              : 'bg-neutral-800/80 border-neutral-700 opacity-60'
          }`}
        >
          <Zap size={15} className={superMeterFull ? 'text-yellow-200' : 'text-neutral-400'} />
          <span>{superMeterFull ? '★ SPECIAL MOVE ★' : 'EX CHARGING'}</span>
        </button>
      </div>
    </div>
  );
};
