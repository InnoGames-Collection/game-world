/**
 * Helix Jump 3D WebGL Canvas Engine (Three.js)
 * Real-time 3D cylinder tower, extruded beveled platform sectors,
 * angular collision detection, ball physics, paint decals, and smooth camera follow.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { LevelDefinition, RingSector, FloatingScoreText } from '../types';
import { HELIX_DIMENSIONS, HELIX_PHYSICS, LEVEL_THEMES } from '../constants';
import { helixAudio } from '../audioEngine';

interface HelixJump3DCanvasProps {
  level: LevelDefinition;
  onScoreChange: (score: number) => void;
  onProgressChange: (percent: number) => void;
  onGameOver: (finalScore: number) => void;
  onLevelComplete: (finalScore: number) => void;
  isPaused: boolean;
}

const TWO_PI = Math.PI * 2;

function normalizeAngle(angle: number): number {
  let a = angle % TWO_PI;
  if (a < 0) a += TWO_PI;
  return a;
}

export const HelixJump3DCanvas: React.FC<HelixJump3DCanvasProps> = ({
  level,
  onScoreChange,
  onProgressChange,
  onGameOver,
  onLevelComplete,
  isPaused,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingScoreText[]>([]);

  // Refs for animation loop state
  const stateRef = useRef({
    score: 0,
    ballY: 0.58,
    ballVy: HELIX_PHYSICS.BOUNCE_IMPULSE,
    ballState: 'BOUNCING' as 'BOUNCING' | 'FALLING' | 'DEEP_DROP' | 'LANDING' | 'DANGER_HIT' | 'GAME_OVER' | 'LEVEL_COMPLETE',
    comboCount: 0,
    isComboSmashing: false,
    helixAngle: 0,
    helixAngularVelocity: 0,
    lastRingPassedIndex: -1,
    activePlatformY: 0,
    gameOverTriggered: false,
    levelCompleteTriggered: false,
    squashTime: 0,
    cameraShake: 0,
    flashTime: 0,
    flashingDangerRing: -1,
    flashingDangerTime: 0,
    ringsDestroyed: new Set<number>(),
  });

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Pointer drag tracking
  const dragRef = useRef({
    isDragging: false,
    lastX: 0,
    lastTime: 0,
  });

  // Spawn floating score feedback
  const addFloatingScore = useCallback((text: string, color: string = '#ffffff') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newText: FloatingScoreText = {
      id,
      text,
      x: window.innerWidth / 2 + (Math.random() * 40 - 20),
      y: window.innerHeight * 0.42 + (Math.random() * 20 - 10),
      alpha: 1,
      color,
      scale: 1,
    };
    setFloatingTexts((prev) => [...prev.slice(-4), newText]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 700);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset local simulation state for this level
    const state = stateRef.current;
    state.score = 0;
    const ring0TopY = level.rings[0].y + HELIX_DIMENSIONS.PLATFORM_THICKNESS;
    state.ballY = ring0TopY + HELIX_DIMENSIONS.BALL_RADIUS;
    state.ballVy = HELIX_PHYSICS.BOUNCE_IMPULSE;
    state.ballState = 'BOUNCING';
    state.comboCount = 0;
    state.isComboSmashing = false;
    state.helixAngle = 0;
    state.helixAngularVelocity = 0;
    state.lastRingPassedIndex = -1;
    state.activePlatformY = level.rings[0].y;
    state.gameOverTriggered = false;
    state.levelCompleteTriggered = false;
    state.squashTime = 0;
    state.ringsDestroyed.clear();

    const theme = LEVEL_THEMES[level.themeIndex] || LEVEL_THEMES[0];

    // 1. Setup Three.js Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.bgGradientTop);
    scene.fog = new THREE.FogExp2(theme.fogColor, 0.018);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 4.2, 10.5);
    camera.lookAt(0, 1.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(6, 20, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x90caf9, 0.4);
    rimLight.position.set(-8, 5, -8);
    scene.add(rimLight);

    // 3. Central Cylindrical Tower
    const towerGeo = new THREE.CylinderGeometry(
      HELIX_DIMENSIONS.TOWER_RADIUS,
      HELIX_DIMENSIONS.TOWER_RADIUS,
      HELIX_DIMENSIONS.TOWER_HEIGHT,
      48
    );
    const towerMat = new THREE.MeshStandardMaterial({
      color: theme.towerColor,
      roughness: 0.4,
      metalness: 0.1,
    });
    const towerMesh = new THREE.Mesh(towerGeo, towerMat);
    towerMesh.position.y = -HELIX_DIMENSIONS.TOWER_HEIGHT / 2 + 5;
    towerMesh.receiveShadow = true;
    scene.add(towerMesh);

    // 4. Rotating Helix Group
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    // Materials - 40 bespoke palettes with per-ring color cycling
    const safeColorList = theme.safeColors && theme.safeColors.length > 0 ? theme.safeColors : [theme.safeColor];
    const ringSafeMaterials = safeColorList.map(
      (c) =>
        new THREE.MeshStandardMaterial({
          color: c,
          roughness: 0.32,
          metalness: 0.08,
        })
    );

    const dangerBaseMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.28,
      metalness: 0.15,
      emissive: new THREE.Color(0xdc2626),
      emissiveIntensity: 0.22,
    });
    const finishDarkMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.2,
    });
    const finishLightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });

    // Track danger meshes per ring for flash reaction
    const dangerMeshesByRing: Record<number, THREE.Mesh[]> = {};

    // Helper: Create 3D Extruded Sector Geometry
    const innerR = HELIX_DIMENSIONS.TOWER_RADIUS + 0.01;
    const outerR = HELIX_DIMENSIONS.PLATFORM_OUTER_RADIUS;
    const thickness = HELIX_DIMENSIONS.PLATFORM_THICKNESS;

    function createSectorGeometry(startA: number, endA: number): THREE.BufferGeometry {
      const shape = new THREE.Shape();
      const segments = 16;
      const angleSpan = endA - startA;

      // Start at outer arc start
      shape.moveTo(Math.cos(startA) * outerR, Math.sin(startA) * outerR);
      for (let s = 1; s <= segments; s++) {
        const a = startA + (angleSpan * s) / segments;
        shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
      }
      // Line to inner arc
      for (let s = segments; s >= 0; s--) {
        const a = startA + (angleSpan * s) / segments;
        shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
      }
      shape.closePath();

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: thickness,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.03,
        bevelThickness: 0.03,
      };

      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane
      return geo;
    }

    // Build meshes for each platform ring
    const ringMeshes: Array<{ group: THREE.Group; ringIndex: number }> = [];

    level.rings.forEach((ringDef, rIdx) => {
      const ringObj = new THREE.Group();
      ringObj.position.y = ringDef.y;

      if (ringDef.isFinish) {
        // Bottom checkered finish platform
        const finishSectorsCount = 16;
        const step = TWO_PI / finishSectorsCount;
        for (let i = 0; i < finishSectorsCount; i++) {
          const sA = i * step;
          const eA = (i + 1) * step;
          const geo = createSectorGeometry(sA, eA);
          const mat = i % 2 === 0 ? finishDarkMat : finishLightMat;
          const mesh = new THREE.Mesh(geo, mat);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          ringObj.add(mesh);
        }
      } else {
        ringDef.sectors.forEach((sec: RingSector) => {
          if (sec.type === 'gap') return; // Empty open space
          const geo = createSectorGeometry(sec.startAngle, sec.endAngle);
          let mesh: THREE.Mesh;
          if (sec.type === 'danger') {
            const meshMat = dangerBaseMat.clone();
            mesh = new THREE.Mesh(geo, meshMat);
            if (!dangerMeshesByRing[rIdx]) dangerMeshesByRing[rIdx] = [];
            dangerMeshesByRing[rIdx].push(mesh);
          } else {
            const mat = ringSafeMaterials[rIdx % ringSafeMaterials.length];
            mesh = new THREE.Mesh(geo, mat);
          }
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          ringObj.add(mesh);
        });
      }

      helixGroup.add(ringObj);
      ringMeshes.push({ group: ringObj, ringIndex: rIdx });
    });

    // 5. 3D Ball
    const ballGeo = new THREE.SphereGeometry(HELIX_DIMENSIONS.BALL_RADIUS, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      color: theme.ballColor,
      roughness: 0.2,
      metalness: 0.25,
      emissive: new THREE.Color(theme.ballColor),
      emissiveIntensity: 0.1,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.position.set(HELIX_DIMENSIONS.BALL_X_OFFSET, state.ballY, HELIX_DIMENSIONS.BALL_Z_OFFSET);
    ballMesh.castShadow = true;
    scene.add(ballMesh);

    // Impact Flash Ring for danger/landing visual feedback
    const flashGeo = new THREE.RingGeometry(0.08, 0.55, 32);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.rotation.x = -Math.PI / 2;
    scene.add(flashMesh);

    // Spark Debris Particles for Red failure reaction
    interface SparkParticle {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      rotVx: number;
      rotVy: number;
      life: number;
      maxLife: number;
    }
    const sparkParticles: SparkParticle[] = [];
    const sparkGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const sparkColors = [0xef4444, 0xf97316, 0xfbbf24, 0xffffff, 0xdc2626];

    // Ball contact shadow on platform
    const shadowGeo = new THREE.CircleGeometry(HELIX_DIMENSIONS.BALL_RADIUS * 1.1, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
    });
    const ballShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    ballShadowMesh.rotation.x = -Math.PI / 2;
    scene.add(ballShadowMesh);

    // Ball combo fire trail particles
    const particleCount = 28;
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(particleCount * 3);
    const trailAlphas = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      trailPositions[i * 3] = HELIX_DIMENSIONS.BALL_X_OFFSET;
      trailPositions[i * 3 + 1] = state.ballY;
      trailPositions[i * 3 + 2] = HELIX_DIMENSIONS.BALL_Z_OFFSET;
      trailAlphas[i] = 0;
    }
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.25,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    scene.add(trailPoints);

    // Paint Splatter marks left on safe platform landings
    const splattersGroup = new THREE.Group();
    helixGroup.add(splattersGroup);

    function addPaintSplatter(worldY: number, currentHelixAngle: number) {
      // Find ring closest to worldY
      const ring = level.rings.find((r) => Math.abs(r.y - worldY) < 0.5);
      if (!ring) return;

      const splatterGeo = new THREE.CircleGeometry(0.24 + Math.random() * 0.1, 16);
      const splatterMat = new THREE.MeshBasicMaterial({
        color: theme.ballColor,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const splatter = new THREE.Mesh(splatterGeo, splatterMat);
      splatter.rotation.x = -Math.PI / 2;
      // Position relative to the rotating helix (ball at front is angle 1.5 * PI)
      const contactAngle = normalizeAngle(1.5 * Math.PI - currentHelixAngle);
      const radius = HELIX_DIMENSIONS.BALL_Z_OFFSET;
      splatter.position.set(
        Math.cos(contactAngle) * radius,
        ring.y + HELIX_DIMENSIONS.PLATFORM_THICKNESS + 0.02,
        -Math.sin(contactAngle) * radius
      );
      splattersGroup.add(splatter);

      // Keep maximum 25 splatters
      if (splattersGroup.children.length > 25) {
        splattersGroup.remove(splattersGroup.children[0]);
      }
    }

    // Immediately trigger initial automatic bounce on the first safe platform
    helixAudio.playBounce();
    addPaintSplatter(level.rings[0].y, 0);

    // Shatter ring pieces during power drop
    function shatterRing(ringIndex: number) {
      const ringObj = ringMeshes.find((m) => m.ringIndex === ringIndex);
      if (!ringObj || state.ringsDestroyed.has(ringIndex)) return;
      state.ringsDestroyed.add(ringIndex);

      helixAudio.playComboSmash();
      addFloatingScore(`+50 POWER SMASH!`, '#f59e0b');
      state.score += 50;
      onScoreChange(state.score);

      // Animate fragments outward
      const fragments = ringObj.group.children;
      fragments.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const angle = (i / fragments.length) * TWO_PI;
        const speed = 4 + Math.random() * 3;
        const dir = new THREE.Vector3(Math.cos(angle) * speed, (Math.random() - 0.5) * 2, Math.sin(angle) * speed);

        const startTime = performance.now();
        const anim = () => {
          const elapsed = (performance.now() - startTime) / 1000;
          if (elapsed < 0.5) {
            mesh.position.addScaledVector(dir, 0.03);
            mesh.rotation.x += 0.1;
            mesh.rotation.y += 0.1;
            requestAnimationFrame(anim);
          } else {
            mesh.visible = false;
          }
        };
        requestAnimationFrame(anim);
      });
    }

    // 6. Pointer Drag Input for Continuous Smooth Rotation
    const onPointerDown = (e: PointerEvent) => {
      if (isPausedRef.current || state.gameOverTriggered || state.levelCompleteTriggered) return;
      container.setPointerCapture(e.pointerId);
      dragRef.current.isDragging = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastTime = performance.now();
      state.helixAngularVelocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.isDragging || isPausedRef.current) return;
      const now = performance.now();
      const deltaX = e.clientX - dragRef.current.lastX;
      const dt = Math.max(1, now - dragRef.current.lastTime);

      // Rotate helix structure: drag left -> CCW (rotate left), drag right -> CW (rotate right)
      const rotDelta = deltaX * HELIX_PHYSICS.ROTATION_SENSITIVITY;
      state.helixAngle += rotDelta;
      state.helixAngularVelocity = (rotDelta / dt) * 16; // approximate per-frame velocity

      dragRef.current.lastX = e.clientX;
      dragRef.current.lastTime = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (dragRef.current.isDragging) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        dragRef.current.isDragging = false;
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    // 7. Physics Simulation & Animation Loop (60 FPS)
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.max(0.001, Math.min(Number.isFinite(rawDt) && rawDt > 0 ? rawDt : 0.016, 0.05)); // robust clamped delta time

      if (isPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      // Smooth inertia when not dragging
      if (!dragRef.current.isDragging && Math.abs(state.helixAngularVelocity) > 0.0001) {
        state.helixAngle += state.helixAngularVelocity;
        state.helixAngularVelocity *= HELIX_PHYSICS.ROTATION_DAMPING;
      }
      helixGroup.rotation.y = state.helixAngle;

      // Ball Physics Simulation (substepped for precise anti-tunneling)
      if (!state.gameOverTriggered && !state.levelCompleteTriggered) {
        const MAX_SUBSTEP = 0.012; // 12ms max per sub-step ensures ball never skips thin platforms
        const numSteps = Math.max(1, Math.ceil(dt / MAX_SUBSTEP));
        const subDt = dt / numSteps;

        for (let s = 0; s < numSteps; s++) {
          if (state.gameOverTriggered || state.levelCompleteTriggered) break;

          if (state.ballVy > 0) {
            // Ball is moving upward in bounce
            state.ballState = 'BOUNCING';
            state.ballVy += HELIX_PHYSICS.GRAVITY * subDt;
            state.ballY += state.ballVy * subDt;
            if (state.ballVy <= 0) {
              state.ballState = state.comboCount >= 3 ? 'DEEP_DROP' : 'FALLING';
            }
          } else {
            // Ball is falling downward
            state.ballState = state.comboCount >= 3 ? 'DEEP_DROP' : 'FALLING';
            state.ballVy += HELIX_PHYSICS.GRAVITY * subDt;
            if (state.ballVy < HELIX_PHYSICS.TERMINAL_VELOCITY) {
              state.ballVy = HELIX_PHYSICS.TERMINAL_VELOCITY;
            }

            const nextBallY = state.ballY + state.ballVy * subDt;
            const previousBallBottom = state.ballY - HELIX_DIMENSIONS.BALL_RADIUS;
            const currentBallBottom = nextBallY - HELIX_DIMENSIONS.BALL_RADIUS;

            // Current angular position of ball relative to helix local coordinate space
            // Front-facing ball at world (X=0, Z=+R) corresponds to local sector angle 1.5 * PI
            const centerAngle = normalizeAngle(1.5 * Math.PI - state.helixAngle);
            // Angular contact footprint of the ball (ball radius / helix cylinder radius)
            const leftAngle = normalizeAngle(centerAngle - 0.08);
            const rightAngle = normalizeAngle(centerAngle + 0.08);

            let collidedThisStep = false;

            for (let rIdx = 0; rIdx < level.rings.length; rIdx++) {
              if (state.ringsDestroyed.has(rIdx)) continue;
              const ring = level.rings[rIdx];
              const platformTop = ring.y + HELIX_DIMENSIONS.PLATFORM_THICKNESS;
              const platformBottom = ring.y;

              // FIX 1 & 2: Continuous Swept-Slab Collision Test
              // Detect if the ball bottom swept across or entered the vertical interval occupied by the platform slab [platformBottom, platformTop]
              const crossedTopDownward = previousBallBottom >= (platformTop - 0.04) && currentBallBottom <= platformTop && previousBallBottom >= platformBottom;
              const insideSlab = previousBallBottom <= platformTop && previousBallBottom >= platformBottom && currentBallBottom <= platformTop;

              if (crossedTopDownward || insideSlab) {
                // Determine sector underneath ball using footprint
                let sectorUnderBall: RingSector | null = null;
                let touchesDanger = false;

                if (ring.isFinish) {
                  sectorUnderBall = { startAngle: 0, endAngle: TWO_PI, type: 'safe' };
                } else {
                  const centerIndex = Math.min(11, Math.floor((centerAngle / TWO_PI) * 12));
                  const leftIndex = Math.min(11, Math.floor((leftAngle / TWO_PI) * 12));
                  const rightIndex = Math.min(11, Math.floor((rightAngle / TWO_PI) * 12));

                  const centerSector = ring.sectors[centerIndex];
                  const leftSector = ring.sectors[leftIndex];
                  const rightSector = ring.sectors[rightIndex];

                  sectorUnderBall = centerSector;
                  if (centerSector.type === 'danger' || leftSector.type === 'danger' || rightSector.type === 'danger') {
                    touchesDanger = true;
                  }
                }

                if (!sectorUnderBall || sectorUnderBall.type === 'gap') {
                  // FIX 5: PASSED THROUGH GAP - ALLOW BALL TO CONTINUE FALLING
                  if (state.lastRingPassedIndex < rIdx) {
                    state.lastRingPassedIndex = rIdx;
                    state.comboCount++;
                    if (rIdx + 1 < level.rings.length) {
                      state.activePlatformY = level.rings[rIdx + 1].y;
                    }

                    const bonus = 10 * state.comboCount;
                    state.score += bonus;
                    onScoreChange(state.score);

                    const progress = Math.min(100, Math.round(((rIdx + 1) / level.rings.length) * 100));
                    onProgressChange(progress);

                    if (state.comboCount >= 3) {
                      state.isComboSmashing = true;
                      addFloatingScore(`x${state.comboCount} COMBO!`, '#f59e0b');
                    } else {
                      addFloatingScore(`+${bonus}`, '#38bdf8');
                    }

                    helixAudio.playGapPass(state.comboCount);
                  }
                  // Continue loop to check deeper platforms in this sub-step
                } else if (touchesDanger || sectorUnderBall.type === 'danger') {
                  // FIX 6: HIT DANGER SECTOR (RED FAILURE REACTION)
                  if (state.isComboSmashing) {
                    // Power smash through danger platform with 3+ combo!
                    shatterRing(rIdx);
                    state.isComboSmashing = false;
                    state.comboCount = 0;
                    if (rIdx + 1 < level.rings.length) {
                      state.activePlatformY = level.rings[rIdx + 1].y;
                    }
                  } else {
                    // AUTHORITATIVE RED DANGER FAILURE REACTION
                    state.ballState = 'DANGER_HIT';
                    state.gameOverTriggered = true;
                    collidedThisStep = true;

                    // 1. Precise surface contact & immediate upward recoil bounce
                    state.ballY = platformTop + HELIX_DIMENSIONS.BALL_RADIUS;
                    state.ballVy = 3.8; // visible bounce recoil impulse

                    helixAudio.playDangerCrash();

                    // Optional mobile haptics
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate([40, 30, 80]);
                    }

                    // 2. Ball impact squash - ball remains completely visible!
                    ballMesh.scale.set(1.45, 0.42, 1.45);

                    // 3. Impact Flash Ring at exact point of contact
                    flashMesh.position.set(
                      HELIX_DIMENSIONS.BALL_X_OFFSET,
                      platformTop + 0.02,
                      HELIX_DIMENSIONS.BALL_Z_OFFSET
                    );
                    flashMesh.scale.set(1, 1, 1);
                    flashMat.opacity = 1.0;
                    state.flashTime = 0.22;

                    // 4. Highlight & Flash the Red Danger Platform Sector
                    const dMeshes = dangerMeshesByRing[rIdx];
                    if (dMeshes) {
                      dMeshes.forEach((dm) => {
                        const mat = dm.material as THREE.MeshStandardMaterial;
                        mat.emissive.setHex(0xff2222);
                        mat.emissiveIntensity = 2.4;
                      });
                      state.flashingDangerRing = rIdx;
                      state.flashingDangerTime = 0.35;
                    }

                    // 5. Spawn 28 bursting 3D spark debris particles
                    for (let i = 0; i < 28; i++) {
                      const pColor = sparkColors[i % sparkColors.length];
                      const pMat = new THREE.MeshBasicMaterial({ color: pColor });
                      const pMesh = new THREE.Mesh(sparkGeo, pMat);
                      pMesh.position.set(
                        HELIX_DIMENSIONS.BALL_X_OFFSET,
                        platformTop + 0.05,
                        HELIX_DIMENSIONS.BALL_Z_OFFSET
                      );
                      scene.add(pMesh);

                      const angle = Math.random() * Math.PI * 2;
                      const speed = 2.0 + Math.random() * 5.0;
                      const vy = 2.0 + Math.random() * 4.5;

                      sparkParticles.push({
                        mesh: pMesh,
                        vx: Math.cos(angle) * speed,
                        vy: vy,
                        vz: Math.sin(angle) * speed,
                        rotVx: (Math.random() - 0.5) * 10,
                        rotVy: (Math.random() - 0.5) * 10,
                        life: 0.35 + Math.random() * 0.25,
                        maxLife: 0.6,
                      });
                    }

                    // 6. Camera shake
                    state.cameraShake = 0.26;

                    // 7. Transition to failure after natural recoil, tumble, and fall (680ms)
                    setTimeout(() => {
                      onGameOver(state.score);
                    }, 680);
                    break;
                  }
                } else {
                  // FIX 3 & 4: HIT SAFE SECTOR - CORRECT LANDING RESOLUTION & AUTOMATIC BOUNCE
                  if (ring.isFinish) {
                    // LEVEL COMPLETE!
                    state.ballState = 'LEVEL_COMPLETE';
                    state.levelCompleteTriggered = true;
                    state.ballY = platformTop + HELIX_DIMENSIONS.BALL_RADIUS;
                    state.ballVy = HELIX_PHYSICS.BOUNCE_IMPULSE * 0.8;
                    collidedThisStep = true;
                    onProgressChange(100);
                    helixAudio.playLevelComplete();

                    setTimeout(() => {
                      onLevelComplete(state.score);
                    }, 750);
                    break;
                  } else if (state.isComboSmashing) {
                    // POWER SMASH THROUGH SAFE PLATFORM!
                    shatterRing(rIdx);
                    state.isComboSmashing = false;
                    state.comboCount = 0;
                    if (rIdx + 1 < level.rings.length) {
                      state.activePlatformY = level.rings[rIdx + 1].y;
                    }
                  } else {
                    // NORMAL SAFE AUTOMATIC BOUNCE!
                    state.ballState = 'BOUNCING';
                    // 1. Position ball exactly on top of platform surface (no penetration, no floating)
                    state.ballY = platformTop + HELIX_DIMENSIONS.BALL_RADIUS;
                    // 2. Immediately apply upward bounce impulse for the next continuous bounce
                    state.ballVy = HELIX_PHYSICS.BOUNCE_IMPULSE;
                    collidedThisStep = true;
                    state.comboCount = 0;
                    state.isComboSmashing = false;
                    state.squashTime = 0.08; // trigger contact compression squash
                    state.activePlatformY = ring.y;

                    state.score += 2;
                    onScoreChange(state.score);
                    helixAudio.playBounce();
                    addPaintSplatter(ring.y, state.helixAngle);
                    break;
                  }
                }
              }
            }

            if (!collidedThisStep && !state.gameOverTriggered && !state.levelCompleteTriggered) {
              state.ballY = nextBallY;
            }
          }
        }

        // Safety check: failure boundary below the lowest platform
        const lowestRing = level.rings[level.rings.length - 1];
        const failureBoundary = lowestRing.y - 8.0;
        if (state.ballY < failureBoundary && !state.gameOverTriggered && !state.levelCompleteTriggered) {
          state.gameOverTriggered = true;
          state.ballVy = 0;
          onGameOver(state.score);
        }
      }

      // Update Ball Mesh Position & Squash/Stretch Animation
      ballMesh.position.y = state.ballY;
      if (state.squashTime > 0) {
        state.squashTime -= dt;
        const progress = Math.max(0, state.squashTime / 0.08);
        const squashY = 1.0 - 0.22 * progress;
        const expandXZ = 1.0 + 0.14 * progress;
        ballMesh.scale.set(expandXZ, squashY, expandXZ);
      } else if (!state.gameOverTriggered) {
        const stretchFactor = Math.min(1.22, Math.max(0.88, 1 + Math.abs(state.ballVy) * 0.012));
        const squashFactor = 1 / Math.sqrt(stretchFactor);
        ballMesh.scale.set(squashFactor, stretchFactor, squashFactor);
      }

      // Update Contact Shadow Position on platform directly below ball
      let surfaceBelowBallY = level.rings[level.rings.length - 1].y + HELIX_DIMENSIONS.PLATFORM_THICKNESS;
      for (let r = 0; r < level.rings.length; r++) {
        const topY = level.rings[r].y + HELIX_DIMENSIONS.PLATFORM_THICKNESS;
        if (topY <= state.ballY + 0.05 && !state.ringsDestroyed.has(r)) {
          surfaceBelowBallY = topY;
          break;
        }
      }
      ballShadowMesh.position.set(
        HELIX_DIMENSIONS.BALL_X_OFFSET,
        surfaceBelowBallY + 0.015,
        HELIX_DIMENSIONS.BALL_Z_OFFSET
      );
      const distToSurface = Math.max(0, state.ballY - (surfaceBelowBallY + HELIX_DIMENSIONS.BALL_RADIUS));
      const shadowScale = Math.max(0.35, 1.0 - distToSurface * 0.22);
      ballShadowMesh.scale.set(shadowScale, shadowScale, 1);
      shadowMat.opacity = Math.max(0.06, 0.4 - distToSurface * 0.15);

      // Update Fire Trail Particles during deep drop combo smash
      if (state.isComboSmashing) {
        const positions = trailGeo.attributes.position.array as Float32Array;
        for (let i = particleCount - 1; i > 0; i--) {
          positions[i * 3] = positions[(i - 1) * 3] + (Math.random() - 0.5) * 0.06;
          positions[i * 3 + 1] = positions[(i - 1) * 3 + 1] + 0.12;
          positions[i * 3 + 2] = positions[(i - 1) * 3 + 2] + (Math.random() - 0.5) * 0.06;
        }
        positions[0] = HELIX_DIMENSIONS.BALL_X_OFFSET + (Math.random() - 0.5) * 0.06;
        positions[1] = state.ballY + HELIX_DIMENSIONS.BALL_RADIUS;
        positions[2] = HELIX_DIMENSIONS.BALL_Z_OFFSET + (Math.random() - 0.5) * 0.06;
        trailGeo.attributes.position.needsUpdate = true;
        trailMat.opacity = 0.85;
      } else {
        trailMat.opacity = Math.max(0, trailMat.opacity - dt * 4);
      }

      // Update Spark Debris Particles
      for (let i = sparkParticles.length - 1; i >= 0; i--) {
        const p = sparkParticles[i];
        p.life -= dt;
        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
          sparkParticles.splice(i, 1);
        } else {
          p.vy += HELIX_PHYSICS.GRAVITY * 0.8 * dt;
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          p.mesh.rotation.x += p.rotVx * dt;
          p.mesh.rotation.y += p.rotVy * dt;
          const s = Math.max(0.01, (p.life / p.maxLife) * 1.3);
          p.mesh.scale.set(s, s, s);
        }
      }

      // Update Impact Flash Ring
      if (state.flashTime > 0) {
        state.flashTime -= dt;
        const progress = 1.0 - Math.max(0, state.flashTime / 0.22);
        const scale = 1.0 + progress * 3.5;
        flashMesh.scale.set(scale, scale, 1);
        flashMat.opacity = Math.max(0, (1.0 - progress) * 0.9);
      } else {
        flashMat.opacity = 0;
      }

      // Decay Flashing Danger Platform Sector Emissive
      if (state.flashingDangerTime > 0) {
        state.flashingDangerTime -= dt;
        const progress = Math.max(0, state.flashingDangerTime / 0.35);
        const dMeshes = dangerMeshesByRing[state.flashingDangerRing];
        if (dMeshes) {
          dMeshes.forEach((dm) => {
            (dm.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.22 + progress * 2.18;
          });
        }
      }

      // If DANGER_HIT, simulate ball gravity recoil & tumble while ball remains fully visible
      if (state.gameOverTriggered && state.ballState === 'DANGER_HIT') {
        state.ballVy += HELIX_PHYSICS.GRAVITY * dt;
        state.ballY += state.ballVy * dt;
        ballMesh.position.y = state.ballY;
        ballMesh.rotation.x += 6 * dt;
        ballMesh.rotation.z += 4 * dt;
        // Ball returns from squash to normal sphere
        ballMesh.scale.x += (1.0 - ballMesh.scale.x) * 0.12;
        ballMesh.scale.y += (1.0 - ballMesh.scale.y) * 0.12;
        ballMesh.scale.z += (1.0 - ballMesh.scale.z) * 0.12;
      }

      // Camera Shake Effect
      if (state.cameraShake > 0) {
        camera.position.x = (Math.random() - 0.5) * state.cameraShake;
        camera.position.z = 10.5 + (Math.random() - 0.5) * state.cameraShake;
        state.cameraShake = Math.max(0, state.cameraShake - dt * 1.5);
      } else {
        camera.position.x = 0;
        camera.position.z = 10.5;
      }

      // FIX 8: Smooth Camera Follow focused on active platform level
      // Active platform remains visually stable during normal bouncing.
      // When the ball drops below the platform level through a gap, camera smoothly descends with it.
      const targetCamY = Math.min(state.activePlatformY + 4.2, state.ballY + 3.6);
      camera.position.y += (targetCamY - camera.position.y) * 0.10;
      camera.lookAt(0, camera.position.y - 2.4, 0);

      // Update Dir Light following camera
      dirLight.position.y = camera.position.y + 12;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Responsive Canvas Resize Listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [level, onScoreChange, onProgressChange, onGameOver, onLevelComplete, addFloatingScore]);

  return (
    <div
      ref={containerRef}
      id="helix-3d-canvas-container"
      className="relative w-full h-full overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      {/* Floating combo & score feedback */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-black text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-out fade-out slide-out-to-top-6 duration-700 pointer-events-none"
            style={{
              left: `${f.x}px`,
              top: `${f.y}px`,
              color: f.color,
            }}
          >
            {f.text}
          </div>
        ))}
      </div>
    </div>
  );
};
