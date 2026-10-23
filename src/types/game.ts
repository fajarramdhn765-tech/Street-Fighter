export type FighterId = 'blaze' | 'shadow' | 'titan' | 'volt';

export type ArenaId = 'neon_city' | 'underground_club' | 'rooftop_battle';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type ActionState =
  | 'idle'
  | 'walk_fwd'
  | 'walk_back'
  | 'jump'
  | 'crouch'
  | 'punch_light'
  | 'punch_heavy'
  | 'kick'
  | 'block'
  | 'hit'
  | 'stunned'
  | 'special'
  | 'victory'
  | 'defeat';

export interface AttackData {
  name: string;
  damage: number;
  meterGain: number;
  startup: number; // in seconds
  active: number;
  recovery: number;
  range: number;
  knockback: number;
  hitstun: number;
  isSpecial?: boolean;
}

export interface FighterConfig {
  id: FighterId;
  name: string;
  title: string;
  bio: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  element: 'fire' | 'dark' | 'steel' | 'electric';
  speed: number;
  power: number;
  defense: number;
  specialMoveName: string;
  specialDescription: string;
  attacks: {
    punch_light: AttackData;
    punch_heavy: AttackData;
    kick: AttackData;
    special: AttackData;
  };
}

export interface FighterEntity {
  id: FighterId;
  name: string;
  isPlayer: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  facing: 1 | -1; // 1: facing right, -1: facing left
  health: number;
  maxHealth: number;
  superMeter: number; // 0 to 100
  state: ActionState;
  stateTimer: number;
  isBlocking: boolean;
  blockTimer: number;
  hitStun: number;
  hasDealtHitInCurrentAttack: boolean;
  comboCount: number;
  comboTimer: number;
  roundsWon: number;
  specialCooldown: number;
  config: FighterConfig;
}

export interface Projectile {
  id: number;
  ownerId: FighterId;
  x: number;
  y: number;
  vx: number;
  life: number;
  maxLife: number;
  color: string;
  damage: number;
  hitRadius: number;
}

export interface VisualEffect {
  id: number;
  x: number;
  y: number;
  z: number;
  type: 'hit' | 'block' | 'parry' | 'special' | 'spark' | 'crit';
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export type RoundState = 'intro' | 'fighting' | 'ko' | 'round_end' | 'match_end';

export interface MatchState {
  round: number;
  maxRounds: number;
  timer: number;
  roundState: RoundState;
  roundStateTimer: number;
  announcement: string | null;
  announcementSub: string | null;
  winner: 'player' | 'cpu' | 'draw' | null;
  playerScore: number;
  cpuScore: number;
}

export interface UserStats {
  wins: number;
  losses: number;
  highestCombo: number;
  highScore: number;
  soundEnabled: boolean;
}
