import * as THREE from 'three';
import { ActionState, FighterConfig, FighterId } from '../types/game';

export interface FighterRig {
  group: THREE.Group;
  root: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  shoulderL: THREE.Group;
  shoulderR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  forearmL: THREE.Group;
  forearmR: THREE.Group;
  fistL: THREE.Mesh;
  fistR: THREE.Mesh;
  thighL: THREE.Group;
  thighR: THREE.Group;
  shinL: THREE.Group;
  shinR: THREE.Group;
  footL: THREE.Mesh;
  footR: THREE.Mesh;
  auraLight?: THREE.PointLight;
  glowMeshes: THREE.Mesh[];
  shadowMesh: THREE.Mesh;
}

export function createProceduralFighter(config: FighterConfig): FighterRig {
  const group = new THREE.Group();
  const glowMeshes: THREE.Mesh[] = [];

  const primaryCol = new THREE.Color(config.primaryColor);
  const secondaryCol = new THREE.Color(config.secondaryColor);
  const glowCol = new THREE.Color(config.glowColor);

  // PBR Materials with high roughness contrast
  const armorMat = new THREE.MeshStandardMaterial({
    color: primaryCol,
    metalness: 0.75,
    roughness: 0.25,
  });

  const undersuitMat = new THREE.MeshStandardMaterial({
    color: 0x111116,
    metalness: 0.1,
    roughness: 0.85,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: secondaryCol,
    metalness: 0.6,
    roughness: 0.35,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: glowCol,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffcc33,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Root
  const root = new THREE.Group();
  group.add(root);

  // Contact Shadow Plane beneath the fighter
  const shadowGeo = new THREE.PlaneGeometry(1.6, 1.0);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02; // prevent z-fighting
  group.add(shadowMesh);

  // Pelvis / Waist
  const pelvis = new THREE.Group();
  pelvis.position.y = 1.15;
  root.add(pelvis);

  const beltGeo = new THREE.CylinderGeometry(0.35, 0.32, 0.22, 12);
  const beltMesh = new THREE.Mesh(beltGeo, undersuitMat);
  pelvis.add(beltMesh);

  // Neon Buckle
  const buckleGeo = new THREE.BoxGeometry(0.18, 0.12, 0.1);
  const buckleMesh = new THREE.Mesh(buckleGeo, glowMat);
  buckleMesh.position.set(0, 0, 0.32);
  pelvis.add(buckleMesh);
  glowMeshes.push(buckleMesh);

  // Torso
  const torso = new THREE.Group();
  torso.position.y = 0.2;
  pelvis.add(torso);

  const isTitan = config.id === 'titan';
  const chestScaleX = isTitan ? 0.65 : 0.5;
  const chestGeo = new THREE.BoxGeometry(chestScaleX, 0.55, 0.38);
  const chestMesh = new THREE.Mesh(chestGeo, armorMat);
  chestMesh.position.y = 0.28;
  torso.add(chestMesh);

  // Chest Neon Core
  const coreGeo = new THREE.BoxGeometry(0.16, 0.2, 0.08);
  const coreMesh = new THREE.Mesh(coreGeo, glowMat);
  coreMesh.position.set(0, 0.32, 0.2);
  torso.add(coreMesh);
  glowMeshes.push(coreMesh);

  // Head
  const head = new THREE.Group();
  head.position.y = 0.65;
  torso.add(head);

  const headGeo = new THREE.BoxGeometry(0.3, 0.35, 0.32);
  const headMesh = new THREE.Mesh(headGeo, secondaryMat);
  head.add(headMesh);

  // Neon Visor
  const visorGeo = new THREE.BoxGeometry(0.26, 0.08, 0.06);
  const visorMesh = new THREE.Mesh(visorGeo, glowMat);
  visorMesh.position.set(0, 0.04, 0.17);
  head.add(visorMesh);
  glowMeshes.push(visorMesh);

  // Fighter-specific headgear
  if (config.id === 'blaze') {
    // Crimson Dragon headband crest
    const crestGeo = new THREE.ConeGeometry(0.12, 0.35, 4);
    const crestMesh = new THREE.Mesh(crestGeo, goldMat);
    crestMesh.rotation.x = -Math.PI / 6;
    crestMesh.position.set(0, 0.22, -0.05);
    head.add(crestMesh);
  } else if (config.id === 'volt') {
    // Lightning antenna horns
    [-0.14, 0.14].forEach((xPos) => {
      const hornGeo = new THREE.CylinderGeometry(0.02, 0.05, 0.25, 6);
      const horn = new THREE.Mesh(hornGeo, glowMat);
      horn.position.set(xPos, 0.24, 0);
      horn.rotation.z = (xPos > 0 ? -1 : 1) * 0.4;
      head.add(horn);
      glowMeshes.push(horn);
    });
  } else if (config.id === 'titan') {
    // Armored juggernaut visor plate
    const jawGeo = new THREE.BoxGeometry(0.34, 0.16, 0.34);
    const jawMesh = new THREE.Mesh(jawGeo, armorMat);
    jawMesh.position.set(0, -0.1, 0.02);
    head.add(jawMesh);
  }

  // --- SHOULDERS & ARMS ---
  const shoulderGeo = new THREE.SphereGeometry(isTitan ? 0.24 : 0.17, 8, 8);
  const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.35, 8);
  const forearmGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.32, 8);
  const fistGeo = new THREE.BoxGeometry(0.15, 0.15, 0.16);

  // Left Arm (Back Arm relative to 2.5D view)
  const shoulderL = new THREE.Group();
  const shoulderDist = isTitan ? 0.42 : 0.34;
  shoulderL.position.set(-shoulderDist, 0.45, 0);
  torso.add(shoulderL);

  const shMeshL = new THREE.Mesh(shoulderGeo, armorMat);
  shoulderL.add(shMeshL);

  const armL = new THREE.Group();
  armL.position.y = -0.1;
  shoulderL.add(armL);
  const armLMesh = new THREE.Mesh(armGeo, undersuitMat);
  armLMesh.position.y = -0.16;
  armL.add(armLMesh);

  const forearmL = new THREE.Group();
  forearmL.position.y = -0.32;
  armL.add(forearmL);
  const forearmLMesh = new THREE.Mesh(forearmGeo, armorMat);
  forearmLMesh.position.y = -0.16;
  forearmL.add(forearmLMesh);

  const fistL = new THREE.Mesh(fistGeo, glowMat);
  fistL.position.y = -0.34;
  forearmL.add(fistL);
  glowMeshes.push(fistL);

  // Right Arm (Lead / Punching Arm)
  const shoulderR = new THREE.Group();
  shoulderR.position.set(shoulderDist, 0.45, 0);
  torso.add(shoulderR);

  const shMeshR = new THREE.Mesh(shoulderGeo, armorMat);
  shoulderR.add(shMeshR);

  const armR = new THREE.Group();
  armR.position.y = -0.1;
  shoulderR.add(armR);
  const armRMesh = new THREE.Mesh(armGeo, undersuitMat);
  armRMesh.position.y = -0.16;
  armR.add(armRMesh);

  const forearmR = new THREE.Group();
  forearmR.position.y = -0.32;
  armR.add(forearmR);
  const forearmRMesh = new THREE.Mesh(forearmGeo, armorMat);
  forearmRMesh.position.y = -0.16;
  forearmR.add(forearmRMesh);

  const fistR = new THREE.Mesh(fistGeo, glowMat);
  fistR.position.y = -0.34;
  forearmR.add(fistR);
  glowMeshes.push(fistR);

  // --- LEGS & FEET ---
  const thighGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.44, 8);
  const shinGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.44, 8);
  const footGeo = new THREE.BoxGeometry(0.18, 0.14, 0.32);

  // Left Leg
  const thighL = new THREE.Group();
  thighL.position.set(-0.18, -0.12, 0);
  pelvis.add(thighL);
  const thighLMesh = new THREE.Mesh(thighGeo, undersuitMat);
  thighLMesh.position.y = -0.22;
  thighL.add(thighLMesh);

  const shinL = new THREE.Group();
  shinL.position.y = -0.44;
  thighL.add(shinL);
  const shinLMesh = new THREE.Mesh(shinGeo, armorMat);
  shinLMesh.position.y = -0.22;
  shinL.add(shinLMesh);

  const footL = new THREE.Mesh(footGeo, secondaryMat);
  footL.position.set(0, -0.44, 0.08);
  shinL.add(footL);

  // Right Leg (Lead Leg)
  const thighR = new THREE.Group();
  thighR.position.set(0.18, -0.12, 0);
  pelvis.add(thighR);
  const thighRMesh = new THREE.Mesh(thighGeo, undersuitMat);
  thighRMesh.position.y = -0.22;
  thighR.add(thighRMesh);

  const shinR = new THREE.Group();
  shinR.position.y = -0.44;
  thighR.add(shinR);
  const shinRMesh = new THREE.Mesh(shinGeo, armorMat);
  shinRMesh.position.y = -0.22;
  shinR.add(shinRMesh);

  const footR = new THREE.Mesh(footGeo, secondaryMat);
  footR.position.set(0, -0.44, 0.08);
  shinR.add(footR);

  // Dynamic Neon Point Light attached to torso for real-time combat aura illumination
  const auraLight = new THREE.PointLight(glowCol, 1.2, 3.5);
  auraLight.position.set(0, 0.5, 0.4);
  torso.add(auraLight);

  return {
    group,
    root,
    pelvis,
    torso,
    head,
    shoulderL,
    shoulderR,
    armL,
    armR,
    forearmL,
    forearmR,
    fistL,
    fistR,
    thighL,
    thighR,
    shinL,
    shinR,
    footL,
    footR,
    auraLight,
    glowMeshes,
    shadowMesh,
  };
}

export function resetRigPose(rig: FighterRig) {
  rig.root.position.set(0, 0, 0);
  rig.root.rotation.set(0, 0, 0);
  rig.pelvis.position.set(0, 1.15, 0);
  rig.pelvis.rotation.set(0, 0, 0);
  rig.torso.rotation.set(0, 0, 0);
  rig.head.rotation.set(0, 0, 0);

  rig.shoulderL.rotation.set(0, 0, 0);
  rig.shoulderR.rotation.set(0, 0, 0);
  rig.armL.rotation.set(0, 0, 0);
  rig.armR.rotation.set(0, 0, 0);
  rig.forearmL.rotation.set(0, 0, 0);
  rig.forearmR.rotation.set(0, 0, 0);

  rig.thighL.rotation.set(0, 0, 0);
  rig.thighR.rotation.set(0, 0, 0);
  rig.shinL.rotation.set(0, 0, 0);
  rig.shinR.rotation.set(0, 0, 0);
  rig.footL.rotation.set(0, 0, 0);
  rig.footR.rotation.set(0, 0, 0);
}

export function updateFighterAnimation(
  rig: FighterRig,
  state: ActionState,
  stateTimer: number,
  time: number,
  fighterId: FighterId,
  isBlocking: boolean
) {
  resetRigPose(rig);

  switch (state) {
    case 'idle': {
      // Natural arcade fighting stance: rhythmic weight shift & breathing
      const breath = Math.sin(time * 5.0) * 0.05;
      const sway = Math.cos(time * 2.5) * 0.03;

      rig.pelvis.position.y = 1.15 + breath;
      rig.torso.rotation.y = 0.25 + sway;
      rig.torso.rotation.z = -0.05;
      rig.head.rotation.y = -0.25;

      // Guarded fighting arms
      rig.armL.rotation.x = -0.6 + breath;
      rig.forearmL.rotation.x = -1.2;
      rig.armR.rotation.x = -0.9 - breath;
      rig.forearmR.rotation.x = -1.5;
      rig.shoulderR.rotation.y = -0.2;

      // Relaxed stance legs
      rig.thighL.rotation.x = -0.15;
      rig.shinL.rotation.x = 0.25;
      rig.thighR.rotation.x = 0.15;
      rig.shinR.rotation.x = 0.15;
      break;
    }

    case 'walk_fwd': {
      const step = time * 8.0;
      const legL = Math.sin(step) * 0.55;
      const legR = -legL;

      rig.pelvis.position.y = 1.15 + Math.abs(Math.sin(step)) * 0.06;
      rig.torso.rotation.x = 0.12; // forward lean

      rig.thighL.rotation.x = legL;
      rig.shinL.rotation.x = Math.max(0, -legL * 0.7);
      rig.thighR.rotation.x = legR;
      rig.shinR.rotation.x = Math.max(0, -legR * 0.7);

      rig.armL.rotation.x = -0.6 - legL * 0.4;
      rig.armR.rotation.x = -0.9 + legL * 0.4;
      break;
    }

    case 'walk_back': {
      const step = time * 7.0;
      const legL = Math.sin(step) * 0.45;
      const legR = -legL;

      rig.pelvis.position.y = 1.15 + Math.abs(Math.sin(step)) * 0.05;
      rig.torso.rotation.x = -0.1; // defensive backward lean

      rig.thighL.rotation.x = legL;
      rig.shinL.rotation.x = Math.max(0, legL * 0.6);
      rig.thighR.rotation.x = legR;
      rig.shinR.rotation.x = Math.max(0, -legR * 0.6);

      rig.armL.rotation.x = -0.8;
      rig.forearmL.rotation.x = -1.4;
      rig.armR.rotation.x = -1.1;
      rig.forearmR.rotation.x = -1.6;
      break;
    }

    case 'jump': {
      // Tucked aerial stance
      rig.pelvis.position.y = 1.15;
      rig.torso.rotation.x = 0.2;
      rig.thighL.rotation.x = -0.8;
      rig.shinL.rotation.x = 1.2;
      rig.thighR.rotation.x = -0.5;
      rig.shinR.rotation.x = 0.9;

      rig.armL.rotation.x = -1.5;
      rig.armR.rotation.x = -1.8;
      break;
    }

    case 'crouch': {
      rig.pelvis.position.y = 0.75;
      rig.torso.rotation.x = 0.35;
      rig.thighL.rotation.x = -1.2;
      rig.shinL.rotation.x = 1.6;
      rig.thighR.rotation.x = -1.1;
      rig.shinR.rotation.x = 1.5;

      rig.armL.rotation.x = -0.8;
      rig.armR.rotation.x = -1.2;
      break;
    }

    case 'punch_light': {
      // Fast straight jab
      const p = Math.min(1, stateTimer / 0.24);
      const extend = Math.sin(p * Math.PI);

      rig.torso.rotation.y = 0.35 * extend;
      rig.armR.rotation.x = -1.57 * extend;
      rig.forearmR.rotation.x = -0.1 * extend;
      rig.armR.position.z = 0.45 * extend;

      // Support arm in guard
      rig.armL.rotation.x = -0.8;
      rig.forearmL.rotation.x = -1.4;
      break;
    }

    case 'punch_heavy': {
      // Windup hook with huge hip torque and torso rotation
      const p = Math.min(1, stateTimer / 0.45);
      if (p < 0.35) {
        // Wind back
        const wind = p / 0.35;
        rig.torso.rotation.y = -0.4 * wind;
        rig.armR.rotation.x = -0.6;
        rig.armR.rotation.y = 0.8 * wind;
      } else {
        // Explosive forward hook
        const strike = (p - 0.35) / 0.65;
        const curve = Math.sin(strike * Math.PI);
        rig.torso.rotation.y = 0.7 * curve;
        rig.torso.rotation.x = 0.2 * curve;
        rig.armR.rotation.x = -1.4;
        rig.armR.rotation.y = -0.8 * curve;
        rig.armR.position.z = 0.5 * curve;
      }
      break;
    }

    case 'kick': {
      // High snap roundhouse kick
      const p = Math.min(1, stateTimer / 0.38);
      const extend = Math.sin(p * Math.PI);

      rig.pelvis.rotation.z = -0.35 * extend;
      rig.torso.rotation.z = 0.35 * extend;
      rig.thighR.rotation.x = -1.65 * extend;
      rig.thighR.rotation.z = -0.3 * extend;
      rig.shinR.rotation.x = 0.1 * extend;
      rig.footR.rotation.x = -0.4 * extend;

      // Balance arms
      rig.armL.rotation.x = -1.1;
      rig.armR.rotation.x = 0.3 * extend;
      break;
    }

    case 'block': {
      // Both arms locked in cross-guard
      rig.pelvis.position.y = 1.05;
      rig.torso.rotation.x = 0.2;
      rig.armL.rotation.x = -1.4;
      rig.forearmL.rotation.x = -1.8;
      rig.shoulderL.rotation.y = 0.3;

      rig.armR.rotation.x = -1.4;
      rig.forearmR.rotation.x = -1.8;
      rig.shoulderR.rotation.y = -0.3;
      break;
    }

    case 'hit':
    case 'stunned': {
      // Violent recoil flinch
      const p = Math.min(1, stateTimer / 0.3);
      const recoil = Math.sin(p * Math.PI);

      rig.torso.rotation.x = -0.55 * recoil;
      rig.head.rotation.x = -0.4 * recoil;
      rig.head.rotation.y = 0.3 * recoil;
      rig.armL.rotation.x = 0.4 * recoil;
      rig.armR.rotation.x = 0.6 * recoil;
      rig.pelvis.position.y = 1.15 - 0.1 * recoil;
      break;
    }

    case 'special': {
      const p = Math.min(1, stateTimer / 0.65);
      if (fighterId === 'blaze') {
        // Blazing Shoryuken rising dragon uppercut
        const strike = Math.sin(p * Math.PI);
        rig.pelvis.position.y = 1.15 + strike * 0.4;
        rig.torso.rotation.x = -0.3 * strike;
        rig.armR.rotation.x = -3.1 * strike; // arm points straight up!
        rig.armL.rotation.x = 0.4 * strike;
      } else if (fighterId === 'shadow') {
        // Teleport spin kick
        rig.torso.rotation.y = p * Math.PI * 4;
        rig.thighR.rotation.x = -1.5;
        rig.shinR.rotation.x = 0.2;
      } else if (fighterId === 'titan') {
        // Mega ground slam
        if (p < 0.4) {
          // Both arms raised high above head
          rig.armL.rotation.x = -2.8;
          rig.armR.rotation.x = -2.8;
          rig.torso.rotation.x = -0.3;
        } else {
          // Crushing impact down into the ground
          rig.armL.rotation.x = -0.5;
          rig.armR.rotation.x = -0.5;
          rig.torso.rotation.x = 0.6;
          rig.pelvis.position.y = 0.85;
        }
      } else {
        // Volt dual plasma blast thrust
        const strike = Math.sin(p * Math.PI);
        rig.armL.rotation.x = -1.57 * strike;
        rig.armR.rotation.x = -1.57 * strike;
        rig.armL.position.z = 0.5 * strike;
        rig.armR.position.z = 0.5 * strike;
      }
      break;
    }

    case 'victory': {
      // Majestic celebratory pose with raised arm and glowing aura
      const t = time * 3;
      rig.armR.rotation.x = -2.9 + Math.sin(t) * 0.1;
      rig.armL.rotation.x = -0.5;
      rig.head.rotation.x = -0.2;
      rig.head.rotation.y = 0.1;
      break;
    }

    case 'defeat': {
      // Knockout collapse
      const p = Math.min(1, stateTimer / 0.8);
      rig.root.rotation.x = (Math.PI / 2) * p;
      rig.root.position.y = -1.15 * p;
      break;
    }
  }

  // If fighter is actively blocking while standing
  if (isBlocking && state !== 'block' && state !== 'hit' && state !== 'defeat') {
    rig.armL.rotation.x = -1.3;
    rig.forearmL.rotation.x = -1.7;
    rig.armR.rotation.x = -1.3;
    rig.forearmR.rotation.x = -1.7;
  }
}
