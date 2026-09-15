import * as THREE from 'three';
import {
  FruitType,
  ActiveFruit,
  FruitHalf,
  BladePoint,
  JuiceParticle,
  WallSplat,
  LevelConfig,
  ComboBanner,
} from './types';
import {
  createWholeFruitMesh,
  createFruitHalves,
  createBombMesh,
  FRUIT_CONFIGS,
} from './fruitGeometry';
import { textureManager } from './fruitTextures';
import { fruitAudio } from './fruitSliceAudio';

export interface EngineCallbacks {
  onScoreUpdate: (score: number, fruitsSliced: number) => void;
  onCombo: (banner: ComboBanner) => void;
  onFruitMissed: (missCount: number) => void;
  onBombDetonated: () => void;
  onLevelComplete: (finalScore: number) => void;
  onGameOver: (finalScore: number) => void;
  onDeflectChange?: (deflects: number) => void;
}

export class FruitSliceEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private trailCanvas: HTMLCanvasElement;
  private trailCtx: CanvasRenderingContext2D;

  private activeFruits: ActiveFruit[] = [];
  private slicedHalves: FruitHalf[] = [];
  private particles: JuiceParticle[] = [];
  private wallSplats: WallSplat[] = [];
  private splatsMeshGroup: THREE.Group;

  // Blade Swipe Trail
  private bladePoints: BladePoint[] = [];
  private isPointerDown: boolean = false;
  private lastWhooshTime: number = 0;

  // Game Progress State
  private levelConfig: LevelConfig;
  private score: number = 0;
  private fruitsSlicedTotal: number = 0;
  private fruitsSlicedThisLevel: number = 0;
  private missesCount: number = 0;
  private bombDeflectsAvailable: number = 3;

  // Combo tracking
  private recentSlicesInSwipe: number = 0;
  private lastSliceTime: number = 0;

  // Spawner State
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private nextSpawnTime: number = 0;
  private lastFrameTime: number = 0;
  private animFrameId: number | null = null;
  private gravity: number = 28.0; // world units / sec^2

  private callbacks: EngineCallbacks;

  constructor(
    container: HTMLElement,
    levelConfig: LevelConfig,
    callbacks: EngineCallbacks,
    initialDeflects: number = 3
  ) {
    this.container = container;
    this.levelConfig = levelConfig;
    this.callbacks = callbacks;
    this.bombDeflectsAvailable = initialDeflects;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera: Perspective 50 deg framing vertical field
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 18);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Katana Blade Trail 2D Overlay Canvas
    this.trailCanvas = document.createElement('canvas');
    this.trailCanvas.style.position = 'absolute';
    this.trailCanvas.style.inset = '0';
    this.trailCanvas.style.pointerEvents = 'none';
    this.trailCanvas.style.zIndex = '10';
    this.container.appendChild(this.trailCanvas);
    this.trailCtx = this.trailCanvas.getContext('2d')!;
    this.resizeTrailCanvas();

    // 5. Lighting: Balanced natural illumination for organic fruit relief and highlights
    const ambientLight = new THREE.AmbientLight(0xfff7ee, 0.72);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(4, 14, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Subtle warm rim/bounce light to pick up natural fruit contours and organic skin depth
    const bounceLight = new THREE.DirectionalLight(0xffe8d6, 0.35);
    bounceLight.position.set(-6, -8, 8);
    this.scene.add(bounceLight);

    // 6. Authentic Weathered Wood Planks Wall Background
    this.createWoodWall();

    // 7. Splat decals group
    this.splatsMeshGroup = new THREE.Group();
    this.scene.add(this.splatsMeshGroup);

    // 8. Event Listeners
    this.bindInputs();
  }

  private createWoodWall(): void {
    const wallGeo = new THREE.PlaneGeometry(32, 24);
    const wallTex = textureManager.getWoodWallTexture();
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.95,
      metalness: 0.05,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 0, -5);
    wallMesh.receiveShadow = true;
    this.scene.add(wallMesh);
  }

  private resizeTrailCanvas(): void {
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.trailCanvas.width = rect.width * dpr;
    this.trailCanvas.height = rect.height * dpr;
    this.trailCanvas.style.width = `${rect.width}px`;
    this.trailCanvas.style.height = `${rect.height}px`;
    this.trailCtx.scale(dpr, dpr);
  }

  public handleResize(): void {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.resizeTrailCanvas();
  }

  private bindInputs(): void {
    const el = this.container;

    const onStart = (clientX: number, clientY: number) => {
      this.isPointerDown = true;
      this.recentSlicesInSwipe = 0;
      this.addBladePoint(clientX, clientY);
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!this.isPointerDown) return;
      this.addBladePoint(clientX, clientY);
      this.checkBladeSlicing();
    };

    const onEnd = () => {
      this.isPointerDown = false;
      this.recentSlicesInSwipe = 0;
    };

    // Touch Events
    el.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          onStart(t.clientX, t.clientY);
        }
      },
      { passive: true }
    );

    el.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          onMove(t.clientX, t.clientY);
        }
      },
      { passive: true }
    );

    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });

    // Mouse Events
    el.addEventListener('mousedown', (e) => {
      if (e.button === 0) onStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      onMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      onEnd();
    });
  }

  private addBladePoint(clientX: number, clientY: number): void {
    const rect = this.container.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const now = performance.now();

    // Raycast to z=0 plane in 3D world
    const ndcX = (px / rect.width) * 2 - 1;
    const ndcY = -(py / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const worldPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeZ, worldPoint);

    // Calculate velocity for whoosh sound
    if (this.bladePoints.length > 0) {
      const prev = this.bladePoints[this.bladePoints.length - 1];
      const dist = Math.hypot(px - prev.x, py - prev.y);
      const dt = Math.max(1, now - prev.time);
      const speed = (dist / dt) * 1000; // px/sec

      if (speed > 450 && now - this.lastWhooshTime > 220) {
        fruitAudio.playWhoosh(Math.min(2.0, speed / 800));
        this.lastWhooshTime = now;
      }
    }

    this.bladePoints.push({
      x: px,
      y: py,
      worldPos: worldPoint,
      time: now,
    });
  }

  /**
   * Continuous Line-Segment vs Sphere / Circle Slicing
   */
  private checkBladeSlicing(): void {
    if (this.bladePoints.length < 2) return;
    const p1 = this.bladePoints[this.bladePoints.length - 2];
    const p2 = this.bladePoints[this.bladePoints.length - 1];

    const cutVector = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y);
    const segmentLen = cutVector.length();
    if (segmentLen < 4) return;

    const cutAngle = Math.atan2(cutVector.y, cutVector.x);
    // Normal perpendicular to the cut vector
    const normal = new THREE.Vector3(-cutVector.y, cutVector.x, 0).normalize();

    // Check each active fruit
    const rect = this.container.getBoundingClientRect();

    for (let i = this.activeFruits.length - 1; i >= 0; i--) {
      const fruit = this.activeFruits[i];
      if (fruit.isSliced) continue;

      // Project fruit position to screen space
      const screenPos = fruit.position.clone().project(this.camera);
      const fx = ((screenPos.x + 1) * 0.5) * rect.width;
      const fy = ((-screenPos.y + 1) * 0.5) * rect.height;

      // Approximate fruit screen radius
      const fRadiusScreen = (fruit.radius / (this.camera.position.z - fruit.position.z)) * rect.height * 0.65;

      // Distance from point (fx, fy) to segment (p1, p2)
      const dist = this.pointToSegmentDistance(fx, fy, p1.x, p1.y, p2.x, p2.y);

      if (dist <= fRadiusScreen * 1.05) {
        // SLICE HIT!
        this.executeSlice(fruit, cutAngle, normal, fx, fy);
      }
    }
  }

  private pointToSegmentDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return Math.hypot(px - projX, py - projY);
  }

  /**
   * Executes the physical 3D slice on the target fruit or bomb
   */
  private executeSlice(
    fruit: ActiveFruit,
    cutAngle: number,
    cutNormal: THREE.Vector3,
    screenX: number,
    screenY: number
  ): void {
    fruit.isSliced = true;
    fruit.slicedTime = performance.now();

    // 1. Check if BOMB
    if (fruit.isBomb) {
      if (this.bombDeflectsAvailable > 0) {
        // Deflect bomb!
        this.bombDeflectsAvailable--;
        this.callbacks.onDeflectChange?.(this.bombDeflectsAvailable);
        fruitAudio.playBombDeflect();

        // Impulse bomb outward
        fruit.velocity.x += (Math.random() - 0.5) * 15;
        fruit.velocity.y += 18;
        fruit.velocity.z += 10;

        this.callbacks.onCombo({
          id: `deflect-${Date.now()}`,
          count: 0,
          bonusPoints: 0,
          x: screenX,
          y: screenY,
          label: `DEFLECT! ${this.bombDeflectsAvailable} LEFT!`,
        });

        // Spawn golden deflect sparks
        this.spawnDeflectSparks(fruit.position);
        return;
      } else {
        // DETONATE BOMB!
        fruitAudio.playBombExplosion();
        this.scene.remove(fruit.group);
        const idx = this.activeFruits.indexOf(fruit);
        if (idx !== -1) this.activeFruits.splice(idx, 1);

        this.spawnBombExplosionFX(fruit.position);
        this.callbacks.onBombDetonated();
        return;
      }
    }

    // 2. REGULAR FRUIT: Split into two physical 3D halves!
    fruitAudio.playSlice(fruit.type);
    this.scene.remove(fruit.group);

    const [halfA, halfB] = createFruitHalves(fruit.type);

    // Position halves at fruit position
    halfA.position.copy(fruit.position);
    halfB.position.copy(fruit.position);

    // Align the halves to the cutting angle
    // In Three.js: Rotate around Z by cutAngle
    halfA.rotation.z = cutAngle;
    halfB.rotation.z = cutAngle;

    this.scene.add(halfA);
    this.scene.add(halfB);

    // Physical separation impulse along cut normal
    const impulseMag = 7.5;
    const velA = fruit.velocity.clone().add(cutNormal.clone().multiplyScalar(impulseMag));
    const velB = fruit.velocity.clone().add(cutNormal.clone().multiplyScalar(-impulseMag));

    velA.y += 2.5;
    velB.y += 2.5;

    const rotA = new THREE.Vector3(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    );
    const rotB = new THREE.Vector3(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    );

    this.slicedHalves.push(
      {
        group: halfA,
        position: halfA.position,
        velocity: velA,
        rotation: halfA.rotation,
        angularVelocity: rotA,
        halfType: 'A',
      },
      {
        group: halfB,
        position: halfB.position,
        velocity: velB,
        rotation: halfB.rotation,
        angularVelocity: rotB,
        halfType: 'B',
      }
    );

    // 3. Spray Juice Particles in direction of cut
    this.spawnJuiceParticles(fruit.position, cutNormal, fruit.juiceColor);

    // 4. Stamp Juicy Wall Splat on Wood Wall
    this.stampWallSplat(fruit.position.x, fruit.position.y, fruit.splatColor);

    // 5. Score & Combos
    let pts = fruit.points;
    const now = performance.now();
    this.recentSlicesInSwipe++;

    if (fruit.isSpecialCritical) {
      pts += 10;
      fruitAudio.playCritical();
      this.callbacks.onCombo({
        id: `crit-${now}`,
        count: 1,
        bonusPoints: 10,
        x: screenX,
        y: screenY,
        label: 'CRITICAL +10',
        isCritical: true,
      });
    }

    if (this.recentSlicesInSwipe >= 2) {
      const comboBonus = this.recentSlicesInSwipe;
      pts += comboBonus;
      fruitAudio.playCombo(this.recentSlicesInSwipe);
      this.callbacks.onCombo({
        id: `combo-${now}-${this.recentSlicesInSwipe}`,
        count: this.recentSlicesInSwipe,
        bonusPoints: comboBonus,
        x: screenX,
        y: screenY,
        label: `${this.recentSlicesInSwipe} FRUIT COMBO +${comboBonus}`,
      });
    }

    this.score += pts;
    this.fruitsSlicedTotal++;
    this.fruitsSlicedThisLevel++;
    this.callbacks.onScoreUpdate(this.score, this.fruitsSlicedThisLevel);

    // Remove from active fruits
    const fIdx = this.activeFruits.indexOf(fruit);
    if (fIdx !== -1) this.activeFruits.splice(fIdx, 1);

    // Check level complete
    if (this.fruitsSlicedThisLevel >= this.levelConfig.quota) {
      this.isPlaying = false;
      fruitAudio.playLevelComplete();
      this.callbacks.onLevelComplete(this.score);
    }
  }

  private spawnJuiceParticles(
    pos: THREE.Vector3,
    normal: THREE.Vector3,
    colorHex: string
  ): void {
    const count = 18;
    const color = new THREE.Color(colorHex);

    for (let i = 0; i < count; i++) {
      const vel = normal.clone().multiplyScalar((Math.random() - 0.5) * 16);
      vel.y += Math.random() * 8 + 3;
      vel.z += (Math.random() - 0.5) * 10;

      this.particles.push({
        position: pos.clone(),
        velocity: vel,
        color,
        size: Math.random() * 0.28 + 0.12,
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 0.45 + 0.35,
        gravity: 24,
      });
    }
  }

  private spawnDeflectSparks(pos: THREE.Vector3): void {
    const count = 25;
    const color = new THREE.Color('#fde047');
    for (let i = 0; i < count; i++) {
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        Math.random() * 15 + 5,
        (Math.random() - 0.5) * 15
      );
      this.particles.push({
        position: pos.clone(),
        velocity: vel,
        color,
        size: 0.18,
        alpha: 1.0,
        life: 0,
        maxLife: 0.35,
        gravity: 18,
      });
    }
  }

  private spawnBombExplosionFX(pos: THREE.Vector3): void {
    const count = 60;
    const colors = ['#ef4444', '#f97316', '#eab308', '#1f2937'];
    for (let i = 0; i < count; i++) {
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 35,
        Math.random() * 20
      );
      this.particles.push({
        position: pos.clone(),
        velocity: vel,
        color: new THREE.Color(colors[i % colors.length]),
        size: Math.random() * 0.45 + 0.2,
        alpha: 1.0,
        life: 0,
        maxLife: 0.8,
        gravity: 12,
      });
    }
  }

  /**
   * Stamp a photorealistic 3D juice splat decal onto the wood wall
   */
  private stampWallSplat(x: number, y: number, colorHex: string): void {
    // Generate splat texture canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const cx = 128;
    const cy = 128;
    const r = 50 + Math.random() * 25;

    ctx.fillStyle = colorHex;
    // Central irregular blob
    ctx.beginPath();
    const pts = 12;
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const rad = r + (Math.random() - 0.5) * 25;
      const px = cx + Math.cos(a) * rad;
      const py = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Splattered satellite droplets and drips
    for (let d = 0; d < 8; d++) {
      const dist = r + 20 + Math.random() * 35;
      const a = Math.random() * Math.PI * 2;
      const dropR = 4 + Math.random() * 8;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, dropR, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    const splatMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const splatGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const splatMesh = new THREE.Mesh(splatGeo, splatMat);
    // Sit slightly in front of wood wall at z = -4.9
    splatMesh.position.set(x, y, -4.9 + this.wallSplats.length * 0.001);
    splatMesh.rotation.z = Math.random() * Math.PI * 2;
    this.splatsMeshGroup.add(splatMesh);

    this.wallSplats.push({
      id: `splat-${Date.now()}`,
      x,
      y,
      size: 3.6,
      color: colorHex,
      opacity: 0.85,
      rotation: splatMesh.rotation.z,
      mesh: splatMesh,
      droplets: [],
    });

    // Cap total wall splats at 16 for peak performance
    if (this.wallSplats.length > 16) {
      const oldest = this.wallSplats.shift();
      if (oldest?.mesh) {
        this.splatsMeshGroup.remove(oldest.mesh);
      }
    }
  }

  /**
   * Spawns a launch wave of fruits / bombs from below screen
   */
  private spawnWave(): void {
    if (!this.isPlaying || this.isPaused) return;

    const count =
      Math.floor(
        Math.random() *
          (this.levelConfig.simultaneousMax - this.levelConfig.simultaneousMin + 1)
      ) + this.levelConfig.simultaneousMin;

    const availableFruits = this.levelConfig.fruitTypes;

    let hasBombInWave = false;

    for (let i = 0; i < count; i++) {
      const isBomb =
        !hasBombInWave &&
        Math.random() < this.levelConfig.bombChance &&
        this.levelConfig.levelNumber >= 3;

      if (isBomb) hasBombInWave = true;

      const fruitType =
        availableFruits[Math.floor(Math.random() * availableFruits.length)];
      const isCritical = !isBomb && Math.random() < this.levelConfig.criticalChance;

      this.spawnSingleFruit(fruitType, isBomb, isCritical, i, count);
    }

    if (hasBombInWave) {
      fruitAudio.startBombFuse();
    }
  }

  private spawnSingleFruit(
    type: FruitType,
    isBomb: boolean,
    isCritical: boolean,
    index: number,
    total: number
  ): void {
    let group: THREE.Group;
    let radius = 1.2;

    if (isBomb) {
      const bombData = createBombMesh();
      group = bombData.group;
      radius = 1.35;
    } else {
      group = createWholeFruitMesh(type);
      radius = FRUIT_CONFIGS[type].radius;
    }

    // Launch position: spread across bottom X (-6 to 6), Y below -11
    const spreadX = ((index + 0.5) / total - 0.5) * 12;
    const startX = spreadX + (Math.random() - 0.5) * 2.0;
    const startY = -11.5 - Math.random() * 1.5;
    const startZ = (Math.random() - 0.5) * 2.0;

    group.position.set(startX, startY, startZ);
    this.scene.add(group);

    // Gravity scaled with level for tight, snappy arc reactions
    this.gravity = 22.0 + Math.min(12.0, (this.levelConfig.levelNumber - 1) * 0.32);

    // Launch velocity driven by levelConfig minSpeed and maxSpeed
    const speedRange = Math.max(2, this.levelConfig.maxSpeed - this.levelConfig.minSpeed);
    const speed = this.levelConfig.minSpeed + Math.random() * speedRange;
    const vy = speed * (0.92 + Math.random() * 0.16);

    // Varied trajectories: cross throws from edges, fan spread across center
    let vx: number;
    if (Math.abs(startX) > 4.2) {
      // Corner cross launch curving across to opposite side
      vx = -Math.sign(startX) * (3.6 + Math.random() * 3.8);
    } else {
      // Center arching launch
      vx = -startX * (0.28 + Math.random() * 0.25) + (Math.random() - 0.5) * 2.2;
    }
    const vz = (Math.random() - 0.5) * 1.5;

    const angularVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 5.0,
      (Math.random() - 0.5) * 5.0,
      (Math.random() - 0.5) * 5.5
    );

    const cfg = FRUIT_CONFIGS[type];

    this.activeFruits.push({
      id: `fruit-${Date.now()}-${Math.random()}`,
      type,
      isBomb,
      isSpecialCritical: isCritical,
      group,
      position: group.position,
      velocity: new THREE.Vector3(vx, vy, vz),
      rotation: group.rotation,
      angularVelocity,
      radius,
      isSliced: false,
      juiceColor: isBomb ? '#ef4444' : cfg.juiceColor,
      splatColor: isBomb ? '#991b1b' : cfg.splatColor,
      points: isBomb ? 0 : cfg.points,
    });
  }

  /**
   * Main Engine Loop (runs at 60fps)
   */
  public start(): void {
    this.isPlaying = true;
    this.isPaused = false;
    this.score = 0;
    this.fruitsSlicedTotal = 0;
    this.fruitsSlicedThisLevel = 0;
    this.missesCount = 0;
    this.lastFrameTime = performance.now();
    this.nextSpawnTime = performance.now() + 800;

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000);
      this.lastFrameTime = now;

      if (this.isPlaying && !this.isPaused) {
        this.update(dt, now);
      }

      this.renderTrail(now);
      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public pause(): void {
    this.isPaused = true;
    fruitAudio.stopBombFuse();
  }

  public resume(): void {
    this.isPaused = false;
    this.lastFrameTime = performance.now();
  }

  public stop(): void {
    this.isPlaying = false;
    fruitAudio.stopBombFuse();
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private update(dt: number, now: number): void {
    // 1. Spawning
    if (now >= this.nextSpawnTime) {
      this.spawnWave();
      const interval =
        Math.random() *
          (this.levelConfig.spawnIntervalMax - this.levelConfig.spawnIntervalMin) +
        this.levelConfig.spawnIntervalMin;
      this.nextSpawnTime = now + interval;
    }

    // 2. Active Fruits Physics
    let hasLiveBomb = false;

    for (let i = this.activeFruits.length - 1; i >= 0; i--) {
      const fruit = this.activeFruits[i];
      if (fruit.isBomb) hasLiveBomb = true;

      // Gravity
      fruit.velocity.y -= this.gravity * dt;
      fruit.position.x += fruit.velocity.x * dt;
      fruit.position.y += fruit.velocity.y * dt;
      fruit.position.z += fruit.velocity.z * dt;

      // Rotation
      fruit.group.rotation.x += fruit.angularVelocity.x * dt;
      fruit.group.rotation.y += fruit.angularVelocity.y * dt;
      fruit.group.rotation.z += fruit.angularVelocity.z * dt;

      // Bomb spark animation
      if (fruit.isBomb) {
        const spark = fruit.group.getObjectByName('fuseSpark') as THREE.Mesh;
        if (spark) {
          const s = 0.8 + Math.sin(now * 0.03) * 0.4;
          spark.scale.set(s, s, s);
        }
        const halo = fruit.group.getObjectByName('bombHalo') as THREE.Mesh;
        if (halo) {
          const hs = 1.0 + Math.sin(now * 0.015) * 0.15;
          halo.scale.set(hs, hs, hs);
        }
      }

      // Check fall below screen threshold
      if (fruit.position.y < -12.5 && fruit.velocity.y < 0) {
        this.scene.remove(fruit.group);
        this.activeFruits.splice(i, 1);

        // If regular fruit fell unsliced, it's a MISS!
        if (!fruit.isBomb && !fruit.isSliced) {
          this.missesCount++;
          fruitAudio.playMiss();
          this.callbacks.onFruitMissed(this.missesCount);

          if (this.missesCount >= this.levelConfig.allowedMisses) {
            this.isPlaying = false;
            fruitAudio.playGameOver();
            this.callbacks.onGameOver(this.score);
            return;
          }
        }
      }
    }

    if (!hasLiveBomb) {
      fruitAudio.stopBombFuse();
    }

    // 3. Sliced Halves Physics
    for (let i = this.slicedHalves.length - 1; i >= 0; i--) {
      const half = this.slicedHalves[i];
      half.velocity.y -= this.gravity * dt;
      half.position.x += half.velocity.x * dt;
      half.position.y += half.velocity.y * dt;
      half.position.z += half.velocity.z * dt;

      half.group.rotation.x += half.angularVelocity.x * dt;
      half.group.rotation.y += half.angularVelocity.y * dt;
      half.group.rotation.z += half.angularVelocity.z * dt;

      if (half.position.y < -14) {
        this.scene.remove(half.group);
        this.slicedHalves.splice(i, 1);
      }
    }

    // 4. Juice Particles Physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.velocity.y -= p.gravity * dt;
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.position.z += p.velocity.z * dt;
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);

      if (p.life >= p.maxLife || p.position.y < -14) {
        this.particles.splice(i, 1);
      }
    }

    // 5. Wall Splats slow fading
    for (let i = this.wallSplats.length - 1; i >= 0; i--) {
      const splat = this.wallSplats[i];
      splat.opacity -= dt * 0.015; // Slow 60s drip fade
      if (splat.mesh) {
        (splat.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, splat.opacity);
      }
      if (splat.opacity <= 0.02) {
        if (splat.mesh) this.splatsMeshGroup.remove(splat.mesh);
        this.wallSplats.splice(i, 1);
      }
    }
  }

  /**
   * Render Katana Blade Glowing Slash Trail on 2D Overlay
   */
  private renderTrail(now: number): void {
    const ctx = this.trailCtx;
    const rect = this.container.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Prune points older than 180ms
    this.bladePoints = this.bladePoints.filter((p) => now - p.time < 180);
    if (this.bladePoints.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer Glowing Cyan/Steel Aura
    for (let i = 1; i < this.bladePoints.length; i++) {
      const p1 = this.bladePoints[i - 1];
      const p2 = this.bladePoints[i];
      const progress = i / this.bladePoints.length;
      const alpha = progress * 0.65;
      const width = progress * 14;

      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Razor-Sharp Pure White Core
    for (let i = 1; i < this.bladePoints.length; i++) {
      const p1 = this.bladePoints[i - 1];
      const p2 = this.bladePoints[i];
      const progress = i / this.bladePoints.length;
      const alpha = progress * 0.95;
      const width = progress * 5.5;

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Sparkle star at blade tip
    const tip = this.bladePoints[this.bladePoints.length - 1];
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public getMisses(): number {
    return this.missesCount;
  }

  public getScore(): number {
    return this.score;
  }

  public getFruitsSliced(): number {
    return this.fruitsSlicedThisLevel;
  }

  public getBombDeflects(): number {
    return this.bombDeflectsAvailable;
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    if (this.trailCanvas.parentElement) {
      this.trailCanvas.parentElement.removeChild(this.trailCanvas);
    }
  }
}
