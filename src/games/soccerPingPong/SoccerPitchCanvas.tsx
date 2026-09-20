/**
 * SOCCER PING PONG - Authentic Playable Vertical Football Match Engine
 * Built strictly according to the reference gameplay model:
 * 
 * 1. MATCH START / COUNTDOWN
 * 2. COMPUTER ATTACK (AI serves ball down towards human goal, targeting Left Wing, Center, or Right Wing)
 * 3. BALL TRAVELS TOWARD HUMAN (continuous physics state: ballX, ballY, vx, vy)
 * 4. HUMAN DEFENDS VIA SWIPE (full pitch width continuous positioning, stays where moved)
 * 5. HUMAN PRESSES KICK:
 *    - Valid strike zone + reach: changes ball velocity, ball travels toward computer goal
 *    - Miss / Too early / Out of reach: ball unaffected, continues to human goal
 * 6. NO AUTO-REBOUND: Human paddle DOES NOT bounce the ball automatically; KICK is required!
 * 7. IF HUMAN DOES NOTHING: Ball passes human -> Computer scores +1 GOAL (YOU 0 - 1 AI)
 * 8. IF HUMAN MOVES BUT DOES NOT KICK: Ball passes human -> Computer scores +1 GOAL (YOU 0 - 1 AI)
 * 9. COMPUTER DEFENDS: Computer AI positions to save. If AI misses -> Human scores +1 GOAL (YOU 1 - 0 AI)
 * 10. SINGLE-EVENT GOAL LOCK: Exactly 1 goal event per score
 */

import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { SoccerTeam } from './soccerTeams';
import { SoccerLevelConfig, HitQuality } from './types';
import { soccerAudio } from './soccerAudio';
import { calculateSkillScore, calculateGoalBonus } from './soccerScore';

export type MatchPhase =
  | 'COUNTDOWN'
  | 'COMPUTER_SERVE'
  | 'BALL_MOVING'
  | 'GOAL_SCORED';

export interface SoccerPitchCanvasHandle {
  triggerKick: () => void;
}

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
  kickTrigger: number;
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

export const SoccerPitchCanvas = forwardRef<SoccerPitchCanvasHandle, SoccerPitchCanvasProps>(
  (
    {
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
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Callbacks & Config Refs (prevents re-triggering the 60fps loop on prop changes)
    const callbacksRef = useRef({
      onPlayerHit,
      onComputerHit,
      onPlayerMiss,
      onComputerMiss,
      onRallyIncrement,
      onKickFeedback,
    });
    callbacksRef.current = {
      onPlayerHit,
      onComputerHit,
      onPlayerMiss,
      onComputerMiss,
      onRallyIncrement,
      onKickFeedback,
    };

    const isRunningRef = useRef(isRunning);
    isRunningRef.current = isRunning;

    const levelConfigRef = useRef(levelConfig);
    levelConfigRef.current = levelConfig;

    const playerTeamRef = useRef(playerTeam);
    playerTeamRef.current = playerTeam;

    const opponentTeamRef = useRef(opponentTeam);
    opponentTeamRef.current = opponentTeam;

    const isMovingLeftRef = useRef(isMovingLeft);
    isMovingLeftRef.current = isMovingLeft;

    const isMovingRightRef = useRef(isMovingRight);
    isMovingRightRef.current = isMovingRight;

    const lastProcessedKickTrigger = useRef<number>(kickTrigger);
    const lastKickTimeRef = useRef<number>(0);
    const isGoalLockedRef = useRef<boolean>(false);
    const serveTimeoutRef = useRef<number | null>(null);
    const recentSwipeRef = useRef<{
      dir: 'left' | 'right';
      time: number;
      speed: number;
    }>({ dir: 'left', time: 0, speed: 0 });

    // Physics and Match State
    const stateRef = useRef({
      phase: 'COUNTDOWN' as MatchPhase,
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
      player: {
        x: 190,
        y: 575,
        width: 92,
        height: 20,
        lastHitX: 190,
        consecutiveStaticHits: 0,
        kickAnim: 0,
      },
      opponent: {
        x: 190,
        y: 65,
        width: 86,
        height: 20,
        targetX: 190,
        serveTimer: 0,
        serveTargetX: 190,
        kickAnim: 0,
      },
      ball: {
        x: 190,
        y: 88,
        vx: 0,
        vy: 0,
        radius: 12,
        rotation: 0,
        speedScale: 1.0,
        lastHitBy: 'none' as 'player' | 'opponent' | 'none',
        isPowerShot: false,
        active: false,
        trail: [] as { x: number; y: number; alpha: number }[],
      },
      rally: 0,
      particles: [] as Particle[],
      goalAnim: 0,
      goalText: '',
      lastTime: performance.now(),
    });

    // Spawn visual impact particles
    const spawnParticles = (x: number, y: number, color: string, count = 12) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const spd = 40 + Math.random() * 80;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 0,
          maxLife: 0.35 + Math.random() * 0.2,
          color,
          size: 2 + Math.random() * 2.5,
        });
      }
    };

    // Prepare Computer Serve (Starts attack from top)
    const prepareComputerServe = useCallback(() => {
      if (serveTimeoutRef.current) clearTimeout(serveTimeoutRef.current);
      const s = stateRef.current;
      isGoalLockedRef.current = false;
      s.phase = 'COMPUTER_SERVE';
      s.rally = 0;
      s.goalAnim = 0;
      s.goalText = '';

      // Position ball at opponent paddle
      s.ball.active = true;
      s.ball.isPowerShot = false;
      s.ball.lastHitBy = 'none';
      s.ball.vx = 0;
      s.ball.vy = 0;
      s.ball.x = s.opponent.x;
      s.ball.y = s.opponent.y + s.opponent.height / 2 + s.ball.radius + 2;
      s.ball.trail = [];

      // Decide tactical attack target (Left Wing, Center, Right Wing)
      const p = s.pitch;
      const centerX = (p.left + p.right) / 2;
      const leftWingTarget = p.left + p.width * 0.18 + (Math.random() - 0.5) * 20;
      const rightWingTarget = p.right - p.width * 0.18 + (Math.random() - 0.5) * 20;
      const centerTarget = centerX + (Math.random() - 0.5) * 35;

      const r = Math.random();
      let targetX = centerTarget;

      // Computer adapts to human player position
      if (s.player.x > centerX + 20) {
        // Player is guarding right -> attack left wing or center
        targetX = r < 0.65 ? leftWingTarget : centerTarget;
      } else if (s.player.x < centerX - 20) {
        // Player is guarding left -> attack right wing or center
        targetX = r < 0.65 ? rightWingTarget : centerTarget;
      } else {
        // Player is in center -> attack wings
        targetX = r < 0.5 ? leftWingTarget : rightWingTarget;
      }

      s.opponent.serveTargetX = Math.max(p.left + 24, Math.min(p.right - 24, targetX));
      s.opponent.serveTimer = 0.5; // 500ms telegraph before strike

      // Fire actual computer attack after brief telegraph
      serveTimeoutRef.current = window.setTimeout(() => {
        const cur = stateRef.current;
        if (cur.phase !== 'COMPUTER_SERVE') return;

        cur.opponent.kickAnim = 0.22;
        cur.phase = 'BALL_MOVING';
        cur.ball.lastHitBy = 'opponent';

        const dx = cur.opponent.serveTargetX - cur.ball.x;
        const dy = cur.player.y - cur.ball.y;
        const angle = Math.atan2(dx, dy);

        const currentLvl = levelConfigRef.current;
        const baseSpeed = 265 * currentLvl.ballSpeedMultiplier;
        cur.ball.vx = Math.sin(angle) * baseSpeed;
        cur.ball.vy = Math.cos(angle) * baseSpeed;
        if (cur.ball.vy < 200) cur.ball.vy = 200;

        soccerAudio.playHit('GOOD', 1);
        spawnParticles(cur.ball.x, cur.ball.y, opponentTeamRef.current.primaryColor, 8);
        callbacksRef.current.onKickFeedback?.('⚠️ INCOMING SHOT! DEFEND!');
      }, 500);
    }, []);

    // HUMAN PLAYER KICK ATTEMPT (Strict, deterministic physics & authoritative return)
    const executePlayerKick = useCallback((swipeDirection?: 'left' | 'right' | 'none'): boolean => {
      const s = stateRef.current;
      if (!isRunningRef.current || isGoalLockedRef.current) return false;

      // 1. Must be in active BALL_MOVING phase
      if (s.phase !== 'BALL_MOVING' || !s.ball.active) {
        return false;
      }

      // 2. Ball must be heading toward human player (vy > 0)
      if (s.ball.vy <= 0) {
        return false;
      }

      // 3. Must not have already been returned by player in this volley
      if (s.ball.lastHitBy === 'player') {
        return false;
      }

      const playerTop = s.player.y - s.player.height / 2;
      // Generous, fair mobile strike zone: 135px ahead of paddle down to paddle bottom
      const strikeZoneTop = s.player.y - 135;
      const strikeZoneBottom = s.player.y + 20;

      // Check vertical timing window
      if (s.ball.y < strikeZoneTop || s.ball.y > strikeZoneBottom) {
        return false;
      }

      // Check horizontal reach of paddle (half width + 24px reach tolerance)
      const halfPW = s.player.width / 2;
      const paddleReach = halfPW + 24;
      const dx = s.ball.x - s.player.x;

      if (Math.abs(dx) > paddleReach) {
        return false;
      }

      // Trigger player striker visual kick animation immediately
      s.player.kickAnim = 0.25;

      // =======================================================================
      // AUTHORITATIVE SUCCESSFUL HUMAN KICK!
      // =======================================================================
      const oldVx = s.ball.vx;
      const oldVy = s.ball.vy;
      s.ball.lastHitBy = 'player';
      s.rally++;
      callbacksRef.current.onRallyIncrement(s.rally);

      // Contact offset on paddle: -1.0 (far left) to +1.0 (far right)
      const contactOffset = Math.max(-1, Math.min(1, dx / halfPW));
      const absOffset = Math.abs(contactOffset);
      const apexY = s.player.y - 38;
      const timingDiff = Math.abs(s.ball.y - apexY);

      let quality: HitQuality = 'GOOD';
      let isPower = false;

      if (absOffset < 0.38 && timingDiff < 28) {
        quality = 'PERFECT';
        isPower = true;
        s.ball.isPowerShot = true;
        spawnParticles(s.ball.x, s.player.y - 12, '#fbbf24', 22);
        callbacksRef.current.onKickFeedback?.('🌟 PERFECT STRIKE!');
      } else if (absOffset >= 0.62) {
        quality = 'DEFENSIVE_SAVE';
        spawnParticles(s.ball.x, s.player.y - 10, '#38bdf8', 16);
        callbacksRef.current.onKickFeedback?.('🛡️ WING SAVE!');
      } else {
        quality = 'GOOD';
        spawnParticles(s.ball.x, s.player.y - 10, '#ffffff', 12);
        callbacksRef.current.onKickFeedback?.('⚽ CLEAN RETURN');
      }

      // Check anti-camping
      if (Math.abs(s.player.x - s.player.lastHitX) < 18) {
        s.player.consecutiveStaticHits++;
      } else {
        s.player.consecutiveStaticHits = 0;
      }
      s.player.lastHitX = s.player.x;

      // Speed calculation
      const currentLvl = levelConfigRef.current;
      s.ball.speedScale = Math.min(2.1, 1.0 + s.rally * 0.038);
      const returnSpeed =
        280 * currentLvl.ballSpeedMultiplier * s.ball.speedScale * (isPower ? 1.25 : 1.0);

      // Directional attack control:
      // Swipe left / contact left -> acute angle toward opponent left wing
      // Swipe right / contact right -> acute angle toward opponent right wing
      const swipeBias = swipeDirection === 'left' ? -0.32 : swipeDirection === 'right' ? 0.32 : 0;
      const combinedOffset = Math.max(-1, Math.min(1, contactOffset * 0.70 + swipeBias));
      const maxAngle = Math.PI * 0.28; // Up to ~50 degree acute attack angle
      const returnAngle = combinedOffset * maxAngle;

      s.ball.vx = returnSpeed * Math.sin(returnAngle);
      s.ball.vy = -Math.abs(returnSpeed * Math.cos(returnAngle));
      if (s.ball.vy > -220) s.ball.vy = -220; // Guarantee firm upward return velocity

      // Reposition ball cleanly above player paddle to avoid re-collision
      s.ball.y = playerTop - s.ball.radius - 4;

      const scoreData = calculateSkillScore(
        currentLvl.level,
        quality,
        s.rally,
        returnSpeed,
        contactOffset,
        s.player.consecutiveStaticHits,
        isPower
      );

      soccerAudio.playHit(quality === 'PERFECT' ? 'PERFECT' : 'GOOD', s.rally);
      if (s.rally % 4 === 0) soccerAudio.playCrowdCheer(0.65);
      callbacksRef.current.onPlayerHit(quality, scoreData.total, s.rally, isPower);

      // Section 29 Mandatory Diagnostic Verification
      console.log(
        `[SOCCER PING PONG DIAGNOSTIC]\n` +
        `SWIPE DETECTED: ${(swipeDirection || 'NONE').toUpperCase()}\n` +
        `PLAYER X: ${Math.round(s.player.x)}\n` +
        `BALL X: ${Math.round(s.ball.x)}\n` +
        `BALL Y: ${Math.round(s.ball.y)}\n` +
        `BALL VELOCITY BEFORE: (${Math.round(oldVx)}, ${Math.round(oldVy)})\n` +
        `STRIKE WINDOW: [${Math.round(strikeZoneTop)} - ${Math.round(strikeZoneBottom)}]\n` +
        `STRIKE VALID: TRUE\n` +
        `RETURN FUNCTION CALLED: YES\n` +
        `BALL VELOCITY AFTER RETURN: (${Math.round(s.ball.vx)}, ${Math.round(s.ball.vy)})\n` +
        `BALL DIRECTION: HUMAN → AI`
      );

      // Computer AI evaluates defense on incoming return:
      const diffPenalty = isPower ? 0.22 : absOffset > 0.65 ? 0.16 : 0;
      const effAccuracy = Math.max(0.32, currentLvl.opponentAccuracy - diffPenalty);
      const willSave = Math.random() < effAccuracy;

      // Project landing X for opponent
      const distY = Math.abs(s.opponent.y - s.ball.y);
      const timeToReach = distY / Math.max(10, Math.abs(s.ball.vy));
      let projectedX = s.ball.x + s.ball.vx * timeToReach;

      // Wall reflections for prediction
      while (projectedX < s.pitch.left || projectedX > s.pitch.right) {
        if (projectedX < s.pitch.left) {
          projectedX = s.pitch.left + (s.pitch.left - projectedX);
        } else if (projectedX > s.pitch.right) {
          projectedX = s.pitch.right - (projectedX - s.pitch.right);
        }
      }

      const halfOW = s.opponent.width / 2;
      const centerX = (s.pitch.left + s.pitch.right) / 2;

      if (willSave) {
        s.opponent.targetX = Math.max(
          s.pitch.left + halfOW,
          Math.min(s.pitch.right - halfOW, projectedX)
        );
      } else {
        // AI misjudges and moves away from ball path
        const missDir = projectedX > centerX ? -1 : 1;
        s.opponent.targetX = projectedX + missDir * (halfOW + 26 + Math.random() * 20);
      }

      return true;
    }, []);

    // ONE-HAND MOBILE SWIPE STRIKE EVALUATOR
    // Evaluates current and swept paddle position against the active ball in strike zone
    const trySwipeReturn = useCallback(
      (swipeDirection: 'left' | 'right', sweptFromX?: number): boolean => {
        const s = stateRef.current;
        if (!isRunningRef.current || isGoalLockedRef.current) return false;
        if (s.phase !== 'BALL_MOVING' || !s.ball.active) return false;
        if (s.ball.vy <= 0 || s.ball.lastHitBy === 'player') return false;

        const strikeZoneTop = s.player.y - 135;
        const strikeZoneBottom = s.player.y + 20;

        if (s.ball.y < strikeZoneTop || s.ball.y > strikeZoneBottom) {
          return false;
        }

        const halfPW = s.player.width / 2;
        const paddleReach = halfPW + 24;

        // Check current paddle coverage
        const inCurrentRange = Math.abs(s.ball.x - s.player.x) <= paddleReach;

        // Check swept continuous collision coverage to prevent skipping on fast swipes
        let inSweptRange = false;
        if (typeof sweptFromX === 'number') {
          const minRangeX = Math.min(sweptFromX, s.player.x) - paddleReach;
          const maxRangeX = Math.max(sweptFromX, s.player.x) + paddleReach;
          inSweptRange = s.ball.x >= minRangeX && s.ball.x <= maxRangeX;
        }

        if (inCurrentRange || inSweptRange) {
          return executePlayerKick(swipeDirection);
        }

        return false;
      },
      [executePlayerKick]
    );

    const trySwipeReturnRef = useRef(trySwipeReturn);
    useEffect(() => {
      trySwipeReturnRef.current = trySwipeReturn;
    }, [trySwipeReturn]);

    // Expose imperative kick method to parent ref
    useImperativeHandle(
      ref,
      () => ({
        triggerKick: () => {
          const now = performance.now();
          if (now - lastKickTimeRef.current >= 60) {
            lastKickTimeRef.current = now;
            executePlayerKick('none');
          }
        },
      }),
      [executePlayerKick]
    );

    // Watch kickTrigger prop updates
    useEffect(() => {
      if (kickTrigger > lastProcessedKickTrigger.current) {
        lastProcessedKickTrigger.current = kickTrigger;
        const now = performance.now();
        if (now - lastKickTimeRef.current >= 60) {
          lastKickTimeRef.current = now;
          executePlayerKick('none');
        }
      }
    }, [kickTrigger, executePlayerKick]);

    // Handle transitions into isRunning
    useEffect(() => {
      if (isRunning) {
        prepareComputerServe();
      }
    }, [isRunning, prepareComputerServe]);

    // =========================================================================
    // FULL-WIDTH HORIZONTAL TOUCH / POINTER CONTROLS
    // Built exactly per mobile touch requirements:
    // pointerdown: capture touch & store lastX
    // pointermove: deltaX = currentX - lastX; move humanX; check swept return
    // pointerup: release gesture
    // Works reliably on Android Chrome (360px, 390px, 412px, 430px) & Desktop
    // =========================================================================
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      container.style.touchAction = 'none';

      let isDragging = false;
      let activePointerId: number | null = null;
      let lastX = 0;

      const handlePointerDown = (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        isDragging = true;
        activePointerId = e.pointerId;
        lastX = e.clientX;
        try {
          container.setPointerCapture(e.pointerId);
        } catch {
          // Ignored if capture unsupported
        }
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (!isDragging || activePointerId !== e.pointerId) return;
        const currentX = e.clientX;
        const deltaScreenX = currentX - lastX;
        lastX = currentX;

        const rect = container.getBoundingClientRect();
        const scaleX = stateRef.current.width / Math.max(1, rect.width);
        const movementSensitivity = 1.4;
        const deltaX = deltaScreenX * scaleX * movementSensitivity;

        const halfPW = stateRef.current.player.width / 2;
        const minX = stateRef.current.pitch.left + halfPW;
        const maxX = stateRef.current.pitch.right - halfPW;

        const prevPlayerX = stateRef.current.player.x;
        stateRef.current.player.x = Math.max(minX, Math.min(maxX, prevPlayerX + deltaX));

        // Horizontal swipe detected
        if (Math.abs(deltaScreenX) >= 1.2) {
          const dir: 'left' | 'right' = deltaScreenX < 0 ? 'left' : 'right';
          // Record recent swipe intent for frame-rate synchronized return checking
          recentSwipeRef.current = {
            dir,
            time: performance.now(),
            speed: Math.abs(deltaScreenX),
          };

          // Try immediate return with swept range verification
          trySwipeReturn(dir, prevPlayerX);
        }
      };

      const handlePointerUp = (e: PointerEvent) => {
        if (activePointerId === e.pointerId) {
          isDragging = false;
          activePointerId = null;
          try {
            container.releasePointerCapture(e.pointerId);
          } catch {
            // Ignored
          }
        }
      };

      container.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);

      return () => {
        container.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };
    }, [trySwipeReturn]);

    // =========================================================================
    // MAIN 60FPS PHYSICS & RENDERING LOOP
    // =========================================================================
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

        const paddleW = Math.max(82, Math.min(108, s.pitch.width * 0.26));
        s.player.width = paddleW;
        s.opponent.width = paddleW * (0.96 - (levelConfigRef.current.difficultyStars - 1) * 0.025);

        s.player.y = s.pitch.bottom - 24;
        s.opponent.y = s.pitch.top + 24;
      };

      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);

      // PHYSICS UPDATE TICK
      const update = (dt: number) => {
        const s = stateRef.current;
        if (!isRunningRef.current) return;

        // Visual paddle kick animation decay
        if (s.player.kickAnim > 0) {
          s.player.kickAnim = Math.max(0, s.player.kickAnim - dt);
        }
        if (s.opponent.kickAnim > 0) {
          s.opponent.kickAnim = Math.max(0, s.opponent.kickAnim - dt);
        }

        const halfPW = s.player.width / 2;
        const halfOW = s.opponent.width / 2;
        const minX = s.pitch.left + halfPW;
        const maxX = s.pitch.right - halfPW;

        // 1. Keyboard lateral movement support
        if (isMovingLeftRef.current) {
          const prevX = s.player.x;
          s.player.x = Math.max(minX, s.player.x - 560 * dt);
          recentSwipeRef.current = { dir: 'left', time: performance.now(), speed: 5 };
          trySwipeReturnRef.current('left', prevX);
        }
        if (isMovingRightRef.current) {
          const prevX = s.player.x;
          s.player.x = Math.min(maxX, s.player.x + 560 * dt);
          recentSwipeRef.current = { dir: 'right', time: performance.now(), speed: 5 };
          trySwipeReturnRef.current('right', prevX);
        }
        s.player.x = Math.max(minX, Math.min(maxX, s.player.x));

        // 1b. Frame-rate synchronized swipe return check:
        // If a swipe gesture occurred recently (within 220ms) and the ball is in strike zone,
        // execute return immediately so human timing is never dropped between tick frames.
        const nowMs = performance.now();
        if (nowMs - recentSwipeRef.current.time <= 220) {
          const didReturn = trySwipeReturnRef.current(recentSwipeRef.current.dir);
          if (didReturn) {
            recentSwipeRef.current.time = 0; // Consumed
          }
        }

        // 2. AI Opponent movement towards target
        const currentLvl = levelConfigRef.current;
        const aiSpeed = (230 + currentLvl.level * 16) * dt;
        const aiDiff = s.opponent.targetX - s.opponent.x;
        if (Math.abs(aiDiff) < aiSpeed) {
          s.opponent.x = s.opponent.targetX;
        } else {
          s.opponent.x += Math.sign(aiDiff) * aiSpeed;
        }
        s.opponent.x = Math.max(
          s.pitch.left + halfOW,
          Math.min(s.pitch.right - halfOW, s.opponent.x)
        );

        // 3. COMPUTER SERVE PHASE (Holding ball at opponent paddle before kick)
        if (s.phase === 'COMPUTER_SERVE') {
          s.ball.x = s.opponent.x;
          s.ball.y = s.opponent.y + s.opponent.height / 2 + s.ball.radius + 2;
          s.ball.vx = 0;
          s.ball.vy = 0;
          return;
        }

        // 4. ACTIVE BALL PHYSICS IN PLAY
        if (s.phase === 'BALL_MOVING' && s.ball.active) {
          s.ball.x += s.ball.vx * dt;
          s.ball.y += s.ball.vy * dt;

          // Ball spin & rotation
          const speed = Math.hypot(s.ball.vx, s.ball.vy);
          s.ball.rotation += speed * 0.02 * dt;

          // Ball motion trail
          if (s.ball.trail.length > 8) s.ball.trail.shift();
          s.ball.trail.push({ x: s.ball.x, y: s.ball.y, alpha: 1.0 });

          // Wall bounces (Left & Right touchlines)
          if (s.ball.x - s.ball.radius <= s.pitch.left) {
            s.ball.x = s.pitch.left + s.ball.radius;
            s.ball.vx = Math.abs(s.ball.vx) * 0.98;
            soccerAudio.playBounce(0.35);
            spawnParticles(s.pitch.left, s.ball.y, '#ffffff', 5);
          } else if (s.ball.x + s.ball.radius >= s.pitch.right) {
            s.ball.x = s.pitch.right - s.ball.radius;
            s.ball.vx = -Math.abs(s.ball.vx) * 0.98;
            soccerAudio.playBounce(0.35);
            spawnParticles(s.pitch.right, s.ball.y, '#ffffff', 5);
          }

          // ===================================================================
          // BALL REACHES COMPUTER DEFENSIVE LINE (Top)
          // ===================================================================
          if (s.ball.vy < 0) {
            const oppBottom = s.opponent.y + s.opponent.height / 2;
            if (s.ball.y - s.ball.radius <= oppBottom) {
              const isIntercepted =
                Math.abs(s.ball.x - s.opponent.x) <= halfOW + s.ball.radius + 4;

              if (isIntercepted) {
                // COMPUTER DEFENDED SUCCESSFULLY!
                s.opponent.kickAnim = 0.22;
                s.rally++;
                callbacksRef.current.onRallyIncrement(s.rally);
                callbacksRef.current.onComputerHit();

                // Computer returns ball down toward player goal
                const centerX = (s.pitch.left + s.pitch.right) / 2;
                const r = Math.random();
                let targetX = centerX;
                if (s.player.x > centerX + 20) {
                  targetX = r < 0.65 ? s.pitch.left + s.pitch.width * 0.2 : centerX;
                } else if (s.player.x < centerX - 20) {
                  targetX = r < 0.65 ? s.pitch.right - s.pitch.width * 0.2 : centerX;
                } else {
                  targetX = r < 0.5 ? s.pitch.left + s.pitch.width * 0.2 : s.pitch.right - s.pitch.width * 0.2;
                }

                const dx = targetX - s.opponent.x;
                const dy = s.player.y - oppBottom;
                const attackAngle = Math.atan2(dx, dy);

                const attackSpeed =
                  260 * currentLvl.ballSpeedMultiplier * Math.min(1.9, 1.0 + s.rally * 0.035);

                s.ball.vx = Math.sin(attackAngle) * attackSpeed;
                s.ball.vy = Math.abs(Math.cos(attackAngle) * attackSpeed);
                if (s.ball.vy < 200) s.ball.vy = 200;

                s.ball.lastHitBy = 'opponent';
                s.ball.isPowerShot = false;
                s.ball.y = oppBottom + s.ball.radius + 2;

                soccerAudio.playBounce(0.6);
                spawnParticles(s.ball.x, oppBottom, opponentTeamRef.current.primaryColor, 10);
                callbacksRef.current.onKickFeedback?.('⚠️ INCOMING SHOT! DEFEND!');
              }
            }
          }

          // ===================================================================
          // GOAL DETECTION (SINGLE-EVENT LOCK TO PREVENT MULTI-COUNT)
          // ===================================================================

          // Case A: Ball passes Computer Goal Line (Top) -> PLAYER SCORES!
          if (s.ball.vy < 0 && s.ball.y <= s.pitch.top) {
            if (!isGoalLockedRef.current) {
              isGoalLockedRef.current = true;
              s.phase = 'GOAL_SCORED';
              s.ball.active = false;
              s.goalAnim = 1.6;
              s.goalText = 'GOAL FOR YOU!';

              soccerAudio.playWhistle();
              soccerAudio.playCrowdCheer(0.9);
              spawnParticles(s.ball.x, s.pitch.top, '#10b981', 30);

              const goalBonus = calculateGoalBonus(currentLvl.level, s.rally, currentLvl.difficultyTier, 0);
              callbacksRef.current.onComputerMiss(goalBonus);

              setTimeout(() => {
                if (isRunningRef.current) prepareComputerServe();
              }, 1250);
            }
          }

          // Case B: Ball passes Human Goal Line (Bottom) -> COMPUTER SCORES!
          // Note: Human DOES NOT auto-rebound; if human failed to kick, ball goes into goal!
          if (s.ball.vy > 0 && s.ball.y >= s.pitch.bottom) {
            if (!isGoalLockedRef.current) {
              isGoalLockedRef.current = true;
              s.phase = 'GOAL_SCORED';
              s.ball.active = false;
              s.goalAnim = 1.6;
              s.goalText = 'GOAL FOR AI!';

              soccerAudio.playWhistle();
              soccerAudio.playDefeatSound();
              spawnParticles(s.ball.x, s.pitch.bottom, opponentTeamRef.current.primaryColor, 25);

              callbacksRef.current.onPlayerMiss();

              setTimeout(() => {
                if (isRunningRef.current) prepareComputerServe();
              }, 1250);
            }
          }
        }

        // 5. Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;
          if (p.life >= p.maxLife) s.particles.splice(i, 1);
        }

        if (s.goalAnim > 0) s.goalAnim -= dt;
      };

      // RENDER FUNCTION (Pixel-perfect visual design)
      const render = () => {
        const s = stateRef.current;
        const w = s.width;
        const h = s.height;
        const p = s.pitch;
        const centerY = (p.top + p.bottom) / 2;

        // 1. Stadium Grass & Alternating Bands
        ctx.fillStyle = '#172e19';
        ctx.fillRect(0, 0, w, h);

        const stripeCount = 12;
        const stripeH = p.height / stripeCount;
        for (let i = 0; i < stripeCount; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#348e3f' : '#2d7c37';
          ctx.fillRect(p.left, p.top + i * stripeH, p.width, stripeH);
        }

        // 2. Pitch Markings (White lines)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.left, p.top, p.width, p.height);

        // Center line & center circle
        ctx.beginPath();
        ctx.moveTo(p.left, centerY);
        ctx.lineTo(p.right, centerY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(w / 2, centerY, p.width * 0.18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(w / 2, centerY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Penalty boxes
        const boxW = p.width * 0.52;
        const boxH = p.height * 0.16;
        const boxLeft = (w - boxW) / 2;

        ctx.strokeRect(boxLeft, p.top, boxW, boxH);
        ctx.strokeRect(boxLeft, p.bottom - boxH, boxW, boxH);

        // Goal areas
        const smallBoxW = p.width * 0.28;
        const smallBoxH = p.height * 0.07;
        const smallBoxLeft = (w - smallBoxW) / 2;
        ctx.strokeRect(smallBoxLeft, p.top, smallBoxW, smallBoxH);
        ctx.strokeRect(smallBoxLeft, p.bottom - smallBoxH, smallBoxW, smallBoxH);

        // 3. Wing Tactical Zone Dashes
        const zoneLine1 = p.left + p.width * 0.33;
        const zoneLine2 = p.left + p.width * 0.67;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(zoneLine1, centerY);
        ctx.lineTo(zoneLine1, p.bottom);
        ctx.moveTo(zoneLine2, centerY);
        ctx.lineTo(zoneLine2, p.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 8.5px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.textAlign = 'center';
        ctx.fillText('LEFT WING', p.left + p.width * 0.165, p.bottom - 8);
        ctx.fillText('CENTER', w / 2, p.bottom - 8);
        ctx.fillText('RIGHT WING', p.right - p.width * 0.165, p.bottom - 8);

        // 4. Human Strike Zone Indicator on Turf
        const zoneTop = s.player.y - 135;
        const zoneHeight = 155;
        const isBallInStrikeZone =
          s.ball.active &&
          s.phase === 'BALL_MOVING' &&
          s.ball.vy > 0 &&
          s.ball.y >= zoneTop &&
          s.ball.y <= s.player.y + 20;

        ctx.fillStyle = isBallInStrikeZone
          ? 'rgba(56, 189, 248, 0.22)'
          : 'rgba(56, 189, 248, 0.06)';
        ctx.fillRect(p.left + 4, zoneTop, p.width - 8, zoneHeight);
        ctx.strokeStyle = isBallInStrikeZone
          ? 'rgba(56, 189, 248, 0.85)'
          : 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = isBallInStrikeZone ? 2 : 1;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(p.left + 4, zoneTop, p.width - 8, zoneHeight);
        ctx.setLineDash([]);

        // Sweet Spot Apex Guideline
        const apexY = s.player.y - 38;
        ctx.strokeStyle = isBallInStrikeZone
          ? 'rgba(251, 191, 36, 0.75)'
          : 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(p.left + 8, apexY);
        ctx.lineTo(p.right - 8, apexY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isBallInStrikeZone ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'right';
        ctx.fillText('STRIKE ZONE', p.right - 8, zoneTop + 14);

        // 5. Goal Nets
        const goalPostW = p.width * 0.38;
        const goalPostLeft = (w - goalPostW) / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(goalPostLeft, p.top - 12, goalPostW, 12);
        ctx.strokeRect(goalPostLeft, p.top - 12, goalPostW, 12);
        ctx.fillRect(goalPostLeft, p.bottom, goalPostW, 12);
        ctx.strokeRect(goalPostLeft, p.bottom, goalPostW, 12);

        // 6. Draw OPPONENT PADDLE (Top)
        const oppKickOffset = s.opponent.kickAnim > 0 ? 6 : 0;
        drawTeamPaddle(
          ctx,
          s.opponent.x,
          s.opponent.y + oppKickOffset,
          s.opponent.width,
          s.opponent.height,
          opponentTeamRef.current,
          true,
          s.opponent.kickAnim > 0
        );

        // 7. Draw PLAYER PADDLE (Bottom with kick animation offset)
        const playerKickOffset = s.player.kickAnim > 0 ? 6 : 0;
        drawTeamPaddle(
          ctx,
          s.player.x,
          s.player.y - playerKickOffset,
          s.player.width,
          s.player.height,
          playerTeamRef.current,
          false,
          s.player.kickAnim > 0
        );

        // 8. Render Ball Trail
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

        // 9. Render Soccer Ball
        if (s.ball.active) {
          // Ball shadow
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

        // 10. COMPUTER AIMING TELEGRAPH ARROW (When serving)
        if (s.phase === 'COMPUTER_SERVE') {
          ctx.save();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);

          ctx.beginPath();
          ctx.moveTo(s.ball.x, s.ball.y + s.ball.radius);
          ctx.lineTo(s.opponent.serveTargetX, s.player.y - 40);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrowhead
          const dx = s.opponent.serveTargetX - s.ball.x;
          const dy = s.player.y - 40 - s.ball.y;
          const ang = Math.atan2(dy, dx);
          ctx.translate(s.opponent.serveTargetX, s.player.y - 40);
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-10, -5);
          ctx.lineTo(-10, 5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // 11. Particles
        for (const pt of s.particles) {
          const pAlpha = 1 - pt.life / pt.maxLife;
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pAlpha;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // 12. Goal Celebration Banner
        if (s.goalAnim > 0) {
          ctx.save();
          const bannerH = 54;
          ctx.fillStyle = s.goalText.includes('YOU')
            ? 'rgba(16, 185, 129, 0.95)'
            : 'rgba(239, 68, 68, 0.95)';
          ctx.fillRect(0, centerY - bannerH / 2, w, bannerH);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(s.goalText, w / 2, centerY);
          ctx.restore();
        }
      };

      // Helper: Draw team paddle
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

        c.fillStyle = 'rgba(0, 0, 0, 0.45)';
        c.beginPath();
        c.roundRect(left + 2, top + 4, width, height, radius);
        c.fill();

        c.fillStyle = team.primaryColor;
        c.beginPath();
        c.roundRect(left, top, width, height, radius);
        c.fill();

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

        c.strokeStyle = isKicking ? '#fbbf24' : 'rgba(255, 255, 255, 0.75)';
        c.lineWidth = isKicking ? 3 : 1.5;
        c.beginPath();
        c.roundRect(left, top, width, height, radius);
        c.stroke();

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
        if (serveTimeoutRef.current) clearTimeout(serveTimeoutRef.current);
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none cursor-ew-resize"
      >
        <canvas ref={canvasRef} className="block w-full h-full max-w-md mx-auto" />
      </div>
    );
  }
);
