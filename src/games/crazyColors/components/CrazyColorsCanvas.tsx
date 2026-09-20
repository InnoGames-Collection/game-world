/**
 * Crazy Colors High-Performance HTML5 Canvas Gameplay Engine
 * 60 FPS requestAnimationFrame loop, precise segment collision, camera lerp, particle physics.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { CrazyColor, LevelDefinition, ObstacleInstance, ColorSwitcherInstance, StarCollectible, Particle, LevelScoreBreakdown } from '../types';
import { CRAZY_COLORS_PALETTE, COLOR_KEYS, GAME_PHYSICS } from '../constants';
import { createShapeSegments, checkObstacleCollision, getShapeDifficultyBonus } from '../shapes';
import { crazyColorsAudio } from '../audioEngine';

interface FloatingScoreText {
  x: number;
  y: number;
  text: string;
  subtext?: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface CrazyColorsCanvasProps {
  level: LevelDefinition;
  onScoreChange: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onLevelComplete: (finalScore: number, breakdown: LevelScoreBreakdown) => void;
  isPaused: boolean;
}

export const CrazyColorsCanvas: React.FC<CrazyColorsCanvasProps> = ({
  level,
  onScoreChange,
  onGameOver,
  onLevelComplete,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mutable game simulation state
  const gameStateRef = useRef({
    score: 0,
    levelScore: 0,
    streak: 0,
    totalPassesMade: 0,
    accuracyMistakes: 0,
    obstacleStartTime: performance.now(),
    ballX: GAME_PHYSICS.VIRTUAL_WIDTH / 2,
    ballY: 540,
    ballVy: 0,
    ballColor: level.startColor,
    cameraY: 200,
    hasStarted: false,
    isDead: false,
    isComplete: false,
    obstacles: [] as ObstacleInstance[],
    switchers: [] as ColorSwitcherInstance[],
    stars: [] as StarCollectible[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingScoreText[],
    finishY: 0,
    lastFrameTime: performance.now(),
  });

  // Initialize level track
  const initializeLevel = useCallback(() => {
    const s = gameStateRef.current;
    s.score = 0;
    s.levelScore = 0;
    s.streak = 0;
    s.totalPassesMade = 0;
    s.accuracyMistakes = 0;
    s.obstacleStartTime = performance.now();
    s.ballX = GAME_PHYSICS.VIRTUAL_WIDTH / 2;
    s.ballY = 540;
    s.ballVy = 0;
    s.ballColor = level.startColor;
    s.cameraY = 160;
    s.hasStarted = false;
    s.isDead = false;
    s.isComplete = false;
    s.particles = [];
    s.floatingTexts = [];
    s.obstacles = [];
    s.switchers = [];
    s.stars = [];

    let currentY = 540 - 240; // first obstacle at y = 300
    level.obstacles.forEach((obsDef, index) => {
      const obstacleY = currentY;
      const segments = createShapeSegments(obsDef.shapeType, obsDef.scale || 1.0);

      s.obstacles.push({
        id: `obs-${index}`,
        y: obstacleY,
        shapeType: obsDef.shapeType,
        rotation: (index * Math.PI) / 4,
        rotationSpeed: obsDef.rotationSpeed,
        scale: obsDef.scale || 1.0,
        segments,
        passed: false,
        oscillationX: obsDef.oscillationX
          ? {
              amplitude: obsDef.oscillationX.amplitude,
              speed: obsDef.oscillationX.speed,
              offset: index * 1.5,
            }
          : undefined,
      });

      // Star collectible in the center of the obstacle
      s.stars.push({
        id: `star-${index}`,
        y: obstacleY,
        collected: false,
      });

      // Color switcher between obstacles
      if (index < level.obstacles.length - 1) {
        s.switchers.push({
          id: `switcher-${index}`,
          y: obstacleY - 170,
          rotation: 0,
          collected: false,
        });
      }

      currentY -= GAME_PHYSICS.OBSTACLE_SPACING;
    });

    // Finish portal position
    s.finishY = currentY + 120;
    onScoreChange(0);
  }, [level, onScoreChange]);

  // Jump action triggered by tap/click/space
  const handleJump = useCallback(() => {
    const s = gameStateRef.current;
    if (s.isDead || s.isComplete || isPaused) return;

    if (!s.hasStarted) {
      s.hasStarted = true;
      s.obstacleStartTime = performance.now();
    }

    s.ballVy = GAME_PHYSICS.JUMP_IMPULSE;
    crazyColorsAudio.playTapJump();

    // Spawn tiny jump puff particles
    const ballHex = CRAZY_COLORS_PALETTE[s.ballColor].hex;
    for (let i = 0; i < 6; i++) {
      s.particles.push({
        x: s.ballX + (Math.random() - 0.5) * 10,
        y: s.ballY + GAME_PHYSICS.BALL_RADIUS,
        vx: (Math.random() - 0.5) * 50,
        vy: 20 + Math.random() * 50,
        color: ballHex,
        radius: 2 + Math.random() * 2,
        alpha: 0.8,
        life: 0,
        maxLife: 0.25,
      });
    }
  }, [isPaused]);

  // Reset or init on level change
  useEffect(() => {
    initializeLevel();
  }, [initializeLevel]);

  // Main animation and physics loop
  useEffect(() => {
    let animId: number;

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const s = gameStateRef.current;
      let dt = (now - s.lastFrameTime) / 1000;
      s.lastFrameTime = now;

      // Cap delta time to prevent physics tunneling during frame drops
      if (dt > 0.05) dt = 0.05;

      // -------------------------------------------------------------
      // 1. PHYSICS UPDATE (IF NOT PAUSED)
      // -------------------------------------------------------------
      if (!isPaused && !s.isDead && !s.isComplete) {
        // Rotate obstacles
        const timeSec = now / 1000;
        s.obstacles.forEach((obs) => {
          obs.rotation += obs.rotationSpeed * dt;
        });

        // Rotate switchers
        s.switchers.forEach((sw) => {
          sw.rotation += 2.2 * dt;
        });

        // Ball gravity and motion if active
        if (s.hasStarted) {
          s.ballVy += GAME_PHYSICS.GRAVITY * dt;
          if (s.ballVy > GAME_PHYSICS.MAX_FALL_SPEED) {
            s.ballVy = GAME_PHYSICS.MAX_FALL_SPEED;
          }
          s.ballY += s.ballVy * dt;

          // Camera smoothly tracks upward as ball climbs
          const targetCameraY = s.ballY - 380;
          if (targetCameraY < s.cameraY) {
            s.cameraY += (targetCameraY - s.cameraY) * 0.12;
          }

          // Check if ball fell below screen bottom
          if (s.ballY > s.cameraY + GAME_PHYSICS.VIRTUAL_HEIGHT + 30) {
            s.isDead = true;
            crazyColorsAudio.playGameOver();
            onGameOver(s.score);
          }

          // Check collisions with obstacles
          s.obstacles.forEach((obs) => {
            let obsCenterX = GAME_PHYSICS.VIRTUAL_WIDTH / 2;
            if (obs.oscillationX) {
              obsCenterX +=
                obs.oscillationX.amplitude *
                Math.sin(timeSec * obs.oscillationX.speed + obs.oscillationX.offset);
            }

            // Only evaluate collision if ball is vertically within bounding range
            if (Math.abs(s.ballY - obs.y) < 130 * obs.scale) {
              const result = checkObstacleCollision(
                s.ballX,
                s.ballY,
                GAME_PHYSICS.BALL_RADIUS,
                s.ballColor,
                obsCenterX,
                obs.y,
                obs.rotation,
                obs.segments
              );

              if (result === 'mismatch' && !s.isDead) {
                // Fatal collision! Ball shatters
                s.isDead = true;
                crazyColorsAudio.playShatter();

                // Explode ball into 32 neon particle shards
                const ballHex = CRAZY_COLORS_PALETTE[s.ballColor].hex;
                for (let i = 0; i < 36; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 70 + Math.random() * 240;
                  s.particles.push({
                    x: s.ballX,
                    y: s.ballY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)] === s.ballColor ? ballHex : '#FFFFFF',
                    radius: 2 + Math.random() * 4,
                    alpha: 1.0,
                    life: 0,
                    maxLife: 0.6 + Math.random() * 0.4,
                  });
                }

                setTimeout(() => {
                  onGameOver(s.score);
                }, 700);
              }
            }

            // Pass score check
            if (!obs.passed && s.ballY < obs.y - 80 * obs.scale) {
              obs.passed = true;
              s.totalPassesMade += 1;
              s.streak += 1;

              // 1. Calculate Speed Bonus based on elapsed seconds since approach/previous obstacle
              const elapsedSec = (now - s.obstacleStartTime) / 1000;
              let speedBonus = 1;
              if (elapsedSec <= 1.8) {
                speedBonus = 10;
              } else if (elapsedSec <= 2.8) {
                speedBonus = 7;
              } else if (elapsedSec <= 4.2) {
                speedBonus = 4;
              } else {
                speedBonus = 1;
              }

              // 2. Streak Bonus:
              // Consecutive passes: 1st: +0, 2nd: +2, 3rd: +4, 4th: +6, 5th: +8, 6th: +10, 7+: +12
              const streakBonus = Math.min(12, Math.max(0, (s.streak - 1) * 2));

              // 3. Shape Difficulty Bonus:
              const shapeBonus = getShapeDifficultyBonus(obs.shapeType);

              // 4. Level Difficulty Multiplier:
              // Level 1 = 1.00x, Level 2 = 1.05x, Level 3 = 1.10x ... Level 40 = 2.95x
              const levelMultiplier = 1.0 + (level.id - 1) * 0.05;

              // 5. Total Pass Score Formula:
              // (10 + SpeedBonus + StreakBonus + DifficultyBonus) * LevelMultiplier
              const passScore = Math.round(
                (10 + speedBonus + streakBonus + shapeBonus) * levelMultiplier
              );

              s.levelScore += passScore;
              s.score = s.levelScore;
              onScoreChange(s.score);
              crazyColorsAudio.playPassObstacle();

              // Reset approach timer for next obstacle
              s.obstacleStartTime = now;

              // Floating score badge
              let subtext = '';
              if (streakBonus > 0) {
                subtext = `STREAK x${s.streak} (+${streakBonus})`;
              } else if (speedBonus >= 7) {
                subtext = `FAST +${speedBonus}`;
              }

              s.floatingTexts.push({
                x: obsCenterX,
                y: obs.y - 25,
                text: `+${passScore}`,
                subtext,
                color: '#FFD800',
                alpha: 1.0,
                life: 0,
                maxLife: 0.9,
              });

              // Spawn passing score confetti
              for (let i = 0; i < 16; i++) {
                const angle = Math.random() * Math.PI * 2;
                s.particles.push({
                  x: obsCenterX + (Math.random() - 0.5) * 60,
                  y: obs.y,
                  vx: Math.cos(angle) * 85,
                  vy: Math.sin(angle) * 85,
                  color: CRAZY_COLORS_PALETTE[s.ballColor].hex,
                  radius: 2.5,
                  alpha: 0.9,
                  life: 0,
                  maxLife: 0.4,
                });
              }
            }
          });

          // Check star pickups
          s.stars.forEach((star) => {
            if (!star.collected) {
              const dist = Math.hypot(s.ballX - GAME_PHYSICS.VIRTUAL_WIDTH / 2, s.ballY - star.y);
              if (dist < 26) {
                star.collected = true;
                const starPoints = Math.round(15 * (1.0 + (level.id - 1) * 0.05));
                s.levelScore += starPoints;
                s.score = s.levelScore;
                onScoreChange(s.score);
                crazyColorsAudio.playStarCollect();

                s.floatingTexts.push({
                  x: GAME_PHYSICS.VIRTUAL_WIDTH / 2,
                  y: star.y - 15,
                  text: `+${starPoints}`,
                  subtext: 'STAR',
                  color: '#FFD800',
                  alpha: 1.0,
                  life: 0,
                  maxLife: 0.7,
                });

                for (let i = 0; i < 16; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 40 + Math.random() * 120;
                  s.particles.push({
                    x: s.ballX,
                    y: star.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: '#FFD800',
                    radius: 2.5,
                    alpha: 1.0,
                    life: 0,
                    maxLife: 0.45,
                  });
                }
              }
            }
          });

          // Check color switchers
          s.switchers.forEach((sw) => {
            if (!sw.collected) {
              const dist = Math.hypot(s.ballX - GAME_PHYSICS.VIRTUAL_WIDTH / 2, s.ballY - sw.y);
              if (dist < 26) {
                sw.collected = true;
                // Switch to a different color
                const remainingColors = COLOR_KEYS.filter((c) => c !== s.ballColor);
                s.ballColor = remainingColors[Math.floor(Math.random() * remainingColors.length)];
                crazyColorsAudio.playColorSwitch();

                // Color switch shockwave particles
                const newHex = CRAZY_COLORS_PALETTE[s.ballColor].hex;
                for (let i = 0; i < 20; i++) {
                  const angle = (i / 20) * Math.PI * 2;
                  s.particles.push({
                    x: s.ballX,
                    y: sw.y,
                    vx: Math.cos(angle) * 110,
                    vy: Math.sin(angle) * 110,
                    color: newHex,
                    radius: 3,
                    alpha: 1.0,
                    life: 0,
                    maxLife: 0.4,
                  });
                }
              }
            }
          });

          // Check Level Complete Goal
          if (!s.isComplete && s.ballY <= s.finishY) {
            s.isComplete = true;
            crazyColorsAudio.playLevelComplete();

            // Calculate Accuracy & Level Multiplier
            const levelMultiplier = 1.0 + (level.id - 1) * 0.05;
            let accuracyPercent = 100;
            if (s.accuracyMistakes > 4) {
              accuracyPercent = 75;
            } else if (s.accuracyMistakes > 2) {
              accuracyPercent = 85;
            } else if (s.accuracyMistakes > 0) {
              accuracyPercent = 94;
            } else {
              accuracyPercent = 100;
            }

            let accuracyBonus = 0;
            if (accuracyPercent >= 100) {
              accuracyBonus = Math.round(100 * levelMultiplier);
            } else if (accuracyPercent >= 90) {
              accuracyBonus = Math.round(50 * levelMultiplier);
            } else if (accuracyPercent >= 80) {
              accuracyBonus = Math.round(25 * levelMultiplier);
            }

            s.levelScore += accuracyBonus;
            s.score = s.levelScore;
            onScoreChange(s.score);

            if (accuracyBonus > 0) {
              s.floatingTexts.push({
                x: GAME_PHYSICS.VIRTUAL_WIDTH / 2,
                y: s.finishY - 20,
                text: `+${accuracyBonus}`,
                subtext: accuracyPercent >= 100 ? 'PERFECT ACCURACY!' : 'ACCURACY BONUS',
                color: '#00D9FF',
                alpha: 1.0,
                life: 0,
                maxLife: 1.2,
              });
            }

            // Fireworks burst
            for (let i = 0; i < 48; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 90 + Math.random() * 220;
              s.particles.push({
                x: GAME_PHYSICS.VIRTUAL_WIDTH / 2,
                y: s.finishY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: COLOR_KEYS[i % 4] ? CRAZY_COLORS_PALETTE[COLOR_KEYS[i % 4]].hex : '#FFFFFF',
                radius: 3.5,
                alpha: 1.0,
                life: 0,
                maxLife: 0.9,
              });
            }

            const breakdown: LevelScoreBreakdown = {
              basePoints: s.totalPassesMade * 10,
              speedBonus: 0,
              streakBonus: 0,
              shapeBonus: 0,
              accuracyBonus,
              levelMultiplier,
              accuracyPercent,
              passesCompleted: s.totalPassesMade,
              finalLevelScore: s.score,
            };

            setTimeout(() => {
              onLevelComplete(s.score, breakdown);
            }, 800);
          }
        }
      }

      // Update floating texts
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.life += dt;
        ft.y -= 25 * dt;
        ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
        if (ft.life >= ft.maxLife) {
          s.floatingTexts.splice(i, 1);
        }
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          s.particles.splice(i, 1);
        }
      }

      // -------------------------------------------------------------
      // 2. CANVAS DRAWING
      // -------------------------------------------------------------
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Coordinate scaling: fit VIRTUAL_WIDTH (390) and VIRTUAL_HEIGHT (700) to actual canvas rect
      const scaleX = rect.width / GAME_PHYSICS.VIRTUAL_WIDTH;
      const scaleY = rect.height / GAME_PHYSICS.VIRTUAL_HEIGHT;
      // Uniform aspect scale to prevent geometric distortion
      const scale = Math.min(scaleX, scaleY);
      const offsetX = (rect.width - GAME_PHYSICS.VIRTUAL_WIDTH * scale) / 2;
      const offsetY = (rect.height - GAME_PHYSICS.VIRTUAL_HEIGHT * scale) / 2;

      // Dark background with subtle radial glow
      ctx.fillStyle = '#2B2B2B';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Radial background vignette
      const bgGrad = ctx.createRadialGradient(
        rect.width / 2,
        rect.height / 2,
        40,
        rect.width / 2,
        rect.height / 2,
        rect.width * 0.7
      );
      bgGrad.addColorStop(0, '#363636');
      bgGrad.addColorStop(1, '#1e1e1e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Clip to virtual play bounds
      ctx.beginPath();
      ctx.rect(0, 0, GAME_PHYSICS.VIRTUAL_WIDTH, GAME_PHYSICS.VIRTUAL_HEIGHT);
      ctx.clip();

      // Camera view transformation
      ctx.save();
      ctx.translate(0, -s.cameraY);

      // ----------------- DRAW OBSTACLES -----------------
      s.obstacles.forEach((obs) => {
        let obsCenterX = GAME_PHYSICS.VIRTUAL_WIDTH / 2;
        if (obs.oscillationX) {
          obsCenterX +=
            obs.oscillationX.amplitude *
            Math.sin((now / 1000) * obs.oscillationX.speed + obs.oscillationX.offset);
        }

        ctx.save();
        ctx.translate(obsCenterX, obs.y);
        ctx.rotate(obs.rotation);

        obs.segments.forEach((seg) => {
          const colorMeta = CRAZY_COLORS_PALETTE[seg.color];
          ctx.strokeStyle = colorMeta.hex;
          ctx.lineWidth = GAME_PHYSICS.SEGMENT_THICKNESS;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 12;
          ctx.shadowColor = colorMeta.glow;

          ctx.beginPath();
          if (seg.type === 'line' && seg.x1 !== undefined && seg.y1 !== undefined && seg.x2 !== undefined && seg.y2 !== undefined) {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
          } else if (seg.type === 'arc' && seg.radius !== undefined && seg.startAngle !== undefined && seg.endAngle !== undefined) {
            ctx.arc(0, 0, seg.radius, seg.startAngle, seg.endAngle);
          }
          ctx.stroke();
        });

        ctx.restore();
      });

      // ----------------- DRAW STARS -----------------
      s.stars.forEach((star) => {
        if (!star.collected) {
          ctx.save();
          ctx.translate(GAME_PHYSICS.VIRTUAL_WIDTH / 2, star.y);
          ctx.rotate((now / 1000) * 1.5);
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#FFD800';

          // 5-point star
          ctx.fillStyle = '#FFD800';
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const a2 = ((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2;
            if (i === 0) {
              ctx.moveTo(11 * Math.cos(a1), 11 * Math.sin(a1));
            } else {
              ctx.lineTo(11 * Math.cos(a1), 11 * Math.sin(a1));
            }
            ctx.lineTo(5 * Math.cos(a2), 5 * Math.sin(a2));
          }
          ctx.closePath();
          ctx.fill();

          // Star inner highlight
          ctx.fillStyle = '#FFF8C4';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // ----------------- DRAW COLOR SWITCHERS -----------------
      s.switchers.forEach((sw) => {
        if (!sw.collected) {
          ctx.save();
          ctx.translate(GAME_PHYSICS.VIRTUAL_WIDTH / 2, sw.y);
          ctx.rotate(sw.rotation);

          const r = 14;
          const colors = [
            CRAZY_COLORS_PALETTE.pink.hex,
            CRAZY_COLORS_PALETTE.cyan.hex,
            CRAZY_COLORS_PALETTE.yellow.hex,
            CRAZY_COLORS_PALETTE.purple.hex,
          ];

          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors[i];
            ctx.fill();
          }

          // Center white dot
          ctx.beginPath();
          ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#FFFFFF';
          ctx.fill();

          ctx.restore();
        }
      });

      // ----------------- DRAW FINISH PORTAL -----------------
      if (!s.isComplete) {
        ctx.save();
        ctx.translate(GAME_PHYSICS.VIRTUAL_WIDTH / 2, s.finishY);

        // Rotating outer ring with 4 colors
        ctx.rotate((now / 1000) * 1.8);
        const ringR = 30;
        const segAng = Math.PI / 2;
        COLOR_KEYS.forEach((colKey, i) => {
          ctx.strokeStyle = CRAZY_COLORS_PALETTE[colKey].hex;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 14;
          ctx.shadowColor = CRAZY_COLORS_PALETTE[colKey].glow;
          ctx.beginPath();
          ctx.arc(0, 0, ringR, i * segAng + 0.1, (i + 1) * segAng - 0.1);
          ctx.stroke();
        });

        // Center glowing star/trophy core
        ctx.fillStyle = '#FFD800';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FFD800';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ----------------- DRAW PARTICLES -----------------
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ----------------- DRAW BALL -----------------
      if (!s.isDead) {
        ctx.save();
        const ballColorMeta = CRAZY_COLORS_PALETTE[s.ballColor];
        const bx = s.ballX;
        const by = s.ballY;
        const br = GAME_PHYSICS.BALL_RADIUS;

        // Ball neon glow
        ctx.shadowBlur = 16;
        ctx.shadowColor = ballColorMeta.glow;

        // Base circular gradient
        const ballGrad = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, 1, bx, by, br);
        ballGrad.addColorStop(0, ballColorMeta.light);
        ballGrad.addColorStop(0.6, ballColorMeta.hex);
        ballGrad.addColorStop(1, ballColorMeta.dark);

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();

        // Specular 3D highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(bx - br * 0.3, by - br * 0.35, br * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ----------------- DRAW FLOATING SCORE BADGES -----------------
      s.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = ft.color;
        ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        if (ft.subtext) {
          ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#66E8FF';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00D9FF';
          ctx.fillText(ft.subtext, ft.x, ft.y + 15);
        }
        ctx.restore();
      });

      ctx.restore(); // end camera transformation

      // Tap to Jump guide overlay when at start
      if (!s.hasStarted && !s.isDead) {
        ctx.save();
        const pulse = 0.75 + Math.sin(now / 220) * 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.fillText('TAP OR CLICK TO JUMP', GAME_PHYSICS.VIRTUAL_WIDTH / 2, 600);
        ctx.restore();
      }

      ctx.restore(); // end canvas scaling
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPaused, onGameOver, onLevelComplete, onScoreChange]);

  // Keyboard Space listener for desktop play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  return (
    <div
      ref={containerRef}
      id="crazy-colors-gameplay-container"
      onPointerDown={(e) => {
        // Prevent default touch scrolling
        e.preventDefault();
        handleJump();
      }}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none touch-none overscroll-none"
    >
      <canvas
        ref={canvasRef}
        id="crazy-colors-canvas"
        className="w-full h-full max-w-md max-h-full block touch-none select-none"
      />
    </div>
  );
};
