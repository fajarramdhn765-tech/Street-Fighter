import * as THREE from 'three';
import { ArenaId } from '../types/game';

export interface ArenaEnvironment {
  group: THREE.Group;
  lights: THREE.Light[];
  animatedElements: {
    update: (time: number) => void;
  };
  groundY: number;
  minX: number;
  maxX: number;
  name: string;
}

export function buildArena(arenaId: ArenaId, scene: THREE.Scene): ArenaEnvironment {
  const group = new THREE.Group();
  scene.add(group);
  const lights: THREE.Light[] = [];
  const animatedUpdaters: Array<(time: number) => void> = [];

  const minX = -8.5;
  const maxX = 8.5;
  const groundY = 0;

  if (arenaId === 'neon_city') {
    // --- 1. NEON CITY ARENA ---
    scene.fog = new THREE.FogExp2(0x070611, 0.035);

    // Arena Floor: Wet reflective dark asphalt
    const floorGeo = new THREE.PlaneGeometry(36, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c14,
      roughness: 0.2,
      metalness: 0.85,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, groundY, 0);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // Neon Road Markings & Curb Lines
    [-7.5, 7.5].forEach((zPos) => {
      const curbGeo = new THREE.BoxGeometry(36, 0.1, 0.4);
      const curbMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(0, groundY + 0.05, zPos);
      group.add(curb);
    });

    // Street Lamps with glowing neon globes
    const lampPositions = [-8, -3, 3, 8];
    lampPositions.forEach((xPos) => {
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(xPos, 2.25, -5.5);
      group.add(pole);

      const lampHeadGeo = new THREE.BoxGeometry(0.6, 0.15, 0.3);
      const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
      lampHead.position.set(xPos, 4.4, -5.3);
      group.add(lampHead);

      const lampLight = new THREE.PointLight(0xff0055, 1.2, 8);
      lampLight.position.set(xPos, 4.2, -5.0);
      group.add(lampLight);
      lights.push(lampLight);
    });

    // Background Cyberpunk Skyscrapers
    const buildingColors = [0x0d111a, 0x121724, 0x0a0d16];
    const windowColors = [0x00e5ff, 0xff007f, 0xffbb00];

    for (let i = -12; i <= 12; i += 2.5) {
      const height = 10 + Math.abs(Math.sin(i * 1.7)) * 12;
      const width = 2.2;
      const depth = 3.5;
      const bGeo = new THREE.BoxGeometry(width, height, depth);
      const bMat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.abs(Math.round(i)) % buildingColors.length],
        roughness: 0.8,
        metalness: 0.3,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(i * 1.5, height / 2 - 2, -12 - Math.random() * 4);
      group.add(bMesh);

      // Glowing Neon Signs on buildings
      if (Math.abs(i) % 3 === 0) {
        const signGeo = new THREE.PlaneGeometry(2.4, 0.8);
        const signMat = new THREE.MeshBasicMaterial({
          color: windowColors[Math.abs(Math.round(i)) % windowColors.length],
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(i * 1.5, height * 0.7, -10);
        group.add(sign);
      }
    }

    // Flying Hovercars in the background night sky
    const hoverCars: Array<{ mesh: THREE.Mesh; speed: number; startX: number; endX: number }> = [];
    for (let h = 0; h < 4; h++) {
      const carGeo = new THREE.BoxGeometry(0.8, 0.25, 0.4);
      const carMat = new THREE.MeshBasicMaterial({ color: h % 2 === 0 ? 0x00ffff : 0xff2266 });
      const car = new THREE.Mesh(carGeo, carMat);
      const yPos = 6 + h * 2.2;
      const zPos = -14 - h * 1.5;
      car.position.set(-15 + h * 6, yPos, zPos);
      group.add(car);
      hoverCars.push({
        mesh: car,
        speed: 4 + h * 2,
        startX: -22,
        endX: 22,
      });
    }

    animatedUpdaters.push((time) => {
      hoverCars.forEach((c) => {
        c.mesh.position.x += c.speed * 0.016;
        if (c.mesh.position.x > c.endX) {
          c.mesh.position.x = c.startX;
        }
      });
    });

  } else if (arenaId === 'underground_club') {
    // --- 2. UNDERGROUND CLUB ARENA ---
    scene.fog = new THREE.FogExp2(0x080410, 0.04);

    // Floor with glowing neon combat grid
    const floorGeo = new THREE.PlaneGeometry(32, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x06060c,
      roughness: 0.15,
      metalness: 0.9,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, groundY, 0);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // Glowing Octagon Arena Boundary
    const ringGeo = new THREE.RingGeometry(8.2, 8.4, 8);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xbf00ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, groundY + 0.02, 0);
    group.add(ring);

    // Industrial Truss Columns & Sound Stacks
    [-9, 9].forEach((xSide) => {
      const trussGeo = new THREE.BoxGeometry(0.8, 8, 0.8);
      const trussMat = new THREE.MeshStandardMaterial({ color: 0x222230, wireframe: true });
      const truss = new THREE.Mesh(trussGeo, trussMat);
      truss.position.set(xSide, 4, -4);
      group.add(truss);

      // Neon Tube along truss
      const tubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 7.8, 8);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(xSide, 4, -3.8);
      group.add(tube);
    });

    // Sweeping Club Lasers
    const lasers: THREE.Mesh[] = [];
    const laserColors = [0xff0055, 0x00e5ff, 0xa855f7, 0x22c55e];
    for (let l = 0; l < 4; l++) {
      const lGeo = new THREE.CylinderGeometry(0.04, 0.4, 14, 8);
      const lMat = new THREE.MeshBasicMaterial({
        color: laserColors[l],
        transparent: true,
        opacity: 0.7,
      });
      const laser = new THREE.Mesh(lGeo, lMat);
      laser.position.set(-6 + l * 4, 7, -5);
      laser.rotation.z = (l - 1.5) * 0.3;
      group.add(laser);
      lasers.push(laser);
    }

    // Dynamic Club Spotlights
    const clubLightA = new THREE.PointLight(0xff0055, 2.5, 14);
    clubLightA.position.set(-5, 6, -2);
    group.add(clubLightA);
    lights.push(clubLightA);

    const clubLightB = new THREE.PointLight(0x00e5ff, 2.5, 14);
    clubLightB.position.set(5, 6, -2);
    group.add(clubLightB);
    lights.push(clubLightB);

    animatedUpdaters.push((time) => {
      lasers.forEach((laser, idx) => {
        laser.rotation.z = Math.sin(time * 2.5 + idx * 1.2) * 0.55;
        laser.rotation.x = Math.cos(time * 1.8 + idx) * 0.35 + 0.4;
      });
      clubLightA.intensity = 2.0 + Math.sin(time * 6) * 0.8;
      clubLightB.intensity = 2.0 + Math.cos(time * 6) * 0.8;
    });

  } else {
    // --- 3. ROOFTOP BATTLE ARENA ---
    scene.fog = new THREE.FogExp2(0x090514, 0.025);

    // Helipad Floor
    const floorGeo = new THREE.PlaneGeometry(34, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0e111a,
      roughness: 0.35,
      metalness: 0.7,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, groundY, 0);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // Helipad Circle & "H" Marking
    const heliRingGeo = new THREE.RingGeometry(4.2, 4.4, 32);
    const heliRingMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
    const heliRing = new THREE.Mesh(heliRingGeo, heliRingMat);
    heliRing.rotation.x = -Math.PI / 2;
    heliRing.position.set(0, groundY + 0.02, 0);
    group.add(heliRing);

    // Rooftop Safety Railing with Neon Accent
    const railGeo = new THREE.BoxGeometry(26, 0.9, 0.1);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9 });
    const railing = new THREE.Mesh(railGeo, railMat);
    railing.position.set(0, 0.45, -6.5);
    group.add(railing);

    const railNeonGeo = new THREE.BoxGeometry(26, 0.06, 0.06);
    const railNeonMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const railNeon = new THREE.Mesh(railNeonGeo, railNeonMat);
    railNeon.position.set(0, 0.92, -6.45);
    group.add(railNeon);

    // Giant Stylized Crimson Supermoon in Horizon
    const moonGeo = new THREE.CircleGeometry(5.5, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xff2255,
      transparent: true,
      opacity: 0.85,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(4, 8, -25);
    group.add(moon);

    // Rooftop perimeter beacon lights
    [-10, -5, 0, 5, 10].forEach((xPos) => {
      const bGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
      const bMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const beacon = new THREE.Mesh(bGeo, bMat);
      beacon.position.set(xPos, 0.2, -6.4);
      group.add(beacon);

      const bLight = new THREE.PointLight(0x00f0ff, 0.8, 4);
      bLight.position.set(xPos, 0.5, -6.0);
      group.add(bLight);
      lights.push(bLight);
    });

    animatedUpdaters.push((time) => {
      moon.position.y = 8 + Math.sin(time * 0.5) * 0.15;
    });
  }

  // Common Key Lights: Warm Key Light and Cool Fill Hemisphere Light as per Three.js directives
  const keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
  keyLight.position.set(5, 10, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  keyLight.shadow.camera.left = -12;
  keyLight.shadow.camera.right = 12;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -2;
  scene.add(keyLight);
  lights.push(keyLight);

  const hemiLight = new THREE.HemisphereLight(0x1a2b4c, 0x0a0514, 1.2);
  scene.add(hemiLight);
  lights.push(hemiLight);

  return {
    group,
    lights,
    animatedElements: {
      update: (time: number) => {
        animatedUpdaters.forEach((fn) => fn(time));
      },
    },
    groundY,
    minX,
    maxX,
    name: arenaId,
  };
}
