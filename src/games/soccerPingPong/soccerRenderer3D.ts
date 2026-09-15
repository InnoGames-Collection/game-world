/**
 * SOCCER PING PONG - Professional 3D Horizontal Stadium & Physics Engine
 * Authentic horizontal 1v1 soccer ping-pong mechanics:
 * PLAYER (LEFT)  ←──────── BALL ────────→  COMPUTER (RIGHT)
 *
 * Both characters move ONLY LEFT AND RIGHT in their defined movement zones.
 * Realistic parabolic bouncing ball physics, spin, multiple return trajectories,
 * intelligent computer AI, and broadcast-ready horizontal camera.
 */

import * as THREE from 'three';
import { 
  SoccerLevelConfig, 
  StadiumTier, 
  HitQuality, 
  SpecialBallType, 
  ReturnTrajectory 
} from './types';
import { soccerAudio } from './soccerAudio';

export interface RendererCallbacks {
  onPlayerHit: (
    quality: HitQuality, 
    scoreAwarded: number, 
    combo: number, 
    trajectory: ReturnTrajectory
  ) => void;
  onOpponentReturn: () => void;
  onPlayerMiss: () => void;
  onOpponentMiss: () => void;
  onRallyIncrement: (rallyCount: number, multiplier: number) => void;
  onSpecialBallTriggered?: (type: SpecialBallType) => void;
}

// 3D Humanoid Soccer Player Character (Outfield competitive player, NOT goalkeeper)
interface SoccerPlayer3D {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  sweetRing: THREE.Mesh;
  // Animation state
  idlePhase: number;
  runPhase: number;
  kickTimer: number;
  cheerTimer: number;
  missTimer: number;
  lastX: number;
}

export class SoccerRenderer3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Config & Callbacks
  private currentLevel: SoccerLevelConfig;
  private callbacks: RendererCallbacks;

  // Scene Groups
  private arenaGroup: THREE.Group = new THREE.Group();
  private stadiumGroup: THREE.Group = new THREE.Group();
  private crowdGroup: THREE.Group = new THREE.Group();
  private particleGroup: THREE.Group = new THREE.Group();

  // 3D Characters: Left Player & Right Computer
  private playerCharacter!: SoccerPlayer3D;
  private opponentCharacter!: SoccerPlayer3D;

  // 3D Ball & Visual Shadows / Trails
  private ballMesh!: THREE.Mesh;
  private ballShadow!: THREE.Mesh;
  private ballSweetReticle!: THREE.Mesh;
  private ballTrailParticles: { mesh: THREE.Mesh; life: number; maxLife: number }[] = [];

  // =========================================================================
  // ARENA DIMENSIONS (HORIZONTAL COURT)
  // X = Left to Right (Ball travel direction)
  // Y = Vertical Height (Bounce & Arc)
  // Z = Depth across court (Angles & Width)
  // =========================================================================
  public readonly courtLengthX: number = 9.4;      // Table length along X (-4.7 to +4.7)
  public readonly courtWidthZ: number = 4.2;       // Table width along Z (-2.1 to +2.1)
  public readonly courtElevY: number = 0.50;       // Table top elevation
  public readonly netHeight: number = 0.38;        // Net height above table
  public readonly ballRadius: number = 0.16;       // Proportional soccer ball
  public readonly gravity: number = -11.8;

  // Defined Horizontal Movement Lanes
  // PLAYER on LEFT: X from -4.7 to -2.0
  public readonly playerLaneMinX: number = -4.6;
  public readonly playerLaneMaxX: number = -2.0;
  public readonly playerDefaultX: number = -3.7;

  // COMPUTER on RIGHT: X from +2.0 to +4.7
  public readonly opponentLaneMinX: number = 2.0;
  public readonly opponentLaneMaxX: number = 4.6;
  public readonly opponentDefaultX: number = 3.7;

  // Current Player Coordinates
  private currentPlayerX: number = -3.7;
  private targetPlayerX: number = -3.7;

  // Current Opponent Coordinates
  private opponentX: number = 3.7;
  private targetOpponentX: number = 3.7;
  private aiReactionTimer: number = 0;
  private aiTargetOffset: number = 0;

  // Ball State
  public isRunning: boolean = false;
  public isBallActive: boolean = false;
  private ballPos: THREE.Vector3 = new THREE.Vector3(-3.7, 0.50 + 0.16, 0);
  private ballVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private ballSpin: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private currentBallType: SpecialBallType = 'NONE';
  private currentTrajectory: ReturnTrajectory = 'NORMAL';

  // Rally & Scoring State
  private rallyCount: number = 0;
  private currentCombo: number = 1;

  // Camera Settings (Side-view broadcast camera)
  private readonly cameraBasePos: THREE.Vector3 = new THREE.Vector3(0, 3.7, 7.2);
  private cameraShakeIntensity: number = 0;

  // Visual Atmosphere
  private crowdBlocks: { mesh: THREE.Mesh; baseY: number; phase: number; freq: number }[] = [];
  private particles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }[] = [];
  private ledMaterials: THREE.MeshStandardMaterial[] = [];

  constructor(
    container: HTMLElement, 
    level: SoccerLevelConfig, 
    callbacks: RendererCallbacks
  ) {
    this.container = container;
    this.currentLevel = level;
    this.callbacks = callbacks;

    // 1. Initialize Scene
    this.scene = new THREE.Scene();

    // 2. Initialize Camera (Stable broadcast side-view)
    const aspect = (container.clientWidth || 1) / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 140);
    this.updateCameraFov(aspect);
    this.camera.position.copy(this.cameraBasePos);
    this.camera.lookAt(0, 0.75, 0);

    // 3. Initialize WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth || 400, container.clientHeight || 600);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.container.appendChild(this.renderer.domElement);

    // 4. Mount Groups
    this.scene.add(this.stadiumGroup);
    this.scene.add(this.arenaGroup);
    this.scene.add(this.crowdGroup);
    this.scene.add(this.particleGroup);

    // 5. Build Environment, Arena, Outfield Characters & Ball
    this.buildStadium(this.currentLevel.stadiumTier);
    this.buildHorizontalCourt();
    this.buildAthleticCharacters();
    this.buildFootball();

    // 6. Setup Listeners & Resize
    this.setupInputListeners();
    this.setupResizeObserver();
    this.clock.start();
    this.startLoop();
  }

  // Mobile viewport camera auto-framing
  private updateCameraFov(aspect: number) {
    if (aspect < 0.8) {
      // Portrait screen: wider FOV to frame horizontal court
      this.camera.fov = 54 + (0.8 - aspect) * 22;
      this.camera.position.set(0, 4.4, 8.4);
    } else if (aspect < 1.2) {
      this.camera.fov = 48;
      this.camera.position.set(0, 4.0, 7.6);
    } else {
      // Widescreen landscape
      this.camera.fov = 44;
      this.camera.position.copy(this.cameraBasePos);
    }
    this.camera.lookAt(0, 0.75, 0);
    this.camera.updateProjectionMatrix();
  }

  // =========================================================================
  // 1. TEXTURES & PROCEDURAL MATERIALS
  // =========================================================================
  private createTurfTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Horizontal grass stripes across court
    const stripes = 14;
    const stripeW = 1024 / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#1b7431' : '#145c26';
      ctx.fillRect(i * stripeW, 0, stripeW, 512);

      // Subtle grass fibers
      ctx.fillStyle = i % 2 === 0 ? 'rgba(34, 197, 94, 0.09)' : 'rgba(16, 120, 50, 0.09)';
      for (let j = 0; j < 300; j++) {
        const x = i * stripeW + Math.random() * stripeW;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 3, 2);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createSoccerBallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // White leather
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);

    // Black pentagons
    ctx.fillStyle = '#0f172a';
    const drawPentagon = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    const positions = [
      [128, 64], [384, 64], [64, 192], [256, 192], [448, 192], [256, 64]
    ];
    positions.forEach(([x, y]) => drawPentagon(x, y, 26));

    // Seam lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 512, 256);

    return new THREE.CanvasTexture(canvas);
  }

  // =========================================================================
  // 2. BUILD HORIZONTAL SOCCER PING-PONG COURT
  // =========================================================================
  private buildHorizontalCourt() {
    while (this.arenaGroup.children.length > 0) {
      this.arenaGroup.remove(this.arenaGroup.children[0]);
    }

    // A. Main Elevated Carbon Pedestal
    const baseGeo = new THREE.BoxGeometry(
      this.courtLengthX + 0.5, 
      this.courtElevY, 
      this.courtWidthZ + 0.5
    );
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate-navy
      roughness: 0.35,
      metalness: 0.75,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, this.courtElevY / 2, 0);
    baseMesh.receiveShadow = true;
    this.arenaGroup.add(baseMesh);

    // B. Vibrant LED Neon Border along outer perimeter
    const ledTrimGeo = new THREE.BoxGeometry(
      this.courtLengthX + 0.54, 
      0.03, 
      this.courtWidthZ + 0.54
    );
    const ledTrimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ledTrim = new THREE.Mesh(ledTrimGeo, ledTrimMat);
    ledTrim.position.set(0, this.courtElevY + 0.015, 0);
    this.arenaGroup.add(ledTrim);

    // C. Pristine Soccer Turf Playing Surface
    const turfGeo = new THREE.BoxGeometry(this.courtLengthX, 0.02, this.courtWidthZ);
    const turfMat = new THREE.MeshStandardMaterial({
      map: this.createTurfTexture(),
      roughness: 0.65,
      metalness: 0.05,
    });
    const turfMesh = new THREE.Mesh(turfGeo, turfMat);
    turfMesh.position.set(0, this.courtElevY + 0.01, 0);
    turfMesh.receiveShadow = true;
    this.arenaGroup.add(turfMesh);

    // D. White Court Boundary Lines & Center Half-Line
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Outer boundary frame
    const lineW = 0.04;
    const makeLine = (w: number, d: number, px: number, pz: number) => {
      const lineGeo = new THREE.BoxGeometry(w, 0.005, d);
      const m = new THREE.Mesh(lineGeo, lineMat);
      m.position.set(px, this.courtElevY + 0.022, pz);
      this.arenaGroup.add(m);
    };

    // Top & Bottom sidelines along X
    makeLine(this.courtLengthX, lineW, 0, this.courtWidthZ / 2 - lineW / 2);
    makeLine(this.courtLengthX, lineW, 0, -this.courtWidthZ / 2 + lineW / 2);

    // Left & Right baselines along Z
    makeLine(lineW, this.courtWidthZ, -this.courtLengthX / 2 + lineW / 2, 0);
    makeLine(lineW, this.courtWidthZ, this.courtLengthX / 2 - lineW / 2, 0);

    // Center divider line (under net)
    makeLine(lineW * 1.5, this.courtWidthZ, 0, 0);

    // Longitudinal center court line (ping pong service division)
    makeLine(this.courtLengthX, 0.025, 0, 0);

    // E. Glowing Movement Lane Markings on Turf
    // Player Zone: Left side
    const playerLaneGeo = new THREE.BoxGeometry(
      this.playerLaneMaxX - this.playerLaneMinX + 0.4, 
      0.006, 
      this.courtWidthZ - 0.4
    );
    const playerLaneMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.15,
    });
    const playerLaneMesh = new THREE.Mesh(playerLaneGeo, playerLaneMat);
    playerLaneMesh.position.set(
      (this.playerLaneMinX + this.playerLaneMaxX) / 2, 
      this.courtElevY + 0.021, 
      0
    );
    this.arenaGroup.add(playerLaneMesh);

    // Opponent Zone: Right side
    const oppLaneGeo = new THREE.BoxGeometry(
      this.opponentLaneMaxX - this.opponentLaneMinX + 0.4, 
      0.006, 
      this.courtWidthZ - 0.4
    );
    const oppLaneMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.15,
    });
    const oppLaneMesh = new THREE.Mesh(oppLaneGeo, oppLaneMat);
    oppLaneMesh.position.set(
      (this.opponentLaneMinX + this.opponentLaneMaxX) / 2, 
      this.courtElevY + 0.021, 
      0
    );
    this.arenaGroup.add(oppLaneMesh);

    // F. Center Soccer Ping-Pong Net with Authentic Mesh
    this.buildCenterNet();
  }

  private buildCenterNet() {
    const netGroup = new THREE.Group();

    // 1. Sleek metallic net posts on both sides of table
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, this.netHeight + 0.08, 12);
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.2,
    });

    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(0, this.courtElevY + (this.netHeight + 0.08) / 2, this.courtWidthZ / 2 + 0.08);
    post1.castShadow = true;
    netGroup.add(post1);

    const post2 = post1.clone();
    post2.position.z = -this.courtWidthZ / 2 - 0.08;
    netGroup.add(post2);

    // 2. White Top Tension Cord & Tape
    const topTapeGeo = new THREE.BoxGeometry(0.04, 0.035, this.courtWidthZ + 0.16);
    const topTapeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });
    const topTape = new THREE.Mesh(topTapeGeo, topTapeMat);
    topTape.position.set(0, this.courtElevY + this.netHeight, 0);
    topTape.castShadow = true;
    netGroup.add(topTape);

    // 3. Transparent Semi-Permeable Mesh Grid
    const meshGeo = new THREE.BoxGeometry(0.015, this.netHeight - 0.03, this.courtWidthZ);
    const meshMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.5,
    });
    const netMesh = new THREE.Mesh(meshGeo, meshMat);
    netMesh.position.set(0, this.courtElevY + (this.netHeight - 0.03) / 2, 0);
    netMesh.castShadow = true;
    netGroup.add(netMesh);

    this.arenaGroup.add(netGroup);
  }

  // =========================================================================
  // 3. BUILD ATHLETIC 3D SOCCER PLAYERS (LEFT HUMAN & RIGHT COMPUTER)
  // =========================================================================
  private createSoccerPlayer(
    isPlayer: boolean,
    kitColor: number,
    trimColor: number,
    initialX: number
  ): SoccerPlayer3D {
    const root = new THREE.Group();

    // Body container for movement tilting & breathing
    const body = new THREE.Group();
    root.add(body);

    // Materials
    const kitMat = new THREE.MeshStandardMaterial({
      color: kitColor,
      roughness: 0.45,
      metalness: 0.1,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: trimColor,
      roughness: 0.3,
      metalness: 0.3,
    });
    const shortsMat = new THREE.MeshStandardMaterial({
      color: isPlayer ? 0xffffff : 0x0f172a,
      roughness: 0.5,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: isPlayer ? 0xd4a373 : 0xc68642,
      roughness: 0.65,
    });
    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.5,
    });

    // 1. Torso / Jersey (Athletic taper)
    const torsoGeo = new THREE.BoxGeometry(0.28, 0.34, 0.18);
    const torso = new THREE.Mesh(torsoGeo, kitMat);
    torso.position.y = 0.44;
    torso.castShadow = true;
    body.add(torso);

    // Jersey Collar Trim
    const collarGeo = new THREE.BoxGeometry(0.18, 0.04, 0.19);
    const collar = new THREE.Mesh(collarGeo, trimMat);
    collar.position.y = 0.59;
    body.add(collar);

    // Soccer Shorts
    const shortsGeo = new THREE.BoxGeometry(0.29, 0.18, 0.19);
    const shorts = new THREE.Mesh(shortsGeo, shortsMat);
    shorts.position.y = 0.23;
    shorts.castShadow = true;
    body.add(shorts);

    // 2. Head with Hair
    const head = new THREE.Group();
    head.position.y = 0.69;

    const faceGeo = new THREE.SphereGeometry(0.10, 16, 16);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.castShadow = true;
    head.add(face);

    // Hair cap
    const hairGeo = new THREE.SphereGeometry(0.105, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({
      color: isPlayer ? 0x271911 : 0x18181b,
      roughness: 0.9,
    });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.02;
    head.add(hair);

    body.add(head);

    // 3. Arms (Articulated athletic soccer pose)
    const createArm = (sideZ: number) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(0, 0.52, sideZ * 0.18);

      const upperArmGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.18, 8);
      const upperArm = new THREE.Mesh(upperArmGeo, kitMat);
      upperArm.position.y = -0.08;
      upperArm.castShadow = true;
      armGroup.add(upperArm);

      const forearmGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.16, 8);
      const forearm = new THREE.Mesh(forearmGeo, skinMat);
      forearm.position.y = -0.22;
      forearm.castShadow = true;
      armGroup.add(forearm);

      // Hand
      const handGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.y = -0.32;
      armGroup.add(hand);

      return armGroup;
    };

    const leftArm = createArm(-1);
    const rightArm = createArm(1);
    body.add(leftArm);
    body.add(rightArm);

    // 4. Legs with Soccer Cleats
    const createLeg = (sideZ: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(0, 0.14, sideZ * 0.09);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.15, 8);
      const thigh = new THREE.Mesh(thighGeo, skinMat);
      thigh.position.y = -0.06;
      legGroup.add(thigh);

      // Soccer Sock (Kit color)
      const sockGeo = new THREE.CylinderGeometry(0.05, 0.042, 0.18, 8);
      const sock = new THREE.Mesh(sockGeo, kitMat);
      sock.position.y = -0.18;
      sock.castShadow = true;
      legGroup.add(sock);

      // Cleat / Boot
      const bootGeo = new THREE.BoxGeometry(0.18, 0.06, 0.08);
      const boot = new THREE.Mesh(bootGeo, bootMat);
      // Cleat points towards opponent (+X for player, -X for computer)
      boot.position.set(isPlayer ? 0.04 : -0.04, -0.28, 0);
      boot.castShadow = true;
      legGroup.add(boot);

      return legGroup;
    };

    const leftLeg = createLeg(-1);
    const rightLeg = createLeg(1);
    body.add(leftLeg);
    body.add(rightLeg);

    // 5. Sweet-Spot Active Interception Ring at Feet
    const sweetGeo = new THREE.RingGeometry(0.35, 0.42, 32);
    const sweetMat = new THREE.MeshBasicMaterial({
      color: isPlayer ? 0x38bdf8 : 0xf43f5e,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const sweetRing = new THREE.Mesh(sweetGeo, sweetMat);
    sweetRing.rotation.x = -Math.PI / 2;
    sweetRing.position.y = 0.02;
    root.add(sweetRing);

    // Root position & orientation:
    // Player on Left: faces RIGHT (+X direction) -> rotation.y = Math.PI / 2
    // Computer on Right: faces LEFT (-X direction) -> rotation.y = -Math.PI / 2
    root.position.set(initialX, this.courtElevY, 0);
    root.rotation.y = isPlayer ? Math.PI / 2 : -Math.PI / 2;

    this.arenaGroup.add(root);

    return {
      root,
      body,
      torso,
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      sweetRing,
      idlePhase: Math.random() * 4,
      runPhase: 0,
      kickTimer: 0,
      cheerTimer: 0,
      missTimer: 0,
      lastX: initialX,
    };
  }

  private buildAthleticCharacters() {
    // Player: Electric Blue & Gold kit on the LEFT
    this.playerCharacter = this.createSoccerPlayer(
      true, 
      0x0284c7, 
      0xfbbf24, 
      this.playerDefaultX
    );

    // Opponent: Crimson Red & Charcoal kit on the RIGHT
    this.opponentCharacter = this.createSoccerPlayer(
      false, 
      0xe11d48, 
      0x0f172a, 
      this.opponentDefaultX
    );
  }

  // =========================================================================
  // 4. BUILD 3D FOOTBALL & DYNAMIC SHADOW
  // =========================================================================
  private buildFootball() {
    const ballGeo = new THREE.SphereGeometry(this.ballRadius, 32, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      map: this.createSoccerBallTexture(),
      roughness: 0.35,
      metalness: 0.05,
    });
    this.ballMesh = new THREE.Mesh(ballGeo, ballMat);
    this.ballMesh.castShadow = true;
    this.ballPos.set(this.playerDefaultX, this.courtElevY + this.ballRadius, 0);
    this.ballMesh.position.copy(this.ballPos);
    this.scene.add(this.ballMesh);

    // Dynamic Turf Shadow
    const shadowGeo = new THREE.CircleGeometry(this.ballRadius * 1.2, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    this.ballShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.ballShadow.rotation.x = -Math.PI / 2;
    this.ballShadow.position.set(0, this.courtElevY + 0.015, 0);
    this.scene.add(this.ballShadow);

    // Visual Timing / Sweet-spot Reticle
    const reticleGeo = new THREE.RingGeometry(0.18, 0.24, 24);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.ballSweetReticle = new THREE.Mesh(reticleGeo, reticleMat);
    this.ballSweetReticle.rotation.x = -Math.PI / 2;
    this.ballSweetReticle.position.set(0, this.courtElevY + 0.02, 0);
    this.scene.add(this.ballSweetReticle);
  }

  // =========================================================================
  // 5. BUILD 3D STADIUM ENVIRONMENT & PROGRESSIVE TIERS
  // =========================================================================
  public buildStadium(tier: StadiumTier) {
    while (this.stadiumGroup.children.length > 0) {
      this.stadiumGroup.remove(this.stadiumGroup.children[0]);
    }
    this.crowdBlocks = [];
    this.ledMaterials = [];

    // Lighting color palette based on tier
    let hemiSky = 0xe0f2fe;
    let hemiGround = 0x14532d;
    let floodColor = 0xffffff;
    let floodIntensity = 1.35;
    let fogColor = 0x091424;

    if (tier === 'training') {
      hemiSky = 0xf8fafc;
      hemiGround = 0x166534;
      floodColor = 0xfffbeb;
      floodIntensity = 1.1;
      fogColor = 0x86efac;
      this.scene.background = new THREE.Color(0x93c5fd); // Clear blue sky
    } else if (tier === 'city') {
      hemiSky = 0xfdba74; // Sunset orange
      hemiGround = 0x14532d;
      floodColor = 0xfef08a;
      floodIntensity = 1.3;
      fogColor = 0x431407;
      this.scene.background = new THREE.Color(0x1e1b4b); // Dusk purple
    } else if (tier === 'national') {
      hemiSky = 0x93c5fd;
      hemiGround = 0x052e16;
      floodColor = 0xe0f2fe;
      floodIntensity = 1.55;
      fogColor = 0x020617;
      this.scene.background = new THREE.Color(0x020617); // Night floodlights
    } else if (tier === 'elite') {
      hemiSky = 0x38bdf8;
      hemiGround = 0x022c22;
      floodColor = 0x38bdf8;
      floodIntensity = 1.7;
      fogColor = 0x020617;
      this.scene.background = new THREE.Color(0x030712); // Neon Championship
    } else {
      // Championship Gold Final
      hemiSky = 0xfef08a;
      hemiGround = 0x052e16;
      floodColor = 0xfde047;
      floodIntensity = 1.85;
      fogColor = 0x0f172a;
      this.scene.background = new THREE.Color(0x0a0a0c);
    }

    this.scene.fog = new THREE.FogExp2(fogColor, 0.022);

    // Hemispheric Ambience
    const hemiLight = new THREE.HemisphereLight(hemiSky, hemiGround, 0.75);
    this.stadiumGroup.add(hemiLight);

    // Directional Key Light
    const dirLight = new THREE.DirectionalLight(floodColor, 1.2);
    dirLight.position.set(4, 9, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 28;
    dirLight.shadow.camera.left = -8;
    dirLight.shadow.camera.right = 8;
    dirLight.shadow.camera.top = 8;
    dirLight.shadow.camera.bottom = -8;
    this.stadiumGroup.add(dirLight);

    // 4 High-Intensity Floodlight Towers at Stadium Corners
    const lightTowers = [
      [-8, 8, -6], [8, 8, -6], [-8, 8, 6], [8, 8, 6]
    ];
    lightTowers.forEach(([tx, ty, tz]) => {
      const spot = new THREE.SpotLight(floodColor, floodIntensity);
      spot.position.set(tx, ty, tz);
      spot.target.position.set(0, 0.5, 0);
      spot.angle = 0.55;
      spot.penumbra = 0.45;
      spot.decay = 1.5;
      spot.distance = 32;
      this.stadiumGroup.add(spot);
      this.stadiumGroup.add(spot.target);

      // Visible glowing tower lamp
      const lampGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const lampMat = new THREE.MeshBasicMaterial({ color: floodColor });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(tx, ty, tz);
      this.stadiumGroup.add(lamp);
    });

    // Stadium Grandstand Stands & Cheering Crowd
    this.buildGrandstands();
  }

  private buildGrandstands() {
    // Tiered stadium seating surrounding court
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
    });

    // Back grandstand (behind table, facing camera)
    const backGeo = new THREE.BoxGeometry(22, 5, 4);
    const backStand = new THREE.Mesh(backGeo, standMat);
    backStand.position.set(0, 2.2, -6.5);
    this.stadiumGroup.add(backStand);

    // Left grandstand (behind player)
    const leftGeo = new THREE.BoxGeometry(4, 5, 16);
    const leftStand = new THREE.Mesh(leftGeo, standMat);
    leftStand.position.set(-11, 2.2, 0);
    this.stadiumGroup.add(leftStand);

    // Right grandstand (behind opponent)
    const rightGeo = new THREE.BoxGeometry(4, 5, 16);
    const rightStand = new THREE.Mesh(rightGeo, standMat);
    rightStand.position.set(11, 2.2, 0);
    this.stadiumGroup.add(rightStand);

    // Animated Crowd Blocks
    const crowdColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xffffff, 0x8b5cf6];
    for (let i = -8; i <= 8; i += 1.4) {
      for (let row = 0; row < 3; row++) {
        const cGeo = new THREE.BoxGeometry(0.85, 0.95, 0.6);
        const col = crowdColors[Math.floor(Math.random() * crowdColors.length)];
        const cMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 });
        const block = new THREE.Mesh(cGeo, cMat);
        const baseY = 2.0 + row * 0.9;
        block.position.set(i + (Math.random() - 0.5) * 0.3, baseY, -5.2 - row * 0.9);
        this.crowdGroup.add(block);
        this.crowdBlocks.push({
          mesh: block,
          baseY,
          phase: Math.random() * 6,
          freq: 2.2 + Math.random() * 2.5,
        });
      }
    }
  }

  // =========================================================================
  // 6. INPUT HANDLING & HORIZONTAL MOVEMENT CONTROLS
  // =========================================================================
  private setupInputListeners() {
    let isDragging = false;
    let startPointerX = 0;
    let initialPlayerX = this.currentPlayerX;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      startPointerX = e.clientX;
      initialPlayerX = this.currentPlayerX;
      // Also register as hit attempt if ball is approaching
      if (this.isBallActive && this.ballVel.x < 0) {
        this.attemptPlayerStrike();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const rect = this.container.getBoundingClientRect();
      const deltaX = (e.clientX - startPointerX) / (rect.width || 1);
      
      // Moving pointer left/right slides the player left/right along the lane
      const laneRange = this.playerLaneMaxX - this.playerLaneMinX;
      const newX = initialPlayerX + deltaX * laneRange * 1.6;
      this.setPlayerX(newX);
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const dom = this.container;
    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Keyboard support: ArrowLeft, ArrowRight, A, D, Space (strike)
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 0.28;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.setPlayerX(this.targetPlayerX - step);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.setPlayerX(this.targetPlayerX + step);
      } else if (e.key === ' ' || e.key === 'Enter') {
        this.attemptPlayerStrike();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
  }

  // Public setter for on-screen touch buttons (← Move Left / → Move Right)
  public movePlayerLeft() {
    this.setPlayerX(this.targetPlayerX - 0.35);
  }

  public movePlayerRight() {
    this.setPlayerX(this.targetPlayerX + 0.35);
  }

  // Set absolute normalized lane position (0.0 = deep baseline, 1.0 = close to net)
  public setPlayerLaneProgress(progress: number) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    const newX = this.playerLaneMinX + clamped * (this.playerLaneMaxX - this.playerLaneMinX);
    this.setPlayerX(newX);
  }

  public setPlayerX(x: number) {
    this.targetPlayerX = THREE.MathUtils.clamp(x, this.playerLaneMinX, this.playerLaneMaxX);
  }

  // Manual Trigger for [ KICK / RETURN ] Button or Screen Tap
  public attemptPlayerStrike(): boolean {
    if (!this.isBallActive || this.ballVel.x >= 0) return false;

    // Trigger leg swing animation immediately
    this.playerCharacter.kickTimer = 0.26;

    // Check if ball is in reachable strike zone
    const distToPlayer = Math.hypot(
      this.ballPos.x - this.currentPlayerX,
      this.ballPos.z - this.playerCharacter.root.position.z
    );

    // Reach window along X
    const inReachX = this.ballPos.x <= this.playerLaneMaxX + 0.6 && this.ballPos.x >= this.playerLaneMinX - 0.4;

    if (inReachX && distToPlayer < 1.15 && this.ballPos.y <= this.courtElevY + 1.2) {
      this.executePlayerReturn(distToPlayer);
      return true;
    }

    return false;
  }

  // =========================================================================
  // 7. BALL SERVE & RALLY LIFECYCLE
  // =========================================================================
  public setLevelConfig(level: SoccerLevelConfig) {
    this.currentLevel = level;
    this.buildStadium(level.stadiumTier);
  }

  public serveBall(server: 'player' | 'opponent' = 'player') {
    const { ballSpeedMultiplier, spinFactor, specialBallType } = this.currentLevel;
    this.currentBallType = specialBallType;

    if (server === 'player') {
      this.ballPos.set(this.currentPlayerX + 0.25, this.courtElevY + this.ballRadius + 0.2, 0);
      const speed = (6.8 + Math.random() * 0.6) * ballSpeedMultiplier;
      this.ballVel.set(speed, 3.8, (Math.random() - 0.5) * 0.8);
      this.playerCharacter.kickTimer = 0.25;
    } else {
      this.ballPos.set(this.opponentX - 0.25, this.courtElevY + this.ballRadius + 0.2, 0);
      const speed = (6.8 + Math.random() * 0.6) * ballSpeedMultiplier;
      this.ballVel.set(-speed, 3.8, (Math.random() - 0.5) * 0.8);
      this.opponentCharacter.kickTimer = 0.25;
    }

    this.ballSpin.set(0, (Math.random() - 0.5) * spinFactor, 0);
    this.isBallActive = true;
    this.currentTrajectory = 'NORMAL';

    // AI timing calculation
    this.aiReactionTimer = Math.max(0.04, 0.18 * (1 - this.currentLevel.opponentAccuracy));
    this.aiTargetOffset = (Math.random() - 0.5) * (0.5 * (1 - this.currentLevel.opponentAccuracy));
  }

  public prepareKickoff() {
    this.isBallActive = false;
    this.ballPos.set(0, this.courtElevY + this.ballRadius + 0.02, 0);
    this.ballVel.set(0, 0, 0);
    this.ballSpin.set(0, 0, 0);
    this.ballMesh.position.copy(this.ballPos);
    this.ballShadow.position.set(0, this.courtElevY + 0.015, 0);
    (this.ballSweetReticle.material as THREE.MeshBasicMaterial).opacity = 0;
  }

  // =========================================================================
  // 8. HIT QUALITY, SCORING & TRAJECTORY CALCULATOR
  // =========================================================================
  private executePlayerReturn(distToSweet: number) {
    const { timingWindow, ballSpeedMultiplier } = this.currentLevel;

    // Calculate quality based on distance to player center and timing
    let quality: HitQuality = 'GOOD';
    let trajectory: ReturnTrajectory = 'NORMAL';

    if (distToSweet < 0.38) {
      quality = 'PERFECT';
      trajectory = Math.random() > 0.4 ? 'PERFECT' : 'POWER';
    } else if (distToSweet < 0.75) {
      quality = 'GOOD';
      trajectory = Math.abs(this.ballPos.z) > 0.6 ? 'ANGLE' : 'NORMAL';
    } else {
      quality = 'BAD';
      trajectory = 'NORMAL';
    }

    // Trajectory Speed & Physics
    let returnSpeed = 8.2 * ballSpeedMultiplier;
    let verticalLaunch = 3.6;

    if (quality === 'PERFECT') {
      returnSpeed = 11.2 * ballSpeedMultiplier;
      verticalLaunch = 3.0; // Piercing trajectory
      this.cameraShakeIntensity = 0.25;
      this.spawnImpactSparks(this.ballPos.x, this.ballPos.y, this.ballPos.z, 0xfacc15);
    } else if (quality === 'GOOD') {
      returnSpeed = 8.8 * ballSpeedMultiplier;
      verticalLaunch = 3.8;
      this.spawnImpactSparks(this.ballPos.x, this.ballPos.y, this.ballPos.z, 0x38bdf8);
    } else {
      returnSpeed = 6.4 * ballSpeedMultiplier;
      verticalLaunch = 4.8; // Vulnerable high floater
    }

    // Reverse horizontal direction: ball moves toward computer (+X)
    const angleZ = (this.ballPos.z + (Math.random() - 0.5) * 0.4) * 0.9;
    this.ballVel.set(returnSpeed, verticalLaunch, angleZ);
    this.currentTrajectory = trajectory;

    // Audio
    soccerAudio.playHit(quality === 'PERFECT' ? 'PERFECT' : 'GOOD', this.currentCombo);

    // Scoring Breakdown calculation
    const basePts = 100;
    const qualityBonus = quality === 'PERFECT' ? 300 : quality === 'GOOD' ? 150 : 50;
    const trajectoryBonus = trajectory === 'POWER' ? 250 : trajectory === 'ANGLE' ? 200 : 0;

    // Rally Multiplier: 3 hits -> x1.2, 5 hits -> x1.5, 8 hits -> x2, 12 hits -> x3
    let multiplier = 1.0;
    if (this.rallyCount >= 12) multiplier = 3.0;
    else if (this.rallyCount >= 8) multiplier = 2.0;
    else if (this.rallyCount >= 5) multiplier = 1.5;
    else if (this.rallyCount >= 3) multiplier = 1.2;

    const roundPoints = Math.round((basePts + qualityBonus + trajectoryBonus) * multiplier * Math.max(1, this.currentCombo * 0.5));

    this.rallyCount++;
    this.callbacks.onPlayerHit(quality, roundPoints, this.currentCombo, trajectory);
    this.callbacks.onRallyIncrement(this.rallyCount, multiplier);

    // Reset AI interception for incoming ball
    this.aiReactionTimer = Math.max(0.04, 0.16 * (1 - this.currentLevel.opponentAccuracy));
    // High difficulty shots induce higher AI error chance
    const errorScale = quality === 'PERFECT' ? 1.4 : 0.8;
    this.aiTargetOffset = (Math.random() - 0.5) * (0.6 * (1 - this.currentLevel.opponentAccuracy) * errorScale);
  }

  // Computer AI Return calculation
  private executeOpponentReturn() {
    const { ballSpeedMultiplier, opponentAccuracy } = this.currentLevel;

    // Decide if AI makes an error
    const mistakeChance = Math.max(0.04, (1 - opponentAccuracy) * 0.45);
    const makesMistake = Math.random() < mistakeChance;

    this.opponentCharacter.kickTimer = 0.26;

    if (makesMistake) {
      // AI slips or mistimes return: hits ball weakly or wide
      this.ballVel.set(-4.5, 4.8, (Math.random() - 0.5) * 2.2);
      soccerAudio.playBounce(0.4);
      return;
    }

    // Normal or aggressive return from AI
    const isAggressive = Math.random() < opponentAccuracy * 0.6;
    const speed = (isAggressive ? 9.8 : 7.6) * ballSpeedMultiplier;
    const targetZ = (Math.random() - 0.5) * (this.courtWidthZ * 0.65);

    this.ballVel.set(-speed, isAggressive ? 3.2 : 3.9, targetZ);
    soccerAudio.playHit('GOOD', 1);
    this.spawnImpactSparks(this.ballPos.x, this.ballPos.y, this.ballPos.z, 0xf43f5e);
    this.callbacks.onOpponentReturn();
  }

  // =========================================================================
  // 9. FRAME PHYSICS & AI LOOP
  // =========================================================================
  private updatePhysics(dt: number) {
    const clampedDt = Math.min(dt, 0.033);

    // 1. Smooth Player Position Interpolation
    const prevPlayerX = this.currentPlayerX;
    const followSpeed = 28 * clampedDt;
    this.currentPlayerX += (this.targetPlayerX - this.currentPlayerX) * Math.min(1, followSpeed);
    this.playerCharacter.root.position.x = this.currentPlayerX;
    const playerVelX = (this.currentPlayerX - prevPlayerX) / clampedDt;

    // 2. Intelligent Computer AI Tracking (Left & Right along its lane)
    const prevOpponentX = this.opponentX;

    if (this.isBallActive && this.ballVel.x > 0) {
      // Ball is traveling toward computer: AI anticipates arrival at its lane
      if (this.aiReactionTimer > 0) {
        this.aiReactionTimer -= clampedDt;
      } else {
        // Calculate predicted arrival X
        const interceptX = THREE.MathUtils.clamp(
          this.ballPos.x + this.ballVel.x * 0.28 + this.aiTargetOffset,
          this.opponentLaneMinX,
          this.opponentLaneMaxX
        );
        this.targetOpponentX = interceptX;
      }
    } else {
      // Ball moving toward player: AI repositions towards sweet-spot center of its lane
      this.targetOpponentX = THREE.MathUtils.lerp(this.targetOpponentX, this.opponentDefaultX, 0.05);
    }

    const aiSpeed = (this.currentLevel.opponentSpeed || 4.5) * clampedDt;
    this.opponentX += (this.targetOpponentX - this.opponentX) * Math.min(1, aiSpeed);
    this.opponentCharacter.root.position.x = this.opponentX;
    const opponentVelX = (this.opponentX - prevOpponentX) / clampedDt;

    // 3. Animate 3D Human Characters
    this.updateCharacterAnimation(this.playerCharacter, clampedDt, playerVelX, true);
    this.updateCharacterAnimation(this.opponentCharacter, clampedDt, opponentVelX, false);

    // If ball not active, skip ball physics
    if (!this.isBallActive) return;

    // 4. Ball Gravity, Velocity & Spin
    this.ballVel.y += this.gravity * clampedDt;
    this.ballPos.addScaledVector(this.ballVel, clampedDt);

    // Magnus spin effect
    this.ballVel.z += this.ballSpin.y * 3.2 * clampedDt;

    // 3D Ball Rotation along travel axis
    this.ballMesh.rotation.z -= this.ballVel.x * 2.2 * clampedDt;
    this.ballMesh.rotation.x += this.ballVel.z * 2.2 * clampedDt;

    // 5. Table Turf Bounce
    const floorY = this.courtElevY + this.ballRadius;
    const isOverTableX = Math.abs(this.ballPos.x) <= this.courtLengthX / 2;
    const isOverTableZ = Math.abs(this.ballPos.z) <= this.courtWidthZ / 2;

    if (this.ballPos.y <= floorY && isOverTableX && isOverTableZ) {
      this.ballPos.y = floorY;
      this.ballVel.y = Math.abs(this.ballVel.y) * 0.83;
      if (this.ballVel.y < 1.3) this.ballVel.y = 1.3;
      soccerAudio.playBounce(Math.min(1, Math.abs(this.ballVel.y) / 4));
      this.spawnTurfParticles(this.ballPos.x, this.ballPos.y, this.ballPos.z);
    }

    // 6. Center Net Interaction (At X = 0)
    if (
      Math.abs(this.ballPos.x) < 0.12 &&
      this.ballPos.y <= this.courtElevY + this.netHeight &&
      isOverTableZ
    ) {
      this.ballVel.x = -this.ballVel.x * 0.45;
      this.ballVel.y += 1.2;
      soccerAudio.playBounce(0.5);
    }

    // 7. Auto-Sweep Contact Check for Human Player
    // (Ensures smooth responsive returns when properly positioned)
    if (this.ballVel.x < 0 && this.ballPos.x <= this.currentPlayerX + 0.35 && this.ballPos.x >= this.currentPlayerX - 0.35) {
      const dist = Math.abs(this.ballPos.z - this.playerCharacter.root.position.z);
      if (dist < 0.9 && this.ballPos.y <= this.courtElevY + 0.95) {
        this.executePlayerReturn(dist);
      }
    }

    // 8. Contact Check for Computer AI
    if (this.ballVel.x > 0 && this.ballPos.x >= this.opponentX - 0.35 && this.ballPos.x <= this.opponentX + 0.35) {
      const dist = Math.abs(this.ballPos.z - this.opponentCharacter.root.position.z);
      if (dist < 0.9 && this.ballPos.y <= this.courtElevY + 0.95) {
        this.executeOpponentReturn();
      }
    }

    // 9. Out of Bounds & Miss Evaluation
    // Player Misses: ball passed player lane behind baseline
    if (this.ballPos.x < this.playerLaneMinX - 0.85) {
      this.isBallActive = false;
      this.currentCombo = 1;
      this.rallyCount = 0;
      this.playerCharacter.missTimer = 0.7;
      this.callbacks.onPlayerMiss();
      soccerAudio.playMiss();
    } 
    // Computer Misses: ball passed computer lane behind baseline -> PLAYER WINS RALLY!
    else if (this.ballPos.x > this.opponentLaneMaxX + 0.85) {
      this.isBallActive = false;
      this.currentCombo++;
      this.opponentCharacter.missTimer = 0.7;
      this.playerCharacter.cheerTimer = 0.8;
      this.callbacks.onOpponentMiss();
      soccerAudio.playCrowdCheer(0.7);
    }

    // 10. Update Ball Visuals & Shadows
    this.ballMesh.position.copy(this.ballPos);

    // Reticle & Shadow on Turf
    this.ballShadow.position.set(this.ballPos.x, this.courtElevY + 0.015, this.ballPos.z);
    const heightAboveCourt = Math.max(0, this.ballPos.y - floorY);
    const shadowScale = Math.max(0.35, 1 - heightAboveCourt * 0.28);
    this.ballShadow.scale.set(shadowScale, shadowScale, 1);
    (this.ballShadow.material as THREE.MeshBasicMaterial).opacity = Math.max(
      0.08, 
      0.45 - heightAboveCourt * 0.14
    );

    // Sweet-spot timing reticle appears when ball approaches player
    if (this.ballVel.x < 0 && this.ballPos.x < 0) {
      this.ballSweetReticle.position.set(this.ballPos.x, this.courtElevY + 0.02, this.ballPos.z);
      (this.ballSweetReticle.material as THREE.MeshBasicMaterial).opacity = Math.min(
        0.8,
        Math.abs(this.ballPos.x) / 3.5
      );
    } else {
      (this.ballSweetReticle.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    // 11. Camera micro-shake & particles
    this.updateCameraShake(clampedDt);
    this.updateParticles(clampedDt);
  }

  // Animate 3D Human Player Character
  private updateCharacterAnimation(
    char: SoccerPlayer3D, 
    dt: number, 
    velX: number, 
    isPlayer: boolean
  ) {
    char.idlePhase += dt * 3.4;

    // 1. Idle Breathing Bounce
    const idleY = Math.sin(char.idlePhase) * 0.018;
    char.body.position.y = idleY;

    // 2. Lateral Movement Footwork
    const isMoving = Math.abs(velX) > 0.06;
    if (isMoving) {
      char.runPhase += dt * 14;
      const stride = Math.sin(char.runPhase) * 0.35;
      char.leftLeg.rotation.z = stride;
      char.rightLeg.rotation.z = -stride;

      // Lateral lean in direction of movement
      const leanX = (isPlayer ? 1 : -1) * THREE.MathUtils.clamp(velX * 0.05, -0.2, 0.2);
      char.body.rotation.z = THREE.MathUtils.lerp(char.body.rotation.z, leanX, 0.2);
    } else {
      char.leftLeg.rotation.z = THREE.MathUtils.lerp(char.leftLeg.rotation.z, 0, 0.2);
      char.rightLeg.rotation.z = THREE.MathUtils.lerp(char.rightLeg.rotation.z, 0, 0.2);
      char.body.rotation.z = THREE.MathUtils.lerp(char.body.rotation.z, 0, 0.2);
    }

    // 3. Kick Volley Animation
    if (char.kickTimer > 0) {
      char.kickTimer -= dt;
      const progress = char.kickTimer / 0.26;
      const kickAngle = Math.sin(progress * Math.PI) * 0.85;
      // Swing striking leg forward toward ball
      char.rightLeg.rotation.x = (isPlayer ? 1 : -1) * kickAngle;
      char.leftArm.rotation.x = (isPlayer ? -1 : 1) * kickAngle * 0.6;
    }

    // 4. Cheer Fist Pump Animation (On Rally Won)
    if (char.cheerTimer > 0) {
      char.cheerTimer -= dt;
      char.rightArm.rotation.x = -1.2;
      char.rightArm.rotation.z = 0.4;
    }

    // 5. Miss / Disappointment Animation (On Rally Lost)
    if (char.missTimer > 0) {
      char.missTimer -= dt;
      char.head.rotation.x = 0.4; // Look down
    } else {
      char.head.rotation.x = 0;
    }
  }

  // Camera Shake
  private updateCameraShake(dt: number) {
    if (this.cameraShakeIntensity > 0) {
      this.cameraShakeIntensity -= dt * 1.8;
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity * 0.2;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity * 0.2;
      this.camera.position.set(
        this.cameraBasePos.x + shakeX,
        this.cameraBasePos.y + shakeY,
        this.cameraBasePos.z
      );
    } else {
      this.camera.position.copy(this.cameraBasePos);
    }
  }

  // Turf and Impact Particle Effects
  private spawnTurfParticles(x: number, y: number, z: number) {
    for (let i = 0; i < 6; i++) {
      const pGeo = new THREE.BoxGeometry(0.03, 0.03, 0.03);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(x, y, z);
      this.particleGroup.add(p);
      this.particles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          1.5 + Math.random() * 2.0,
          (Math.random() - 0.5) * 1.5
        ),
        life: 0.35,
        maxLife: 0.35,
      });
    }
  }

  private spawnImpactSparks(x: number, y: number, z: number, color: number) {
    for (let i = 0; i < 12; i++) {
      const pGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const pMat = new THREE.MeshBasicMaterial({ color });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(x, y, z);
      this.particleGroup.add(p);
      this.particles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 3.5,
          2.0 + Math.random() * 3.0,
          (Math.random() - 0.5) * 3.5
        ),
        life: 0.45,
        maxLife: 0.45,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }
      p.vel.y += this.gravity * 0.6 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      const scale = p.life / p.maxLife;
      p.mesh.scale.setScalar(scale);
    }

    // Crowd bounce
    for (const c of this.crowdBlocks) {
      c.phase += dt * c.freq;
      c.mesh.position.y = c.baseY + Math.sin(c.phase) * 0.08;
    }
  }

  // =========================================================================
  // 10. ENGINE LOOP & CLEANUP
  // =========================================================================
  private startLoop() {
    this.isRunning = true;
    const animate = () => {
      if (!this.isRunning) return;
      const dt = this.clock.getDelta();
      this.updatePhysics(dt);
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.renderer.setSize(width, height);
          const aspect = width / height;
          this.camera.aspect = aspect;
          this.updateCameraFov(aspect);
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  public destroy() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
      this.renderer.dispose();
    }
  }
}
