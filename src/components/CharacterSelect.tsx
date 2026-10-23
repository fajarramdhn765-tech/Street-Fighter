import React from 'react';
import { ArrowLeft, Play, Flame, Shield, Zap, Sparkles, MapPin, Gauge } from 'lucide-react';
import { ArenaId, Difficulty, FighterId } from '../types/game';
import { FIGHTERS } from '../game/fightersData';

interface CharacterSelectProps {
  selectedPlayer: FighterId;
  onSelectPlayer: (id: FighterId) => void;
  selectedCpu: FighterId | 'random';
  onSelectCpu: (id: FighterId | 'random') => void;
  selectedArena: ArenaId;
  onSelectArena: (id: ArenaId) => void;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onStartFight: () => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selectedPlayer,
  onSelectPlayer,
  selectedCpu,
  onSelectCpu,
  selectedArena,
  onSelectArena,
  difficulty,
  onChangeDifficulty,
  onStartFight,
  onBack,
}) => {
  const fightersList = Object.values(FIGHTERS);
  const currentFighter = FIGHTERS[selectedPlayer];

  const arenas: Array<{ id: ArenaId; name: string; desc: string }> = [
    { id: 'neon_city', name: 'NEON CITY', desc: 'Rain-slicked cyberpunk street' },
    { id: 'underground_club', name: 'CLUB 99', desc: 'Underground pulse laser stage' },
    { id: 'rooftop_battle', name: 'ROOFTOP CITADEL', desc: 'Skyscraper helipad & crimson moon' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 md:p-8 bg-neutral-950 text-white select-none overflow-y-auto z-20">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white font-chakra text-sm uppercase tracking-wider transition cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>BACK</span>
        </button>

        <h1 className="font-arcade text-lg md:text-2xl text-cyan-400 neon-glow-blue tracking-widest uppercase">
          FIGHTER SELECT
        </h1>

        <div className="w-16" />
      </div>

      {/* Main Grid: Fighter Cards & Details */}
      <div className="my-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto w-full">
        {/* Left Column: Fighter Select Grid */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="text-xs font-chakra font-bold text-neutral-400 tracking-wider uppercase">
            CHOOSE YOUR FIGHTER (P1)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {fightersList.map((f) => {
              const isSelected = selectedPlayer === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSelectPlayer(f.id)}
                  className={`relative p-3 rounded-xl border-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-yellow-400 bg-neutral-900 shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-102'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-600 hover:bg-neutral-900/60'
                  }`}
                >
                  {/* Color Glow Indicator */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-inner"
                    style={{ backgroundColor: f.primaryColor }}
                  >
                    {f.element === 'fire' && <Flame size={20} className="text-white" />}
                    {f.element === 'dark' && <Sparkles size={20} className="text-white" />}
                    {f.element === 'steel' && <Shield size={20} className="text-white" />}
                    {f.element === 'electric' && <Zap size={20} className="text-white" />}
                  </div>

                  <span className="font-orbitron font-bold text-sm tracking-wider text-white">
                    {f.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-chakra line-clamp-1">
                    {f.title}
                  </span>

                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[9px] font-arcade px-1.5 py-0.5 rounded shadow">
                      P1
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* CPU Opponent Selector */}
          <div className="mt-2">
            <div className="text-xs font-chakra font-bold text-neutral-400 tracking-wider uppercase mb-2">
              OPPONENT (CPU)
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSelectCpu('random')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-orbitron transition cursor-pointer ${
                  selectedCpu === 'random'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                RANDOM
              </button>
              {fightersList.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onSelectCpu(f.id)}
                  className={`py-1.5 px-3 rounded-lg border text-xs font-orbitron transition cursor-pointer ${
                    selectedCpu === f.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Arena & Difficulty Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {/* Arena Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-chakra font-bold text-neutral-400 tracking-wider uppercase flex items-center gap-1.5">
                <MapPin size={14} className="text-red-400" />
                <span>BATTLE ARENA</span>
              </label>
              <div className="flex flex-col gap-1.5">
                {arenas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onSelectArena(a.id)}
                    className={`py-2 px-3 rounded-lg border text-left flex justify-between items-center transition cursor-pointer ${
                      selectedArena === a.id
                        ? 'border-yellow-400 bg-yellow-950/30 text-yellow-300'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="font-orbitron text-xs font-bold">{a.name}</div>
                      <div className="text-[10px] font-chakra text-neutral-400">{a.desc}</div>
                    </div>
                    {selectedArena === a.id && <span className="text-yellow-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-chakra font-bold text-neutral-400 tracking-wider uppercase flex items-center gap-1.5">
                <Gauge size={14} className="text-yellow-400" />
                <span>CPU DIFFICULTY</span>
              </label>
              <div className="flex flex-col gap-1.5">
                {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => onChangeDifficulty(diff)}
                    className={`py-2 px-3 rounded-lg border text-left flex justify-between items-center uppercase transition cursor-pointer ${
                      difficulty === diff
                        ? 'border-red-500 bg-red-950/40 text-red-300'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="font-orbitron text-xs font-bold">{diff}</div>
                      <div className="text-[10px] font-chakra text-neutral-400">
                        {diff === 'easy' && 'Casual response & spacing'}
                        {diff === 'normal' && 'Active combos & tactical blocks'}
                        {diff === 'hard' && 'Aggressive parries & frame-punishes'}
                      </div>
                    </div>
                    {difficulty === diff && <span className="text-red-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Fighter Profile & Stats */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white tracking-wider">
                  {currentFighter.name}
                </h2>
                <p className="text-xs font-chakra font-bold text-cyan-400 tracking-widest uppercase">
                  {currentFighter.title}
                </p>
              </div>
              <div
                className="w-4 h-4 rounded-full shadow-[0_0_10px]"
                style={{ backgroundColor: currentFighter.glowColor, boxShadow: `0 0 12px ${currentFighter.glowColor}` }}
              />
            </div>

            <p className="mt-3 text-xs text-neutral-300 font-chakra leading-relaxed">
              {currentFighter.bio}
            </p>

            {/* Combat Radar Stat Bars */}
            <div className="flex flex-col gap-2.5 mt-5">
              {/* Speed */}
              <div>
                <div className="flex justify-between text-[11px] font-chakra text-neutral-300 mb-0.5">
                  <span>AGILITY / SPEED</span>
                  <span className="font-mono">{currentFighter.speed}%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${currentFighter.speed}%` }}
                  />
                </div>
              </div>

              {/* Power */}
              <div>
                <div className="flex justify-between text-[11px] font-chakra text-neutral-300 mb-0.5">
                  <span>STRIKE POWER</span>
                  <span className="font-mono">{currentFighter.power}%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${currentFighter.power}%` }}
                  />
                </div>
              </div>

              {/* Defense */}
              <div>
                <div className="flex justify-between text-[11px] font-chakra text-neutral-300 mb-0.5">
                  <span>ARMOR DEFENSE</span>
                  <span className="font-mono">{currentFighter.defense}%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${currentFighter.defense}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Special Move Showcase */}
            <div className="mt-5 p-3 rounded-xl bg-black/60 border border-neutral-700">
              <div className="text-[10px] font-arcade text-yellow-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Zap size={13} />
                <span>EX SPECIAL MOVE:</span>
              </div>
              <div className="font-orbitron font-bold text-sm text-white">
                {currentFighter.specialMoveName}
              </div>
              <p className="text-[11px] text-neutral-400 font-chakra mt-1">
                {currentFighter.specialDescription}
              </p>
            </div>
          </div>

          {/* Fight Button */}
          <button
            onClick={onStartFight}
            className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-black font-orbitron font-black text-base md:text-lg tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,59,48,0.7)] hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Play size={22} className="fill-black" />
            <span>ENTER ARENA</span>
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-[11px] font-chakra text-neutral-500">
        SELECT YOUR FIGHTER AND CONQUER ALL 3 ROUNDS IN RETRO NEON GLORY
      </div>
    </div>
  );
};
