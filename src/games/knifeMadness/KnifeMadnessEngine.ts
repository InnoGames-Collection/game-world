/**
 * KNIFE MADNESS - Core Physics & Gameplay Engine
 * 60 FPS deterministic collision detection, rotation physics, precision measurement,
 * combo tracking, and attempt-based visual variation.
 *
 * Core Rule: Only fails when newly thrown knife collides with an embedded blade!
 */

import {
  GameState,
  LevelConfig,
  EmbeddedKnife,
  TargetApple,
  FlyingKnife,
  DeflectedKnife,
  ImpactParticle,
  ShatterFragment,
  SlicedApplePart,
  FloatingFeedback,
  TargetTheme,
} from './types';
import { knifeAudio } from './audio';
import { calculatePrecisionScore, calculateComboBonus, calculateFruitBonus } from './scoring';

export interface LevelSuccessData {
  level: LevelConfig;
  knivesPlaced: number;
  fruitsSlicedCount: number;
  accumulatedFruitScore: number;
  accumulatedPrecisionScore: number;
  accumulatedComboScore: number;
  activeSeconds: number;
  throwsCount: number;
  maxCombo: number;
  bestPrecisionDeg: number;
}

export interface LevelFailedData {
  level: LevelConfig;
  reason: 'blade_collision';
  knivesPlaced: number;
  fruitsSlicedCount: number;
  accumulatedFruitScore: number;
  accumulatedPrecisionScore: number;
  accumulatedComboScore: number;
  activeSeconds: number;
  throwsCount: number;
  maxCombo: number;
  bestPrecisionDeg: number;
}

export interface EngineCallbacks {
  onScoreUpdate: (levelScore: number, applesCount: number) => void;
  onKnivesUpdate: (remaining: number) => void;
  onLevelComplete: (data: LevelSuccessData) => void;
  onLevelFailed: (data: LevelFailedData) => void;
  onStateChange: (state: GameState) => void;
}

export class KnifeMadnessEngine {
  public state: GameState = 'idle';
  public currentLevel: LevelConfig;
  public activeTheme: TargetTheme;
  public attemptSeed: number = 0;

  // Level Gameplay Metrics
  public score: number = 0;
  public applesCollected: number = 0;
  public remainingKnives: number = 0;
  public knivesPlaced: number = 0;
  public throwsCount: number = 0;
  public currentCombo: number = 0;
  public maxCombo: number = 0;
  public accumulatedFruitScore: number = 0;
  public accumulatedPrecisionScore: number = 0;
  public accumulatedComboScore: number = 0;
  public bestPrecisionDeg: number = 99;
  public activeSeconds: number = 0;

  // Geometry
  public targetRadius: number = 78;
  public targetCenter = { x: 180, y: 195 };
  public readyKnifeY: number = 490;

  // Rotation Physics
  public targetRotation: number = 0;
  public currentRotationSpeed: number = 1.8;
  private rotationTimer: number = 0;

  // Knives & Entities
  public embeddedKnives: EmbeddedKnife[] = [];
  public apples: TargetApple[] = [];
  public flyingKnives: FlyingKnife[] = [];
  public deflectedKnives: DeflectedKnife[] = [];
  public particles: ImpactParticle[] = [];
  public shatterFragments: ShatterFragment[] = [];
  public slicedApples: SlicedApplePart[] = [];
  public floatingFeedbacks: FloatingFeedback[] = [];

  // Hit & Feedback
  public screenShake: number = 0;
  public isReadyToThrow: boolean = true;
  private callbacks: EngineCallbacks;

  constructor(initialLevel: LevelConfig, callbacks: EngineCallbacks, attemptSeed: number = 0) {
    this.currentLevel = initialLevel;
    this.attemptSeed = attemptSeed;
    this.activeTheme = this.resolveActiveTheme(initialLevel, attemptSeed);
    this.callbacks = callbacks;
    this.loadLevel(initialLevel, attemptSeed);
  }

  private resolveActiveTheme(level: LevelConfig, seed: number): TargetTheme {
    if (level.themeVariations && level.themeVariations.length > 0) {
      return level.themeVariations[seed % level.themeVariations.length];
    }
    return level.theme;
  }

  public loadLevel(level: LevelConfig, attemptSeed: number = this.attemptSeed) {
    this.currentLevel = level;
    this.attemptSeed = attemptSeed;
    this.activeTheme = this.resolveActiveTheme(level, attemptSeed);

    this.remainingKnives = level.requiredKnives;
    this.knivesPlaced = 0;
    this.throwsCount = 0;
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.accumulatedFruitScore = 0;
    this.accumulatedPrecisionScore = 0;
    this.accumulatedComboScore = 0;
    this.bestPrecisionDeg = 99;
    this.activeSeconds = 0;
    this.score = 0;
    this.applesCollected = 0;

    this.targetRotation = 0;
    this.currentRotationSpeed = level.baseSpeed;
    this.rotationTimer = 0;

    // Load pre-embedded obstacles
    this.embeddedKnives = level.preEmbeddedKnives.map((k, idx) => ({
      id: `pre_${idx}`,
      angle: k.angle,
      isObstacle: true,
      type: k.type || 'standard',
    }));

    // Load level apples/fruits
    this.apples = level.apples.map((a, idx) => ({
      id: `apple_${idx}`,
      angle: a.angle,
      sliced: false,
      type: a.type || 'apple',
    }));

    this.flyingKnives = [];
    this.deflectedKnives = [];
    this.particles = [];
    this.shatterFragments = [];
    this.slicedApples = [];
    this.floatingFeedbacks = [];
    this.screenShake = 0;
    this.isReadyToThrow = true;
    this.state = 'playing';

    this.callbacks.onKnivesUpdate(this.remainingKnives);
    this.callbacks.onScoreUpdate(this.score, this.applesCollected);
    this.callbacks.onStateChange(this.state);
  }

  public setDimensions(width: number, height: number) {
    this.targetCenter = { x: width / 2, y: Math.max(140, height * 0.32) };
    this.targetRadius = Math.min(width * 0.22, 85);
    this.readyKnifeY = height - 90;
  }

  /**
   * Main game loop update called at 60 FPS
   */
  public update(dt: number) {
    if (this.state !== 'playing' && this.state !== 'failed' && this.state !== 'level_complete') {
      return;
    }

    // Accumulate active gameplay time only during active play
    if (this.state === 'playing') {
      this.activeSeconds += dt;
    }

    // 1. Decay Screen Shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 45);
    }

    // 2. Rotate Target
    if (this.state === 'playing' || this.state === 'failed') {
      this.updateTargetRotation(dt);
    }

    // 3. Update Flying Knives
    for (let i = this.flyingKnives.length - 1; i >= 0; i--) {
      const knife = this.flyingKnives[i];
      knife.y += knife.vy * dt;

      // Target impact boundary: knife reaches bottom perimeter of rotating target
      const hitTargetY = this.targetCenter.y + this.targetRadius - 10;
      if (knife.y <= hitTargetY) {
        this.flyingKnives.splice(i, 1);
        this.handleKnifeCollision();
        this.isReadyToThrow = true;
      }
    }

    // 4. Update Deflected Knives (failure physics)
    for (let i = this.deflectedKnives.length - 1; i >= 0; i--) {
      const dk = this.deflectedKnives[i];
      dk.x += dk.vx * dt;
      dk.y += dk.vy * dt;
      dk.vy += 850 * dt; // Gravity
      dk.rotation += dk.vRot * dt;
      dk.opacity = Math.max(0, dk.opacity - dt * 0.85);

      if (dk.opacity <= 0 || dk.y > 1000) {
        this.deflectedKnives.splice(i, 1);
      }
    }

    // 5. Update Shatter Fragments (victory explosion)
    for (let i = this.shatterFragments.length - 1; i >= 0; i--) {
      const frag = this.shatterFragments[i];
      frag.x += frag.vx * dt;
      frag.y += frag.vy * dt;
      frag.vy += 820 * dt; // Gravity
      frag.rotation += frag.vRot * dt;
      frag.opacity = Math.max(0, frag.opacity - dt * 0.95);

      if (frag.opacity <= 0 || frag.y > 1000) {
        this.shatterFragments.splice(i, 1);
      }
    }

    // 6. Update Sliced Fruits
    for (let i = this.slicedApples.length - 1; i >= 0; i--) {
      const part = this.slicedApples[i];
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vy += 920 * dt;
      part.rotation += part.vRot * dt;
      part.opacity = Math.max(0, part.opacity - dt * 0.85);

      if (part.opacity <= 0 || part.y > 1000) {
        this.slicedApples.splice(i, 1);
      }
    }

    // 7. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 8. Update Floating Feedback Indicators
    for (let i = this.floatingFeedbacks.length - 1; i >= 0; i--) {
      const fb = this.floatingFeedbacks[i];
      fb.y += fb.vy * dt;
      fb.life -= dt;
      fb.opacity = Math.max(0, fb.life / 0.9);
      fb.scale = Math.min(1.2, fb.scale + dt * 0.4);
      if (fb.life <= 0) {
        this.floatingFeedbacks.splice(i, 1);
      }
    }
  }

  /**
   * Deterministic rotation patterns
   */
  private updateTargetRotation(dt: number) {
    this.rotationTimer += dt;
    const { speedPattern, baseSpeed, patternParams } = this.currentLevel;
    const period = patternParams?.period || 3.0;

    switch (speedPattern) {
      case 'variable': {
        const minS = patternParams?.speedMin || baseSpeed * 0.6;
        const maxS = patternParams?.speedMax || baseSpeed * 1.5;
        const wave = 0.5 + 0.5 * Math.sin((this.rotationTimer / period) * Math.PI * 2);
        this.currentRotationSpeed = minS + (maxS - minS) * wave;
        break;
      }
      case 'reverse': {
        const wave = Math.sin((this.rotationTimer / period) * Math.PI * 2);
        this.currentRotationSpeed = baseSpeed * wave * 1.35;
        break;
      }
      case 'pulsing': {
        const cycle = (this.rotationTimer % period) / period;
        if (cycle < 0.4) {
          this.currentRotationSpeed = baseSpeed * 1.85;
        } else {
          this.currentRotationSpeed = baseSpeed * 0.45;
        }
        break;
      }
      case 'jerky': {
        const cycle = Math.floor(this.rotationTimer * (patternParams?.jerkFrequency || 1.8));
        const odd = cycle % 2 === 0;
        this.currentRotationSpeed = odd ? baseSpeed * 2.2 : baseSpeed * 0.25;
        break;
      }
      case 'extreme_oscillation': {
        const wave1 = Math.sin(this.rotationTimer * 3.2);
        const wave2 = Math.cos(this.rotationTimer * 1.7);
        this.currentRotationSpeed = baseSpeed * (wave1 * 1.25 + wave2 * 0.65);
        break;
      }
      case 'constant':
      default:
        this.currentRotationSpeed = baseSpeed;
        break;
    }

    this.targetRotation += this.currentRotationSpeed * dt;
    this.targetRotation = ((this.targetRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  }

  /**
   * Throw ready knife
   */
  public throwKnife(): boolean {
    if (this.state !== 'playing' || !this.isReadyToThrow || this.remainingKnives <= 0) {
      return false;
    }

    this.isReadyToThrow = false;
    this.throwsCount += 1;
    knifeAudio.playThrow();

    this.flyingKnives.push({
      id: `flying_${Date.now()}`,
      y: this.readyKnifeY,
      vy: -1750, // fast, responsive knife velocity
      scale: 1,
      rotation: 0,
      wobble: 0,
    });

    return true;
  }

  /**
   * Collision evaluation when knife reaches the target perimeter
   * CRITICAL: FAIL ONLY HAPPENS ON BLADE COLLISION!
   */
  private handleKnifeCollision() {
    let impactAngle = (Math.PI / 2 - this.targetRotation) % (Math.PI * 2);
    if (impactAngle < 0) impactAngle += Math.PI * 2;

    const toleranceRad = (this.currentLevel.hitToleranceDegrees * Math.PI) / 180;

    // Check collision with existing embedded knives/obstacles
    let collidedKnife: EmbeddedKnife | null = null;
    let minGapRad = Infinity;

    for (const ek of this.embeddedKnives) {
      let diff = Math.abs(ek.angle - impactAngle);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;

      if (diff < minGapRad) {
        minGapRad = diff;
      }

      if (diff < toleranceRad) {
        collidedKnife = ek;
        break;
      }
    }

    // --- CASE A: BLADE COLLISION (FAILURE ONLY) ---
    if (collidedKnife) {
      knifeAudio.playDeflect();
      this.screenShake = 18;
      this.state = 'failed';
      this.currentCombo = 0;

      // Deflection rebound
      this.deflectedKnives.push({
        id: `deflected_${Date.now()}`,
        x: this.targetCenter.x,
        y: this.targetCenter.y + this.targetRadius,
        vx: (Math.random() - 0.5) * 340,
        vy: 300,
        rotation: 0.35,
        vRot: (Math.random() - 0.5) * 16,
        opacity: 1,
      });

      // Sparks
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 140 + Math.random() * 260;
        this.particles.push({
          x: this.targetCenter.x,
          y: this.targetCenter.y + this.targetRadius,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          radius: 2 + Math.random() * 2.5,
          color: i % 2 === 0 ? '#fef08a' : '#f59e0b',
          life: 0.4 + Math.random() * 0.3,
          maxLife: 0.7,
          type: 'spark',
        });
      }

      const failData: LevelFailedData = {
        level: this.currentLevel,
        reason: 'blade_collision',
        knivesPlaced: this.knivesPlaced,
        fruitsSlicedCount: this.applesCollected,
        accumulatedFruitScore: this.accumulatedFruitScore,
        accumulatedPrecisionScore: this.accumulatedPrecisionScore,
        accumulatedComboScore: this.accumulatedComboScore,
        activeSeconds: this.activeSeconds,
        throwsCount: this.throwsCount,
        maxCombo: this.maxCombo,
        bestPrecisionDeg: this.bestPrecisionDeg === 99 ? 0 : this.bestPrecisionDeg,
      };

      this.callbacks.onLevelFailed(failData);
      this.callbacks.onStateChange(this.state);
      return;
    }

    // --- CASE B: SUCCESSFUL EMBEDDING ---
    knifeAudio.playImpact();
    this.screenShake = 6;
    this.knivesPlaced += 1;
    this.remainingKnives -= 1;
    this.currentCombo += 1;
    if (this.currentCombo > this.maxCombo) {
      this.maxCombo = this.currentCombo;
    }

    // 1. Base Knife Hit Score (+1)
    this.score += 1;

    // 2. Precision Evaluation
    const minGapDeg = (minGapRad * 180) / Math.PI;
    if (minGapDeg < this.bestPrecisionDeg) {
      this.bestPrecisionDeg = minGapDeg;
    }
    const prec = calculatePrecisionScore(minGapDeg);
    if (prec.points > 0) {
      this.score += prec.points;
      this.accumulatedPrecisionScore += prec.points;
      this.addFloatingFeedback(
        prec.label,
        this.targetCenter.x,
        this.targetCenter.y + this.targetRadius + 18,
        '#38bdf8'
      );
    }

    // 3. Combo Bonus
    const comboInfo = calculateComboBonus(this.currentCombo);
    if (comboInfo.points > 0 && comboInfo.label) {
      this.score += comboInfo.points;
      this.accumulatedComboScore += comboInfo.points;
      this.addFloatingFeedback(
        comboInfo.label,
        this.targetCenter.x,
        this.targetCenter.y - this.targetRadius - 16,
        '#fbbf24'
      );
    }

    // 4. Check Fruit Slicing
    for (const apple of this.apples) {
      if (!apple.sliced) {
        let diff = Math.abs(apple.angle - impactAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < toleranceRad * 1.35) {
          apple.sliced = true;
          this.applesCollected += 1;
          const fruitPts = calculateFruitBonus(apple.type);
          this.score += fruitPts;
          this.accumulatedFruitScore += fruitPts;
          knifeAudio.playAppleSlice();

          // Sliced fruit floating indicator
          this.addFloatingFeedback(
            `+${fruitPts}`,
            this.targetCenter.x + Math.cos(apple.angle + this.targetRotation) * this.targetRadius,
            this.targetCenter.y + Math.sin(apple.angle + this.targetRotation) * this.targetRadius,
            '#ef4444'
          );

          // Sliced halves physics
          const appleWorldX = this.targetCenter.x + Math.cos(apple.angle + this.targetRotation) * this.targetRadius;
          const appleWorldY = this.targetCenter.y + Math.sin(apple.angle + this.targetRotation) * this.targetRadius;

          this.slicedApples.push(
            {
              x: appleWorldX - 6,
              y: appleWorldY,
              vx: -140 - Math.random() * 80,
              vy: -170 - Math.random() * 90,
              rotation: 0,
              vRot: -6.5,
              side: 'left',
              opacity: 1,
              type: apple.type,
            },
            {
              x: appleWorldX + 6,
              y: appleWorldY,
              vx: 140 + Math.random() * 80,
              vy: -170 - Math.random() * 90,
              rotation: 0,
              vRot: 6.5,
              side: 'right',
              opacity: 1,
              type: apple.type,
            }
          );

          // Juice spray
          for (let j = 0; j < 18; j++) {
            const ja = Math.random() * Math.PI * 2;
            const jspd = 80 + Math.random() * 160;
            this.particles.push({
              x: appleWorldX,
              y: appleWorldY,
              vx: Math.cos(ja) * jspd,
              vy: Math.sin(ja) * jspd,
              radius: 2 + Math.random() * 3,
              color: j % 2 === 0 ? '#ef4444' : '#f87171',
              life: 0.4 + Math.random() * 0.25,
              maxLife: 0.65,
              type: 'apple_juice',
            });
          }
        }
      }
    }

    // 5. Attach Knife into Target
    this.embeddedKnives.push({
      id: `knife_${Date.now()}_${this.remainingKnives}`,
      angle: impactAngle,
      isObstacle: false,
      type: 'standard',
    });

    this.callbacks.onScoreUpdate(this.score, this.applesCollected);
    this.callbacks.onKnivesUpdate(this.remainingKnives);

    // Impact debris
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const spd = 60 + Math.random() * 140;
      this.particles.push({
        x: this.targetCenter.x,
        y: this.targetCenter.y + this.targetRadius - 10,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        radius: 1.8 + Math.random() * 2,
        color: '#fde68a',
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        type: 'spark',
      });
    }

    // 6. Check Level Completion
    if (this.remainingKnives <= 0) {
      this.handleLevelComplete();
    }
  }

  private addFloatingFeedback(text: string, x: number, y: number, color: string) {
    this.floatingFeedbacks.push({
      id: `fb_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      opacity: 1,
      scale: 0.8,
      vy: -45,
      life: 0.9,
    });
  }

  /**
   * Handle Level Complete
   */
  private handleLevelComplete() {
    this.state = 'level_complete';
    knifeAudio.playShatter();
    knifeAudio.playVictory();
    this.screenShake = 16;

    // Shatter target into 8 pie slices
    const fragments = 8;
    const sliceAngle = (Math.PI * 2) / fragments;

    for (let i = 0; i < fragments; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;

      const blastSpeed = 220 + Math.random() * 160;
      this.shatterFragments.push({
        x: this.targetCenter.x,
        y: this.targetCenter.y,
        vx: Math.cos(midAngle) * blastSpeed,
        vy: Math.sin(midAngle) * blastSpeed - 120,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 10,
        startAngle,
        endAngle,
        radius: this.targetRadius,
        theme: this.activeTheme,
        opacity: 1,
      });
    }

    // Convert embedded knives to flying debris
    this.embeddedKnives.forEach((k) => {
      const worldAngle = k.angle + this.targetRotation;
      this.deflectedKnives.push({
        id: `frag_knife_${k.id}`,
        x: this.targetCenter.x + Math.cos(worldAngle) * (this.targetRadius + 20),
        y: this.targetCenter.y + Math.sin(worldAngle) * (this.targetRadius + 20),
        vx: Math.cos(worldAngle) * (200 + Math.random() * 100),
        vy: Math.sin(worldAngle) * (200 + Math.random() * 100) - 100,
        rotation: worldAngle,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    });

    this.embeddedKnives = [];

    const successData: LevelSuccessData = {
      level: this.currentLevel,
      knivesPlaced: this.knivesPlaced,
      fruitsSlicedCount: this.applesCollected,
      accumulatedFruitScore: this.accumulatedFruitScore,
      accumulatedPrecisionScore: this.accumulatedPrecisionScore,
      accumulatedComboScore: this.accumulatedComboScore,
      activeSeconds: this.activeSeconds,
      throwsCount: this.throwsCount,
      maxCombo: this.maxCombo,
      bestPrecisionDeg: this.bestPrecisionDeg === 99 ? 0 : this.bestPrecisionDeg,
    };

    setTimeout(() => {
      this.callbacks.onLevelComplete(successData);
      this.callbacks.onStateChange(this.state);
    }, 600);
  }
}
