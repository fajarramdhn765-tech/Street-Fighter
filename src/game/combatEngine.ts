import { soundManager } from '../audio/soundSynthesizer';
import {
  ActionState,
  AttackData,
  Difficulty,
  FighterEntity,
  FighterId,
  MatchState,
  Projectile,
  VisualEffect,
} from '../types/game';
import { FIGHTERS } from './fightersData';

export interface CombatInputs {
  left: boolean;
  right: boolean;
  jump: boolean;
  crouch: boolean;
  punch_light: boolean;
  punch_heavy: boolean;
  kick: boolean;
  block: boolean;
  special: boolean;
}

export class CombatEngine {
  public player: FighterEntity;
  public cpu: FighterEntity;
  public match: MatchState;
  public projectiles: Projectile[] = [];
  public effects: VisualEffect[] = [];
  public difficulty: Difficulty;
  public hitstopTimer: number = 0;
  public cameraShake: number = 0;
  public arenaMinX: number = -8.0;
  public arenaMaxX: number = 8.0;

  private nextProjId: number = 1;
  private nextEffectId: number = 1;
  private cpuAiTimer: number = 0;
  private cpuInputs: CombatInputs = {
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

  constructor(playerFighterId: FighterId, cpuFighterId: FighterId, difficulty: Difficulty) {
    this.difficulty = difficulty;
    this.player = this.createFighterEntity(playerFighterId, true, -3.2);
    this.cpu = this.createFighterEntity(cpuFighterId, false, 3.2);

    this.match = {
      round: 1,
      maxRounds: 3,
      timer: 99,
      roundState: 'intro',
      roundStateTimer: 2.2,
      announcement: 'ROUND 1',
      announcementSub: 'READY',
      winner: null,
      playerScore: 0,
      cpuScore: 0,
    };

    soundManager.playRoundGong();
  }

  private createFighterEntity(id: FighterId, isPlayer: boolean, startX: number): FighterEntity {
    const config = FIGHTERS[id];
    return {
      id,
      name: config.name,
      isPlayer,
      x: startX,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      facing: isPlayer ? 1 : -1,
      health: 100,
      maxHealth: 100,
      superMeter: 20, // start with a little meter
      state: 'idle',
      stateTimer: 0,
      isBlocking: false,
      blockTimer: 0,
      hitStun: 0,
      hasDealtHitInCurrentAttack: false,
      comboCount: 0,
      comboTimer: 0,
      roundsWon: 0,
      specialCooldown: 0,
      config,
    };
  }

  public resetRound() {
    this.player.x = -3.2;
    this.player.y = 0;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.health = 100;
    this.player.state = 'idle';
    this.player.stateTimer = 0;
    this.player.isBlocking = false;
    this.player.hitStun = 0;
    this.player.comboCount = 0;

    this.cpu.x = 3.2;
    this.cpu.y = 0;
    this.cpu.vx = 0;
    this.cpu.vy = 0;
    this.cpu.health = 100;
    this.cpu.state = 'idle';
    this.cpu.stateTimer = 0;
    this.cpu.isBlocking = false;
    this.cpu.hitStun = 0;
    this.cpu.comboCount = 0;

    this.projectiles = [];
    this.effects = [];
    this.match.timer = 99;
    this.match.roundState = 'intro';
    this.match.roundStateTimer = 2.0;

    const roundName =
      this.match.round === 3
        ? 'FINAL ROUND'
        : `ROUND ${this.match.round}`;

    this.match.announcement = roundName;
    this.match.announcementSub = 'READY';
    soundManager.playRoundGong();
  }

  public update(dt: number, playerInputs: CombatInputs) {
    // Hitstop freeze frame handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Camera shake decay
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 5.0);
    }

    // Round flow state machine
    this.updateRoundFlow(dt);

    // AI inputs update
    this.updateCpuAi(dt);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Visual Effects
    this.updateEffects(dt);

    // Only allow combat inputs during active fighting
    if (this.match.roundState === 'fighting') {
      this.updateFighterPhysicsAndInput(this.player, playerInputs, this.cpu, dt);
      this.updateFighterPhysicsAndInput(this.cpu, this.cpuInputs, this.player, dt);

      // Facing logic: fighters always face each other unless in mid-attack
      if (this.player.state === 'idle' || this.player.state === 'walk_fwd' || this.player.state === 'walk_back') {
        this.player.facing = this.player.x <= this.cpu.x ? 1 : -1;
      }
      if (this.cpu.state === 'idle' || this.cpu.state === 'walk_fwd' || this.cpu.state === 'walk_back') {
        this.cpu.facing = this.cpu.x <= this.player.x ? 1 : -1;
      }

      // Check Attacks & Hitboxes
      this.checkAttackHits(this.player, this.cpu);
      this.checkAttackHits(this.cpu, this.player);

      // Match timer countdown
      this.match.timer -= dt;
      if (this.match.timer <= 0) {
        this.match.timer = 0;
        this.triggerTimeOver();
      }
    } else {
      // Idle gravity and animations during intro / ko / end
      this.updateFighterPhysicsAndInput(
        this.player,
        { left: false, right: false, jump: false, crouch: false, punch_light: false, punch_heavy: false, kick: false, block: false, special: false },
        this.cpu,
        dt
      );
      this.updateFighterPhysicsAndInput(
        this.cpu,
        { left: false, right: false, jump: false, crouch: false, punch_light: false, punch_heavy: false, kick: false, block: false, special: false },
        this.player,
        dt
      );
    }
  }

  private updateRoundFlow(dt: number) {
    if (this.match.roundStateTimer > 0) {
      this.match.roundStateTimer -= dt;

      if (this.match.roundState === 'intro') {
        if (this.match.roundStateTimer <= 1.0 && this.match.announcementSub === 'READY') {
          this.match.announcement = 'FIGHT!';
          this.match.announcementSub = null;
          soundManager.playFightFanfare();
        }
        if (this.match.roundStateTimer <= 0) {
          this.match.roundState = 'fighting';
          this.match.announcement = null;
        }
      } else if (this.match.roundState === 'ko') {
        if (this.match.roundStateTimer <= 0) {
          this.match.roundState = 'round_end';
          this.match.roundStateTimer = 2.2;
        }
      } else if (this.match.roundState === 'round_end') {
        if (this.match.roundStateTimer <= 0) {
          // Check if match won
          if (this.player.roundsWon >= 2) {
            this.match.roundState = 'match_end';
            this.match.winner = 'player';
            this.match.announcement = 'YOU WIN!';
            this.player.state = 'victory';
            this.cpu.state = 'defeat';
            soundManager.playVictoryFanfare();
          } else if (this.cpu.roundsWon >= 2) {
            this.match.roundState = 'match_end';
            this.match.winner = 'cpu';
            this.match.announcement = 'YOU LOSE';
            this.cpu.state = 'victory';
            this.player.state = 'defeat';
          } else {
            // Next round
            this.match.round++;
            this.resetRound();
          }
        }
      }
    }
  }

  private triggerKO(winner: 'player' | 'cpu' | 'draw') {
    if (this.match.roundState !== 'fighting') return;
    this.match.roundState = 'ko';
    this.match.roundStateTimer = 2.5;
    this.hitstopTimer = 0.35; // dramatic freeze
    this.cameraShake = 0.5;

    soundManager.playKO();

    if (winner === 'player') {
      this.player.roundsWon++;
      this.match.playerScore += 1000 + Math.round(this.match.timer * 20);
      this.match.announcement = 'K.O.!';
      this.match.announcementSub = `${this.player.name} WINS ROUND`;
      this.cpu.state = 'defeat';
    } else if (winner === 'cpu') {
      this.cpu.roundsWon++;
      this.match.cpuScore += 1000;
      this.match.announcement = 'K.O.!';
      this.match.announcementSub = `${this.cpu.name} WINS ROUND`;
      this.player.state = 'defeat';
    } else {
      this.match.announcement = 'DRAW GAME';
    }
  }

  private triggerTimeOver() {
    if (this.match.roundState !== 'fighting') return;
    if (this.player.health > this.cpu.health) {
      this.triggerKO('player');
    } else if (this.cpu.health > this.player.health) {
      this.triggerKO('cpu');
    } else {
      this.triggerKO('draw');
    }
  }

  private updateFighterPhysicsAndInput(
    f: FighterEntity,
    inputs: CombatInputs,
    opponent: FighterEntity,
    dt: number
  ) {
    f.stateTimer += dt;
    if (f.specialCooldown > 0) f.specialCooldown -= dt;

    // Hitstun recovery
    if (f.hitStun > 0) {
      f.hitStun -= dt;
      if (f.hitStun <= 0) {
        f.state = 'idle';
        f.stateTimer = 0;
      }
    }

    // Combo timer
    if (f.comboTimer > 0) {
      f.comboTimer -= dt;
      if (f.comboTimer <= 0) {
        f.comboCount = 0;
      }
    }

    // Gravity
    const gravity = -26.0;
    if (f.y > 0 || f.vy !== 0) {
      f.vy += gravity * dt;
      f.y += f.vy * dt;
      if (f.y <= 0) {
        f.y = 0;
        f.vy = 0;
        if (f.state === 'jump') {
          f.state = 'idle';
          f.stateTimer = 0;
        }
      }
    }

    // Friction & Horizontal velocity
    f.x += f.vx * dt;
    f.vx *= Math.pow(0.005, dt);

    // Arena Clamping
    f.x = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, f.x));

    // If in hitstun or defeat/victory, cannot act
    if (f.hitStun > 0 || f.state === 'defeat' || f.state === 'victory') {
      return;
    }

    // Blocking status
    f.isBlocking = inputs.block;
    if (f.isBlocking) {
      f.blockTimer += dt;
      if (f.state === 'idle' || f.state === 'walk_back') {
        f.state = 'block';
      }
    } else {
      f.blockTimer = 0;
    }

    // Attack State Recoveries
    const isAttacking =
      f.state === 'punch_light' ||
      f.state === 'punch_heavy' ||
      f.state === 'kick' ||
      f.state === 'special';

    if (isAttacking) {
      const attackData = this.getAttackData(f, f.state);
      const totalDuration = attackData.startup + attackData.active + attackData.recovery;
      if (f.stateTimer >= totalDuration) {
        f.state = 'idle';
        f.stateTimer = 0;
        f.hasDealtHitInCurrentAttack = false;
      }
      return; // Locked in attack animation
    }

    // Start Actions
    if (inputs.special && f.superMeter >= 100 && f.specialCooldown <= 0) {
      f.state = 'special';
      f.stateTimer = 0;
      f.superMeter = 0;
      f.hasDealtHitInCurrentAttack = false;
      f.specialCooldown = 1.0;
      this.executeSpecialMove(f);
      return;
    }

    if (inputs.punch_heavy) {
      f.state = 'punch_heavy';
      f.stateTimer = 0;
      f.hasDealtHitInCurrentAttack = false;
      soundManager.playHeavyPunch();
      return;
    }

    if (inputs.punch_light) {
      f.state = 'punch_light';
      f.stateTimer = 0;
      f.hasDealtHitInCurrentAttack = false;
      soundManager.playLightPunch();
      return;
    }

    if (inputs.kick) {
      f.state = 'kick';
      f.stateTimer = 0;
      f.hasDealtHitInCurrentAttack = false;
      soundManager.playKick();
      return;
    }

    if (inputs.jump && f.y === 0) {
      f.vy = 10.5;
      f.state = 'jump';
      f.stateTimer = 0;
      soundManager.playJump();
      return;
    }

    if (inputs.crouch && f.y === 0) {
      f.state = 'crouch';
      return;
    }

    // Walking Left / Right
    const moveSpeed = (f.config.speed / 100) * 4.8;
    if (inputs.left) {
      f.x -= moveSpeed * dt;
      f.state = f.facing === 1 ? 'walk_back' : 'walk_fwd';
    } else if (inputs.right) {
      f.x += moveSpeed * dt;
      f.state = f.facing === 1 ? 'walk_fwd' : 'walk_back';
    } else if (f.y === 0 && !f.isBlocking) {
      f.state = 'idle';
    }
  }

  private getAttackData(f: FighterEntity, state: ActionState): AttackData {
    if (state === 'punch_light') return f.config.attacks.punch_light;
    if (state === 'punch_heavy') return f.config.attacks.punch_heavy;
    if (state === 'kick') return f.config.attacks.kick;
    return f.config.attacks.special;
  }

  private executeSpecialMove(f: FighterEntity) {
    soundManager.playSpecialAttack();
    this.cameraShake = 0.35;
    this.addEffect(f.x + f.facing * 0.8, f.y + 1.2, 0, 'special', f.config.glowColor, 0.5, 1.8);

    // Blaze & Volt launch glowing projectiles!
    if (f.id === 'blaze' || f.id === 'volt') {
      this.projectiles.push({
        id: this.nextProjId++,
        ownerId: f.id,
        x: f.x + f.facing * 1.2,
        y: f.y + 1.1,
        vx: f.facing * 9.5,
        life: 0,
        maxLife: 1.2,
        color: f.config.glowColor,
        damage: 18,
        hitRadius: 0.8,
      });
    } else if (f.id === 'titan') {
      // Titan ground shockwave
      this.cameraShake = 0.5;
      this.addEffect(f.x + f.facing * 1.5, 0.1, 0, 'special', '#f59e0b', 0.6, 2.5);
    }
  }

  private checkAttackHits(attacker: FighterEntity, defender: FighterEntity) {
    const isAttacking =
      attacker.state === 'punch_light' ||
      attacker.state === 'punch_heavy' ||
      attacker.state === 'kick' ||
      attacker.state === 'special';

    if (!isAttacking || attacker.hasDealtHitInCurrentAttack) return;

    const attack = this.getAttackData(attacker, attacker.state);
    const activeStart = attack.startup;
    const activeEnd = attack.startup + attack.active;

    if (attacker.stateTimer >= activeStart && attacker.stateTimer <= activeEnd) {
      const dist = Math.abs(attacker.x - defender.x);
      const isFacingDefender = (defender.x - attacker.x) * attacker.facing > 0;

      // Hitbox range test
      if (dist <= attack.range && isFacingDefender && Math.abs(attacker.y - defender.y) < 1.4) {
        attacker.hasDealtHitInCurrentAttack = true;
        this.resolveHit(attacker, defender, attack);
      }
    }
  }

  private resolveHit(attacker: FighterEntity, defender: FighterEntity, attack: AttackData) {
    // Check Perfect Block (Parrying within 0.15s of initiating block)
    const isParrying = defender.isBlocking && defender.blockTimer < 0.16;

    if (isParrying) {
      // PERFECT PARRY!
      soundManager.playParry();
      this.cameraShake = 0.25;
      this.hitstopTimer = 0.12;

      // Attacker gets stunned, defender gains +25 super meter
      attacker.state = 'stunned';
      attacker.hitStun = 0.45;
      defender.superMeter = Math.min(100, defender.superMeter + 25);

      this.addEffect(defender.x, defender.y + 1.2, 0, 'parry', '#ffffff', 0.4, 2.0);
      return;
    }

    if (defender.isBlocking) {
      // NORMAL BLOCK: 80% damage reduction
      soundManager.playBlock();
      const chipDmg = Math.max(1, Math.round(attack.damage * 0.2));
      defender.health = Math.max(0, defender.health - chipDmg);
      defender.vx = attacker.facing * (attack.knockback * 0.5);
      defender.superMeter = Math.min(100, defender.superMeter + 4);
      attacker.superMeter = Math.min(100, attacker.superMeter + attack.meterGain * 0.5);

      this.addEffect(defender.x, defender.y + 1.1, 0, 'block', '#00e5ff', 0.25, 1.2);
    } else {
      // DIRECT HIT!
      let damage = attack.damage;
      // Crit bonus on heavy punch
      const isCrit = attack.damage > 12 && Math.random() < 0.35;
      if (isCrit) {
        damage = Math.round(damage * 1.4);
      }

      defender.health = Math.max(0, defender.health - damage);
      defender.state = 'hit';
      defender.stateTimer = 0;
      defender.hitStun = attack.hitstun;
      defender.vx = attacker.facing * attack.knockback * 4.5;

      // Hitstop crunchy freeze
      this.hitstopTimer = attack.damage >= 14 ? 0.08 : 0.04;
      this.cameraShake = attack.damage >= 14 ? 0.35 : 0.15;

      // Meter gains
      attacker.superMeter = Math.min(100, attacker.superMeter + attack.meterGain);
      defender.superMeter = Math.min(100, defender.superMeter + Math.round(damage * 0.6));

      // Combo count
      attacker.comboCount++;
      attacker.comboTimer = 1.2;

      // Visual Spark
      const effectType = isCrit ? 'crit' : 'hit';
      this.addEffect(
        defender.x - attacker.facing * 0.2,
        defender.y + 1.1,
        0,
        effectType,
        attacker.config.glowColor,
        0.35,
        isCrit ? 2.0 : 1.4
      );
    }

    // Check KO
    if (defender.health <= 0) {
      this.triggerKO(attacker.isPlayer ? 'player' : 'cpu');
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life += dt;
      p.x += p.vx * dt;

      // Check collision with target
      const target = p.ownerId === this.player.id ? this.cpu : this.player;
      const dist = Math.abs(p.x - target.x);

      if (dist < p.hitRadius && Math.abs(p.y - (target.y + 1.0)) < 1.0) {
        // Hit!
        const attacker = p.ownerId === this.player.id ? this.player : this.cpu;
        this.resolveHit(attacker, target, {
          name: 'Projectile',
          damage: p.damage,
          meterGain: 0,
          startup: 0,
          active: 0.1,
          recovery: 0,
          range: 1,
          knockback: 2.2,
          hitstun: 0.45,
        });
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.life >= p.maxLife || p.x < this.arenaMinX || p.x > this.arenaMaxX) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateEffects(dt: number) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const ef = this.effects[i];
      ef.life += dt;
      if (ef.life >= ef.maxLife) {
        this.effects.splice(i, 1);
      }
    }
  }

  public addEffect(
    x: number,
    y: number,
    z: number,
    type: VisualEffect['type'],
    color: string,
    maxLife: number,
    scale: number
  ) {
    this.effects.push({
      id: this.nextEffectId++,
      x,
      y,
      z,
      type,
      color,
      life: 0,
      maxLife,
      scale,
    });
  }

  // --- CPU AI CONTROLLER ---
  private updateCpuAi(dt: number) {
    this.cpuAiTimer += dt;
    // Tick AI decision loop
    const reactionDelay = this.difficulty === 'hard' ? 0.08 : this.difficulty === 'normal' ? 0.18 : 0.35;

    if (this.cpuAiTimer >= reactionDelay) {
      this.cpuAiTimer = 0;
      this.cpuInputs = {
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

      if (this.match.roundState !== 'fighting') return;

      const dist = Math.abs(this.cpu.x - this.player.x);
      const isPlayerAttacking =
        this.player.state === 'punch_light' ||
        this.player.state === 'punch_heavy' ||
        this.player.state === 'kick' ||
        this.player.state === 'special';

      // 1. Defense / Blocking reaction
      const blockChance = this.difficulty === 'hard' ? 0.75 : this.difficulty === 'normal' ? 0.45 : 0.2;
      if (isPlayerAttacking && dist < 2.5 && Math.random() < blockChance) {
        this.cpuInputs.block = true;
        return;
      }

      // 2. Special move execution if meter full
      if (this.cpu.superMeter >= 100 && Math.random() < (this.difficulty === 'hard' ? 0.85 : 0.5)) {
        this.cpuInputs.special = true;
        return;
      }

      // 3. Close Range Combat
      if (dist < 1.8) {
        const rand = Math.random();
        if (rand < 0.35) {
          this.cpuInputs.punch_light = true;
        } else if (rand < 0.65) {
          this.cpuInputs.kick = true;
        } else if (rand < 0.85) {
          this.cpuInputs.punch_heavy = true;
        } else {
          // Tactical step back
          if (this.cpu.x > this.player.x) {
            this.cpuInputs.right = true;
          } else {
            this.cpuInputs.left = true;
          }
        }
      } else if (dist < 4.0) {
        // Mid-Range Spacing & Jump In
        const rand = Math.random();
        if (rand < 0.25 && this.cpu.y === 0) {
          this.cpuInputs.jump = true;
          if (this.cpu.x > this.player.x) this.cpuInputs.left = true;
          else this.cpuInputs.right = true;
        } else if (rand < 0.75) {
          // Approach
          if (this.cpu.x > this.player.x) {
            this.cpuInputs.left = true;
          } else {
            this.cpuInputs.right = true;
          }
        }
      } else {
        // Long Range: Close the distance
        if (this.cpu.x > this.player.x) {
          this.cpuInputs.left = true;
        } else {
          this.cpuInputs.right = true;
        }
      }
    }
  }
}
