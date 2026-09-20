/**
 * Hill Climb 3D - Production 3D Mountain Hill-Driving Game
 * Fully Integrated with TelePlus Tournaments (Max 400 PTS)
 * 
 * Progressive Endless Difficulty & Continuous High-Score Competition
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Fuel,
  Coins,
  Pause,
  Award,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Layers,
} from 'lucide-react';
import {
  GameState,
  CrashReason,
  Collectible3D,
  VehiclePhysics3D,
  HillRiderStorage,
  HillClimbLevelConfig,
  PlayerLevelProgress,
  HillClimbSettingsState,
} from './types';
import {
  createTerrainMesh,
  createEnvironmentProps,
  createMountainRange,
  generateCollectiblesChunk,
  createCoinMesh,
  createFuelMesh,
  getTerrainElevation,
  getTerrainSlopeAt,
  resetSplineToDailySeed,
  resetSplineForLevel,
} from './terrain3D';
import {
  createVehicle3D,
  updateVehicleMeshTransform,
  VehicleMeshRig,
} from './vehicle3D';
import {
  createInitialPhysicsState,
  stepVehiclePhysics,
  PhysicsControls,
} from './physics3D';
import { HillRiderAudio } from './audio';
import { HILL_CLIMB_LEVELS } from './levels';
import { HillClimbStorage } from './levelStorage';
import { HillClimbMenu } from './components/HillClimbMenu';
import { HillClimbLevelSelect } from './components/HillClimbLevelSelect';
import { HillClimbLeaderboard } from './components/HillClimbLeaderboard';
import { HillClimbSettings } from './components/HillClimbSettings';
import { HillClimbVictoryModal } from './components/HillClimbVictoryModal';
import { HillClimbFailureModal } from './components/HillClimbFailureModal';

const getLevelConfig = (lvl: number): HillClimbLevelConfig => {
  return HILL_CLIMB_LEVELS.find((l) => l.levelNumber === lvl) || HILL_CLIMB_LEVELS[0];
};

interface HillRiderGameProps {
  game?: any;
  profile?: any;
  onGameOver?: (score: number, durationSeconds: number) => void;
  onScoreSubmit?: (score: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY = 'teleplus_hill_climb_3d_save';
const CHUNK_SIZE = 250;
const TOTAL_SESSION_SECONDS = 120; // Exactly 2 Minutes (120 seconds)

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.max(0, Math.floor(seconds % 60));
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface ActiveChunk {
  index: number;
  terrainGroup: THREE.Group;
  propsGroup: THREE.Group;
  mountainsGroup: THREE.Group;
  itemIds: string[];
}

export const HillRiderGame: React.FC<HillRiderGameProps> = ({
  game,
  profile,
  onGameOver,
  onScoreSubmit,
  onExit,
  isAudioEnabled = true,
}) => {
  // Mount element for Three.js WebGL canvas
  const mountRef = useRef<HTMLDivElement>(null);

  // Player and Level Progression Persistence
  const playerId = HillClimbStorage.getCleanPlayerId(profile);
  const [progress, setProgress] = useState<PlayerLevelProgress>(() => {
    return HillClimbStorage.getPlayerProgress(playerId);
  });
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const currentLevelConfigRef = useRef<HillClimbLevelConfig>(getLevelConfig(1));

  // Audio & Settings State
  const [soundSettings, setSoundSettings] = useState<HillClimbSettingsState>(() => {
    const s = HillClimbStorage.getSettings();
    if (isAudioEnabled === false) {
      s.soundEnabled = false;
      s.engineSound = false;
    }
    return s;
  });

  // -------------------------------------------------------------
  // Game & UI States (Defaults to 'menu' before gameplay starts)
  // -------------------------------------------------------------
  const [status, setStatus] = useState<GameState>('menu');
  const [countdownText, setCountdownText] = useState<string>('3');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundSettings.soundEnabled);
  const [crashReason, setCrashReason] = useState<CrashReason>('flipped');

  // Live HUD Metrics (Updated from animation loop throttled)
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [coinsCount, setCoinsCount] = useState<number>(0);
  const [fuelPercent, setFuelPercent] = useState<number>(100);
  const [normalizedScore, setNormalizedScore] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [isOverturned, setIsOverturned] = useState<boolean>(false);
  const [isGasActive, setIsGasActive] = useState<boolean>(false);
  const [isBrakeActive, setIsBrakeActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_SESSION_SECONDS);

  // Run Results for modals
  const [lastRunStats, setLastRunStats] = useState<{
    score: number;
    distance: number;
    targetDistance: number;
    stars: number;
    coins: number;
    timeTaken: number;
    isNewRecord: boolean;
    reason?: CrashReason;
    unlockedNextLevel: boolean;
  }>({
    score: 0,
    distance: 0,
    targetDistance: 500,
    stars: 0,
    coins: 0,
    timeTaken: 0,
    isNewRecord: false,
    unlockedNextLevel: false,
  });

  // Persistence (best runs, coins, total games)
  const [userData, setUserData] = useState<HillRiderStorage>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return { coins: 0, bestDistance: 0, bestScore: 0, totalRuns: 0 };
  });

  // Keep progress in sync if player changes
  useEffect(() => {
    setProgress(HillClimbStorage.getPlayerProgress(playerId));
  }, [playerId]);

  // -------------------------------------------------------------
  // Engine Refs (Physics, Controls, Three.js Scene Entities)
  // -------------------------------------------------------------
  const controlsRef = useRef<PhysicsControls>({ gas: false, brake: false });
  const physicsStateRef = useRef<VehiclePhysics3D>(createInitialPhysicsState());
  const collectiblesRef = useRef<Collectible3D[]>([]);
  const collectibleMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const activeChunksRef = useRef<Map<number, ActiveChunk>>(new Map());
  const coinTemplateRef = useRef<THREE.Group | null>(null);
  const fuelTemplateRef = useRef<THREE.Group | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleRigRef = useRef<VehicleMeshRig | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Save persistent data
  const saveUserData = useCallback((newStats: Partial<HillRiderStorage>) => {
    setUserData((prev) => {
      const updated = { ...prev, ...newStats };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // -------------------------------------------------------------
  // Web Audio System & Sound State
  // -------------------------------------------------------------
  const initAudio = useCallback(() => {
    HillRiderAudio.init();
  }, []);

  useEffect(() => {
    HillRiderAudio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Clean up all audio on unmount
  useEffect(() => {
    return () => {
      HillRiderAudio.stopAll();
    };
  }, []);

  // -------------------------------------------------------------
  // Dynamic Chunk Management (Seamless Endless Terrain & Performance)
  // -------------------------------------------------------------
  const loadChunk = useCallback((chunkIndex: number) => {
    const scene = sceneRef.current;
    if (!scene || activeChunksRef.current.has(chunkIndex)) return;

    const startX = chunkIndex * CHUNK_SIZE;
    const endX = (chunkIndex + 1) * CHUNK_SIZE;

    const terrainGroup = createTerrainMesh(startX, endX);
    const propsGroup = createEnvironmentProps(startX, endX);
    const mountainsGroup = createMountainRange(startX, endX);

    scene.add(terrainGroup);
    scene.add(propsGroup);
    scene.add(mountainsGroup);

    if (!coinTemplateRef.current) coinTemplateRef.current = createCoinMesh();
    if (!fuelTemplateRef.current) fuelTemplateRef.current = createFuelMesh();

    const chunkItems = generateCollectiblesChunk(startX, endX);
    const itemIds: string[] = [];

    chunkItems.forEach((item) => {
      collectiblesRef.current.push(item);
      itemIds.push(item.id);

      const template = item.type === 'coin' ? coinTemplateRef.current! : fuelTemplateRef.current!;
      const mesh = template.clone();
      mesh.position.set(item.x, item.y, item.z);
      scene.add(mesh);
      collectibleMeshesRef.current.set(item.id, mesh);
    });

    activeChunksRef.current.set(chunkIndex, {
      index: chunkIndex,
      terrainGroup,
      propsGroup,
      mountainsGroup,
      itemIds,
    });
  }, []);

  const unloadChunk = useCallback((chunkIndex: number) => {
    const scene = sceneRef.current;
    const chunk = activeChunksRef.current.get(chunkIndex);
    if (!chunk || !scene) return;

    scene.remove(chunk.terrainGroup);
    scene.remove(chunk.propsGroup);
    scene.remove(chunk.mountainsGroup);

    const disposeGroup = (group: THREE.Group) => {
      group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
        }
      });
    };

    disposeGroup(chunk.terrainGroup);
    disposeGroup(chunk.propsGroup);
    disposeGroup(chunk.mountainsGroup);

    // Remove collectibles in this chunk
    chunk.itemIds.forEach((id) => {
      const mesh = collectibleMeshesRef.current.get(id);
      if (mesh) {
        scene.remove(mesh);
        mesh.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh;
            if (m.geometry) m.geometry.dispose();
          }
        });
        collectibleMeshesRef.current.delete(id);
      }
    });

    collectiblesRef.current = collectiblesRef.current.filter((c) => !chunk.itemIds.includes(c.id));
    activeChunksRef.current.delete(chunkIndex);
  }, []);

  const syncChunks = useCallback((carX: number) => {
    const currentChunk = Math.floor(carX / CHUNK_SIZE);
    const minChunk = Math.max(0, currentChunk - 1);
    const maxChunk = currentChunk + 4; // Keeps 1000m ahead active

    for (let i = minChunk; i <= maxChunk; i++) {
      if (!activeChunksRef.current.has(i)) {
        loadChunk(i);
      }
    }

    // Unload trailing chunks
    activeChunksRef.current.forEach((_, idx) => {
      if (idx < minChunk - 1 || idx > maxChunk + 1) {
        unloadChunk(idx);
      }
    });
  }, [loadChunk, unloadChunk]);

  // -------------------------------------------------------------
  // Full Clean Game Restart (Play Again / Reset for Current Level)
  // -------------------------------------------------------------
  const resetRun = useCallback((levelConfig?: HillClimbLevelConfig) => {
    const config = levelConfig || currentLevelConfigRef.current;

    // 0. Ensure deterministic seed & handcrafted profile is loaded for this level
    resetSplineForLevel(config);

    // 1. Reset Physics State
    physicsStateRef.current = createInitialPhysicsState();
    controlsRef.current = { gas: false, brake: false };
    setIsGasActive(false);
    setIsBrakeActive(false);
    setIsOverturned(false);

    // 2. Unload all active chunks cleanly and reload initial window
    activeChunksRef.current.forEach((_, idx) => {
      unloadChunk(idx);
    });
    activeChunksRef.current.clear();
    collectiblesRef.current = [];
    collectibleMeshesRef.current.clear();

    // Load initial chunks: 0, 1, 2, 3, 4 (0m to 1250m)
    for (let i = 0; i <= 4; i++) {
      loadChunk(i);
    }

    // 3. Reset HUD State
    setDistanceMeters(0);
    setCoinsCount(0);
    setFuelPercent(100);
    setNormalizedScore(0);
    setCurrentSpeedKmh(0);
    setTimeLeft(TOTAL_SESSION_SECONDS);

    // 4. Update 3D Vehicle Transform
    if (vehicleRigRef.current) {
      const p = physicsStateRef.current;
      updateVehicleMeshTransform(
        vehicleRigRef.current,
        p.x,
        p.y,
        p.z,
        p.pitch,
        p.roll,
        p.yaw,
        p.wheelRotation,
        p.rearSuspensionComp,
        p.frontSuspensionComp,
        p.frontLeftComp,
        p.frontRightComp,
        p.rearLeftComp,
        p.rearRightComp
      );
    }

    // 5. Reset Camera Position with complete vehicle framing
    if (cameraRef.current) {
      const p = physicsStateRef.current;
      const camDistBehind = 8.8;
      const camHeightAbove = 3.8;
      const camSideOffset = 10.5;
      cameraRef.current.position.set(p.x - camDistBehind, p.y + camHeightAbove, p.z + camSideOffset);
      cameraRef.current.lookAt(p.x + 5.5, p.y + 0.8, 0);
    }
  }, [loadChunk, unloadChunk]);

  // -------------------------------------------------------------
  // Start Flow: Select Level -> Countdown (3, 2, 1, GO) -> Playing
  // -------------------------------------------------------------
  const handleStartLevel = useCallback((levelNum: number) => {
    initAudio();
    const config = getLevelConfig(levelNum);
    currentLevelConfigRef.current = config;
    setCurrentLevelNumber(levelNum);

    resetRun(config);
    setStatus('countdown');
    setCountdownText('3');
    HillRiderAudio.playCountdownTick(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownText(count.toString());
        HillRiderAudio.playCountdownTick(false);
      } else if (count === 0) {
        setCountdownText('GO!');
        HillRiderAudio.playCountdownTick(true);
      } else {
        clearInterval(interval);
        setStatus('playing');
        if (soundSettings.engineSound) {
          HillRiderAudio.startEngine();
        }
        lastTimeRef.current = performance.now();
      }
    }, 700);
  }, [initAudio, resetRun, soundSettings.engineSound]);

  const handleRestartRun = useCallback(() => {
    HillRiderAudio.stopEngine();
    handleStartLevel(currentLevelNumber);
  }, [handleStartLevel, currentLevelNumber]);

  const handleStartGame = useCallback(() => {
    handleStartLevel(progress.unlockedLevel || 1);
  }, [handleStartLevel, progress.unlockedLevel]);

  // -------------------------------------------------------------
  // Touch / Pointer / Mouse Control Handlers (Android Optimized)
  // -------------------------------------------------------------
  const handleGasStart = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }
    controlsRef.current.gas = true;
    setIsGasActive(true);
    initAudio();
  }, [initAudio]);

  const handleGasEnd = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }
    controlsRef.current.gas = false;
    setIsGasActive(false);
  }, []);

  const handleBrakeStart = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }
    controlsRef.current.brake = true;
    setIsBrakeActive(true);
    initAudio();
  }, [initAudio]);

  const handleBrakeEnd = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }
    controlsRef.current.brake = false;
    setIsBrakeActive(false);
  }, []);

  // Keyboard controls listener (Arrow keys, WASD, and Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'arrowright' || key === 'arrowup' || key === 'd' || key === 'w') {
        controlsRef.current.gas = true;
        setIsGasActive(true);
        initAudio();
      } else if (key === 'arrowleft' || key === 'arrowdown' || key === 'a' || key === 's' || key === ' ') {
        controlsRef.current.brake = true;
        setIsBrakeActive(true);
        initAudio();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowright' || key === 'arrowup' || key === 'd' || key === 'w') {
        controlsRef.current.gas = false;
        setIsGasActive(false);
      } else if (key === 'arrowleft' || key === 'arrowdown' || key === 'a' || key === 's' || key === ' ') {
        controlsRef.current.brake = false;
        setIsBrakeActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [initAudio]);

  // -------------------------------------------------------------
  // Three.js Scene Setup (Lights, Shadows, Road Mesh, Vehicle Rig)
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Clean Highland Ethiopian Sky & Atmospheric Fog
    scene.background = new THREE.Color(0xa0c4e2);
    scene.fog = new THREE.FogExp2(0xa0c4e2, 0.0075);

    // Camera (Third-Person Chase Perspective)
    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.2,
      600
    );
    const initP = physicsStateRef.current;
    const camDistBehind = 8.8;
    const camHeightAbove = 3.8;
    const camSideOffset = 10.5;
    camera.position.set(initP.x - camDistBehind, initP.y + camHeightAbove, initP.z + camSideOffset);
    camera.lookAt(initP.x + 5.5, initP.y + 0.8, 0);
    cameraRef.current = camera;

    // WebGL Renderer with Shadow Maps & Antialiasing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // ==========================================
    // LIGHTING & AMBIENCE
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x4a3b32, 0.95);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.45);
    dirLight.position.set(25, 45, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 160;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const ambLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambLight);

    // Subterranean Bedrock Horizon Foundation (Prevents any sky/void below terrain)
    const baseBedrockGeo = new THREE.PlaneGeometry(10000, 600);
    baseBedrockGeo.rotateX(-Math.PI / 2);
    const baseBedrockMat = new THREE.MeshStandardMaterial({
      color: 0x2e241e,
      roughness: 0.98,
      metalness: 0.02,
      flatShading: true,
    });
    const baseBedrockMesh = new THREE.Mesh(baseBedrockGeo, baseBedrockMat);
    baseBedrockMesh.position.set(4000, -125, 0);
    baseBedrockMesh.receiveShadow = true;
    scene.add(baseBedrockMesh);

    // ==========================================
    // 3D VEHICLE RIG
    // ==========================================
    const vehicleRig = createVehicle3D();
    vehicleRigRef.current = vehicleRig;
    scene.add(vehicleRig.rootGroup);

    // Initial vehicle placement and chunks setup
    resetRun();

    // ==========================================
    // WINDOW RESIZE HANDLER
    // ==========================================
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      cameraRef.current.aspect = width / Math.max(1, height);
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
      container.replaceChildren();
    };
  }, [resetRun]);

  // -------------------------------------------------------------
  // Main Animation / Physics Game Loop
  // -------------------------------------------------------------
  useEffect(() => {
    let hudThrottleTimer = 0;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.035, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      const physics = physicsStateRef.current;
      const rig = vehicleRigRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      const renderer = rendererRef.current;

      // 1. STEP PHYSICS (If actively playing)
      if (status === 'playing') {
        const result = stepVehiclePhysics(
          physics,
          controlsRef.current,
          collectiblesRef.current,
          dt
        );

        // Synchronize procedural terrain chunks ahead of player
        syncChunks(physics.x);

        // Dynamic Engine Audio Synthesizer Update (RPM, throttle, steep hill load strain, airborne limiter)
        const slopeInfo = getTerrainSlopeAt(physics.x, 0);
        HillRiderAudio.updateEngine({
          throttle: controlsRef.current.gas ? 1.0 : 0.0,
          brake: controlsRef.current.brake ? 1.0 : 0.0,
          speed: physics.vx,
          slopeAngle: slopeInfo.slopeAngle,
          isAirborne: physics.isAirborne,
          isGrounded: physics.isGrounded,
        });

        // Dynamic Suspension Landing Impact Thud
        if (result.landedThisFrame && result.impactSpeed > 3.2) {
          HillRiderAudio.playLandingThud(Math.min(2.5, result.impactSpeed / 3.8));
        }

        // Collectibles Audio (Coins & Fuel)
        if (result.collectedItems.length > 0) {
          result.collectedItems.forEach((c) => {
            if (c.type === 'coin') {
              HillRiderAudio.playCoinCollect();
            } else if (c.type === 'fuel') {
              HillRiderAudio.playFuelRefill();
            }
            const mesh = collectibleMeshesRef.current.get(c.id);
            if (mesh) {
              mesh.visible = false;
            }
          });
        }

        // Check for Level Finish (Victory!)
        const targetDist = currentLevelConfigRef.current.targetDistance;
        if (physics.distance >= targetDist) {
          HillRiderAudio.stopEngine();
          HillRiderAudio.playWinFanfare();

          const finalScore = physics.finalScore;
          const timeTaken = physics.driveTimeSeconds;

          // Star rating calculation based on score and fuel efficiency
          let earnedStars = 1;
          if (physics.fuel >= 25 && finalScore >= 180) {
            earnedStars = 3;
          } else if (physics.fuel >= 10 || finalScore >= 120) {
            earnedStars = 2;
          }

          const saveResult = HillClimbStorage.saveLevelResult(
            playerId,
            currentLevelNumber,
            finalScore,
            Math.round(timeTaken),
            true,
            physics.coinsCollected
          );

          setLastRunStats({
            score: finalScore,
            distance: Math.floor(physics.distance),
            targetDistance: targetDist,
            stars: saveResult.stars,
            coins: physics.coinsCollected,
            timeTaken,
            isNewRecord: saveResult.isNewBest,
            unlockedNextLevel: saveResult.unlockedNext,
          });

          setProgress(saveResult.progress);
          setStatus('level_complete');

          saveUserData({
            coins: userData.coins + physics.coinsCollected,
            bestDistance: Math.max(userData.bestDistance, Math.floor(physics.distance)),
            bestScore: Math.max(userData.bestScore, finalScore),
            totalRuns: userData.totalRuns + 1,
          });

          if (onScoreSubmit) {
            onScoreSubmit(finalScore);
          }
          if (onGameOver) {
            onGameOver(finalScore, Math.floor(timeTaken));
          }
          return;
        }

        // Check for Game Over Failure
        if (physics.isCrashed) {
          HillRiderAudio.playCrash();
          HillRiderAudio.stopEngine();
          const reason = physics.crashReason || 'flipped';
          setCrashReason(reason);

          const finalScore = physics.finalScore;
          const timeTaken = physics.driveTimeSeconds;

          const saveResult = HillClimbStorage.saveLevelResult(
            playerId,
            currentLevelNumber,
            finalScore,
            Math.round(timeTaken),
            false,
            physics.coinsCollected
          );

          setLastRunStats({
            score: finalScore,
            distance: Math.floor(physics.distance),
            targetDistance: targetDist,
            stars: 0,
            coins: physics.coinsCollected,
            timeTaken,
            reason,
            isNewRecord: saveResult.isNewBest,
            unlockedNextLevel: false,
          });

          setProgress(saveResult.progress);
          setStatus('level_failed');

          // Save personal best records
          saveUserData({
            coins: userData.coins + physics.coinsCollected,
            bestDistance: Math.max(userData.bestDistance, Math.floor(physics.distance)),
            bestScore: Math.max(userData.bestScore, finalScore),
            totalRuns: userData.totalRuns + 1,
          });

          // Submit tournament score to platform
          if (onScoreSubmit) {
            onScoreSubmit(finalScore);
          }
          return;
        }
      }

      // 2. UPDATE 3D VEHICLE RIG
      if (rig) {
        updateVehicleMeshTransform(
          rig,
          physics.x,
          physics.y,
          physics.z,
          physics.pitch,
          physics.roll,
          physics.yaw,
          physics.wheelRotation,
          physics.rearSuspensionComp,
          physics.frontSuspensionComp,
          physics.frontLeftComp,
          physics.frontRightComp,
          physics.rearLeftComp,
          physics.rearRightComp
        );
      }

      // 3. UPDATE ROTATION ON ACTIVE COLLECTIBLES
      const spinAngle = currentTime * 0.003;
      collectibleMeshesRef.current.forEach((mesh) => {
        if (mesh.visible) {
          mesh.rotation.y = spinAngle;
        }
      });

      // 4. THIRD-PERSON CHASE CAMERA SMOOTH FOLLOW (Framing full vehicle & road ahead)
      if (camera) {
        const camDistBehind = 8.8;
        const camHeightAbove = 3.8;
        const camSideOffset = 10.5;

        const targetCamX = physics.x - camDistBehind;
        const targetCamY = physics.y + camHeightAbove;
        const targetCamZ = physics.z + camSideOffset;

        // Smooth camera lerp
        camera.position.x += (targetCamX - camera.position.x) * 0.14;
        camera.position.y += (targetCamY - camera.position.y) * 0.14;
        camera.position.z += (targetCamZ - camera.position.z) * 0.14;

        // Look forward along the asphalt road
        const lookAheadX = physics.x + 5.5;
        const lookAheadY = getTerrainElevation(lookAheadX, 0) + 0.8;
        camera.lookAt(lookAheadX, lookAheadY, 0);

        // Keep directional sunlight centered around player
        if (dirLightRef.current) {
          dirLightRef.current.position.set(physics.x + 25, physics.y + 45, 30);
          dirLightRef.current.target.position.set(physics.x, physics.y, 0);
          dirLightRef.current.target.updateMatrixWorld();
        }
      }

      // 5. THROTTLED REACT HUD STATE UPDATE (60fps -> 20fps for performance)
      hudThrottleTimer += dt;
      if (hudThrottleTimer >= 0.05) {
        hudThrottleTimer = 0;
        setDistanceMeters(Math.floor(physics.distance));
        setCoinsCount(physics.coinsCollected);
        setFuelPercent(Math.max(0, Math.round(physics.fuel)));
        setCurrentSpeedKmh(Math.max(0, Math.round(Math.abs(physics.vx) * 3.6)));
        setIsOverturned(physics.isFlipped);
        setNormalizedScore(physics.finalScore);
        const remainingTime = Math.max(0, TOTAL_SESSION_SECONDS - physics.driveTimeSeconds);
        setTimeLeft(Math.ceil(remainingTime));
      }

      // 6. RENDER THREE.JS SCENE
      if (scene && camera && renderer) {
        renderer.render(scene, camera);
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [status, syncChunks, saveUserData, userData, onScoreSubmit, onGameOver, playerId, currentLevelNumber]);

  return (
    <div
      id="hill-climb-root"
      className="relative w-full h-full min-h-[580px] bg-slate-950 flex flex-col select-none overflow-hidden font-sans"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: Level Title, Difficulty Badge, Score HUD, Sound, Pause */}
      {/* ========================================================================= */}
      <div className="relative z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        
        {/* Game & Level Information */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (status === 'playing') {
                HillRiderAudio.stopEngine();
                setStatus('paused');
              } else {
                setStatus('level_select');
              }
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            title="Levels / Pause"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{status === 'playing' ? 'PAUSE' : 'LEVELS'}</span>
          </button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1688C9] to-[#8BCB3D] flex items-center justify-center text-white font-black text-xs shadow-md">
            L{currentLevelNumber}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-white font-black text-xs sm:text-sm tracking-tight leading-none uppercase">
                {currentLevelConfigRef.current.name}
              </h1>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                currentLevelConfigRef.current.tier.includes('Expert')
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : currentLevelConfigRef.current.tier.includes('Extreme')
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {currentLevelConfigRef.current.tier}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span>TARGET: <strong className="text-amber-400 font-mono">{currentLevelConfigRef.current.targetDistance}m</strong></span>
              <span>•</span>
              <span>BEST: <strong className="text-cyan-400 font-mono">{progress.completedLevels[currentLevelNumber]?.bestScore || 0} PTS</strong></span>
            </div>
          </div>
        </div>

        {/* Live Score & Time Displays */}
        <div className="flex items-center gap-2">
          {/* Live Score Display */}
          <div className="px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-right leading-none">
              <div className="text-[9px] text-slate-400 uppercase font-bold">SCORE</div>
              <div className="text-[#8BCB3D] font-mono font-black text-sm sm:text-base">
                {normalizedScore}
              </div>
            </div>
          </div>

          {/* Live 120s Time Limit Display */}
          <div className={`px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800/90 border flex items-center gap-1.5 sm:gap-2 ${
            timeLeft <= 15 ? 'border-rose-500/80 text-rose-400 animate-pulse' : 'border-slate-700/80 text-cyan-400'
          }`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <div className="text-right leading-none">
              <div className="text-[9px] text-slate-400 uppercase font-bold">TIME</div>
              <div className="font-mono font-black text-sm sm:text-base">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const nextVal = !soundEnabled;
              setSoundEnabled(nextVal);
              const updated = { ...soundSettings, soundEnabled: nextVal, engineSound: nextVal };
              setSoundSettings(updated);
              HillClimbStorage.saveSettings(updated);
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Pause / Resume */}
          {status === 'playing' && (
            <button
              onClick={() => {
                HillRiderAudio.stopEngine();
                setStatus('paused');
              }}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECONDARY LIVE HUD: Distance / Target Progress, Coins, Fuel, Speed     */}
      {/* ========================================================================= */}
      {status === 'playing' && (
        <div className="absolute top-14 inset-x-3 sm:inset-x-5 z-20 flex items-center justify-between pointer-events-none">
          
          {/* Distance & Coins Pill */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-white font-mono text-xs flex flex-col gap-1 shadow-lg min-w-[130px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">DIST</span>
                <span className="text-[#8BCB3D] font-black">
                  {distanceMeters}m <span className="text-[10px] text-slate-400 font-normal">/ {currentLevelConfigRef.current.targetDistance}m</span>
                </span>
              </div>
              {/* Progress track */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1688C9] to-[#8BCB3D] transition-all duration-150"
                  style={{
                    width: `${Math.min(100, Math.round((distanceMeters / currentLevelConfigRef.current.targetDistance) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-amber-400 font-mono text-xs flex items-center gap-1.5 shadow-lg">
              <Coins className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-black text-white">{coinsCount}</span>
            </div>
          </div>

          {/* Fuel Gauge & Speedometer */}
          <div className="flex items-center gap-2">
            {/* Speedometer */}
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-cyan-300 font-mono text-xs font-black shadow-lg">
              {currentSpeedKmh} <span className="text-[9px] font-sans font-semibold text-slate-400">KM/H</span>
            </div>

            {/* Fuel Bar */}
            <div className="w-24 sm:w-32 bg-slate-950/85 backdrop-blur-sm border border-slate-800 rounded-xl p-1.5 flex items-center gap-1.5 shadow-lg">
              <Fuel className={`w-3.5 h-3.5 shrink-0 ${fuelPercent <= 20 ? 'text-rose-500 animate-pulse' : 'text-[#8BCB3D]'}`} />
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    fuelPercent > 45
                      ? 'bg-[#8BCB3D]'
                      : fuelPercent > 20
                      ? 'bg-amber-400'
                      : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${fuelPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 3D WEBGL VIEWPORT CONTAINER                                            */}
      {/* ========================================================================= */}
      <div className="relative w-full flex-1 min-h-[440px] bg-slate-950 overflow-hidden">
        
        {/* Three.js DOM Container */}
        <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

        {/* OVERTURN WARNING */}
        {isOverturned && status === 'playing' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-rose-600/90 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl border-2 border-white animate-bounce pointer-events-none">
            <AlertTriangle className="w-4 h-4 fill-current" />
            <span>WARNING: VEHICLE OVERTURNED!</span>
          </div>
        )}

        {/* LOW FUEL WARNING */}
        {fuelPercent <= 15 && fuelPercent > 0 && status === 'playing' && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-xl bg-amber-500/90 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse pointer-events-none">
            <Fuel className="w-3.5 h-3.5 fill-current" />
            <span>LOW FUEL! GRAB A JERRYCAN</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. PRE-GAME MAIN MENU SCREEN                                              */}
        {/* ========================================================================= */}
        {(status === 'menu' || status === 'start_screen') && (
          <HillClimbMenu
            progress={progress}
            profile={profile}
            onPlay={(levelNumber) => handleStartLevel(levelNumber || progress.unlockedLevel || 1)}
            onOpenLevels={() => setStatus('level_select')}
            onOpenLeaderboard={() => setStatus('leaderboard')}
            onOpenSettings={() => setStatus('settings')}
            onExit={onExit}
          />
        )}

        {/* ========================================================================= */}
        {/* 4B. LEVEL SELECT SCREEN                                                   */}
        {/* ========================================================================= */}
        {status === 'level_select' && (
          <HillClimbLevelSelect
            progress={progress}
            onSelectLevel={(levelNum) => handleStartLevel(levelNum)}
            onClose={() => setStatus('menu')}
          />
        )}

        {/* ========================================================================= */}
        {/* 4C. LEADERBOARD SCREEN                                                    */}
        {/* ========================================================================= */}
        {status === 'leaderboard' && (
          <HillClimbLeaderboard
            profile={profile}
            initialLevel={currentLevelNumber}
            onClose={() => setStatus('menu')}
          />
        )}

        {/* ========================================================================= */}
        {/* 4D. SETTINGS SCREEN                                                       */}
        {/* ========================================================================= */}
        {status === 'settings' && (
          <HillClimbSettings
            onClose={() => {
              const s = HillClimbStorage.getSettings();
              setSoundSettings(s);
              setSoundEnabled(s.soundEnabled);
              setStatus('menu');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* 5. COUNTDOWN OVERLAY (3 -> 2 -> 1 -> GO)                                  */}
        {/* ========================================================================= */}
        {status === 'countdown' && (
          <div className="absolute inset-0 z-40 bg-slate-950/40 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div
              key={countdownText}
              className="text-7xl sm:text-8xl font-black text-white font-mono tracking-tighter drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] animate-in zoom-in-50 duration-200"
            >
              {countdownText}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. ETHIOFANTASY 3D DRIVING PEDAL CONTROLS (BRAKE ON LEFT, GAS ON RIGHT)   */}
        {/* ========================================================================= */}
        {status === 'playing' && (
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 flex items-end justify-between gap-6 z-30 pointer-events-auto select-none touch-none">
            
            {/* LEFT SIDE: BRAKE CONTROL (#071B2D Deep Navy, #FFD54F Gold trim, White label) */}
            <div className="flex-1 max-w-[155px] sm:max-w-[175px] flex flex-col items-center">
              {/* Mechanical Linkage Bracket */}
              <div className="w-6 h-3.5 bg-gradient-to-b from-[#071B2D] to-slate-800 rounded-t border-t border-x border-amber-400/30 -mb-1 z-0 shadow-inner" />
              
              <button
                id="brake-pedal-btn"
                onPointerDown={handleBrakeStart}
                onPointerUp={handleBrakeEnd}
                onPointerCancel={handleBrakeEnd}
                onPointerLeave={handleBrakeEnd}
                onTouchStart={handleBrakeStart}
                onTouchEnd={handleBrakeEnd}
                onTouchCancel={handleBrakeEnd}
                onMouseDown={handleBrakeStart}
                onMouseUp={handleBrakeEnd}
                style={{
                  transform: isBrakeActive
                    ? 'perspective(450px) rotateX(16deg) translateY(5px) scale(0.96)'
                    : 'perspective(450px) rotateX(0deg) translateY(0px) scale(1)',
                  transition: 'transform 0.06s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.06s ease',
                }}
                className={`relative z-10 w-full h-22 sm:h-24 rounded-2xl p-2.5 flex flex-col items-center justify-between border-2 shadow-2xl cursor-pointer select-none touch-none active:outline-none ${
                  isBrakeActive
                    ? 'bg-gradient-to-b from-[#071B2D] via-rose-950 to-[#030c14] border-rose-500 shadow-[0_0_28px_rgba(244,63,94,0.7)] ring-2 ring-rose-500/50'
                    : 'bg-gradient-to-b from-[#0d2842] via-[#071B2D] to-[#030c14] border-[#FFD54F]/60 hover:border-[#FFD54F] shadow-[0_10px_24px_rgba(0,0,0,0.9)]'
                }`}
                aria-label="Vehicle Brake"
              >
                {/* Gold Bezel Top Rivets */}
                <div className="w-full flex items-center justify-between px-1.5 pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FFD54F] to-amber-200 shadow-inner border border-amber-600/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FFD54F] to-amber-200 shadow-inner border border-amber-600/60" />
                </div>

                {/* Grooved Anti-Slip Brake Treads */}
                <div className="w-full flex flex-col gap-1.5 px-1.5 my-0.5">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className={`h-2.5 rounded-md flex items-center justify-center border transition-colors ${
                        isBrakeActive
                          ? 'bg-rose-950/70 border-rose-500/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]'
                          : 'bg-[#051421] border-[#FFD54F]/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]'
                      }`}
                    >
                      <div className={`w-4/5 h-[1.5px] rounded-full transition-colors ${
                        isBrakeActive ? 'bg-rose-400/80' : 'bg-slate-500/50'
                      }`} />
                    </div>
                  ))}
                </div>

                {/* Label: BRAKE */}
                <div className="w-full flex items-center justify-center pb-0.5">
                  <span className={`text-xs sm:text-sm font-black tracking-widest uppercase font-mono transition-colors ${
                    isBrakeActive ? 'text-rose-400' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                  }`}>
                    BRAKE
                  </span>
                </div>
              </button>
            </div>

            {/* RIGHT SIDE: GAS CONTROL (#071B2D Deep Navy, #00C853 Green, #FFD54F Gold trim, White label) */}
            <div className="flex-1 max-w-[155px] sm:max-w-[175px] flex flex-col items-center">
              {/* Mechanical Accelerator Arm */}
              <div className="w-5 h-4 bg-gradient-to-b from-[#071B2D] to-slate-800 rounded-t border-t border-x border-[#00C853]/40 -mb-1 z-0 shadow-inner" />
              
              <button
                id="gas-pedal-btn"
                onPointerDown={handleGasStart}
                onPointerUp={handleGasEnd}
                onPointerCancel={handleGasEnd}
                onPointerLeave={handleGasEnd}
                onTouchStart={handleGasStart}
                onTouchEnd={handleGasEnd}
                onTouchCancel={handleGasEnd}
                onMouseDown={handleGasStart}
                onMouseUp={handleGasEnd}
                style={{
                  transform: isGasActive
                    ? 'perspective(450px) rotateX(20deg) translateY(6px) scale(0.96)'
                    : 'perspective(450px) rotateX(0deg) translateY(0px) scale(1)',
                  transition: 'transform 0.06s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.06s ease',
                }}
                className={`relative z-10 w-full h-24 sm:h-26 rounded-2xl p-2.5 flex flex-col items-center justify-between border-2 shadow-2xl cursor-pointer select-none touch-none active:outline-none ${
                  isGasActive
                    ? 'bg-gradient-to-b from-[#071B2D] via-emerald-950 to-[#030c14] border-[#00C853] shadow-[0_0_30px_rgba(0,200,83,0.75)] ring-2 ring-[#00C853]/50'
                    : 'bg-gradient-to-b from-[#0d2842] via-[#071B2D] to-[#030c14] border-[#00C853]/70 hover:border-[#00C853] shadow-[0_10px_24px_rgba(0,0,0,0.9)]'
                }`}
                aria-label="Vehicle Gas Accelerator"
              >
                {/* Gold Bezel Top Rivets */}
                <div className="w-full flex items-center justify-between px-1.5 pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FFD54F] to-amber-200 shadow-inner border border-amber-600/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FFD54F] to-amber-200 shadow-inner border border-amber-600/60" />
                </div>

                {/* Vertical Accelerator Dual-Column Grip Slots */}
                <div className="w-full grid grid-cols-2 gap-1.5 px-1.5 my-0.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-2.5 rounded-md flex items-center justify-center border transition-colors ${
                        isGasActive
                          ? 'bg-emerald-950/80 border-[#00C853]/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]'
                          : 'bg-[#051421] border-[#00C853]/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]'
                      }`}
                    >
                      <div className={`w-3/5 h-[1.5px] rounded-full transition-colors ${
                        isGasActive ? 'bg-[#00C853]' : 'bg-slate-500/50'
                      }`} />
                    </div>
                  ))}
                </div>

                {/* Label: GAS */}
                <div className="w-full flex items-center justify-center pb-0.5">
                  <span className={`text-xs sm:text-sm font-black tracking-widest uppercase font-mono transition-colors ${
                    isGasActive ? 'text-[#00C853]' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                  }`}>
                    GAS
                  </span>
                </div>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. PAUSE MODAL                                                            */}
      {/* ========================================================================= */}
      {status === 'paused' && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#1688C9] text-white flex items-center justify-center mb-3 shadow-xl">
            <Pause className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white mb-1">Drive Paused</h3>
          <p className="text-xs text-slate-300 mb-5">
            Level {currentLevelNumber}: {currentLevelConfigRef.current.name} • {distanceMeters}m / {currentLevelConfigRef.current.targetDistance}m
          </p>

          <div className="w-full max-w-xs space-y-2.5">
            <button
              onClick={() => {
                setStatus('playing');
                if (soundSettings.engineSound) {
                  HillRiderAudio.startEngine();
                }
                lastTimeRef.current = performance.now();
              }}
              className="w-full py-3 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb736] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Driving</span>
            </button>

            <button
              onClick={handleRestartRun}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Level</span>
            </button>

            <button
              onClick={() => setStatus('level_select')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Select Level</span>
            </button>

            <button
              onClick={() => setStatus('menu')}
              className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. LEVEL VICTORY MODAL                                                    */}
      {/* ========================================================================= */}
      {status === 'level_complete' && lastRunStats && (
        <HillClimbVictoryModal
          levelConfig={currentLevelConfigRef.current}
          score={lastRunStats.score}
          stars={lastRunStats.stars}
          coinsEarned={lastRunStats.coins}
          timeSeconds={Math.round(lastRunStats.timeTaken)}
          isNewBest={lastRunStats.isNewRecord}
          bestScore={progress.completedLevels[currentLevelNumber]?.bestScore || lastRunStats.score}
          unlockedNext={lastRunStats.unlockedNextLevel}
          onNextLevel={() => {
            const nextLevel = currentLevelNumber + 1;
            if (nextLevel <= 40) {
              handleStartLevel(nextLevel);
            } else {
              setStatus('level_select');
            }
          }}
          onReplay={() => handleStartLevel(currentLevelNumber)}
          onOpenLevels={() => setStatus('level_select')}
          onOpenMenu={() => setStatus('menu')}
        />
      )}

      {/* ========================================================================= */}
      {/* 9. LEVEL FAILURE MODAL                                                    */}
      {/* ========================================================================= */}
      {(status === 'level_failed' || status === 'game_over') && lastRunStats && (
        <HillClimbFailureModal
          levelConfig={currentLevelConfigRef.current}
          crashReason={lastRunStats.reason || crashReason}
          distance={lastRunStats.distance}
          score={lastRunStats.score}
          bestScore={progress.completedLevels[currentLevelNumber]?.bestScore || 0}
          onRetry={() => handleStartLevel(currentLevelNumber)}
          onOpenLevels={() => setStatus('level_select')}
          onOpenMenu={() => setStatus('menu')}
        />
      )}
    </div>
  );
};

export default HillRiderGame;
