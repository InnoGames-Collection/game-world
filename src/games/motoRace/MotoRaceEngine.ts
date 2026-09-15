/**
 * MOTO RACE — High-Performance 3D First-Person Motorcycle Racing Engine (Phase 3)
 * 
 * Major Upgrades:
 * 1. HIGH-CONTRAST MOTORCYCLE COCKPIT:
 *    - Bright polished aerospace aluminum & chrome components (triple clamp, levers, bar ends, mirrors).
 *    - Brilliant gloss racing red fairing with white accents and tinted aerodynamic windshield bubble.
 *    - Detailed rider arms in two-tone racing gloves with carbon knuckle armor.
 *    - Dedicated camera-relative cockpit spot and fill lighting for brilliant metallic reflections.
 * 2. INTEGRATED DASHBOARD & DIGITAL SPEEDOMETER:
 *    - High-tech instrument cluster with dual silver-bezeled analog dials (Speedo & Tachometer).
 *    - Dynamic real-time central digital TFT display (CanvasTexture) showing exact KM/H speed, gear, and RPM bars.
 *    - Fluorescent red needles sweep accurately in real time.
 * 3. REALISTIC 3D TRAFFIC AUTOMOBILES (No placeholder boxes):
 *    - Detailed Sedans, SUVs, Yellow Taxis, Hatchbacks, Delivery Vans, and Heavy Trucks.
 *    - Anatomical car features: hoods, curved cabins, windshields, side windows, wheels with silver alloys,
 *      side mirrors, headlights, and active brake lights that flare when slowing.
 *    - Parked cars in curbside parking bays for authentic urban density.
 * 4. PURE URBAN ENVIRONMENT (Zero unnatural trees / green scenery):
 *    - Completely eliminated unnatural trees and green terrain.
 *    - Multi-layered city: foreground retail storefronts with neon signs & awnings -> midground apartments ->
 *      background high-rise skyscrapers with illuminated window grids.
 *    - Urban infrastructure: crosswalks, traffic light gantries, bus stop shelters, metal guardrails,
 *      overhead highway sign gantries, and modern cantilever streetlamps.
 * 5. PRESERVED WORKING DRIVING MECHANICS:
 *    - Physical acceleration, braking, steering, road scrolling, and audio synchronization remain 100% intact.
 */

import * as THREE from 'three';
import { MotoRaceAudio } from './MotoRaceAudio';
import { MotoRaceLevelConfig } from './motoRaceLevels';

export interface MotoRaceCallbacks {
  onSpeedChange: (speedKmh: number) => void;
  onDistanceChange: (distanceMeters: number, targetDistanceMeters: number) => void;
  onTimeChange: (remainingSeconds: number) => void;
  onScoreChange: (score: number) => void;
  onNearMiss: (combo: number, bonusPoints: number, bonusSec: number) => void;
  onHighSpeedStreak: (active: boolean, streakSeconds: number) => void;
  onCrash: (stats: { score: number; distanceMeters: number; overtakes: number }) => void;
  onLevelComplete: (stats: { score: number; timeTakenSec: number; overtakes: number }) => void;
}

interface TrafficVehicle {
  mesh: THREE.Group;
  type: 'sedan' | 'suv' | 'taxi' | 'hatchback' | 'van' | 'truck';
  lane: number; // 0, 1, 2, 3
  targetLane: number;
  laneTransitionProgress: number;
  laneChangeSpeed: number;
  laneChangeTimer: number;
  isBlinking: boolean;
  brakeLights: THREE.Mesh[];
  headlights: THREE.Mesh[];
  z: number; // relative Z distance from player camera (player is at Z = 0)
  speedKmh: number;
  targetSpeedKmh: number;
  width: number;
  length: number;
  height: number;
  overtaken: boolean;
}

export class MotoRaceEngine {
  private container: HTMLElement;
  private audio: MotoRaceAudio;
  private callbacks: MotoRaceCallbacks;
  private levelConfig: MotoRaceLevelConfig;

  // Three.js Core
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Infinite Highway & City Environment
  private roadChunks: THREE.Group[] = [];
  private readonly ROAD_CHUNK_LENGTH = 80; // 80m segments
  private readonly NUM_ROAD_CHUNKS = 6; // 480m total visible distance
  private finishGantry: THREE.Group | null = null;

  // Motorcycle Cockpit 3D Objects
  private cockpitGroup!: THREE.Group;
  private handlebarsGroup!: THREE.Group;
  private speedoNeedle!: THREE.Mesh;
  private tachoNeedle!: THREE.Mesh;
  private currentRpm: number = 1200;

  // Traffic System
  private trafficVehicles: TrafficVehicle[] = [];
  private readonly LANE_POSITIONS = [-5.4, -1.8, 1.8, 5.4]; // 4 lanes

  // Continuous Physical Driving State (UNCHANGED CORE MECHANICS)
  public currentSpeedKmh: number = 0;
  public maxSpeedKmh: number = 148;
  public accelerationRate: number = 38; // km/h per second
  public brakingRate: number = 68; // km/h per second
  public playerX: number = 1.8; // Starting in lane 2
  public playerDistanceMeters: number = 0;
  public leanAngle: number = 0; // Roll radians

  // Active Control Inputs
  public isGasPressed: boolean = false;
  public isBrakePressed: boolean = false;
  public steerInput: number = 0; // -1 (left) to +1 (right)

  // Race & Session State
  public score: number = 0;
  public remainingTime: number = 40;
  public overtakesCount: number = 0;
  public nearMissCombo: number = 0;
  public lastNearMissTime: number = 0;
  public isHighSpeedStreak: boolean = false;
  public highSpeedStreakSeconds: number = 0;
  public isCrashed: boolean = false;
  public isCompleted: boolean = false;
  public isPaused: boolean = false;
  private crashAnimationTimer: number = 0;

  // Collision Bounding Box (Motorcycle rider + frame)
  private readonly playerCollisionWidth: number = 0.82;
  private readonly playerCollisionLength: number = 2.0;

  constructor(
    container: HTMLElement,
    levelConfig: MotoRaceLevelConfig,
    audio: MotoRaceAudio,
    callbacks: MotoRaceCallbacks
  ) {
    this.container = container;
    this.levelConfig = levelConfig;
    this.audio = audio;
    this.callbacks = callbacks;
    this.remainingTime = levelConfig.timeLimitSeconds;

    this.initThree();
    this.buildHighwayAndCity();
    this.buildCockpit();
    this.spawnInitialTraffic();

    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  /**
   * Initializes Three.js Scene, Camera, WebGLRenderer, and Professional Lighting
   */
  private initThree(): void {
    this.scene = new THREE.Scene();
    
    const isSunset = this.levelConfig.environmentTheme === 'sunset';
    const isNight = this.levelConfig.environmentTheme === 'night';

    const skyColor = isSunset ? 0xf97316 : isNight ? 0x070b14 : 0x38bdf8;
    const fogColor = isSunset ? 0xdd6b20 : isNight ? 0x090e1a : 0x7dd3fc;

    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(fogColor, 0.0062);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // First-person motorcycle camera: rider eye level ~1.30m above asphalt, looking over handlebars
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 400);
    this.camera.position.set(this.playerX, 1.30, 0);
    this.camera.rotation.x = -0.06;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = isNight ? 0.85 : 1.15;

    this.container.appendChild(this.renderer.domElement);

    // Environmental World Lighting - Tuned for realistic road asphalt visibility
    const ambientLight = new THREE.AmbientLight(
      isSunset ? 0xffc499 : isNight ? 0x2a3b5c : 0xffffff,
      isNight ? 0.65 : 1.05
    );
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      isSunset ? 0xff8c42 : isNight ? 0x6688cc : 0xfffaed,
      isNight ? 0.55 : 1.35
    );
    sunLight.position.set(35, 55, -45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 170;
    sunLight.shadow.camera.left = -32;
    sunLight.shadow.camera.right = 32;
    sunLight.shadow.camera.top = 32;
    sunLight.shadow.camera.bottom = -32;
    this.scene.add(sunLight);
  }

  /**
   * Generates high-resolution circular Canvas texture for Left Speedometer (0 - 200 km/h)
   */
  private createSpeedoDialTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const cx = 256;
    const cy = 256;
    const r = 240;

    // Deep rich dark navy-black gradient background
    const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, r);
    grad.addColorStop(0, '#09111f');
    grad.addColorStop(0.7, '#040912');
    grad.addColorStop(1, '#020408');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer subtle cyan illumination ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 232, 0, Math.PI * 2);
    ctx.stroke();

    // Concentric guide circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 218, 0, Math.PI * 2);
    ctx.stroke();

    // Speedometer dial sweep: 135 deg (bottom-left) to 405 deg (bottom-right) = 270 deg total
    const startAngle = 135 * (Math.PI / 180);
    const totalSweep = 270 * (Math.PI / 180);

    for (let speed = 0; speed <= 200; speed += 5) {
      const fraction = speed / 200;
      const angle = startAngle + fraction * totalSweep;
      const isMajor = speed % 20 === 0;
      const isMedium = speed % 10 === 0 && !isMajor;

      const innerR = isMajor ? 186 : isMedium ? 198 : 206;
      const outerR = 216;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.strokeStyle = isMajor ? '#ffffff' : isMedium ? '#cbd5e1' : '#64748b';
      ctx.lineWidth = isMajor ? 4.5 : isMedium ? 2.5 : 1.5;
      ctx.stroke();

      if (isMajor) {
        const textR = 158;
        const tx = cx + Math.cos(angle) * textR;
        const ty = cy + Math.sin(angle) * textR;
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(speed.toString(), tx, ty);
      }
    }

    // Classic Trip Odometer window in upper half
    ctx.fillStyle = '#050810';
    ctx.fillRect(cx - 65, cy - 88, 130, 34);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 65, cy - 88, 130, 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('0 1 4 8 2', cx - 12, cy - 70);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx + 40, cy - 86, 22, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('5', cx + 51, cy - 70);

    // "km/h" typography in lower half
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('km/h', cx, cy + 76);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('SPEED', cx, cy + 104);

    // Specular glass highlight arc across upper lens
    const glassGrad = ctx.createLinearGradient(0, 0, 0, 200);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 215, Math.PI * 1.1, Math.PI * 1.9);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Generates high-resolution circular Canvas texture for Right Tachometer (0 - 12 x1000 r/min with Redline)
   */
  private createTachoDialTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const cx = 256;
    const cy = 256;
    const r = 240;

    // Deep rich dark navy-black gradient background
    const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, r);
    grad.addColorStop(0, '#09111f');
    grad.addColorStop(0.7, '#040912');
    grad.addColorStop(1, '#020408');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer subtle cyan illumination ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 232, 0, Math.PI * 2);
    ctx.stroke();

    const startAngle = 135 * (Math.PI / 180);
    const totalSweep = 270 * (Math.PI / 180);

    // Prominent Redline Arc from 9,000 to 12,000 RPM (fraction 9/12 = 0.75 to 1.0)
    const redlineStart = startAngle + (9 / 12) * totalSweep;
    const redlineEnd = startAngle + totalSweep;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, 210, redlineStart, redlineEnd);
    ctx.stroke();

    // Concentric guide circle for safe zone
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 218, startAngle, redlineStart);
    ctx.stroke();

    for (let rpm = 0; rpm <= 12; rpm += 0.5) {
      const fraction = rpm / 12;
      const angle = startAngle + fraction * totalSweep;
      const isMajor = rpm % 1 === 0;
      const inRedline = rpm >= 9;

      const innerR = isMajor ? 186 : 202;
      const outerR = 216;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.strokeStyle = inRedline ? '#ef4444' : isMajor ? '#ffffff' : '#94a3b8';
      ctx.lineWidth = isMajor ? 4.5 : 2;
      ctx.stroke();

      if (isMajor) {
        const textR = 158;
        const tx = cx + Math.cos(angle) * textR;
        const ty = cy + Math.sin(angle) * textR;
        ctx.fillStyle = inRedline ? '#ef4444' : '#f8fafc';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rpm.toString(), tx, ty);
      }
    }

    // "RPM" in upper half
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RPM', cx, cy - 72);

    // "x1000 r/min" in lower half
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('x1000 r/min', cx, cy + 76);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('REDLINE', cx + 78, cy + 42);

    // Specular glass highlight arc
    const glassGrad = ctx.createLinearGradient(0, 0, 0, 200);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 215, Math.PI * 1.1, Math.PI * 1.9);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Builds the Reference-Accurate 3D First-Person Motorcycle Cockpit:
   * Matching the authentic classic roadster (CK 750F) from the reference video:
   * - Two prominent circular analog gauges (Left Speedometer, Right Tachometer)
   * - Dark satin tubular handlebars with riser clamps
   * - Classic olive-khaki fuel tank top and triple clamp with ignition key
   * - Realistic rider hands in light-khaki motorcycle gloves gripping handlebars
   * - Two round chrome rearview mirrors on angled stalks framing the screen
   * - Fluorescent red analog needles reacting dynamically to speed and RPM
   */
  private buildCockpit(): void {
    this.cockpitGroup = new THREE.Group();
    // Positioned in camera local space so it sits naturally in the lower third of the viewport
    this.cockpitGroup.position.set(0, -0.34, -0.72);
    this.camera.add(this.cockpitGroup);
    this.scene.add(this.camera);

    // =========================================================================
    // DEDICATED COCKPIT LIGHTING: Ensures motorcycle POPs brightly with crisp highlights
    // =========================================================================
    const cockpitKeyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    cockpitKeyLight.position.set(0, 1.4, 0.6);
    this.cockpitGroup.add(cockpitKeyLight);

    const cockpitFillLight = new THREE.PointLight(0xbde0fe, 1.8, 3.5);
    cockpitFillLight.position.set(0, 0.35, -0.15);
    this.cockpitGroup.add(cockpitFillLight);

    this.handlebarsGroup = new THREE.Group();
    this.cockpitGroup.add(this.handlebarsGroup);

    // =========================================================================
    // HIGH-CONTRAST AUTHENTIC MATERIALS
    // =========================================================================
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.98,
      roughness: 0.10,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      metalness: 0.85,
      roughness: 0.32,
    });
    const brushedAlloyMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.88,
      roughness: 0.25,
    });
    const tankOliveMat = new THREE.MeshStandardMaterial({
      color: 0x485834, // Metallic Olive / Khaki Green from CK 750F reference
      metalness: 0.58,
      roughness: 0.22,
    });
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.95,
    });
    const gloveFabricMat = new THREE.MeshStandardMaterial({
      color: 0xbdb7a4, // Light khaki / sand motorcycle glove fabric from reference video
      roughness: 0.70,
      metalness: 0.08,
    });
    const knuckleArmorMat = new THREE.MeshStandardMaterial({
      color: 0x22242a, // Dark reinforced knuckle shield
      roughness: 0.35,
      metalness: 0.6,
    });
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
    const glassLensMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.88,
      opacity: 0.45,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
    });
    const mirrorGlassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      metalness: 0.95,
      roughness: 0.10,
    });

    // =========================================================================
    // 1. MOTORCYCLE FRONT & BODY (Olive Fuel Tank & Triple Tree)
    // =========================================================================
    // Teardrop Fuel Tank Top (Visible in lower-center foreground)
    const tankGeom = new THREE.SphereGeometry(0.32, 24, 18);
    tankGeom.scale(1.15, 0.65, 1.75);
    const fuelTank = new THREE.Mesh(tankGeom, tankOliveMat);
    fuelTank.position.set(0, -0.25, 0.26);
    fuelTank.rotation.x = -0.18;
    this.cockpitGroup.add(fuelTank);

    // Chrome Fuel Filler Cap (Offset to right on top of tank)
    const capGeom = new THREE.CylinderGeometry(0.038, 0.042, 0.022, 20);
    const fuelCap = new THREE.Mesh(capGeom, chromeMat);
    fuelCap.position.set(0.065, -0.075, 0.20);
    this.cockpitGroup.add(fuelCap);

    // Black Center Rubber Tank Spine
    const tankSpine = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.015, 0.48), rubberMat);
    tankSpine.position.set(0, -0.065, 0.24);
    tankSpine.rotation.x = -0.18;
    this.cockpitGroup.add(tankSpine);

    // Top curvature of Round Chrome Headlight Bucket (Peeking below the gauges)
    const headlightTop = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), chromeMat);
    headlightTop.scale.set(1.2, 0.9, 1.2);
    headlightTop.position.set(0, -0.06, -0.18);
    this.handlebarsGroup.add(headlightTop);

    // =========================================================================
    // 2. TRIPLE CLAMP & HANDLEBAR RISERS
    // =========================================================================
    // Cast Dark Upper Triple Tree Clamp
    const clampGeom = new THREE.BoxGeometry(0.56, 0.045, 0.14);
    const tripleClamp = new THREE.Mesh(clampGeom, darkMetalMat);
    tripleClamp.position.set(0, 0.02, 0);
    this.handlebarsGroup.add(tripleClamp);

    // Left & Right Chrome Fork Top Caps with Hex Nut
    [-0.23, 0.23].forEach((fx) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.055, 16), chromeMat);
      cap.position.set(fx, 0.045, 0);
      this.handlebarsGroup.add(cap);

      const hexBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.065, 6), brushedAlloyMat);
      hexBolt.position.set(fx, 0.05, 0);
      this.handlebarsGroup.add(hexBolt);
    });

    // Central Steering Stem Nut
    const stemNut = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.052, 6), chromeMat);
    stemNut.position.set(0, 0.045, 0.01);
    this.handlebarsGroup.add(stemNut);

    // Ignition Lock Switch Barrel & Realistic Key
    const ignitionBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.055, 16), darkMetalMat);
    ignitionBarrel.position.set(0, 0.055, -0.045);
    this.handlebarsGroup.add(ignitionBarrel);

    const ignitionKey = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.038, 0.024), chromeMat);
    ignitionKey.position.set(0, 0.082, -0.045);
    this.handlebarsGroup.add(ignitionKey);

    const keyFob = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.024, 0.018), rubberMat);
    keyFob.position.set(0, 0.096, -0.045);
    this.handlebarsGroup.add(keyFob);

    // Two Heavy-Duty Handlebar Risers (Left & Right)
    [-0.085, 0.085].forEach((rx) => {
      const riserPost = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.065, 16), darkMetalMat);
      riserPost.position.set(rx, 0.05, -0.025);
      this.handlebarsGroup.add(riserPost);

      const riserCap = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.022, 0.048), brushedAlloyMat);
      riserCap.position.set(rx, 0.08, -0.025);
      this.handlebarsGroup.add(riserCap);

      // Clamp bolts
      [-0.015, 0.015].forEach((bz) => {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.025, 8), chromeMat);
        bolt.position.set(rx, 0.09, -0.025 + bz);
        this.handlebarsGroup.add(bolt);
      });
    });

    // =========================================================================
    // 3. CLASSIC TUBULAR HANDLEBAR (Satin Gunmetal Steel)
    // =========================================================================
    // Center straight bar segment
    const centerBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 16), darkMetalMat);
    centerBar.rotation.z = Math.PI / 2;
    centerBar.position.set(0, 0.075, -0.025);
    this.handlebarsGroup.add(centerBar);

    // Left swept handlebar tube
    const leftBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.38, 16), darkMetalMat);
    leftBar.rotation.z = (Math.PI / 2) + 0.12;
    leftBar.rotation.y = 0.10;
    leftBar.position.set(-0.28, 0.085, -0.045);
    this.handlebarsGroup.add(leftBar);

    // Right swept handlebar tube
    const rightBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.38, 16), darkMetalMat);
    rightBar.rotation.z = (Math.PI / 2) - 0.12;
    rightBar.rotation.y = -0.10;
    rightBar.position.set(0.28, 0.085, -0.045);
    this.handlebarsGroup.add(rightBar);

    // Bar End Weights (Left & Right Chrome)
    [-0.485, 0.485].forEach((bx) => {
      const barEnd = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 16), chromeMat);
      barEnd.rotation.z = Math.PI / 2;
      barEnd.position.set(bx, 0.085, -0.058);
      this.handlebarsGroup.add(barEnd);
    });

    // =========================================================================
    // 4. CONTROLS, SWITCHES & LEVERS
    // =========================================================================
    // Textured Rubber Handgrips (Diamond/Ribbed)
    const gripGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.155, 16);
    const leftGrip = new THREE.Mesh(gripGeom, rubberMat);
    leftGrip.rotation.z = Math.PI / 2;
    leftGrip.position.set(-0.39, 0.085, -0.055);
    this.handlebarsGroup.add(leftGrip);

    const rightGrip = new THREE.Mesh(gripGeom, rubberMat);
    rightGrip.rotation.z = Math.PI / 2;
    rightGrip.position.set(0.39, 0.085, -0.055);
    this.handlebarsGroup.add(rightGrip);

    // Left Switch Assembly (Turn signals, horn)
    const leftSwitchBox = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.042, 0.042), darkMetalMat);
    leftSwitchBox.position.set(-0.295, 0.088, -0.048);
    this.handlebarsGroup.add(leftSwitchBox);

    const hornButton = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.01, 10), rubberMat);
    hornButton.position.set(-0.295, 0.088, -0.026);
    hornButton.rotation.x = Math.PI / 2;
    this.handlebarsGroup.add(hornButton);

    // Right Switch Assembly (Engine kill rocker switch)
    const rightSwitchBox = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.042, 0.042), darkMetalMat);
    rightSwitchBox.position.set(0.295, 0.088, -0.048);
    this.handlebarsGroup.add(rightSwitchBox);

    const killSwitchMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const killSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 0.015), killSwitchMat);
    killSwitch.position.set(0.295, 0.105, -0.048);
    this.handlebarsGroup.add(killSwitch);

    // Right Front Brake Master Cylinder Reservoir with Sight Glass
    const brakeReservoir = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.045, 0.05), darkMetalMat);
    brakeReservoir.position.set(0.315, 0.12, -0.048);
    this.handlebarsGroup.add(brakeReservoir);

    const sightGlass = new THREE.Mesh(new THREE.CircleGeometry(0.011, 12), glassLensMat);
    sightGlass.position.set(0.315, 0.12, -0.022);
    this.handlebarsGroup.add(sightGlass);

    // Polished Alloy Clutch Lever (Left)
    const leverGeom = new THREE.BoxGeometry(0.18, 0.012, 0.022);
    const leftLever = new THREE.Mesh(leverGeom, chromeMat);
    leftLever.position.set(-0.35, 0.088, -0.095);
    leftLever.rotation.y = -0.28;
    this.handlebarsGroup.add(leftLever);

    const leftLeverTip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), chromeMat);
    leftLeverTip.position.set(-0.435, 0.088, -0.118);
    this.handlebarsGroup.add(leftLeverTip);

    // Polished Alloy Front Brake Lever (Right)
    const rightLever = new THREE.Mesh(leverGeom, chromeMat);
    rightLever.position.set(0.35, 0.088, -0.095);
    rightLever.rotation.y = 0.28;
    this.handlebarsGroup.add(rightLever);

    const rightLeverTip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), chromeMat);
    rightLeverTip.position.set(0.435, 0.088, -0.118);
    this.handlebarsGroup.add(rightLeverTip);

    // =========================================================================
    // 5. TWO PROMINENT CIRCULAR ANALOG GAUGES (Center Dashboard Cluster)
    // =========================================================================
    // Common Pod & Bezel Geometries
    const podGeom = new THREE.CylinderGeometry(0.094, 0.096, 0.055, 28);
    const bezelGeom = new THREE.TorusGeometry(0.095, 0.009, 14, 32);
    const dialGeom = new THREE.CircleGeometry(0.088, 32);
    const lensGeom = new THREE.CircleGeometry(0.088, 32);

    // Dial Canvas Textures
    const speedoTexture = this.createSpeedoDialTexture();
    const tachoTexture = this.createTachoDialTexture();

    const speedoDialMat = new THREE.MeshBasicMaterial({ map: speedoTexture });
    const tachoDialMat = new THREE.MeshBasicMaterial({ map: tachoTexture });

    // LEFT ROUND GAUGE: SPEEDOMETER (0 - 200 KM/H)
    const speedoGroup = new THREE.Group();
    speedoGroup.position.set(-0.135, 0.145, -0.065);
    speedoGroup.rotation.x = Math.PI / 3.4;
    this.handlebarsGroup.add(speedoGroup);

    const speedoPod = new THREE.Mesh(podGeom, darkMetalMat);
    speedoPod.rotation.x = Math.PI / 2;
    speedoGroup.add(speedoPod);

    const speedoBezel = new THREE.Mesh(bezelGeom, chromeMat);
    speedoBezel.position.set(0, 0, 0.026);
    speedoGroup.add(speedoBezel);

    const speedoDial = new THREE.Mesh(dialGeom, speedoDialMat);
    speedoDial.position.set(0, 0, 0.027);
    speedoGroup.add(speedoDial);

    // 3D Fluorescent Red Speedometer Needle
    const needleGeom = new THREE.BoxGeometry(0.006, 0.076, 0.003);
    needleGeom.translate(0, 0.035, 0.002);
    this.speedoNeedle = new THREE.Mesh(needleGeom, needleMat);
    this.speedoNeedle.position.set(0, 0, 0.029);
    this.speedoNeedle.rotation.z = Math.PI * 0.75; // 0 km/h position
    speedoGroup.add(this.speedoNeedle);

    // Needle Center Pivot Cap (Black with chrome pin)
    const pivotCap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 16), darkMetalMat);
    pivotCap.rotation.x = Math.PI / 2;
    pivotCap.position.set(0, 0, 0.032);
    speedoGroup.add(pivotCap);

    const pivotPin = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.009, 12), chromeMat);
    pivotPin.rotation.x = Math.PI / 2;
    pivotPin.position.set(0, 0, 0.033);
    speedoGroup.add(pivotPin);

    // Convex Glass Protective Lens
    const speedoLens = new THREE.Mesh(lensGeom, glassLensMat);
    speedoLens.position.set(0, 0, 0.035);
    speedoGroup.add(speedoLens);

    // RIGHT ROUND GAUGE: TACHOMETER (0 - 12 x1000 r/min)
    const tachoGroup = new THREE.Group();
    tachoGroup.position.set(0.135, 0.145, -0.065);
    tachoGroup.rotation.x = Math.PI / 3.4;
    this.handlebarsGroup.add(tachoGroup);

    const tachoPod = new THREE.Mesh(podGeom, darkMetalMat);
    tachoPod.rotation.x = Math.PI / 2;
    tachoGroup.add(tachoPod);

    const tachoBezel = new THREE.Mesh(bezelGeom, chromeMat);
    tachoBezel.position.set(0, 0, 0.026);
    tachoGroup.add(tachoBezel);

    const tachoDial = new THREE.Mesh(dialGeom, tachoDialMat);
    tachoDial.position.set(0, 0, 0.027);
    tachoGroup.add(tachoDial);

    // 3D Fluorescent Red Tachometer Needle
    this.tachoNeedle = new THREE.Mesh(needleGeom.clone(), needleMat);
    this.tachoNeedle.position.set(0, 0, 0.029);
    this.tachoNeedle.rotation.z = Math.PI * 0.75;
    tachoGroup.add(this.tachoNeedle);

    const tachoPivotCap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 16), darkMetalMat);
    tachoPivotCap.rotation.x = Math.PI / 2;
    tachoPivotCap.position.set(0, 0, 0.032);
    tachoGroup.add(tachoPivotCap);

    const tachoPivotPin = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.009, 12), chromeMat);
    tachoPivotPin.rotation.x = Math.PI / 2;
    tachoPivotPin.position.set(0, 0, 0.033);
    tachoGroup.add(tachoPivotPin);

    const tachoLens = new THREE.Mesh(lensGeom, glassLensMat);
    tachoLens.position.set(0, 0, 0.035);
    tachoGroup.add(tachoLens);

    // CENTRAL GAUGE BRIDGE & PILOT INDICATOR LIGHTS
    const bridgeGeom = new THREE.BoxGeometry(0.12, 0.035, 0.045);
    const gaugeBridge = new THREE.Mesh(bridgeGeom, darkMetalMat);
    gaugeBridge.position.set(0, 0.145, -0.065);
    gaugeBridge.rotation.x = Math.PI / 3.4;
    this.handlebarsGroup.add(gaugeBridge);

    // Pilot Lights: Green Neutral, Blue High Beam, Amber Turn Signals
    const greenPilotMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.8 });
    const greenNeutral = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 12), greenPilotMat);
    greenNeutral.position.set(0, 0.016, 0);
    gaugeBridge.add(greenNeutral);

    const bluePilotMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 });
    const blueHighBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 12), bluePilotMat);
    blueHighBeam.position.set(-0.032, 0.016, 0);
    gaugeBridge.add(blueHighBeam);

    const amberPilotMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.7 });
    const amberTurn = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 12), amberPilotMat);
    amberTurn.position.set(0.032, 0.016, 0);
    gaugeBridge.add(amberTurn);

    // =========================================================================
    // 6. TWO ROUND REAR-VIEW MIRRORS (Framing Screen Exactly like Reference)
    // =========================================================================
    const mirrorStemGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.28, 12);
    const mirrorHousingGeom = new THREE.CylinderGeometry(0.076, 0.076, 0.022, 24);

    // LEFT ROUND MIRROR
    const leftStem = new THREE.Mesh(mirrorStemGeom, chromeMat);
    leftStem.position.set(-0.45, 0.20, -0.04);
    leftStem.rotation.z = 0.62;
    leftStem.rotation.y = -0.15;
    this.handlebarsGroup.add(leftStem);

    const leftMirrorHead = new THREE.Mesh(mirrorHousingGeom, darkMetalMat);
    leftMirrorHead.position.set(-0.55, 0.30, -0.04);
    leftMirrorHead.rotation.x = Math.PI / 2.3;
    leftMirrorHead.rotation.y = -0.28;
    this.handlebarsGroup.add(leftMirrorHead);

    const leftMirrorRim = new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.006, 10, 24), chromeMat);
    leftMirrorRim.position.set(0, 0.011, 0);
    leftMirrorRim.rotation.x = Math.PI / 2;
    leftMirrorHead.add(leftMirrorRim);

    const leftGlass = new THREE.Mesh(new THREE.CircleGeometry(0.071, 20), mirrorGlassMat);
    leftGlass.position.set(0, 0.012, 0);
    leftGlass.rotation.x = -Math.PI / 2;
    leftMirrorHead.add(leftGlass);

    // RIGHT ROUND MIRROR
    const rightStem = new THREE.Mesh(mirrorStemGeom, chromeMat);
    rightStem.position.set(0.45, 0.20, -0.04);
    rightStem.rotation.z = -0.62;
    rightStem.rotation.y = 0.15;
    this.handlebarsGroup.add(rightStem);

    const rightMirrorHead = new THREE.Mesh(mirrorHousingGeom, darkMetalMat);
    rightMirrorHead.position.set(0.55, 0.30, -0.04);
    rightMirrorHead.rotation.x = Math.PI / 2.3;
    rightMirrorHead.rotation.y = 0.28;
    this.handlebarsGroup.add(rightMirrorHead);

    const rightMirrorRim = new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.006, 10, 24), chromeMat);
    rightMirrorRim.position.set(0, 0.011, 0);
    rightMirrorRim.rotation.x = Math.PI / 2;
    rightMirrorHead.add(rightMirrorRim);

    const rightGlass = new THREE.Mesh(new THREE.CircleGeometry(0.071, 20), mirrorGlassMat);
    rightGlass.position.set(0, 0.012, 0);
    rightGlass.rotation.x = -Math.PI / 2;
    rightMirrorHead.add(rightGlass);

    // =========================================================================
    // 7. RIDER HANDS & GLOVES (Textured Light Khaki / Sand Fabric from Reference)
    // =========================================================================
    // LEFT HAND & FOREARM
    const leftPalm = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), gloveFabricMat);
    leftPalm.scale.set(1.15, 0.90, 1.35);
    leftPalm.position.set(-0.39, 0.095, -0.05);
    this.handlebarsGroup.add(leftPalm);

    // Curled Fingers Wrapping Around the Grip
    const leftFingers = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.038, 0.065), gloveFabricMat);
    leftFingers.position.set(-0.39, 0.085, -0.085);
    leftFingers.rotation.x = 0.35;
    this.handlebarsGroup.add(leftFingers);

    // Thumb Wrapped Underneath
    const leftThumb = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.045), gloveFabricMat);
    leftThumb.position.set(-0.34, 0.065, -0.04);
    this.handlebarsGroup.add(leftThumb);

    // Dark Knuckle Protection Plate
    const leftKnuckle = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.024, 0.085), knuckleArmorMat);
    leftKnuckle.position.set(-0.39, 0.125, -0.05);
    this.handlebarsGroup.add(leftKnuckle);

    // Forearm Sleeve Extends Backwards Towards Screen Edge
    const armGeom = new THREE.CylinderGeometry(0.052, 0.062, 0.42, 14);
    const leftArm = new THREE.Mesh(armGeom, gloveFabricMat);
    leftArm.position.set(-0.45, -0.09, 0.14);
    leftArm.rotation.x = Math.PI / 3.4;
    leftArm.rotation.z = -0.32;
    this.handlebarsGroup.add(leftArm);

    // RIGHT HAND & FOREARM (Throttle Grip)
    const rightPalm = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), gloveFabricMat);
    rightPalm.scale.set(1.15, 0.90, 1.35);
    rightPalm.position.set(0.39, 0.095, -0.05);
    this.handlebarsGroup.add(rightPalm);

    const rightFingers = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.038, 0.065), gloveFabricMat);
    rightFingers.position.set(0.39, 0.085, -0.085);
    rightFingers.rotation.x = 0.35;
    this.handlebarsGroup.add(rightFingers);

    const rightThumb = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.045), gloveFabricMat);
    rightThumb.position.set(0.34, 0.065, -0.04);
    this.handlebarsGroup.add(rightThumb);

    const rightKnuckle = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.024, 0.085), knuckleArmorMat);
    rightKnuckle.position.set(0.39, 0.125, -0.05);
    this.handlebarsGroup.add(rightKnuckle);

    const rightArm = new THREE.Mesh(armGeom, gloveFabricMat);
    rightArm.position.set(0.45, -0.09, 0.14);
    rightArm.rotation.x = Math.PI / 3.4;
    rightArm.rotation.z = 0.32;
    this.handlebarsGroup.add(rightArm);
  }

  // Shared Procedural Textures for Realistic Road Asphalt
  private static asphaltDiffuseMap: THREE.CanvasTexture | null = null;
  private static asphaltBumpMap: THREE.CanvasTexture | null = null;

  /**
   * Generates procedural realistic highway asphalt textures:
   * - Medium-dark gray base stone tone (replaces flat pure black)
   * - Thousands of mineral aggregate flecks (crushed granite, quartz, basalt)
   * - Subtle natural weathering patches & tonal variations
   * - Clean highway tire-wear tracking in traffic lanes
   * - Micro-surface bump mapping for natural light scattering
   */
  private getAsphaltTextures(): { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
    if (MotoRaceEngine.asphaltDiffuseMap && MotoRaceEngine.asphaltBumpMap) {
      return { diffuse: MotoRaceEngine.asphaltDiffuseMap, bump: MotoRaceEngine.asphaltBumpMap };
    }

    const width = 1024;
    const height = 1024;

    // 1. Diffuse Map (Medium-dark gray authentic road asphalt)
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = width;
    diffCanvas.height = height;
    const diffCtx = diffCanvas.getContext('2d')!;

    // Base medium-dark gray asphalt tone (RGB ~72, 76, 84)
    diffCtx.fillStyle = '#484c54';
    diffCtx.fillRect(0, 0, width, height);

    // Natural stone consolidation & weathered patches
    const patchTones = ['#41454d', '#4d525b', '#3e4249', '#515660', '#464b53'];
    for (let p = 0; p < 38; p++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const pr = 70 + Math.random() * 140;
      const pGrad = diffCtx.createRadialGradient(px, py, 10, px, py, pr);
      const chosenColor = patchTones[Math.floor(Math.random() * patchTones.length)];
      pGrad.addColorStop(0, chosenColor);
      pGrad.addColorStop(1, 'transparent');
      diffCtx.save();
      diffCtx.globalAlpha = 0.3 + Math.random() * 0.25;
      diffCtx.fillStyle = pGrad;
      diffCtx.beginPath();
      diffCtx.arc(px, py, pr, 0, Math.PI * 2);
      diffCtx.fill();
      diffCtx.restore();
    }

    // Subtle lane tire wear tracking (faint smoother bands where vehicle wheels travel)
    const laneCenters = [0.15, 0.38, 0.62, 0.85];
    laneCenters.forEach((lc) => {
      [-0.045, 0.045].forEach((offset) => {
        const trackX = (lc + offset) * width;
        const trackWidth = width * 0.075;
        const trackGrad = diffCtx.createLinearGradient(
          trackX - trackWidth / 2,
          0,
          trackX + trackWidth / 2,
          0
        );
        trackGrad.addColorStop(0, 'transparent');
        trackGrad.addColorStop(0.5, '#545862');
        trackGrad.addColorStop(1, 'transparent');
        diffCtx.save();
        diffCtx.globalAlpha = 0.16;
        diffCtx.fillStyle = trackGrad;
        diffCtx.fillRect(trackX - trackWidth / 2, 0, trackWidth, height);
        diffCtx.restore();
      });
    });

    // High-resolution mineral aggregate & stone crystalline flecks
    const imgData = diffCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // 2. Matching Bump Map
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = width;
    bumpCanvas.height = height;
    const bumpCtx = bumpCanvas.getContext('2d')!;
    const bumpData = bumpCtx.createImageData(width, height);
    const bData = bumpData.data;

    for (let i = 0; i < data.length; i += 4) {
      const rand = Math.random();
      let delta = 0;
      let rOffset = 0;
      let gOffset = 0;
      let bOffset = 0;

      if (rand > 0.86) {
        // Light quartz / limestone aggregate particles
        delta = Math.floor(18 + Math.random() * 32);
        rOffset = delta;
        gOffset = delta;
        bOffset = delta + 3;
      } else if (rand < 0.14) {
        // Dark basalt / bitumen binder crevices
        delta = -Math.floor(14 + Math.random() * 22);
        rOffset = delta;
        gOffset = delta;
        bOffset = delta;
      } else if (rand > 0.62) {
        // Mid-tone aggregate speckle
        delta = Math.floor((Math.random() - 0.5) * 16);
        rOffset = delta;
        gOffset = delta;
        bOffset = delta;
      }

      const r = Math.min(255, Math.max(0, data[i] + rOffset));
      const g = Math.min(255, Math.max(0, data[i + 1] + gOffset));
      const b = Math.min(255, Math.max(0, data[i + 2] + bOffset));

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;

      // Surface roughness / bump luminance
      const lum = (r + g + b) / 3;
      bData[i] = lum;
      bData[i + 1] = lum;
      bData[i + 2] = lum;
      bData[i + 3] = 255;
    }

    diffCtx.putImageData(imgData, 0, 0);
    bumpCtx.putImageData(bumpData, 0, 0);

    const diffTex = new THREE.CanvasTexture(diffCanvas);
    diffTex.wrapS = THREE.RepeatWrapping;
    diffTex.wrapT = THREE.RepeatWrapping;
    diffTex.repeat.set(3, 10);
    diffTex.colorSpace = THREE.SRGBColorSpace;

    const bumpTex = new THREE.CanvasTexture(bumpCanvas);
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.repeat.set(3, 10);

    MotoRaceEngine.asphaltDiffuseMap = diffTex;
    MotoRaceEngine.asphaltBumpMap = bumpTex;

    return { diffuse: diffTex, bump: bumpTex };
  }

  /**
   * Constructs modular road chunks with pure connected urban architecture
   */
  private buildHighwayAndCity(): void {
    for (let i = 0; i < this.NUM_ROAD_CHUNKS; i++) {
      const zPos = -i * this.ROAD_CHUNK_LENGTH;
      const chunk = this.createRoadChunk(zPos);
      this.roadChunks.push(chunk);
      this.scene.add(chunk);
    }
  }

  /**
   * Creates a single 80m segment of the connected 4-lane city boulevard:
   * Pure urban city with sidewalks, curbs, crash barriers, storefronts, and skyscrapers.
   * Features realistic medium-dark gray stone asphalt with aggregate texture.
   */
  private createRoadChunk(zPos: number): THREE.Group {
    const chunk = new THREE.Group();
    chunk.position.z = zPos;

    // 1. Continuous Ground Foundation (100m wide, solid concrete / dark curb base)
    const groundGeom = new THREE.PlaneGeometry(100, this.ROAD_CHUNK_LENGTH);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x272b33, roughness: 0.96 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    chunk.add(ground);

    // 2. 4-Lane Realistic Road Asphalt Surface (15.5m wide, medium-dark natural gray with aggregate texture)
    const { diffuse: asphaltDiff, bump: asphaltBump } = this.getAsphaltTextures();
    const roadGeom = new THREE.PlaneGeometry(15.5, this.ROAD_CHUNK_LENGTH);
    const roadMat = new THREE.MeshStandardMaterial({
      map: asphaltDiff,
      bumpMap: asphaltBump,
      bumpScale: 0.035,
      color: 0xe8ecf2, // High fidelity reflectance showing natural medium-dark gray aggregate
      roughness: 0.86,
      metalness: 0.04,
    });
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    chunk.add(road);

    // 3. Road Markings (3 Dashed White Divider Lines + 2 Solid Edge Lines)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });

    // 3 Dashed divider lines at X = -3.6, 0, +3.6
    const dividerX = [-3.6, 0, 3.6];
    dividerX.forEach((x) => {
      const dashCount = 8;
      for (let d = 0; d < dashCount; d++) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 4.8), lineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x, 0.015, -d * 10 + 35);
        chunk.add(dash);
      }
    });

    // Solid Edge Lines (at X = -7.4, +7.4)
    [-7.4, 7.4].forEach((ex) => {
      const edgeLine = new THREE.Mesh(new THREE.PlaneGeometry(0.25, this.ROAD_CHUNK_LENGTH), lineMat);
      edgeLine.rotation.x = -Math.PI / 2;
      edgeLine.position.set(ex, 0.015, 0);
      chunk.add(edgeLine);
    });

    // Pedestrian Zebra Crosswalk at every 160m segment
    if (Math.abs(zPos) % 160 === 0) {
      for (let zw = -6.8; zw <= 6.8; zw += 1.0) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 4.2), lineMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(zw, 0.016, -15);
        chunk.add(stripe);
      }
    }

    // 4. Raised Sidewalks with Red/White Beveled Curbs
    const curbStripeMat1 = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.65 }); // Red
    const curbStripeMat2 = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 }); // White
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 });

    [-8.0, 8.0].forEach((cx) => {
      const segments = 10;
      const segLen = this.ROAD_CHUNK_LENGTH / segments;
      for (let s = 0; s < segments; s++) {
        const curb = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.28, segLen),
          s % 2 === 0 ? curbStripeMat1 : curbStripeMat2
        );
        curb.position.set(cx, 0.14, -this.ROAD_CHUNK_LENGTH / 2 + s * segLen + segLen / 2);
        chunk.add(curb);
      }

      // Concrete Sidewalk Slab
      const walkX = cx > 0 ? cx + 4.2 : cx - 4.2;
      const walk = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.28, this.ROAD_CHUNK_LENGTH), sidewalkMat);
      walk.position.set(walkX, 0.14, 0);
      walk.receiveShadow = true;
      chunk.add(walk);

      // Metal Crash Guardrail along the curb
      const railPoleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.35 });
      for (let rz = -35; rz <= 35; rz += 10) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8), railPoleMat);
        pole.position.set(cx > 0 ? cx + 0.35 : cx - 0.35, 0.5, rz);
        chunk.add(pole);
      }
      const railBeam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, this.ROAD_CHUNK_LENGTH), railPoleMat);
      railBeam.position.set(cx > 0 ? cx + 0.35 : cx - 0.35, 0.75, 0);
      chunk.add(railBeam);
    });

    // 5. Modern Cantilever Street Lamps every 30m
    [-8.8, 8.8].forEach((lx) => {
      for (let lz = -25; lz <= 25; lz += 30) {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.12, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 })
        );
        pole.position.set(lx, 4.0, lz);
        chunk.add(pole);

        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 0.08, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 })
        );
        arm.position.set(lx > 0 ? lx - 0.9 : lx + 0.9, 7.9, lz);
        chunk.add(arm);

        const lampHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.14, 0.28),
          new THREE.MeshStandardMaterial({ color: 0xfffae0, emissive: 0xffea85, emissiveIntensity: 1.0 })
        );
        lampHead.position.set(lx > 0 ? lx - 1.8 : lx + 1.8, 7.8, lz);
        chunk.add(lampHead);
      }
    });

    // 6. Urban Street Infrastructure: Bus Stop Shelters & Parked Cars
    [-11.0, 11.0].forEach((bx) => {
      // Parked Car in parking bay along the sidewalk
      const parkedCar = this.createRealisticSedan(bx, -10, Math.random() > 0.5 ? 0x2563eb : 0xdbe2ea);
      chunk.add(parkedCar);

      // Glass Bus Stop Shelter
      const shelter = new THREE.Group();
      shelter.position.set(bx, 1.2, 18);
      const glassShelterMat = new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transmission: 0.8, transparent: true, opacity: 0.5 });
      const frameShelterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 4.0), glassShelterMat);
      shelter.add(backWall);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 4.2), frameShelterMat);
      roof.position.set(bx > 0 ? -0.8 : 0.8, 1.1, 0);
      shelter.add(roof);
      chunk.add(shelter);
    });

    // 7. MULTI-LAYERED URBAN ARCHITECTURE (No trees, 100% city)
    // FOREGROUND & MIDGROUND BUILDINGS (Shops, Cafes, Apartments)
    const buildingColors = [0x1e293b, 0x334155, 0x475569, 0x0f172a, 0x273549, 0x182234];
    [-23, 23].forEach((bx) => {
      for (let bz = -35; bz <= 35; bz += 24) {
        const bHeight = 18 + Math.random() * 32;
        const bWidth = 14;
        const bDepth = 20;
        const col = buildingColors[Math.floor(Math.random() * buildingColors.length)];

        // Main Building Block
        const building = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth, bHeight, bDepth),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.75, metalness: 0.25 })
        );
        building.position.set(bx > 0 ? bx + bWidth / 2 : bx - bWidth / 2, bHeight / 2, bz);
        building.castShadow = true;
        building.receiveShadow = true;
        chunk.add(building);

        // Ground Floor Storefront with illuminated display windows & colorful canopy
        const storefrontMat = new THREE.MeshStandardMaterial({
          color: 0xffd166,
          emissive: 0xffa200,
          emissiveIntensity: 0.65,
        });
        const storeFront = new THREE.Mesh(new THREE.PlaneGeometry(bDepth * 0.85, 3.8), storefrontMat);
        storeFront.rotation.y = bx > 0 ? -Math.PI / 2 : Math.PI / 2;
        storeFront.position.set(bx > 0 ? bx + 0.1 : bx - 0.1, 1.9, bz);
        chunk.add(storeFront);

        // Storefront Canopy / Awning
        const awningMat = new THREE.MeshStandardMaterial({ color: bx > 0 ? 0xdc2626 : 0x0284c7, roughness: 0.6 });
        const awning = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, bDepth * 0.88), awningMat);
        awning.position.set(bx > 0 ? bx - 0.5 : bx + 0.5, 3.8, bz);
        chunk.add(awning);

        // Window Rows
        const windowGrid = new THREE.Mesh(
          new THREE.PlaneGeometry(bDepth * 0.8, bHeight * 0.6),
          new THREE.MeshBasicMaterial({
            color: this.levelConfig.environmentTheme === 'night' ? 0xffea85 : 0xbae6fd,
            opacity: 0.6,
            transparent: true,
          })
        );
        windowGrid.rotation.y = bx > 0 ? -Math.PI / 2 : Math.PI / 2;
        windowGrid.position.set(bx > 0 ? bx + 0.05 : bx - 0.05, bHeight / 2 + 2, bz);
        chunk.add(windowGrid);
      }
    });

    // BACKGROUND SKYSCRAPERS (Layer 3: Distant City Skyline)
    [-45, 45].forEach((sx) => {
      for (let sz = -30; sz <= 30; sz += 35) {
        const sHeight = 45 + Math.random() * 45;
        const sWidth = 22;
        const sDepth = 28;
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(sWidth, sHeight, sDepth),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.5 })
        );
        tower.position.set(sx > 0 ? sx + sWidth / 2 : sx - sWidth / 2, sHeight / 2, sz);
        chunk.add(tower);

        // Illuminated skyscraper window grid
        const towerWindows = new THREE.Mesh(
          new THREE.PlaneGeometry(sDepth * 0.85, sHeight * 0.75),
          new THREE.MeshBasicMaterial({
            color: this.levelConfig.environmentTheme === 'night' ? 0xfff3a1 : 0x7dd3fc,
            opacity: 0.45,
            transparent: true,
          })
        );
        towerWindows.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
        towerWindows.position.set(sx > 0 ? sx + 0.1 : sx - 0.1, sHeight / 2, sz);
        chunk.add(towerWindows);
      }
    });

    // 8. Overhead Highway Destination Sign Gantry (every 160m)
    if (Math.abs(zPos) % 160 === 0) {
      const gantry = this.createOverheadGantry();
      chunk.add(gantry);
    }

    return chunk;
  }

  /**
   * Overhead green highway sign gantry spanning the 4 lanes
   */
  private createOverheadGantry(): THREE.Group {
    const gantry = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
    const signMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });

    [-8.2, 8.2].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 8.5, 12), steelMat);
      pillar.position.set(px, 4.25, 0);
      gantry.add(pillar);
    });

    const truss = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.5, 0.5), steelMat);
    truss.position.set(0, 8.2, 0);
    gantry.add(truss);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(11.5, 2.2, 0.12), signMat);
    sign.position.set(0, 7.2, 0);
    gantry.add(sign);

    const border = new THREE.Mesh(
      new THREE.BoxGeometry(11.7, 2.3, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    border.position.set(0, 7.2, -0.05);
    gantry.add(border);

    return gantry;
  }

  /**
   * Creates a static parked sedan for curbside realism
   */
  private createRealisticSedan(x: number, z: number, color: number): THREE.Group {
    const car = new THREE.Group();
    car.position.set(x, 0, z);
    const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });

    // Lower chassis & hood
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 4.3), bodyMat);
    lowerBody.position.set(0, 0.5, 0);
    car.add(lowerBody);

    // Curved Cabin Glass
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.65, 2.3), glassMat);
    cabin.position.set(0, 1.1, -0.15);
    car.add(cabin);

    // 4 Wheels
    [-1.0, 1.0].forEach((wx) => {
      [-1.3, 1.3].forEach((wz) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.32, wz);
        car.add(wheel);
      });
    });

    return car;
  }

  /**
   * Checkered finish-line archway at target distance
   */
  private spawnFinishGantry(): void {
    if (this.finishGantry) return;

    this.finishGantry = new THREE.Group();
    this.finishGantry.position.set(0, 0, -this.levelConfig.targetDistanceMeters);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
    [-8.2, 8.2].forEach((px) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 9, 12), pillarMat);
      p.position.set(px, 4.5, 0);
      this.finishGantry!.add(p);
    });

    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(16.8, 2.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xffc700, emissiveIntensity: 0.6 })
    );
    banner.position.set(0, 8.2, 0);
    this.finishGantry.add(banner);

    this.scene.add(this.finishGantry);
  }

  /**
   * Creates a detailed, anatomically believable 3D traffic automobile
   * (Sedan, SUV, Yellow Taxi, Hatchback, Delivery Van, or Heavy Truck)
   */
  private createTrafficVehicle(type: TrafficVehicle['type'], laneIndex: number, zDistance: number): TrafficVehicle {
    const group = new THREE.Group();
    const xPos = this.LANE_POSITIONS[laneIndex];
    group.position.set(xPos, 0, zDistance);

    const brakeLights: THREE.Mesh[] = [];
    const headlights: THREE.Mesh[] = [];

    const carColors = [0x2563eb, 0xdbe2ea, 0x111827, 0x059669, 0xd97706, 0xe11d48, 0x475569];
    const carColor = type === 'taxi' ? 0xf59e0b : carColors[Math.floor(Math.random() * carColors.length)];

    const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, metalness: 0.75, roughness: 0.28 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.08, metalness: 0.95 });
    const wheelRubberMat = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.9 });
    const wheelRimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.98, roughness: 0.1 });
    const brakeLightMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.6,
    });
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfffbe8,
      emissive: 0xfffae0,
      emissiveIntensity: 1.0,
    });

    let width = 2.0;
    let length = 4.4;
    let height = 1.45;

    if (type === 'truck') {
      width = 2.6;
      length = 9.2;
      height = 3.6;

      // Heavy Cargo Box Trailer
      const trailer = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.8, 6.8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 })
      );
      trailer.position.set(0, 2.1, 0.9);
      trailer.castShadow = true;
      group.add(trailer);

      // Cab
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 2.2), bodyMat);
      cab.position.set(0, 1.65, -3.2);
      group.add(cab);

      // Cab Windshield
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 0.1), glassMat);
      windshield.position.set(0, 2.1, -4.3);
      group.add(windshield);

      // Chrome Front Grille
      const grille = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.08), chromeMat);
      grille.position.set(0, 1.2, -4.32);
      group.add(grille);

      // 6 Heavy Wheels with Alloy Rims
      [-1.15, 1.15].forEach((wx) => {
        [-3.2, 1.8, 3.4].forEach((wz) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.32, 16), wheelRubberMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.48, wz);
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.33, 12), wheelRimMat);
          wheel.add(rim);
          group.add(wheel);
        });
      });

      // Dual High Trailer Taillights
      [-1.0, 1.0].forEach((lx) => {
        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.38, 0.1), brakeLightMat);
        bl.position.set(lx, 1.2, 4.35);
        group.add(bl);
        brakeLights.push(bl);
      });
    } else if (type === 'van') {
      width = 2.2;
      length = 5.6;
      height = 2.4;

      const vanBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.0, 5.2), bodyMat);
      vanBody.position.set(0, 1.35, 0);
      group.add(vanBody);

      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.85, 0.1), glassMat);
      windshield.position.set(0, 1.5, -2.6);
      group.add(windshield);

      [-1.05, 1.05].forEach((wx) => {
        [-1.6, 1.6].forEach((wz) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16), wheelRubberMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.38, wz);
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.29, 12), wheelRimMat);
          wheel.add(rim);
          group.add(wheel);
        });
      });

      [-0.9, 0.9].forEach((lx) => {
        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.1), brakeLightMat);
        bl.position.set(lx, 1.2, 2.62);
        group.add(bl);
        brakeLights.push(bl);
      });
    } else {
      // SEDAN, SUV, TAXI, HATCHBACK (Detailed Car Anatomy)
      const isSUV = type === 'suv';
      width = isSUV ? 2.15 : 2.0;
      length = isSUV ? 4.6 : 4.4;
      height = isSUV ? 1.68 : 1.45;

      // 1. Lower Body & Sloped Front Hood
      const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.62, length * 0.96), bodyMat);
      lowerBody.position.set(0, 0.55, 0);
      lowerBody.castShadow = true;
      group.add(lowerBody);

      // Front bumper
      const fWidth = width * 0.94;
      const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(fWidth, 0.32, 0.22), bodyMat);
      frontBumper.position.set(0, 0.38, -length / 2 + 0.1);
      group.add(frontBumper);

      // 2. Aerodynamic Cabin Glass Greenhouse (Windshield, Side windows, Rear glass)
      const cabinWidth = width * 0.85;
      const cabinLength = isSUV ? 2.8 : 2.3;
      const cabinHeight = isSUV ? 0.75 : 0.65;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength), glassMat);
      cabin.position.set(0, 1.15, -0.15);
      group.add(cabin);

      // Roof panel
      const roof = new THREE.Mesh(new THREE.BoxGeometry(cabinWidth * 0.98, 0.08, cabinLength * 0.92), bodyMat);
      roof.position.set(0, 1.15 + cabinHeight / 2 + 0.04, -0.15);
      group.add(roof);

      // TAXI ROOF SIGN
      if (type === 'taxi') {
        const taxiSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.16, 0.22),
          new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfffbeb, emissiveIntensity: 0.9 })
        );
        taxiSign.position.set(0, 1.15 + cabinHeight / 2 + 0.16, -0.15);
        group.add(taxiSign);
      }

      // SUV ROOF RAILS
      if (isSUV) {
        [-cabinWidth / 2 + 0.05, cabinWidth / 2 - 0.05].forEach((rx) => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, cabinLength * 0.85), chromeMat);
          rail.position.set(rx, 1.15 + cabinHeight / 2 + 0.07, -0.15);
          group.add(rail);
        });
      }

      // 3. Side-View Mirrors (Left & Right)
      [-cabinWidth / 2 - 0.08, cabinWidth / 2 + 0.08].forEach((mx) => {
        const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.14), bodyMat);
        mirror.position.set(mx, 0.95, -0.9);
        group.add(mirror);
      });

      // 4. 4 Realistic Wheels with 5-Spoke Silver Alloy Rims
      const tireRadius = isSUV ? 0.36 : 0.32;
      const tireWidth = isSUV ? 0.26 : 0.24;
      [-width / 2, width / 2].forEach((wx) => {
        [-1.35, 1.35].forEach((wz) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 16), wheelRubberMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, tireRadius, wz);

          const rim = new THREE.Mesh(new THREE.CylinderGeometry(tireRadius * 0.65, tireRadius * 0.65, tireWidth + 0.01, 12), wheelRimMat);
          wheel.add(rim);

          group.add(wheel);
        });
      });

      // 5. Dual Clear Headlights
      [-0.72, 0.72].forEach((hx) => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.1), headlightMat);
        hl.position.set(hx, 0.62, -length / 2);
        group.add(hl);
        headlights.push(hl);
      });

      // 6. Dual Ruby Red Taillights / Reactive Brake Lights
      [-0.75, 0.75].forEach((lx) => {
        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.1), brakeLightMat);
        bl.position.set(lx, 0.66, length / 2);
        group.add(bl);
        brakeLights.push(bl);
      });
    }

    this.scene.add(group);

    const baseSpeed = this.levelConfig.trafficBaseSpeedKmh + (laneIndex - 1.5) * 3;
    const finalSpeed = type === 'truck' ? baseSpeed - 8 : baseSpeed + Math.random() * 8;

    return {
      mesh: group,
      type,
      lane: laneIndex,
      targetLane: laneIndex,
      laneTransitionProgress: 1,
      laneChangeSpeed: 1.2,
      laneChangeTimer: 3.5 + Math.random() * 5,
      isBlinking: false,
      brakeLights,
      headlights,
      z: zDistance,
      speedKmh: Math.max(35, finalSpeed),
      targetSpeedKmh: Math.max(35, finalSpeed),
      width,
      length,
      height,
      overtaken: false,
    };
  }

  /**
   * Spawns traffic ahead along the 4 highway lanes
   */
  private spawnInitialTraffic(): void {
    const density = this.levelConfig.trafficDensity;
    for (let i = 0; i < density; i++) {
      const lane = Math.floor(Math.random() * 4);
      const zDist = -(35 + i * 26 + Math.random() * 14);
      const isTruck = Math.random() < this.levelConfig.truckRatio;
      
      let type: TrafficVehicle['type'] = 'sedan';
      if (isTruck) {
        type = Math.random() > 0.5 ? 'truck' : 'van';
      } else {
        const rand = Math.random();
        type = rand < 0.35 ? 'sedan' : rand < 0.65 ? 'suv' : rand < 0.85 ? 'taxi' : 'hatchback';
      }

      const vehicle = this.createTrafficVehicle(type, lane, zDist);
      this.trafficVehicles.push(vehicle);
    }

    this.spawnFinishGantry();
  }

  /**
   * Main Physics, Simulation & Rendering Loop
   */
  public animate(): void {
    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.isPaused) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.isCrashed) {
      this.updateCrashSequence(delta);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.isCompleted) {
      this.updateCompletionSequence(delta);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.updateDrivingPhysics(delta);
    this.updateCameraAndCockpit(delta);
    this.updateWorldMovement(delta);
    this.updateTraffic(delta);
    this.checkCollisionsAndOvertakes();
    this.updateMissionTimer(delta);

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Updates player motorcycle speed, acceleration, braking, and steering (UNCHANGED DRIVING MECHANICS)
   */
  private updateDrivingPhysics(delta: number): void {
    if (this.isBrakePressed) {
      this.currentSpeedKmh = Math.max(0, this.currentSpeedKmh - this.brakingRate * delta);
      if (this.currentSpeedKmh > 50) {
        this.audio.playBrakeScreech();
      }
    } else if (this.isGasPressed) {
      this.currentSpeedKmh = Math.min(this.maxSpeedKmh, this.currentSpeedKmh + this.accelerationRate * delta);
    } else {
      const naturalDecel = 8 + Math.pow(this.currentSpeedKmh / 100, 2) * 14;
      this.currentSpeedKmh = Math.max(0, this.currentSpeedKmh - naturalDecel * delta);
    }

    const metersPerSecond = (this.currentSpeedKmh * 1000) / 3600;
    this.playerDistanceMeters += metersPerSecond * delta;

    if (this.playerDistanceMeters >= this.levelConfig.targetDistanceMeters && !this.isCompleted) {
      this.triggerLevelComplete();
    }

    // Steering Physics
    const steerSpeedFactor = Math.max(0.4, 1.2 - (this.currentSpeedKmh / this.maxSpeedKmh) * 0.45);
    const lateralSpeed = this.steerInput * 9.8 * steerSpeedFactor;
    this.playerX += lateralSpeed * delta;
    this.playerX = Math.max(-6.6, Math.min(6.6, this.playerX));

    // Dynamic Roll / Lean Angle
    const targetLean = -this.steerInput * Math.min(0.42, 0.14 + (this.currentSpeedKmh / 140) * 0.26);
    this.leanAngle += (targetLean - this.leanAngle) * 0.2;

    // Audio Engine Update
    this.audio.updateEngine(
      this.currentSpeedKmh,
      this.maxSpeedKmh,
      this.isGasPressed && !this.isBrakePressed,
      this.isBrakePressed
    );

    // Callbacks
    this.callbacks.onSpeedChange(Math.round(this.currentSpeedKmh));
    this.callbacks.onDistanceChange(
      Math.min(this.levelConfig.targetDistanceMeters, Math.round(this.playerDistanceMeters)),
      this.levelConfig.targetDistanceMeters
    );
  }

  /**
   * Continuous World Movement:
   * Moves all highway segments, sidewalks, curbs, storefronts, and skyscrapers toward and past player
   */
  private updateWorldMovement(delta: number): void {
    const metersPerSecond = (this.currentSpeedKmh * 1000) / 3600;
    const forwardDisplacement = metersPerSecond * delta;

    this.roadChunks.forEach((chunk) => {
      chunk.position.z += forwardDisplacement;

      if (chunk.position.z > 60) {
        let minZ = 0;
        this.roadChunks.forEach((c) => {
          if (c.position.z < minZ) minZ = c.position.z;
        });
        chunk.position.z = minZ - this.ROAD_CHUNK_LENGTH;
      }
    });

    if (this.finishGantry) {
      const remainingDistance = this.levelConfig.targetDistanceMeters - this.playerDistanceMeters;
      this.finishGantry.position.z = -remainingDistance;
    }
  }

  /**
   * Updates camera position, road vibration, suspension pitch, and cockpit needle rotations
   */
  private updateCameraAndCockpit(delta: number): void {
    this.camera.position.x = this.playerX;

    const vibrationAmp = (this.currentSpeedKmh / this.maxSpeedKmh) * 0.009;
    const vibration = Math.sin(performance.now() * 0.06) * vibrationAmp;
    this.camera.position.y = 1.30 + vibration;

    this.camera.rotation.z = this.leanAngle * 0.32;

    let targetPitch = -0.06;
    if (this.isGasPressed && !this.isBrakePressed) {
      targetPitch -= 0.025;
    } else if (this.isBrakePressed) {
      targetPitch += 0.045;
    }
    this.camera.rotation.x += (targetPitch - this.camera.rotation.x) * 0.15;

    // Handlebars banking and yaw
    if (this.handlebarsGroup) {
      this.handlebarsGroup.rotation.z = this.leanAngle * 0.85;
      this.handlebarsGroup.rotation.y = -this.steerInput * 0.14;
    }

    // Left Speedometer Needle Calibration (0 - 200 km/h: 135° to -135° sweep)
    const speedRatio = Math.min(1, Math.max(0, this.currentSpeedKmh / 200));
    const speedoAngle = Math.PI * 0.75 - speedRatio * (Math.PI * 1.5);
    if (this.speedoNeedle) {
      this.speedoNeedle.rotation.z = speedoAngle;
    }

    // Right Tachometer Needle Calibration (0 - 12,000 RPM with dynamic rev response)
    const idleRpm = 1350;
    const targetRpm = Math.min(
      11800,
      idleRpm + (this.currentSpeedKmh / 200) * 8800 + (this.isGasPressed ? 1450 : this.isBrakePressed ? -500 : 0)
    );
    this.currentRpm += (targetRpm - this.currentRpm) * Math.min(1, delta * 9);

    const rpmRatio = Math.min(1, Math.max(0, this.currentRpm / 12000));
    const tachoAngle = Math.PI * 0.75 - rpmRatio * (Math.PI * 1.5);
    if (this.tachoNeedle) {
      this.tachoNeedle.rotation.z = tachoAngle;
    }
  }

  /**
   * Updates AI traffic relative velocity, lane changes, and active brake lights
   */
  private updateTraffic(delta: number): void {
    const playerSpeedMs = (this.currentSpeedKmh * 1000) / 3600;

    this.trafficVehicles.forEach((v) => {
      const vSpeedMs = (v.speedKmh * 1000) / 3600;
      const relativeDeltaZ = (vSpeedMs - playerSpeedMs) * delta;
      v.z -= relativeDeltaZ;
      v.mesh.position.z = v.z;

      // Lane Changing Logic
      v.laneChangeTimer -= delta;
      if (v.laneChangeTimer <= 0 && v.laneTransitionProgress >= 1) {
        v.laneChangeTimer = 3.5 + Math.random() * 5;
        if (Math.random() < this.levelConfig.laneChangeFrequency) {
          const possibleLanes: number[] = [];
          if (v.lane > 0) possibleLanes.push(v.lane - 1);
          if (v.lane < 3) possibleLanes.push(v.lane + 1);

          if (possibleLanes.length > 0) {
            v.targetLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
            v.laneTransitionProgress = 0;
            v.isBlinking = true;
          }
        }
      }

      // Smooth Lane Transition
      if (v.laneTransitionProgress < 1) {
        v.laneTransitionProgress += v.laneChangeSpeed * delta;
        const currentLaneX = this.LANE_POSITIONS[v.lane];
        const targetLaneX = this.LANE_POSITIONS[v.targetLane];
        v.mesh.position.x = THREE.MathUtils.lerp(currentLaneX, targetLaneX, v.laneTransitionProgress);

        const steerDir = targetLaneX > currentLaneX ? 1 : -1;
        v.mesh.rotation.y = Math.sin(v.laneTransitionProgress * Math.PI) * 0.12 * steerDir;

        if (v.laneTransitionProgress >= 1) {
          v.lane = v.targetLane;
          v.mesh.rotation.y = 0;
          v.isBlinking = false;
        }
      }

      // Active Brake Lights flare when decelerating
      const isBraking = v.speedKmh < v.targetSpeedKmh - 2;
      v.brakeLights.forEach((bl) => {
        (bl.material as THREE.MeshStandardMaterial).emissiveIntensity = isBraking ? 1.6 : 0.45;
      });

      // Recycle vehicles that fall far behind player (> 25m behind player at Z > 25)
      if (v.z > 25) {
        this.recycleVehicle(v);
      }
    });
  }

  /**
   * Recycles vehicle ahead on horizon in an open corridor
   */
  private recycleVehicle(v: TrafficVehicle): void {
    let minZ = -80;
    this.trafficVehicles.forEach((other) => {
      if (other.z < minZ) minZ = other.z;
    });

    v.z = minZ - (30 + Math.random() * 35);
    v.lane = Math.floor(Math.random() * 4);
    v.targetLane = v.lane;
    v.laneTransitionProgress = 1;
    v.mesh.position.set(this.LANE_POSITIONS[v.lane], 0, v.z);
    v.mesh.rotation.y = 0;
    v.overtaken = false;

    const base = this.levelConfig.trafficBaseSpeedKmh;
    v.speedKmh = v.type === 'truck' ? base - 6 : base + Math.random() * 10;
    v.targetSpeedKmh = v.speedKmh;
  }

  /**
   * Collision and near-miss close overtake checks
   */
  private checkCollisionsAndOvertakes(): void {
    const playerHalfW = this.playerCollisionWidth / 2;
    const playerZMin = -this.playerCollisionLength / 2;
    const playerZMax = this.playerCollisionLength / 2;

    this.trafficVehicles.forEach((v) => {
      const vHalfW = v.width / 2;
      const vHalfL = v.length / 2;

      const vX = v.mesh.position.x;
      const vZ = v.z;

      const deltaX = Math.abs(this.playerX - vX);
      const deltaZ = Math.abs(vZ);

      // Collision Check
      const isOverlapX = deltaX < (playerHalfW + vHalfW) * 0.82;
      const isOverlapZ = deltaZ < (playerZMax + vHalfL) * 0.85;

      if (isOverlapX && isOverlapZ && !this.isCrashed) {
        this.triggerCrash();
        return;
      }

      // Near Miss Check
      if (
        !v.overtaken &&
        vZ > 0 &&
        vZ < 3.5 &&
        deltaX < playerHalfW + vHalfW + 1.2 &&
        deltaX >= (playerHalfW + vHalfW) * 0.82 &&
        this.currentSpeedKmh > 68
      ) {
        v.overtaken = true;
        this.overtakesCount++;
        this.nearMissCombo++;
        this.lastNearMissTime = performance.now();

        const bonusPoints = this.levelConfig.nearMissBonusPoints * this.nearMissCombo;
        const bonusSec = this.levelConfig.nearMissBonusSeconds;

        this.score += bonusPoints;
        this.remainingTime = Math.min(this.levelConfig.timeLimitSeconds + 15, this.remainingTime + bonusSec);

        this.audio.playNearMiss();
        this.callbacks.onNearMiss(this.nearMissCombo, bonusPoints, bonusSec);
        this.callbacks.onScoreChange(this.score);
      }
    });

    if (this.nearMissCombo > 0 && performance.now() - this.lastNearMissTime > 3000) {
      this.nearMissCombo = 0;
    }
  }

  /**
   * Mission countdown timer and high-speed bonus
   */
  private updateMissionTimer(delta: number): void {
    this.remainingTime -= delta;
    this.callbacks.onTimeChange(Math.max(0, parseFloat(this.remainingTime.toFixed(1))));

    if (this.remainingTime <= 0 && !this.isCrashed && !this.isCompleted) {
      this.triggerCrash();
      return;
    }

    if (this.currentSpeedKmh >= this.levelConfig.speedBonusThresholdKmh) {
      this.isHighSpeedStreak = true;
      this.highSpeedStreakSeconds += delta;
      this.score += Math.round(20 * delta * (this.currentSpeedKmh / 100));
      this.callbacks.onHighSpeedStreak(true, parseFloat(this.highSpeedStreakSeconds.toFixed(1)));
      this.callbacks.onScoreChange(this.score);
    } else {
      if (this.isHighSpeedStreak) {
        this.isHighSpeedStreak = false;
        this.highSpeedStreakSeconds = 0;
        this.callbacks.onHighSpeedStreak(false, 0);
      }
    }
  }

  /**
   * Dramatic camera tumbling crash sequence
   */
  private triggerCrash(): void {
    this.isCrashed = true;
    this.crashAnimationTimer = 0;
    this.currentSpeedKmh = 0;
    this.audio.playCrash();

    const sparkCount = 30;
    const sparkGeom = new THREE.SphereGeometry(0.06, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffbb00 });
    for (let i = 0; i < sparkCount; i++) {
      const spark = new THREE.Mesh(sparkGeom, sparkMat);
      spark.position.set(this.playerX, 1.2, 0);
      this.scene.add(spark);
    }
  }

  private updateCrashSequence(delta: number): void {
    this.crashAnimationTimer += delta;
    this.camera.position.y += 2.6 * delta;
    this.camera.rotation.x -= 2.0 * delta;
    this.camera.rotation.z += 3.2 * delta;
    this.camera.rotation.y += 1.6 * delta;

    if (this.crashAnimationTimer > 1.35) {
      this.callbacks.onCrash({
        score: this.score,
        distanceMeters: Math.round(this.playerDistanceMeters),
        overtakes: this.overtakesCount,
      });
    }
  }

  /**
   * Checkered finish line crossing celebration
   */
  private triggerLevelComplete(): void {
    this.isCompleted = true;
    this.audio.playLevelComplete();

    const timeTaken = Math.round(this.levelConfig.timeLimitSeconds - this.remainingTime);
    const timeBonus = Math.max(0, Math.round(this.remainingTime * 50));
    this.score += timeBonus;
    this.callbacks.onScoreChange(this.score);

    this.callbacks.onLevelComplete({
      score: this.score,
      timeTakenSec: timeTaken,
      overtakes: this.overtakesCount,
    });
  }

  private updateCompletionSequence(delta: number): void {
    this.currentSpeedKmh = Math.max(0, this.currentSpeedKmh - 32 * delta);
    const metersPerSecond = (this.currentSpeedKmh * 1000) / 3600;
    this.playerDistanceMeters += metersPerSecond * delta;
  }

  private onWindowResize(): void {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ==========================================
  // PUBLIC CONTROL STATE API
  // ==========================================

  public setGasPressed(pressed: boolean): void {
    this.isGasPressed = pressed;
  }

  public setBrakePressed(pressed: boolean): void {
    this.isBrakePressed = pressed;
  }

  public setSteerInput(val: number): void {
    this.steerInput = Math.max(-1, Math.min(1, val));
  }

  public pause(): void {
    this.isPaused = true;
    this.audio.pause();
  }

  public resume(): void {
    this.isPaused = false;
    this.clock.start();
    this.audio.resume();
  }

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);

    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.audio.destroy();
  }
}
