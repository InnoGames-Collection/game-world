import { 
  LevelConfig, 
  FruitKind, 
  FruitConfig, 
  FlyingObject, 
  SlicedHalf, 
  SplatterDecal, 
  Particle, 
  FloatingText, 
  SlashPoint 
} from './types';
import { halloweenAudio } from './audio';

export const HALLOWEEN_FRUITS: Record<FruitKind, FruitConfig> = {
  pumpkin: {
    kind: 'pumpkin',
    name: 'Pumpkin',
    radius: 38,
    scoreValue: 10,
    outerColor: '#FF6B00',
    innerColor: '#FFA726',
    splatterColor: '#FF7D00',
    accentColor: '#FFEB3B',
    eyeType: 'spooky',
  },
  monster_apple: {
    kind: 'monster_apple',
    name: 'Monster Apple',
    radius: 34,
    scoreValue: 10,
    outerColor: '#D61A3C',
    innerColor: '#FFF3E0',
    splatterColor: '#E53935',
    accentColor: '#4A154B',
    eyeType: 'angry',
  },
  slime_melon: {
    kind: 'slime_melon',
    name: 'Slime Melon',
    radius: 40,
    scoreValue: 15,
    outerColor: '#72C812',
    innerColor: '#FF3366',
    splatterColor: '#76FF03',
    accentColor: '#00BCD4',
    eyeType: 'cyclops',
  },
  spooky_lemon: {
    kind: 'spooky_lemon',
    name: 'Spooky Lemon',
    radius: 32,
    scoreValue: 10,
    outerColor: '#FBC02D',
    innerColor: '#FFFDE7',
    splatterColor: '#FFEA00',
    accentColor: '#7B1FA2',
    eyeType: 'fangs',
  },
  ghost_berry: {
    kind: 'ghost_berry',
    name: 'Ghost Berry',
    radius: 30,
    scoreValue: 15,
    outerColor: '#8E24AA',
    innerColor: '#E1BEE7',
    splatterColor: '#D500F9',
    accentColor: '#00E5FF',
    eyeType: 'spooky',
  },
  candy_corn: {
    kind: 'candy_corn',
    name: 'Candy Corn',
    radius: 32,
    scoreValue: 20,
    outerColor: '#FB8C00',
    innerColor: '#FFF8E1',
    splatterColor: '#FF9800',
    accentColor: '#FDD835',
    eyeType: 'smiling',
  },
};

const FRUIT_KEYS: FruitKind[] = [
  'pumpkin', 
  'monster_apple', 
  'slime_melon', 
  'spooky_lemon', 
  'ghost_berry', 
  'candy_corn'
];

interface EngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onObjectiveProgress: (current: number, target: number) => void;
  onLevelComplete: (finalScore: number, stars: number) => void;
  onGameOver: (finalScore: number, reason: 'lives' | 'bomb') => void;
}

export class HalloweenFruitSliceEngine {
  private level: LevelConfig;
  private callbacks: EngineCallbacks;
  private width: number = 400;
  private height: number = 700;

  public objects: FlyingObject[] = [];
  public halves: SlicedHalf[] = [];
  public splatters: SplatterDecal[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public slashPoints: SlashPoint[] = [];

  private nextId: number = 1;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastFrameTime: number = 0;
  private spawnTimer: number = 0;
  private levelTimer: number = 0;

  // Gameplay stats
  public currentScore: number = 0;
  public remainingLives: number = 3;
  public totalSlices: number = 0;
  public highestCombo: number = 0;

  // Swipe & Combo state
  private isSwiping: boolean = false;
  private currentSwipeSlices: number = 0;
  private lastSliceTime: number = 0;
  private comboChain: number = 0;

  // Screen shake
  public screenShake: number = 0;

  constructor(level: LevelConfig, callbacks: EngineCallbacks) {
    this.level = level;
    this.callbacks = callbacks;
    this.remainingLives = level.maxMisses;
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.spawnTimer = 0;
    this.levelTimer = 0;
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastFrameTime = performance.now();
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
  }

  // ---------------------------------------------------------------------------
  // Input Handling: Pointer Down / Move / Up
  // ---------------------------------------------------------------------------
  public onPointerDown(x: number, y: number) {
    if (!this.isRunning || this.isPaused) return;
    this.isSwiping = true;
    this.currentSwipeSlices = 0;
    const now = performance.now();
    this.slashPoints = [{ x, y, time: now }];
    this.checkSliceSegment(x, y, x, y);
  }

  public onPointerMove(x: number, y: number) {
    if (!this.isRunning || this.isPaused || !this.isSwiping) return;
    const now = performance.now();
    const last = this.slashPoints[this.slashPoints.length - 1];

    if (last) {
      const dist = Math.hypot(x - last.x, y - last.y);
      if (dist > 8) {
        this.checkSliceSegment(last.x, last.y, x, y);
        if (dist > 35) {
          halloweenAudio.playSwipeWhoosh();
        }
      }
    }
    this.slashPoints.push({ x, y, time: now });

    // Keep slash trail bounded
    if (this.slashPoints.length > 24) {
      this.slashPoints.shift();
    }
  }

  public onPointerUp() {
    this.isSwiping = false;
    this.currentSwipeSlices = 0;
  }

  // ---------------------------------------------------------------------------
  // Continuous Intersection Check: Segment P1-P2 vs Flying Object Circles
  // ---------------------------------------------------------------------------
  private checkSliceSegment(x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const segLenSq = dx * dx + dy * dy;

    for (const obj of this.objects) {
      if (obj.sliced || obj.missed) continue;

      let distSq: number;
      if (segLenSq === 0) {
        distSq = (obj.x - x1) ** 2 + (obj.y - y1) ** 2;
      } else {
        const t = Math.max(0, Math.min(1, ((obj.x - x1) * dx + (obj.y - y1) * dy) / segLenSq));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        distSq = (obj.x - projX) ** 2 + (obj.y - projY) ** 2;
      }

      const hitDist = obj.radius * 1.05;
      if (distSq <= hitDist * hitDist) {
        const cutAngle = Math.atan2(dy, dx);
        this.sliceObject(obj, cutAngle);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Slice Execution: Split, Juice, Sound, Score, Combos
  // ---------------------------------------------------------------------------
  private sliceObject(obj: FlyingObject, cutAngle: number) {
    obj.sliced = true;
    const now = performance.now();

    // 1. DANGER BOMB SLICED
    if (obj.isBomb) {
      this.screenShake = 22;
      halloweenAudio.playBombExplosion();
      try {
        navigator.vibrate?.(180);
      } catch {}

      // Spawn fiery bomb explosion blast particles
      for (let i = 0; i < 35; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 320 + 80;
        this.particles.push({
          x: obj.x,
          y: obj.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: Math.random() * 5 + 3,
          color: Math.random() > 0.4 ? '#FF5722' : '#FFEB3B',
          alpha: 1,
          life: 0,
          maxLife: 0.65,
        });
      }

      this.remainingLives = 0;
      this.callbacks.onLivesUpdate(0);
      this.callbacks.onGameOver(this.currentScore, 'bomb');
      return;
    }

    // 2. FRUIT SLICED
    halloweenAudio.playFruitSlice();
    try {
      navigator.vibrate?.(25);
    } catch {}

    const cfg = obj.config || HALLOWEEN_FRUITS[obj.kind];

    // Outward impulse vector perpendicular to slice angle
    const perpAngle = cutAngle + Math.PI / 2;
    const splitSpeed = 160 + Math.random() * 50;
    const splitVx = Math.cos(perpAngle) * splitSpeed;
    const splitVy = Math.sin(perpAngle) * splitSpeed;

    // Halves creation
    this.halves.push({
      id: this.nextId++,
      kind: obj.kind,
      isLeft: true,
      x: obj.x,
      y: obj.y,
      vx: obj.vx - splitVx,
      vy: obj.vy - splitVy,
      gravity: 950,
      radius: obj.radius,
      rotation: cutAngle,
      vRot: -3.5 - Math.random() * 2,
      sliceAngle: cutAngle,
      alpha: 1,
      config: cfg,
    });

    this.halves.push({
      id: this.nextId++,
      kind: obj.kind,
      isLeft: false,
      x: obj.x,
      y: obj.y,
      vx: obj.vx + splitVx,
      vy: obj.vy + splitVy,
      gravity: 950,
      radius: obj.radius,
      rotation: cutAngle,
      vRot: 3.5 + Math.random() * 2,
      sliceAngle: cutAngle,
      alpha: 1,
      config: cfg,
    });

    // Wall Splatter Decal
    const dropCount = Math.floor(Math.random() * 5) + 5;
    const drops: { dx: number; dy: number; r: number }[] = [];
    for (let i = 0; i < dropCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (obj.radius * 1.2);
      drops.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        r: Math.random() * 6 + 3,
      });
    }

    this.splatters.push({
      id: this.nextId++,
      x: obj.x,
      y: obj.y,
      radius: obj.radius * (0.8 + Math.random() * 0.3),
      color: cfg.splatterColor,
      alpha: 0.95,
      drops,
    });

    // Bound decals count to keep memory low
    if (this.splatters.length > 25) {
      this.splatters.shift();
    }

    // Juice Splash Particles
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 260 + 60;
      this.particles.push({
        x: obj.x,
        y: obj.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 60,
        radius: Math.random() * 4.5 + 2,
        color: cfg.splatterColor,
        alpha: 1,
        life: 0,
        maxLife: 0.45,
      });
    }

    // Starburst Blade Sparks
    for (let i = 0; i < 8; i++) {
      const ang = cutAngle + (Math.random() - 0.5) * 1.5;
      const spd = Math.random() * 320 + 100;
      this.particles.push({
        x: obj.x,
        y: obj.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: Math.random() * 3 + 1.5,
        color: '#FFFFFF',
        alpha: 1,
        life: 0,
        maxLife: 0.3,
      });
    }

    // Combo & Score Calculation
    this.totalSlices++;
    this.currentSwipeSlices++;

    if (now - this.lastSliceTime < 380) {
      this.comboChain++;
    } else {
      this.comboChain = 1;
    }
    this.lastSliceTime = now;

    let pointsAwarded = cfg.scoreValue;
    if (this.comboChain >= 2) {
      pointsAwarded += this.comboChain * 5;
      halloweenAudio.playCombo(this.comboChain);
      try {
        navigator.vibrate?.(45);
      } catch {}

      this.floatingTexts.push({
        id: this.nextId++,
        text: `+${this.comboChain} COMBO!`,
        x: obj.x,
        y: obj.y - 25,
        vy: -75,
        color: '#FFEB3B',
        alpha: 1,
        scale: 1.25,
        life: 0,
        maxLife: 0.9,
      });

      if (this.comboChain > this.highestCombo) {
        this.highestCombo = this.comboChain;
      }
    }

    this.currentScore += pointsAwarded;
    this.callbacks.onScoreUpdate(this.currentScore);

    // Floating Score Text (+10, +25)
    this.floatingTexts.push({
      id: this.nextId++,
      text: `+${pointsAwarded}`,
      x: obj.x,
      y: obj.y,
      vy: -55,
      color: '#FFFFFF',
      alpha: 1,
      scale: 1,
      life: 0,
      maxLife: 0.7,
    });

    // Check Objective Completion
    this.checkObjectives();
  }

  // ---------------------------------------------------------------------------
  // Check Objective Criteria
  // ---------------------------------------------------------------------------
  private checkObjectives() {
    let currentVal = 0;
    switch (this.level.objectiveType) {
      case 'SCORE':
        currentVal = this.currentScore;
        break;
      case 'SLICES':
        currentVal = this.totalSlices;
        break;
      case 'COMBO':
        currentVal = this.highestCombo;
        break;
      case 'SURVIVE':
        currentVal = Math.floor(this.levelTimer);
        break;
      case 'NO_MISS':
        currentVal = this.totalSlices;
        break;
    }

    this.callbacks.onObjectiveProgress(currentVal, this.level.objectiveTarget);

    if (currentVal >= this.level.objectiveTarget) {
      let stars = 1;
      if (this.currentScore >= this.level.star3) stars = 3;
      else if (this.currentScore >= this.level.star2) stars = 2;

      this.isRunning = false;
      halloweenAudio.playLevelComplete();
      this.callbacks.onLevelComplete(this.currentScore, stars);
    }
  }

  // ---------------------------------------------------------------------------
  // Spawner: Varied Trajectories, Heights, Speed, Bombs
  // ---------------------------------------------------------------------------
  private spawnWave() {
    const count = Math.floor(Math.random() * this.level.maxSimultaneous) + 1;

    for (let i = 0; i < count; i++) {
      const isBomb = Math.random() < this.level.bombChance;
      const kind = FRUIT_KEYS[Math.floor(Math.random() * FRUIT_KEYS.length)];
      const cfg = HALLOWEEN_FRUITS[kind];

      // Spawn horizontal position: 15% to 85% width
      const spawnX = this.width * (0.15 + Math.random() * 0.7);
      const spawnY = this.height + 45;

      // Arc towards screen center
      const centerX = this.width * 0.5;
      const dirTowardsCenter = spawnX < centerX ? 1 : -1;
      const vx = (Math.random() * 140 + 40) * dirTowardsCenter;

      // Upward velocity scaled to reach upper 20-40% of screen
      const vy = -(
        this.level.minSpeedY +
        Math.random() * (this.level.maxSpeedY - this.level.minSpeedY)
      );

      this.objects.push({
        id: this.nextId++,
        isBomb,
        kind,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        gravity: 920,
        radius: isBomb ? 36 : cfg.radius,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 5,
        sliced: false,
        missed: false,
        config: cfg,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Physics & Simulation Loop (Delta-Time Independent)
  // ---------------------------------------------------------------------------
  public update() {
    if (!this.isRunning || this.isPaused) return;

    const now = performance.now();
    const dt = Math.min(Math.max((now - this.lastFrameTime) / 1000, 0.001), 0.08);
    this.lastFrameTime = now;

    // Decay screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 45);
    }

    // Timers
    this.levelTimer += dt;
    this.spawnTimer += dt * 1000;

    if (this.level.objectiveType === 'SURVIVE') {
      this.checkObjectives();
    }

    // Spawn waves
    if (this.spawnTimer >= this.level.spawnIntervalMs) {
      this.spawnTimer = 0;
      this.spawnWave();
    }

    // 1. Update Flying Objects
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      if (obj.sliced) {
        this.objects.splice(i, 1);
        continue;
      }

      obj.vy += obj.gravity * dt;
      obj.x += obj.vx * dt;
      obj.y += obj.vy * dt;
      obj.rotation += obj.vRot * dt;

      // Miss check: unsliced fruit drops below screen
      if (obj.y > this.height + 60 && obj.vy > 0) {
        if (!obj.isBomb && !obj.sliced && !obj.missed) {
          obj.missed = true;
          this.remainingLives--;
          halloweenAudio.playMiss();
          try {
            navigator.vibrate?.(60);
          } catch {}
          this.callbacks.onLivesUpdate(this.remainingLives);

          if (this.remainingLives <= 0) {
            this.isRunning = false;
            halloweenAudio.playGameOver();
            this.callbacks.onGameOver(this.currentScore, 'lives');
          }
        }
        this.objects.splice(i, 1);
      }
    }

    // 2. Update Sliced Halves
    for (let i = this.halves.length - 1; i >= 0; i--) {
      const h = this.halves[i];
      h.vy += h.gravity * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rotation += h.vRot * dt;

      if (h.y > this.height + 80) {
        this.halves.splice(i, 1);
      }
    }

    // 3. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 450 * dt; // gravity on droplets
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 4. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life += dt;
      t.y += t.vy * dt;
      t.alpha = Math.max(0, 1 - t.life / t.maxLife);

      if (t.life >= t.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 5. Clean up old slash points
    const slashThreshold = now - 280;
    while (this.slashPoints.length > 0 && this.slashPoints[0].time < slashThreshold) {
      this.slashPoints.shift();
    }
  }
}
