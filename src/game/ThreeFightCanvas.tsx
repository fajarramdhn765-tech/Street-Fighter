import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ArenaId, FighterId } from '../types/game';
import { ArenaEnvironment, buildArena } from './arenas';
import { CombatEngine, CombatInputs } from './combatEngine';
import {
  createProceduralFighter,
  FighterRig,
  updateFighterAnimation,
} from './proceduralModels';

interface ThreeFightCanvasProps {
  combatEngine: CombatEngine;
  arenaId: ArenaId;
  playerInputsRef: React.MutableRefObject<CombatInputs>;
  onStateUpdate: () => void;
}

export const ThreeFightCanvas: React.FC<ThreeFightCanvasProps> = ({
  combatEngine,
  arenaId,
  playerInputsRef,
  onStateUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06060c);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.8, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Procedural Studio Reflection (RoomEnvironment)
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback if WebGL environment fails
    }

    // 4. Build Arena
    const arena: ArenaEnvironment = buildArena(arenaId, scene);

    // 5. Build 3D Articulated Fighter Rigs
    const playerRig: FighterRig = createProceduralFighter(combatEngine.player.config);
    scene.add(playerRig.group);

    const cpuRig: FighterRig = createProceduralFighter(combatEngine.cpu.config);
    scene.add(cpuRig.group);

    // 6. Visual Effects 3D Pool
    const effectGroup = new THREE.Group();
    scene.add(effectGroup);

    const effectMeshes: Map<number, THREE.Mesh> = new Map();
    const projectileMeshes: Map<number, THREE.Group> = new Map();

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 8. Game Loop with Delta Time and Software WebGL pacing
    let frameId = 0;
    let lastTime = performance.now();
    let totalTime = 0;
    let uiUpdateCounter = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 60);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05); // clamp delta time
      totalTime += dt;

      // Update Combat Engine Physics & Logic
      combatEngine.update(dt, playerInputsRef.current);

      // Notify React HUD periodically (throttled to ~30-60hz to avoid React re-render choke)
      uiUpdateCounter++;
      if (uiUpdateCounter % 2 === 0) {
        onStateUpdate();
      }

      // Update Arena Animated Elements (lights, cars, lasers)
      arena.animatedElements.update(totalTime);

      // Update 3D Fighter Transforms & Orientations
      // Player
      playerRig.group.position.set(combatEngine.player.x, combatEngine.player.y, combatEngine.player.z);
      playerRig.group.rotation.y = combatEngine.player.facing === 1 ? Math.PI / 2 : -Math.PI / 2;
      updateFighterAnimation(
        playerRig,
        combatEngine.player.state,
        combatEngine.player.stateTimer,
        totalTime,
        combatEngine.player.id,
        combatEngine.player.isBlocking
      );

      // CPU
      cpuRig.group.position.set(combatEngine.cpu.x, combatEngine.cpu.y, combatEngine.cpu.z);
      cpuRig.group.rotation.y = combatEngine.cpu.facing === 1 ? Math.PI / 2 : -Math.PI / 2;
      updateFighterAnimation(
        cpuRig,
        combatEngine.cpu.state,
        combatEngine.cpu.stateTimer,
        totalTime,
        combatEngine.cpu.id,
        combatEngine.cpu.isBlocking
      );

      // Dynamic 3D Camera tracking the two fighters with spring damping
      const midX = (combatEngine.player.x + combatEngine.cpu.x) / 2;
      const dist = Math.abs(combatEngine.player.x - combatEngine.cpu.x);
      const targetCamZ = Math.max(6.8, Math.min(10.5, 5.0 + dist * 0.65));
      const targetCamY = 2.2 + Math.max(0, (combatEngine.player.y + combatEngine.cpu.y) * 0.4);

      // Camera Shake
      const shakeX = (Math.random() - 0.5) * combatEngine.cameraShake * 0.8;
      const shakeY = (Math.random() - 0.5) * combatEngine.cameraShake * 0.8;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, midX + shakeX, 8, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY + shakeY, 8, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 8, dt);
      camera.lookAt(midX, 1.6, 0);

      // Render Visual Effects (Impact Sparks, Parry Rings, Blast Waves)
      const currentEffectIds = new Set(combatEngine.effects.map((e) => e.id));
      // Remove dead effect meshes
      effectMeshes.forEach((mesh, id) => {
        if (!currentEffectIds.has(id)) {
          effectGroup.remove(mesh);
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
          effectMeshes.delete(id);
        }
      });

      // Update / Add effect meshes
      combatEngine.effects.forEach((ef) => {
        let mesh = effectMeshes.get(ef.id);
        if (!mesh) {
          const progress = ef.life / ef.maxLife;
          const geo =
            ef.type === 'parry' || ef.type === 'block'
              ? new THREE.RingGeometry(0.3, 0.5, 16)
              : new THREE.SphereGeometry(0.4, 8, 8);
          const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(ef.color),
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
          });
          mesh = new THREE.Mesh(geo, mat);
          effectGroup.add(mesh);
          effectMeshes.set(ef.id, mesh);
        }

        const p = ef.life / ef.maxLife;
        mesh.position.set(ef.x, ef.y, ef.z + 0.1);
        const s = ef.scale * (1 + p * 1.5);
        mesh.scale.set(s, s, s);
        (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - p);
      });

      // Render Projectiles (Fireballs, Plasma Orbs)
      const currentProjIds = new Set(combatEngine.projectiles.map((p) => p.id));
      projectileMeshes.forEach((pGroup, id) => {
        if (!currentProjIds.has(id)) {
          scene.remove(pGroup);
          projectileMeshes.delete(id);
        }
      });

      combatEngine.projectiles.forEach((p) => {
        let pGroup = projectileMeshes.get(p.id);
        if (!pGroup) {
          pGroup = new THREE.Group();
          const coreGeo = new THREE.SphereGeometry(0.28, 12, 12);
          const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color) });
          const coreMesh = new THREE.Mesh(coreGeo, coreMat);
          pGroup.add(coreMesh);

          // Outer aura ring
          const ringGeo = new THREE.RingGeometry(0.32, 0.45, 16);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          pGroup.add(ring);

          const light = new THREE.PointLight(new THREE.Color(p.color), 2.0, 5);
          pGroup.add(light);

          scene.add(pGroup);
          projectileMeshes.set(p.id, pGroup);
        }

        pGroup.position.set(p.x, p.y, 0);
        pGroup.rotation.z += dt * 15;
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);

      // Clean up Three.js resources
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [arenaId, combatEngine]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ touchAction: 'none' }}
    />
  );
};
