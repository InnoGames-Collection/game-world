/**
 * SOCCER PING PONG - High Performance Vertical Football Pitch Canvas
 * Fully Refactored with:
 * - Full-width swipe defense (Left Wing, Center, Right Wing)
 * - Dedicated, forgiving yet skill-based Kick Interaction Zone
 * - Immediate responsive kick animation & tactile contact feedback
 * - Fair symmetrical scoring: Conceded goals if player misses; Player goals if AI misses
 * - Tactical computer wing attacks based on level difficulty
 * - Authentic club crests and national flag badges on player & opponent platforms
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { SoccerTeam } from './soccerTeams';
import { SoccerLevelConfig, HitQuality } from './types';
import { soccerAudio } from './soccerAudio';
import { calculateSkillScore, calculateGoalBonus } from './soccerScore';

interface SoccerPitchCanvasProps {
  playerTeam: SoccerTeam;
  opponentTeam: SoccerTeam;
  levelConfig: SoccerLevelConfig;
  isRunning: boolean;
  onPlayerHit: (quality: HitQuality, points: number, rally: number, isPower: boolean) => void;
  onComputerHit: () => void;
  onPlayerMiss: () => void;
  onComputerMiss: (goalPoints: number) => void;
  onRallyIncrement: (rally: number) => void;
  onKickFeedback?: (text: string) => void;
  // External inputs (KICK button, spacebar, keyboard arrows)
  kickTrigger: number; // increments on each tap of KICK or Space
  isMovingLeft?: boolean;
  isMovingRight?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const SoccerPitchCanvas: React.FC<SoccerPitchCanvasProps> = ({
  playerTeam,
  opponentTeam,
  levelConfig,
  isRunning,
  onPlayerHit,
  onComputerHit,
  onPlayerMiss,
  onComputerMiss,
  onRallyIncrement,
  onKickFeedback,
  kickTrigger,
  isMovingLeft = false,
  isMovingRight = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep track of the last processed kickTrigger so we only execute once per button press
  const lastProcessedKickTrigger = useRef<number>(kickTrigger);
  const lastKickTimeRef = useRef<number>(0);

  // Engine state kept in mutable ref for 60fps game loop without React rerender lag
  const stateRef = useRef({
    width: 380,
    height: 640,
    pitch: {
      left: 18,
      right: 362,
      top: 32,
      bottom: 608,
      width: 344,
      height: 576,
    },
    // Player Paddle (Bottom)
    player: {
      x: 190,
      y: 575,
      width: 90,
      height: 20,
      vx: 0,
      targetX: 190,
      lastHitX: 190,
      consecutiveStaticHits: 0,
      kickAnim: 0, // > 0 when kick animation is active
      kickCooldown: 0,
    },
    // Opponent Paddle (Top)
    opponent: {
      x: 190,
      y: 65,
      width: 86,
      height: 20,
      vx: 0,
      targetX: 190,
      reactionTimer: 0,
      errorOffset: 0,
    },
    // Ball
    ball: {
      x: 190,
      y: 320,
      vx: 0,
      vy: 260,
      radius: 12,
      rotation: 0,
      spin: 0,
      speedScale: 1.0,
      lastHitBy: 'none' as 'player' | 'opponent' | 'none',
      isPowerShot: false,
      active: true,
      hasDeflectedIntoGoal: false,
      trail: [] as { x: number; y: number; alpha: number }[],
    },
    rally: 0,
    particles: [] as Particle[],
    goalAnim: 0, // > 0 when celebration is playing
    goalText: '',
    lastTime: performance.now(),
    swipeVelocityX: 0,
  });

  // Serve the ball
  const serveBall = useCallback(
    (toward: 'player' | 'opponent' = 'player') => {
      const s = stateRef.current;
      const centerX = (s.pitch.left + s.pitch.right) / 2;
      const centerY = (s.pitch.top + s.pitch.bottom) / 2;

      s.ball.x = centerX;
      s.ball.y = centerY;
      s.ball.speedScale = 1.0;
      s.ball.isPowerShot = false;
      s.ball.lastHitBy = 'none';
      s.ball.hasDeflectedIntoGoal = false;
      s.ball.trail = [];
      s.goalAnim = 0;
      s.goalText = '';

      const baseSpeed = 270 * levelConfig.ballSpeedMultiplier;

      // Realistic tactical initial angle targeting Left Wing, Center, or Right Wing
      let angleOffset = 0;
      if (toward === 'player') {
        // Computer tactical serve: varied wings to test player defense
        const servePattern = Math.floor(Math.random() * 3);
        if (servePattern === 0) {
          angleOffset = -(85 + Math.random() * 30); // Towards Left Wing
        } else if (servePattern === 1) {
          angleOffset = (85 + Math.random() * 30); // Towards Right Wing
        } else {
          angleOffset = (Math.random() - 0.5) * 35; // Towards Center
        }
      }

      s.ball.vx = angleOffset;
      s.ball.vy = toward === 'player' ? baseSpeed : -baseSpeed;
      s.ball.active = true;

      // Computer error offset scaled strictly by level accuracy
      s.opponent.errorOffset = ((levelConfig.level % 2 === 0 ? 1 : -1) * (36 * (1.0 - levelConfig.opponentAccuracy)));
    },
    [levelConfig]
  );

  // Spawn tactile sparks / grass particles
  const spawnParticles = (x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const spd = 50 + (i % 3) * 40;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0,
        maxLife: 0.35,
        color,
        size: 2.5 + (i % 2) * 1.5,
      });
    }
  };

  // Perform Kick Action - ONLY executed on real human input (KICK button, space, etc.)
  const performPlayerKick = useCallback(() => {
    const s = stateRef.current;
    if (!s.ball.active || !isRunning) return;

    const halfPW = s.player.width / 2;
    const halfOW = s.opponent.width / 2;
    const playerTop = s.player.y - s.player.height / 2;

    // Trigger visual kick animation on player paddle immediately on button press
    s.player.kickAnim = 0.28;

    // 1. Ball must be moving downward toward player
    if (s.ball.vy <= 0) {
      onKickFeedback?.('⚠️ BALL RECEDING');
      soccerAudio.playBounce(0.2);
      return;
    }

    // 2. Define Mobile-Friendly Kick Strike Zone:
    // From 100px above paddle down to 24px past paddle top (generous ~124px vertical window)
    const strikeZoneTop = s.player.y - 100;
    const strikeZoneBottom = s.player.y + 24;

    // 3. Horizontal reach (within paddle width plus forgiving reach margin)
    // halfPW is 38px, so halfPW + 24 is 62px from paddle center
    const inHorizontalReach = Math.abs(s.ball.x - s.player.x) <= halfPW + 24;

    if (s.ball.y < strikeZoneTop) {
      // Human tapped kick too early
      onKickFeedback?.('⚠️ TOO EARLY!');
      soccerAudio.playBounce(0.25);
      return;
    }

    if (s.ball.y > strikeZoneBottom) {
      // Human tapped kick too late
      onKickFeedback?.('❌ TOO LATE!');
      return;
    }

    if (!inHorizontalReach) {
      // Human paddle is in the wrong lane / missed reach - user must move to intercept!
      onKickFeedback?.('❌ OUT OF REACH!');
      soccerAudio.playBounce(0.25);
      return;
    }

    // SUCCESSFUL HUMAN KICK RETURN!
    s.ball.lastHitBy = 'player';
    s.ball.hasDeflectedIntoGoal = false;
    s.rally++;
    onRallyIncrement(s.rally);

    // Anti-camping detection: check if player returned from identical spot
    if (Math.abs(s.player.x - s.player.lastHitX) < 14) {
      s.player.consecutiveStaticHits++;
    } else {
      s.player.consecutiveStaticHits = 0;
    }
    s.player.lastHitX = s.player.x;

    // Calculate contact offset: -1.0 (far left) to +1.0 (far right)
    const offset = Math.max(-1, Math.min(1, (s.ball.x - s.player.x) / halfPW));
    const absOffset = Math.abs(offset);

    // Timing difference from sweet spot apex line
    const apexY = s.player.y - 40;
    const timingDiff = Math.abs(s.ball.y - apexY);

    let quality: HitQuality = 'GOOD';
    let isPower = false;

    if (absOffset < 0.42 && timingDiff < 24) {
      // Sweet spot + active kick button timing = PERFECT POWER STRIKE!
      quality = 'PERFECT';
      isPower = true;
      s.ball.isPowerShot = true;
      spawnParticles(s.ball.x, s.player.y - 12, '#fbbf24', 24);
      onKickFeedback?.('🌟 PERFECT STRIKE!');
    } else if (absOffset >= 0.65) {
      // Defending an acute wing shot near edge of platform!
      quality = 'DEFENSIVE_SAVE';
      spawnParticles(s.ball.x, s.player.y - 8, '#38bdf8', 18);
      onKickFeedback?.('🛡️ WING SAVE!');
    } else {
      quality = 'GOOD';
      spawnParticles(s.ball.x, s.player.y - 8, '#ffffff', 14);
      onKickFeedback?.('⚽ CLEAN RETURN');
    }

    // Calculate exit velocity
    s.ball.speedScale = Math.min(2.1, 1.0 + s.rally * 0.038);
    const currentSpeed =
      275 * levelConfig.ballSpeedMultiplier * s.ball.speedScale * (isPower ? 1.30 : 1.0);

    // Trajectory: offset influences direction (Left wing vs Right wing vs Center)
    const maxAngle = Math.PI * 0.38; // ~68 degrees maximum angle
    const baseAngle = -Math.PI / 2 + offset * maxAngle;

    // Swipe momentum adds slight curl
    const swipeCurl = Math.max(-0.25, Math.min(0.25, s.swipeVelocityX * 0.0003));
    const returnAngle = baseAngle + swipeCurl;

    s.ball.vx = Math.sin(returnAngle + Math.PI / 2) * currentSpeed;
    s.ball.vy = -Math.abs(Math.cos(returnAngle + Math.PI / 2) * currentSpeed);

    // Ensure minimum vertical velocity
    if (Math.abs(s.ball.vy) < 190) s.ball.vy = -190;

    // Reposition ball outside paddle to prevent re-hits
    s.ball.y = playerTop - s.ball.radius - 4;

    // Deterministic Skill Score calculation
    const scoreData = calculateSkillScore(
      levelConfig.level,
      quality,
      s.rally,
      currentSpeed,
      offset,
      s.player.consecutiveStaticHits,
      isPower
    );

    // Sound & feedback
    soccerAudio.playHit(quality === 'PERFECT' ? 'PERFECT' : 'GOOD', s.rally);
    if (s.rally % 5 === 0) soccerAudio.playCrowdCheer(0.65);

    // ONLY human kicks award progression points!
    onPlayerHit(quality, scoreData.total, s.rally, isPower);

    // Computer AI reaction & defense calculation:
    // Determine whether AI anticipates or misjudges based on level accuracy and shot power
    const willAiMiss = (Math.random() > levelConfig.opponentAccuracy) || isPower;
    const missDistance = (halfOW + 18) + Math.random() * 32;
    const errorDirection = offset >= 0 ? -1 : 1;
    s.opponent.errorOffset = willAiMiss
      ? errorDirection * missDistance
      : (Math.random() - 0.5) * 16;
    s.opponent.reactionTimer = 0; // AI takes a moment to react
  }, [isRunning, levelConfig, onPlayerHit, onRallyIncrement, onKickFeedback]);

  // Monitor external kick triggers (from KICK button or Spacebar)
  // Single-input guard: fast 60ms debounce to prevent button stutter
  useEffect(() => {
    if (kickTrigger > lastProcessedKickTrigger.current) {
      lastProcessedKickTrigger.current = kickTrigger;
      const now = performance.now();
      if (now - lastKickTimeRef.current >= 60) {
        lastKickTimeRef.current = now;
        performPlayerKick();
      }
    }
  }, [kickTrigger, performPlayerKick]);

  // Touch / Drag / Swipe handling on full pitch canvas
  // Full-width continuous horizontal swipe matching exact user touch
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let isSwiping = false;
    let startX = 0;
    let playerStartX = 0;
    let lastClientX = 0;
    let lastTime = performance.now();

    const onSwipeStart = (clientX: number) => {
      isSwiping = true;
      startX = clientX;
      playerStartX = stateRef.current.player.x;
      lastClientX = clientX;
      lastTime = performance.now();
    };

    const onSwipeMove = (clientX: number) => {
      if (!isSwiping) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = stateRef.current.width / Math.max(1, rect.width);
      const deltaX = (clientX - startX) * scaleX;

      const halfPW = stateRef.current.player.width / 2;
      const minX = stateRef.current.pitch.left + halfPW;
      const maxX = stateRef.current.pitch.right - halfPW;

      // Clamp player's position across Left Wing, Center, and Right Wing
      const newX = Math.max(minX, Math.min(maxX, playerStartX + deltaX));
      stateRef.current.player.x = newX;
      stateRef.current.player.targetX = newX;

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const instantDx = clientX - lastClientX;
      stateRef.current.swipeVelocityX = (instantDx / dt) * 1000;
      lastClientX = clientX;
      lastTime = now;
    };

    const onSwipeEnd = () => {
      isSwiping = false;
      stateRef.current.swipeVelocityX = 0;
      // CRITICAL: Player STAYS at their current position - NEVER automatically returns to center!
    };

    // Pointer events (Desktop mouse + standard pointers)
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return;
      onSwipeStart(e.clientX);
    };

    const handlePointerMove = (e: PointerEvent) => {
      onSwipeMove(e.clientX);
    };

    const handlePointerUp = () => {
      onSwipeEnd();
    };

    // Touch events for full Android browser compatibility with e.preventDefault()
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onSwipeStart(e.touches[0].clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        onSwipeMove(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      onSwipeEnd();
    };

    // Add listeners to canvas and surrounding container
    canvas.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      canvas.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Main 60FPS Game Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      const s = stateRef.current;
      s.width = w;
      s.height = h;

      const marginX = Math.max(14, w * 0.05);
      const marginY = Math.max(18, h * 0.04);
      s.pitch.left = marginX;
      s.pitch.right = w - marginX;
      s.pitch.top = marginY;
      s.pitch.bottom = h - marginY;
      s.pitch.width = s.pitch.right - s.pitch.left;
      s.pitch.height = s.pitch.bottom - s.pitch.top;

      // Platform sizes scaled proportionally
      const paddleW = Math.max(82, Math.min(108, s.pitch.width * 0.26));
      s.player.width = paddleW;
      s.opponent.width = paddleW * (0.96 - (levelConfig.difficultyStars - 1) * 0.025);

      s.player.y = s.pitch.bottom - 24;
      s.opponent.y = s.pitch.top + 24;

      if (!s.ball.active) {
        s.ball.x = w / 2;
        s.ball.y = h / 2;
        s.player.x = w / 2;
        s.player.targetX = w / 2;
        s.opponent.x = w / 2;
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // Initial serve
    serveBall('player');

    // UPDATE PHYSICS & GAME TICK
    const update = (dt: number) => {
      const s = stateRef.current;
      if (!isRunning) return;

      // Decay visual kick animation
      if (s.player.kickAnim > 0) {
        s.player.kickAnim = Math.max(0, s.player.kickAnim - dt);
      }
      if (s.player.kickCooldown > 0) {
        s.player.kickCooldown = Math.max(0, s.player.kickCooldown - dt);
      }

      // 1. Player Platform Movement
      const halfPW = s.player.width / 2;
      const minX = s.pitch.left + halfPW;
      const maxX = s.pitch.right - halfPW;

      // Keyboard arrow fallback
      if (isMovingLeft) s.player.targetX = Math.max(minX, s.player.targetX - 560 * dt);
      if (isMovingRight) s.player.targetX = Math.min(maxX, s.player.targetX + 560 * dt);

      // Direct responsive position lock (strictly user controlled, no auto-centering)
      s.player.x = s.player.targetX;

      // 2. Computer AI Movement & Prediction
      s.opponent.reactionTimer += dt;
      let targetAIX = s.opponent.x;

      if (s.ball.vy < 0) {
        if (s.opponent.reactionTimer >= levelConfig.aiReactionDelay) {
          // Ball approaching computer
          // Calculate intercept X with wall bounces
          const distY = Math.abs(s.opponent.y - s.ball.y);
          const timeToReach = distY / Math.max(10, Math.abs(s.ball.vy));
          let projectedX = s.ball.x + s.ball.vx * timeToReach;

          while (projectedX < s.pitch.left || projectedX > s.pitch.right) {
            if (projectedX < s.pitch.left) {
              projectedX = s.pitch.left + (s.pitch.left - projectedX);
            } else if (projectedX > s.pitch.right) {
              projectedX = s.pitch.right - (projectedX - s.pitch.right);
            }
          }

          // Apply error offset based on level's opponent accuracy
          targetAIX = projectedX + s.opponent.errorOffset;
        }
      } else {
        // Ball heading away - AI repositions back to center
        targetAIX = (s.pitch.left + s.pitch.right) / 2;
      }

      // Move opponent toward targetAIX with level speed
      const aiSpeed = (240 + levelConfig.level * 12) * dt;
      const aiDiff = targetAIX - s.opponent.x;
      if (Math.abs(aiDiff) < aiSpeed) {
        s.opponent.x = targetAIX;
      } else {
        s.opponent.x += Math.sign(aiDiff) * aiSpeed;
      }

      const halfOW = s.opponent.width / 2;
      s.opponent.x = Math.max(s.pitch.left + halfOW, Math.min(s.pitch.right - halfOW, s.opponent.x));

      // 3. Ball Movement
      if (s.ball.active) {
        s.ball.x += s.ball.vx * dt;
        s.ball.y += s.ball.vy * dt;

        // Ball spin & rotation
        const ballSpeed = Math.hypot(s.ball.vx, s.ball.vy);
        s.ball.rotation += (ballSpeed * 0.02 + s.ball.spin) * dt;

        // Ball trail
        if (s.ball.trail.length > 8) s.ball.trail.shift();
        s.ball.trail.push({ x: s.ball.x, y: s.ball.y, alpha: 1.0 });

        // Wall collisions (Touchlines)
        if (s.ball.x - s.ball.radius <= s.pitch.left) {
          s.ball.x = s.pitch.left + s.ball.radius;
          s.ball.vx = Math.abs(s.ball.vx) * 0.98;
          soccerAudio.playBounce(0.4);
          spawnParticles(s.pitch.left, s.ball.y, '#ffffff', 5);
        } else if (s.ball.x + s.ball.radius >= s.pitch.right) {
          s.ball.x = s.pitch.right - s.ball.radius;
          s.ball.vx = -Math.abs(s.ball.vx) * 0.98;
          soccerAudio.playBounce(0.4);
          spawnParticles(s.pitch.right, s.ball.y, '#ffffff', 5);
        }

        // 4. PLAYER DEFENSIVE PLATFORM (Bottom)
        // CRITICAL ANTI-AUTOPLAY:
        // A collision alone NEVER produces a return!
        // If human did not press KICK, the ball deflects straight past into user's net.
        const playerTop = s.player.y - s.player.height / 2;
        const playerBottom = s.player.y + s.player.height / 2;

        if (
          s.ball.vy > 0 &&
          s.ball.y + s.ball.radius >= playerTop &&
          s.ball.y - s.ball.radius <= playerBottom &&
          s.ball.x >= s.player.x - halfPW - 8 &&
          s.ball.x <= s.player.x + halfPW + 8
        ) {
          if (!s.ball.hasDeflectedIntoGoal) {
            s.ball.hasDeflectedIntoGoal = true;
            s.ball.vy = Math.max(300, Math.abs(s.ball.vy));
            soccerAudio.playMissSound();
            spawnParticles(s.ball.x, s.player.y, '#ef4444', 12);
            onKickFeedback?.('❌ TAP KICK TO RETURN!');
          }
        }

        // 5. OPPONENT DEFENSIVE PADDLE COLLISION (Top)
        const oppTop = s.opponent.y - s.opponent.height / 2;
        const oppBottom = s.opponent.y + s.opponent.height / 2;

        if (
          s.ball.vy < 0 &&
          s.ball.y - s.ball.radius <= oppBottom &&
          s.ball.y + s.ball.radius >= oppTop &&
          s.ball.x >= s.opponent.x - halfOW - 8 &&
          s.ball.x <= s.opponent.x + halfOW + 8
        ) {
          // OPPONENT INTERCEPTED & RETURNED!
          s.ball.lastHitBy = 'opponent';
          s.ball.isPowerShot = false;
          s.ball.hasDeflectedIntoGoal = false;
          s.rally++;
          onRallyIncrement(s.rally);

          s.ball.speedScale = Math.min(2.0, 1.0 + s.rally * 0.035);
          const oppSpeed = 265 * levelConfig.ballSpeedMultiplier * s.ball.speedScale;

          // Tactical Computer Attack:
          // Target Left Wing, Right Wing, or Center based on player's position
          let attackTargetX = (s.pitch.left + s.pitch.right) / 2;
          const playerCenterX = (s.pitch.left + s.pitch.right) / 2;

          if (s.player.x > playerCenterX + 16) {
            // Player is defending right wing -> AI attacks LEFT wing!
            attackTargetX = s.pitch.left + s.pitch.width * 0.16 + Math.random() * 24;
          } else if (s.player.x < playerCenterX - 16) {
            // Player is defending left wing -> AI attacks RIGHT wing!
            attackTargetX = s.pitch.right - s.pitch.width * 0.16 - Math.random() * 24;
          } else {
            // Player in center -> AI shoots towards left or right wing
            const shootLeft = Math.random() < 0.5;
            attackTargetX = shootLeft
              ? s.pitch.left + s.pitch.width * 0.16
              : s.pitch.right - s.pitch.width * 0.16;
          }

          // Calculate angle toward target
          const dxToTarget = attackTargetX - s.opponent.x;
          const dyToTarget = s.player.y - oppBottom;
          const targetAngle = Math.atan2(dxToTarget, dyToTarget);

          s.ball.vx = Math.sin(targetAngle) * oppSpeed;
          s.ball.vy = Math.abs(Math.cos(targetAngle) * oppSpeed);

          if (Math.abs(s.ball.vy) < 180) s.ball.vy = 180;

          s.ball.y = oppBottom + s.ball.radius + 2;

          soccerAudio.playBounce(0.55);
          spawnParticles(s.ball.x, s.opponent.y, opponentTeam.primaryColor, 8);
          onComputerHit();
        }

        // 6. SYMMETRICAL SCORING CONSEQUENCES
        // If player fails to defend -> COMPUTER SCORES!
        if (s.ball.y > s.pitch.bottom + 22) {
          s.ball.active = false;
          s.goalAnim = 1.8;
          s.goalText = 'GOAL CONCEDED!';
          soccerAudio.playMissSound();
          spawnParticles(s.ball.x, s.pitch.bottom, '#ef4444', 28);
          onPlayerMiss();

          setTimeout(() => {
            if (isRunning) serveBall('player');
          }, 1300);
        }

        // If computer fails to defend -> PLAYER SCORES!
        if (s.ball.y < s.pitch.top - 22) {
          s.ball.active = false;
          s.goalAnim = 1.8;
          s.goalText = 'GOAL FOR YOU!';
          soccerAudio.playWhistle();
          soccerAudio.playCrowdCheer(0.9);
          spawnParticles(s.ball.x, s.pitch.top, '#10b981', 32);

          const goalBonus = calculateGoalBonus(levelConfig.level, s.rally);
          onComputerMiss(goalBonus);

          setTimeout(() => {
            if (isRunning) serveBall('opponent');
          }, 1400);
        }
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += dt;
        if (p.life >= p.maxLife) {
          s.particles.splice(i, 1);
        }
      }

      if (s.goalAnim > 0) {
        s.goalAnim -= dt;
      }
    };

    // RENDER PITCH, PLAYERS, BALL & INTERACTION ZONES
    const render = () => {
      const s = stateRef.current;
      const w = s.width;
      const h = s.height;
      const p = s.pitch;
      const centerY = (p.top + p.bottom) / 2;

      // 1. Stadium Grass & Alternating Bands
      ctx.fillStyle = '#172e19'; // Stadium surrounds
      ctx.fillRect(0, 0, w, h);

      const stripeCount = 12;
      const stripeH = p.height / stripeCount;
      for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#348e3f' : '#2d7c37';
        ctx.fillRect(p.left, p.top + i * stripeH, p.width, stripeH);
      }

      // Vignette
      const grad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        p.width * 0.25,
        w / 2,
        h / 2,
        p.height * 0.75
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(p.left, p.top, p.width, p.height);

      // 2. Regulation Pitch Markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.5;

      // Outer boundary line
      ctx.strokeRect(p.left, p.top, p.width, p.height);

      // Center line
      ctx.beginPath();
      ctx.moveTo(p.left, centerY);
      ctx.lineTo(p.right, centerY);
      ctx.stroke();

      // Center Circle & Spot
      const centerCircleR = p.width * 0.18;
      ctx.beginPath();
      ctx.arc(w / 2, centerY, centerCircleR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w / 2, centerY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Penalty Box & Arc - TOP (Computer)
      const penBoxW = p.width * 0.52;
      const penBoxH = p.height * 0.16;
      const penBoxLeft = (w - penBoxW) / 2;
      ctx.strokeRect(penBoxLeft, p.top, penBoxW, penBoxH);

      // Penalty Box & Arc - BOTTOM (Player)
      const botPenBoxTop = p.bottom - penBoxH;
      ctx.strokeRect(penBoxLeft, botPenBoxTop, penBoxW, penBoxH);

      // 3. Kick Interaction Zone Indicator on Turf
      const zoneTop = s.player.y - 100;
      const zoneHeight = 124;
      const isBallInStrikeZone =
        s.ball.active &&
        s.ball.vy > 0 &&
        s.ball.y >= zoneTop &&
        s.ball.y <= s.player.y + 24;

      ctx.fillStyle = isBallInStrikeZone
        ? 'rgba(56, 189, 248, 0.18)'
        : 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(p.left + 4, zoneTop, p.width - 8, zoneHeight);
      ctx.strokeStyle = isBallInStrikeZone
        ? 'rgba(56, 189, 248, 0.85)'
        : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = isBallInStrikeZone ? 2 : 1;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(p.left + 4, zoneTop, p.width - 8, zoneHeight);
      ctx.setLineDash([]);

      // Sweet Spot Apex Guideline (Target line for PERFECT strike timing)
      const apexY = s.player.y - 40;
      ctx.strokeStyle = isBallInStrikeZone
        ? 'rgba(251, 191, 36, 0.7)'
        : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(p.left + 8, apexY);
      ctx.lineTo(p.right - 8, apexY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Visual helper text on turf
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isBallInStrikeZone ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)';
      ctx.textAlign = 'right';
      ctx.fillText('STRIKE ZONE', p.right - 8, zoneTop + 14);

      // 4. Goal Nets
      const goalPostW = p.width * 0.38;
      const goalPostLeft = (w - goalPostW) / 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(goalPostLeft, p.top - 12, goalPostW, 12);
      ctx.strokeRect(goalPostLeft, p.top - 12, goalPostW, 12);
      ctx.fillRect(goalPostLeft, p.bottom, goalPostW, 12);
      ctx.strokeRect(goalPostLeft, p.bottom, goalPostW, 12);

      // 5. Draw OPPONENT PADDLE (Top)
      drawTeamPaddle(
        ctx,
        s.opponent.x,
        s.opponent.y,
        s.opponent.width,
        s.opponent.height,
        opponentTeam,
        true,
        false
      );

      // 6. Draw PLAYER PADDLE (Bottom with kick animation offset)
      const kickVisualY = s.player.y - (s.player.kickAnim > 0 ? 6 : 0);
      drawTeamPaddle(
        ctx,
        s.player.x,
        kickVisualY,
        s.player.width,
        s.player.height,
        playerTeam,
        false,
        s.player.kickAnim > 0
      );

      // 7. Render Ball Trail
      if (s.ball.trail.length > 1) {
        for (let i = 0; i < s.ball.trail.length; i++) {
          const t = s.ball.trail[i];
          const trAlpha = (i / s.ball.trail.length) * 0.35;
          const trRadius = s.ball.radius * (0.4 + (i / s.ball.trail.length) * 0.6);
          ctx.fillStyle = s.ball.isPowerShot
            ? `rgba(239, 68, 68, ${trAlpha})`
            : `rgba(255, 255, 255, ${trAlpha})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, trRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 8. Render Soccer Ball
      if (s.ball.active) {
        // Shadow on turf
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(
          s.ball.x + 3,
          s.ball.y + 6,
          s.ball.radius * 1.05,
          s.ball.radius * 0.7,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // 3D Leather sphere
        ctx.save();
        ctx.translate(s.ball.x, s.ball.y);
        ctx.rotate(s.ball.rotation);

        const ballGrad = ctx.createRadialGradient(
          -s.ball.radius * 0.3,
          -s.ball.radius * 0.3,
          1,
          0,
          0,
          s.ball.radius
        );
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.8, '#e2e8f0');
        ballGrad.addColorStop(1, '#94a3b8');

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(0, 0, s.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pentagonal leather patches
        ctx.fillStyle = '#1e293b';
        drawPentagon(ctx, 0, 0, s.ball.radius * 0.42);
        for (let a = 0; a < 5; a++) {
          const angle = (a * 72 * Math.PI) / 180;
          const px = Math.cos(angle) * (s.ball.radius * 0.72);
          const py = Math.sin(angle) * (s.ball.radius * 0.72);
          drawPentagon(ctx, px, py, s.ball.radius * 0.28);
        }

        if (s.ball.isPowerShot) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        ctx.restore();
      }

      // 9. Particles
      for (const pt of s.particles) {
        const pAlpha = 1 - pt.life / pt.maxLife;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pAlpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 10. Celebration / Concession Banner
      if (s.goalAnim > 0) {
        ctx.save();
        const bannerH = 52;
        ctx.fillStyle = s.goalText.includes('YOU')
          ? 'rgba(16, 185, 129, 0.94)'
          : 'rgba(239, 68, 68, 0.94)';
        ctx.fillRect(0, centerY - bannerH / 2, w, bannerH);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.goalText, w / 2, centerY);
        ctx.restore();
      }
    };

    // Helper: Draw team paddle with crest / flag badge
    const drawTeamPaddle = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      team: SoccerTeam,
      isTop: boolean,
      isKicking = false
    ) => {
      const radius = 8;
      const left = x - width / 2;
      const top = y - height / 2;

      // Drop shadow
      c.fillStyle = 'rgba(0, 0, 0, 0.45)';
      c.beginPath();
      c.roundRect(left + 2, top + 4, width, height, radius);
      c.fill();

      // Main kit body
      c.fillStyle = team.primaryColor;
      c.beginPath();
      c.roundRect(left, top, width, height, radius);
      c.fill();

      // Kit Patterns
      c.save();
      c.clip();
      if (team.pattern === 'stripes') {
        c.fillStyle = team.secondaryColor;
        const stripeW = width / 5;
        for (let i = 0; i < 5; i += 2) {
          c.fillRect(left + i * stripeW, top, stripeW, height);
        }
      } else if (team.pattern === 'sash') {
        c.fillStyle = team.secondaryColor;
        c.fillRect(left + width * 0.35, top, width * 0.3, height);
      } else if (team.pattern === 'halves') {
        c.fillStyle = team.secondaryColor;
        c.fillRect(left + width / 2, top, width / 2, height);
      }
      c.restore();

      // Platform Border
      c.strokeStyle = isKicking ? '#fbbf24' : 'rgba(255, 255, 255, 0.75)';
      c.lineWidth = isKicking ? 3 : 1.5;
      c.beginPath();
      c.roundRect(left, top, width, height, radius);
      c.stroke();

      // Flag / Crest Badge + Striker Number
      c.fillStyle = team.textColor || '#ffffff';
      c.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const badgeIcon = team.flagEmoji || team.crestSymbol || '⚽';
      c.fillText(`${badgeIcon} #${team.striker.number}`, x, y);
    };

    const drawPentagon = (c: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 18) * (Math.PI / 180);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.fill();
    };

    const tick = (time: number) => {
      const dt = Math.min((time - stateRef.current.lastTime) / 1000, 0.05);
      stateRef.current.lastTime = time;

      update(dt);
      render();

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [
    levelConfig,
    isRunning,
    onComputerHit,
    onPlayerMiss,
    onComputerMiss,
    onRallyIncrement,
    playerTeam,
    opponentTeam,
    serveBall,
    isMovingLeft,
    isMovingRight,
    performPlayerKick,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none cursor-ew-resize"
    >
      <canvas ref={canvasRef} className="block w-full h-full max-w-md mx-auto" />
    </div>
  );
};
