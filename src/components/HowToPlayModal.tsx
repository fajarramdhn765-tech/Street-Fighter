import React from 'react';
import { X, ShieldAlert, Sparkles, Zap, Keyboard, Smartphone } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border-2 border-cyan-500/80 rounded-2xl p-6 text-white shadow-[0_0_40px_rgba(0,229,255,0.3)] my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-neutral-800">
          <ShieldAlert className="text-cyan-400" size={28} />
          <div>
            <h2 className="font-arcade text-lg md:text-xl text-cyan-300 neon-glow-blue">
              HOW TO PLAY & MOVES
            </h2>
            <p className="font-chakra text-xs text-neutral-400 uppercase tracking-widest">
              STREET FIGHTER NEON CLASH &bull; ARCADE MANUAL
            </p>
          </div>
        </div>

        {/* Section 1: Keyboard & Mobile Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Desktop Keyboard Controls */}
          <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-yellow-400 font-orbitron font-bold text-xs uppercase tracking-wider mb-1">
              <Keyboard size={16} />
              <span>KEYBOARD CONTROLS</span>
            </div>
            <div className="text-xs font-mono space-y-1.5 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Move Left / Right:</span>
                <span className="text-cyan-300 font-bold">A / D or ◄ / ►</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Jump / Leap:</span>
                <span className="text-cyan-300 font-bold">W / ▲ or S</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Light Jab:</span>
                <span className="text-yellow-300 font-bold">J or P</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Heavy Punch:</span>
                <span className="text-orange-400 font-bold">I or H</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Kick Attack:</span>
                <span className="text-purple-300 font-bold">K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Guard / Block:</span>
                <span className="text-blue-300 font-bold">L or T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Special Move:</span>
                <span className="text-red-400 font-bold">U or B</span>
              </div>
            </div>
          </div>

          {/* Touch / Mobile Controls */}
          <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-xs uppercase tracking-wider mb-1">
              <Smartphone size={16} />
              <span>TOUCH / MOBILE</span>
            </div>
            <div className="text-xs font-chakra space-y-2 text-neutral-300">
              <p>
                <strong className="text-white">Left D-Pad:</strong> Virtual buttons to move left, right, jump, and crouch.
              </p>
              <p>
                <strong className="text-white">Right Cluster:</strong> Dedicated action buttons for <span className="text-red-400">JAB</span>, <span className="text-orange-400">HVY</span>, <span className="text-purple-400">KICK</span>, and <span className="text-blue-400">GUARD</span>.
              </p>
              <p>
                <strong className="text-yellow-300">SPECIAL BUTTON:</strong> Glows bright gold when your EX Gauge hits 100%. Tap to unleash!
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Combat Systems & Advanced Mechanics */}
        <div className="space-y-4">
          {/* Perfect Parry */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-600/60 flex items-start gap-3">
            <Sparkles className="text-purple-400 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-orbitron font-bold text-sm text-purple-300">
                PERFECT BLOCK (PARRY) SYSTEM
              </div>
              <p className="text-xs text-neutral-300 font-chakra mt-1">
                Press or tap Block right before an incoming attack lands (within a 0.15s window). You will take <strong>ZERO damage</strong>, instantly stagger the enemy with heavy hitstun, and gain an immediate <strong>+25% Super EX Meter</strong>!
              </p>
            </div>
          </div>

          {/* Combo & Hitstop */}
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-600/60 flex items-start gap-3">
            <Zap className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-orbitron font-bold text-sm text-red-300">
                CHAIN COMBOS & HITSTOP
              </div>
              <p className="text-xs text-neutral-300 font-chakra mt-1">
                Cancel quick Light Jabs into Kicks and Heavy Punches. Consecutive strikes trigger high-multiplier Combo Bonuses and crunching hitstop freeze frames that lock opponents in stun.
              </p>
            </div>
          </div>

          {/* EX Special Moves */}
          <div className="p-3.5 rounded-xl bg-yellow-950/30 border border-yellow-600/60 flex items-start gap-3">
            <ShieldAlert className="text-yellow-400 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-orbitron font-bold text-sm text-yellow-300">
                SIGNATURE EX SPECIAL OVERDRIVE
              </div>
              <p className="text-xs text-neutral-300 font-chakra mt-1">
                Both delivering attacks and parrying incoming hits charge your EX Gauge. At 100%, trigger your fighter's signature move — like Blaze's Dragon Fire Surge, Shadow's Phantom Blitz, Titan's Seismic Crush, or Volt's Thunderstorm Burst!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-orbitron font-bold text-sm tracking-wider uppercase transition cursor-pointer"
        >
          GOT IT &bull; RETURN TO GAME
        </button>
      </div>
    </div>
  );
};
