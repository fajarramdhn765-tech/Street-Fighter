import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from './audio/soundSynthesizer';
import { ArenaId, Difficulty, FighterId, UserStats } from './types/game';
import { CombatEngine, CombatInputs } from './game/combatEngine';
import { ThreeFightCanvas } from './game/ThreeFightCanvas';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelect } from './components/CharacterSelect';
import { FightHUD } from './components/FightHUD';
import { VirtualControls } from './components/VirtualControls';
import { HowToPlayModal } from './components/HowToPlayModal';
import { MatchResultModal } from './components/MatchResultModal';

type AppScreen = 'title' | 'select' | 'fight';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('title');
  const [selectedPlayer, setSelectedPlayer] = useState<FighterId>('blaze');
  const [selectedCpu, setSelectedCpu] = useState<FighterId | 'random'>('shadow');
  const [selectedArena, setSelectedArena] = useState<ArenaId>('neon_city');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  const [soundEnabled, setSoundEnabled] = useState<boolean>(!soundManager.getIsMuted());
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Stats in localStorage
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('sfnc_user_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      wins: 0,
      losses: 0,
      highestCombo: 0,
      highScore: 0,
      soundEnabled: true,
    };
  });

  // Track max combo in current match
  const [matchMaxCombo, setMatchMaxCombo] = useState<number>(0);

  // Active Combat Engine instance
  const combatEngineRef = useRef<CombatEngine | null>(null);
  const [, setTick] = useState(0);

  // Stable player inputs ref for 60fps simulation
  const playerInputsRef = useRef<CombatInputs>({
    left: false,
    right: false,
    jump: false,
    crouch: false,
    punch_light: false,
    punch_heavy: false,
    kick: false,
    block: false,
    special: false,
  });

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  // Save stats to localStorage
  const saveStats = (updated: Partial<UserStats>) => {
    setUserStats((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('sfnc_user_stats', JSON.stringify(next));
      return next;
    });
  };

  // Toggle audio
  const handleToggleSound = () => {
    const enabled = soundManager.toggleMute();
    setSoundEnabled(enabled);
  };

  // Start Fight Match
  const startFight = useCallback(() => {
    // Pick CPU fighter
    let cpuId: FighterId = 'shadow';
    if (selectedCpu === 'random') {
      const ids: FighterId[] = ['blaze', 'shadow', 'titan', 'volt'];
      const filtered = ids.filter((id) => id !== selectedPlayer);
      cpuId = filtered[Math.floor(Math.random() * filtered.length)];
    } else {
      cpuId = selectedCpu;
    }

    combatEngineRef.current = new CombatEngine(selectedPlayer, cpuId, difficulty);
    setMatchMaxCombo(0);
    setIsPaused(false);
    setScreen('fight');

    // Start background synthwave music
    soundManager.startBGM();
  }, [selectedPlayer, selectedCpu, difficulty]);

  // Restart match (Rematch)
  const handleRematch = () => {
    startFight();
  };

  // Return to Title or Select
  const handleReturnToMenu = () => {
    soundManager.stopBGM();
    setScreen('title');
  };

  // Setup Keyboard Event Listeners for Desktop Players
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys & space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        if (screen === 'fight') {
          setIsPaused((p) => !p);
        }
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;
      const inputs = playerInputsRef.current;

      // Left: A or ArrowLeft
      if (key === 'a' || code === 'ArrowLeft') inputs.left = true;
      // Right: D or ArrowRight
      if (key === 'd' || code === 'ArrowRight') inputs.right = true;
      // Jump: W, ArrowUp, Space, or S (as requested)
      if (key === 'w' || code === 'ArrowUp' || key === ' ' || key === 's') inputs.jump = true;
      // Crouch: Down Arrow
      if (code === 'ArrowDown') inputs.crouch = true;

      // Attacks:
      // Punch: J or P
      if (key === 'j' || key === 'p') inputs.punch_light = true;
      // Heavy Punch: I or H
      if (key === 'i' || key === 'h') inputs.punch_heavy = true;
      // Kick: K
      if (key === 'k') inputs.kick = true;
      // Block: L or T
      if (key === 'l' || key === 't') inputs.block = true;
      // Special: U or B
      if (key === 'u' || key === 'b') inputs.special = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code;
      const inputs = playerInputsRef.current;

      if (key === 'a' || code === 'ArrowLeft') inputs.left = false;
      if (key === 'd' || code === 'ArrowRight') inputs.right = false;
      if (key === 'w' || code === 'ArrowUp' || key === ' ' || key === 's') inputs.jump = false;
      if (code === 'ArrowDown') inputs.crouch = false;

      if (key === 'j' || key === 'p') inputs.punch_light = false;
      if (key === 'i' || key === 'h') inputs.punch_heavy = false;
      if (key === 'k') inputs.kick = false;
      if (key === 'l' || key === 't') inputs.block = false;
      if (key === 'u' || key === 'b') inputs.special = false;
    };

    const handleBlur = () => {
      // Clear held inputs on window blur as per Three.js directives
      playerInputsRef.current = {
        left: false,
        right: false,
        jump: false,
        crouch: false,
        punch_light: false,
        punch_heavy: false,
        kick: false,
        block: false,
        special: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [screen]);

  // Handle Match Results & Stats Updates
  const handleStateUpdate = useCallback(() => {
    if (!combatEngineRef.current) return;
    const engine = combatEngineRef.current;

    // Track combo peak
    if (engine.player.comboCount > matchMaxCombo) {
      setMatchMaxCombo(engine.player.comboCount);
    }

    // Check Match End for stats
    if (engine.match.roundState === 'match_end' && engine.match.winner) {
      if (engine.match.winner === 'player') {
        saveStats({
          wins: userStats.wins + 1,
          highestCombo: Math.max(userStats.highestCombo, matchMaxCombo),
          highScore: Math.max(userStats.highScore, engine.match.playerScore),
        });
      } else if (engine.match.winner === 'cpu') {
        saveStats({
          losses: userStats.losses + 1,
        });
      }
    }

    setTick((t) => (t + 1) % 1000);
  }, [matchMaxCombo, userStats]);

  const activeEngine = combatEngineRef.current;
  const isMatchEnded = activeEngine && activeEngine.match.roundState === 'match_end';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* Subtle CRT Scanline Overlay */}
      <div className="crt-overlay absolute inset-0 z-40 pointer-events-none" />

      {/* Screen 1: Title Screen */}
      {screen === 'title' && (
        <TitleScreen
          onStartGame={() => setScreen('select')}
          onOpenCharacterSelect={() => setScreen('select')}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          userStats={userStats}
        />
      )}

      {/* Screen 2: Character & Arena Select */}
      {screen === 'select' && (
        <CharacterSelect
          selectedPlayer={selectedPlayer}
          onSelectPlayer={setSelectedPlayer}
          selectedCpu={selectedCpu}
          onSelectCpu={setSelectedCpu}
          selectedArena={selectedArena}
          onSelectArena={setSelectedArena}
          difficulty={difficulty}
          onChangeDifficulty={setDifficulty}
          onStartFight={startFight}
          onBack={() => setScreen('title')}
        />
      )}

      {/* Screen 3: Active 3D Fight */}
      {screen === 'fight' && activeEngine && (
        <div className="relative w-full h-full">
          {/* Isolated Three.js Canvas Container */}
          <ThreeFightCanvas
            combatEngine={activeEngine}
            arenaId={selectedArena}
            playerInputsRef={playerInputsRef}
            onStateUpdate={handleStateUpdate}
          />

          {/* Fighting HUD (Health, Rounds, Timer, EX Meter, Combo Counter) */}
          <FightHUD
            combatEngine={activeEngine}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused((p) => !p)}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onForfeit={handleReturnToMenu}
          />

          {/* Virtual Mobile Gamepad */}
          <VirtualControls
            playerInputsRef={playerInputsRef}
            superMeterFull={activeEngine.player.superMeter >= 100}
          />

          {/* Pause Modal Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75">
              <div className="bg-neutral-900 border-2 border-yellow-400 p-6 rounded-2xl text-center max-w-sm w-full mx-4 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                <h2 className="font-arcade text-2xl text-yellow-400 mb-4 neon-glow-yellow">
                  MATCH PAUSED
                </h2>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-orbitron font-bold text-sm uppercase transition cursor-pointer"
                  >
                    RESUME FIGHT
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      setShowHowToPlay(true);
                    }}
                    className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-orbitron font-bold text-xs uppercase transition cursor-pointer"
                  >
                    HOW TO PLAY
                  </button>
                  <button
                    onClick={handleReturnToMenu}
                    className="py-2.5 rounded-xl bg-neutral-800 hover:bg-red-950/80 text-red-400 border border-neutral-700 hover:border-red-500 font-orbitron font-bold text-xs uppercase transition cursor-pointer"
                  >
                    EXIT TO MAIN MENU
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Match Results Victory/Defeat Modal */}
          {isMatchEnded && (
            <MatchResultModal
              matchState={activeEngine.match}
              playerName={activeEngine.player.name}
              cpuName={activeEngine.cpu.name}
              playerRounds={activeEngine.player.roundsWon}
              cpuRounds={activeEngine.cpu.roundsWon}
              highestCombo={matchMaxCombo}
              onRematch={handleRematch}
              onCharacterSelect={() => setScreen('select')}
              onMainMenu={handleReturnToMenu}
            />
          )}
        </div>
      )}

      {/* How to Play & Moves Modal */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
}
