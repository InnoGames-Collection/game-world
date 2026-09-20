/**
 * Candy Blast - Cinematic Multi-Layer VFX Engine
 * 
 * Re-designed from scratch for authentic mobile game visual quality:
 * 1. Detonation Core & Radiant Starburst Flash (white-hot center + needle rays)
 * 2. Multi-Lobed Plasma Plumes (8-12 irregular organic energy bursts in varied directions)
 * 3. High-Speed Directional Spark Streaks with velocity trails
 * 4. 3D Faceted Physical Debris & Shards with simulated tumbling rotation & specular gleam
 * 5. Localized Candy Shatter Bursts (targeted crystal fragments & hit flashes per candy)
 * 6. Secondary Micro-Bursts (varied irregular secondary explosions at candy locations)
 * 7. Soft Atmospheric Dissipation Haze (no dominant circles or flat rings)
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { CandyType, Position } from './types';
import { BOARD_ROWS, BOARD_COLS } from './matchLogic';

export interface ExplosionCanvasHandle {
  triggerCreationGather: (pos: Position, color: string) => void;
  triggerBombAnticipation: (pos: Position, color?: string) => void;
  triggerBombExplosion: (pos: Position, radiusCells?: number, candyColor?: string, intensity?: number) => void;
  triggerLineBlast: (type: 'horizontal' | 'vertical', index: number, candyColor?: string) => void;
  triggerColorSupernova: (pos: Position, targetPositions?: Position[], color?: string) => void;
  triggerStaggeredImpact: (pos: Position, color: string, delayMs: number) => void;
  clear: () => void;
}

// Particle Categories
export type ParticleType = 
  | 'plasma_plume'    // Expanding organic energy lobe
  | 'spark_streak'    // High-speed needle spark with motion trail
  | 'shard_debris'    // 3D tumbling solid fragment with specular gleam
  | 'candy_crystal'   // Shattered crystal shard matching candy color
  | 'energy_ember'    // Floating glowing energy ember
  | 'suction_mote'    // Inward anticipation suction particle
  | 'haze_puff';      // Soft background dissipation cloud

export interface VFXParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  maxSize: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: ParticleType;
  angle: number;
  rotSpeed: number;
  drag: number;
  gravity: number;
  points?: { x: number; y: number }[]; // For faceted shards
  scaleX?: number; // 3D flip simulation
  targetX?: number;
  targetY?: number;
}

export interface DetonationFlash {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  life: number;
  maxLife: number;
  rays?: { angle: number; length: number; width: number; speed: number }[];
}

export interface SecondaryBurst {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const ExplosionCanvas = forwardRef<ExplosionCanvasHandle, { className?: string }>(
  ({ className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const particlesRef = useRef<VFXParticle[]>([]);
    const flashesRef = useRef<DetonationFlash[]>([]);
    const secondaryBurstsRef = useRef<SecondaryBurst[]>([]);
    const animFrameRef = useRef<number | null>(null);

    // Color conversion helper
    const toRgba = (color: string, alpha: number): string => {
      if (!color) return `rgba(255, 255, 255, ${Math.max(0, Math.min(1, alpha))})`;
      if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
          hex = hex.split('').map((c) => c + c).join('');
        }
        const r = parseInt(hex.slice(0, 2), 16) || 255;
        const g = parseInt(hex.slice(2, 4), 16) || 255;
        const b = parseInt(hex.slice(4, 6), 16) || 255;
        return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
      }
      if (color.startsWith('rgb')) {
        const parts = color.match(/\d+/g);
        if (parts && parts.length >= 3) {
          return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${Math.max(0, Math.min(1, alpha))})`;
        }
      }
      return `rgba(255, 215, 0, ${Math.max(0, Math.min(1, alpha))})`;
    };

    const getPixelCoords = (pos: Position) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, cellSize: 45 };
      const cellW = canvas.width / BOARD_COLS;
      const cellH = canvas.height / BOARD_ROWS;
      return {
        x: (pos.col + 0.5) * cellW,
        y: (pos.row + 0.5) * cellH,
        cellSize: (cellW + cellH) / 2,
      };
    };

    const startAnimationLoop = () => {
      if (animFrameRef.current !== null) return;

      const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          animFrameRef.current = null;
          return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          animFrameRef.current = null;
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let hasActiveElements = false;

        // =====================================================================
        // LAYER 1: BACKGROUND SOFT ATMOSPHERIC HAZE & SCORCH PUFFS
        // =====================================================================
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          if (p.type !== 'haze_puff') continue;

          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= p.drag;
          p.vy *= p.drag;
          p.size += (p.maxSize - p.size) * 0.08;
          p.alpha = Math.max(0, (1 - p.life / p.maxLife) * 0.45);

          if (p.alpha > 0.01 && p.life < p.maxLife) {
            hasActiveElements = true;
            ctx.save();
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grad.addColorStop(0, toRgba(p.color, p.alpha * 0.9));
            grad.addColorStop(0.5, toRgba(p.color, p.alpha * 0.4));
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            particlesRef.current.splice(i, 1);
          }
        }

        // =====================================================================
        // LAYER 2: DETONATION CORE FLASH & RADIANT NEEDLE RAYS
        // =====================================================================
        for (let i = flashesRef.current.length - 1; i >= 0; i--) {
          const fl = flashesRef.current[i];
          fl.life++;
          const progress = fl.life / fl.maxLife;
          fl.alpha = fl.maxAlpha * (1 - Math.pow(progress, 1.6));
          fl.size += (fl.maxSize - fl.size) * 0.22;

          if (fl.alpha > 0.01 && fl.life < fl.maxLife) {
            hasActiveElements = true;
            ctx.save();

            // Diamond / 4-Point Star Core Flash
            const halfS = fl.size * 0.5;
            const coreGrad = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, fl.size);
            coreGrad.addColorStop(0, '#FFFFFF');
            coreGrad.addColorStop(0.35, toRgba(fl.color, fl.alpha));
            coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.moveTo(fl.x, fl.y - fl.size * 1.2);
            ctx.quadraticCurveTo(fl.x + halfS * 0.2, fl.y - halfS * 0.2, fl.x + fl.size * 1.2, fl.y);
            ctx.quadraticCurveTo(fl.x + halfS * 0.2, fl.y + halfS * 0.2, fl.x, fl.y + fl.size * 1.2);
            ctx.quadraticCurveTo(fl.x - halfS * 0.2, fl.y + halfS * 0.2, fl.x - fl.size * 1.2, fl.y);
            ctx.quadraticCurveTo(fl.x - halfS * 0.2, fl.y - halfS * 0.2, fl.x, fl.y - fl.size * 1.2);
            ctx.closePath();
            ctx.fill();

            // Central White-Hot Singularity Flare
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = fl.alpha * 0.95;
            ctx.beginPath();
            ctx.arc(fl.x, fl.y, Math.max(2, fl.size * 0.22), 0, Math.PI * 2);
            ctx.fill();

            // Radiant Needle Rays shooting outward
            if (fl.rays) {
              fl.rays.forEach((ray) => {
                ray.length += ray.speed;
                ctx.save();
                ctx.translate(fl.x, fl.y);
                ctx.rotate(ray.angle);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(ray.length, 0);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = Math.max(1, ray.width * fl.alpha);
                ctx.globalAlpha = fl.alpha;
                ctx.lineCap = 'round';
                ctx.stroke();

                ctx.restore();
              });
            }

            ctx.restore();
          } else {
            flashesRef.current.splice(i, 1);
          }
        }

        // =====================================================================
        // LAYER 3: MIDGROUND - MULTI-LOBED ORGANIC PLASMA BURST PLUMES
        // =====================================================================
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          if (p.type !== 'plasma_plume') continue;

          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= p.drag;
          p.vy *= p.drag;
          p.size += (p.maxSize - p.size) * 0.14;
          const prog = p.life / p.maxLife;
          p.alpha = Math.max(0, (1 - Math.pow(prog, 1.4)) * 0.95);

          if (p.alpha > 0.02 && p.life < p.maxLife) {
            hasActiveElements = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);

            // Teardrop / Plasma Bulb Plume Shape
            const r = p.size;
            const grad = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(0.3, toRgba('#FFF59D', p.alpha * 0.9));
            grad.addColorStop(0.65, toRgba(p.color, p.alpha * 0.8));
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.8);
            ctx.quadraticCurveTo(r * 0.9, -r * 0.3, r * 0.7, r * 0.7);
            ctx.quadraticCurveTo(0, r * 1.1, -r * 0.7, r * 0.7);
            ctx.quadraticCurveTo(-r * 0.9, -r * 0.3, 0, -r * 0.8);
            ctx.closePath();
            ctx.fill();

            // Inner hot streak
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = p.alpha * 0.9;
            ctx.beginPath();
            ctx.ellipse(0, -r * 0.2, r * 0.28, r * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          } else {
            particlesRef.current.splice(i, 1);
          }
        }

        // =====================================================================
        // LAYER 4: SECONDARY MICRO-BURSTS (Localized Candy Epicenters)
        // =====================================================================
        for (let i = secondaryBurstsRef.current.length - 1; i >= 0; i--) {
          const mb = secondaryBurstsRef.current[i];
          mb.life++;
          const p = mb.life / mb.maxLife;
          mb.radius += (mb.maxRadius - mb.radius) * 0.28;
          mb.alpha = (1 - p) * 0.9;

          if (mb.alpha > 0.02 && mb.life < mb.maxLife) {
            hasActiveElements = true;
            ctx.save();
            const grad = ctx.createRadialGradient(mb.x, mb.y, 0, mb.x, mb.y, mb.radius);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(0.4, toRgba(mb.color, mb.alpha));
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(mb.x, mb.y, mb.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            secondaryBurstsRef.current.splice(i, 1);
          }
        }

        // =====================================================================
        // LAYER 5: FOREGROUND PARTICLES (Needle Sparks, 3D Shards, Candy Crystals, Embers)
        // =====================================================================
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          if (p.type === 'plasma_plume' || p.type === 'haze_puff') continue;

          p.life++;

          if (p.type === 'suction_mote' && p.targetX !== undefined && p.targetY !== undefined) {
            // Inward swirling anticipation suction
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const suctionForce = 0.15;
            p.vx += dx * suctionForce;
            p.vy += dy * suctionForce;
            p.vx *= 0.85;
            p.vy *= 0.85;
            p.x += p.vx;
            p.y += p.vy;

            p.alpha = Math.min(1, p.life / 4) * Math.max(0, dist / 10);
            if (dist < 4 || p.life > p.maxLife) {
              p.alpha = 0;
            }
          } else {
            // Dynamic outward particle motion with drag & gravity
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.vy *= p.drag;

            // 3D Tumbling simulation
            if (p.scaleX !== undefined) {
              p.scaleX = Math.cos(p.life * p.rotSpeed * 1.5);
            }
            p.angle += p.rotSpeed;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          }

          if (p.alpha > 0.02 && p.life < p.maxLife) {
            hasActiveElements = true;
            ctx.save();
            ctx.globalAlpha = p.alpha;

            if (p.type === 'spark_streak') {
              // High-speed needle streak with motion trail
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - p.vx * 3.2, p.y - p.vy * 3.2);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = Math.max(1, p.size * 0.7);
              ctx.lineCap = 'round';
              ctx.stroke();

              // White-hot core
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = Math.max(0.8, p.size * 0.4);
              ctx.stroke();
            } else if (p.type === 'shard_debris' || p.type === 'candy_crystal') {
              // 3D Faceted Fragment with specular shine
              ctx.translate(p.x, p.y);
              ctx.rotate(p.angle);
              if (p.scaleX !== undefined) {
                ctx.scale(p.scaleX, 1);
              }

              ctx.fillStyle = p.color;
              ctx.beginPath();
              if (p.points && p.points.length > 2) {
                ctx.moveTo(p.points[0].x * p.size, p.points[0].y * p.size);
                for (let k = 1; k < p.points.length; k++) {
                  ctx.lineTo(p.points[k].x * p.size, p.points[k].y * p.size);
                }
                ctx.closePath();
              } else {
                ctx.moveTo(-p.size, -p.size * 0.5);
                ctx.lineTo(p.size * 0.8, -p.size * 0.2);
                ctx.lineTo(p.size * 0.5, p.size * 0.8);
                ctx.lineTo(-p.size * 0.6, p.size * 0.4);
                ctx.closePath();
              }
              ctx.fill();

              // Specular shine edge
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 0.8;
              ctx.stroke();

              // Gleam star point
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0.5, p.size * 0.3), 0, Math.PI * 2);
              ctx.fill();
            } else if (p.type === 'energy_ember') {
              // Soft floating glowing ember
              const orbGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.8);
              orbGrad.addColorStop(0, '#FFFFFF');
              orbGrad.addColorStop(0.35, toRgba(p.color, 0.9));
              orbGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

              ctx.fillStyle = orbGrad;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Suction mote or basic particle
              ctx.beginPath();
              ctx.arc(p.x, p.y, Math.max(0.8, p.size), 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.fill();
            }

            ctx.restore();
          } else {
            particlesRef.current.splice(i, 1);
          }
        }

        if (hasActiveElements) {
          animFrameRef.current = requestAnimationFrame(render);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(render);
    };

    // Auto-resize canvas according to DOM container
    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const updateSize = () => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      };

      updateSize();
      const observer = new ResizeObserver(updateSize);
      observer.observe(container);

      return () => {
        observer.disconnect();
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      /**
       * 1. BOMB CREATION GATHER (350–450ms)
       * Inward spiraling energy streams condensing into a bright core
       */
      triggerCreationGather: (pos: Position, color: string) => {
        const { x: targetX, y: targetY, cellSize } = getPixelCoords(pos);

        for (let i = 0; i < 28; i++) {
          const angle = (Math.PI * 2 * i) / 28 + (Math.random() * 0.3 - 0.15);
          const distance = cellSize * (1.2 + Math.random() * 0.8);
          const startX = targetX + Math.cos(angle) * distance;
          const startY = targetY + Math.sin(angle) * distance;

          particlesRef.current.push({
            x: startX,
            y: startY,
            vx: 0,
            vy: 0,
            color: i % 3 === 0 ? '#FFFFFF' : i % 2 === 0 ? '#FFD54F' : color,
            size: 2.2 + Math.random() * 2.0,
            maxSize: 3.5,
            alpha: 1,
            life: 0,
            maxLife: 20,
            type: 'suction_mote',
            angle: 0,
            rotSpeed: 0,
            drag: 0.88,
            gravity: 0,
            targetX,
            targetY,
          });
        }

        // Center condensating flash
        flashesRef.current.push({
          x: targetX,
          y: targetY,
          size: 6,
          maxSize: cellSize * 0.9,
          alpha: 0.9,
          maxAlpha: 0.9,
          color,
          life: 0,
          maxLife: 16,
        });

        startAnimationLoop();
      },

      /**
       * 2. BOMB PRE-DETONATION ANTICIPATION (120–160ms)
       * Vacuum suction motes pulling inward rapidly, core supercharging
       */
      triggerBombAnticipation: (pos: Position, colorHex?: string) => {
        const { x: targetX, y: targetY, cellSize } = getPixelCoords(pos);
        const color = colorHex || '#FFA500';

        // 22 Fast inward suction motes
        for (let i = 0; i < 22; i++) {
          const angle = (Math.PI * 2 * i) / 22 + (Math.random() * 0.4 - 0.2);
          const distance = cellSize * (0.9 + Math.random() * 0.8);
          const startX = targetX + Math.cos(angle) * distance;
          const startY = targetY + Math.sin(angle) * distance;

          particlesRef.current.push({
            x: startX,
            y: startY,
            vx: -Math.cos(angle) * (3.0 + Math.random() * 1.5),
            vy: -Math.sin(angle) * (3.0 + Math.random() * 1.5),
            color: i % 2 === 0 ? '#FFFFFF' : color,
            size: 2.2 + Math.random() * 2.0,
            maxSize: 3.0,
            alpha: 1,
            life: 0,
            maxLife: 14,
            type: 'suction_mote',
            angle: 0,
            rotSpeed: 0,
            drag: 0.86,
            gravity: 0,
            targetX,
            targetY,
          });
        }

        // Concentrating core glow
        flashesRef.current.push({
          x: targetX,
          y: targetY,
          size: cellSize * 0.4,
          maxSize: cellSize * 1.1,
          alpha: 0.95,
          maxAlpha: 0.95,
          color,
          life: 0,
          maxLife: 12,
        });

        startAnimationLoop();
      },

      /**
       * 3. COMPLETE VOLUMETRIC BOMB DETONATION (NO EXPANDING CIRCLE!)
       * Multi-lobed plasma burst + diamond core flash + directional streaks + 3D shards
       */
      triggerBombExplosion: (pos: Position, radiusCells = 1.7, candyColor = '#FF6D00', intensity = 1.0) => {
        const { x, y, cellSize } = getPixelCoords(pos);
        const baseSpeed = cellSize * 0.18 * intensity;

        // 1. CORE DIAMOND FLASH & RADIANT NEEDLE RAYS
        const rayCount = Math.round(12 * intensity);
        const rays = [];
        for (let r = 0; r < rayCount; r++) {
          rays.push({
            angle: (Math.PI * 2 * r) / rayCount + (Math.random() * 0.3 - 0.15),
            length: 4,
            width: (2.0 + Math.random() * 2.2) * intensity,
            speed: (3.5 + Math.random() * 3.0) * intensity,
          });
        }

        flashesRef.current.push({
          x,
          y,
          size: 10,
          maxSize: cellSize * radiusCells * 1.1,
          alpha: 1.0,
          maxAlpha: 1.0,
          color: candyColor,
          life: 0,
          maxLife: Math.round(14 * intensity),
          rays,
        });

        // 2. MULTI-LOBED ORGANIC PLASMA BURST PLUMES (10 directional irregular lobes)
        const lobeCount = Math.round(10 * intensity);
        for (let i = 0; i < lobeCount; i++) {
          const baseAngle = (Math.PI * 2 * i) / lobeCount;
          const angle = baseAngle + (Math.random() * 0.5 - 0.25);
          // Varied velocity per lobe (some fast shoots, some slow billows)
          const speed = baseSpeed * (0.8 + Math.random() * 1.2);
          const lobeSize = cellSize * (0.55 + Math.random() * 0.45) * intensity;

          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: i % 2 === 0 ? '#FFD54F' : candyColor,
            size: lobeSize * 0.3,
            maxSize: lobeSize,
            alpha: 1.0,
            life: 0,
            maxLife: Math.round((18 + Math.random() * 10) * intensity),
            type: 'plasma_plume',
            angle: angle + Math.PI / 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            drag: 0.90,
            gravity: 0.02,
          });
        }

        // 3. HIGH-SPEED NEEDLE SPARK STREAKS (24 directional sparks)
        const sparkCount = Math.round(24 * intensity);
        for (let i = 0; i < sparkCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = baseSpeed * (1.5 + Math.random() * 2.2);

          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: i % 3 === 0 ? '#FFFFFF' : i % 2 === 0 ? '#FFF176' : candyColor,
            size: (1.6 + Math.random() * 1.8) * intensity,
            maxSize: 3.5,
            alpha: 1.0,
            life: 0,
            maxLife: Math.round((14 + Math.random() * 12) * intensity),
            type: 'spark_streak',
            angle: 0,
            rotSpeed: 0,
            drag: 0.94,
            gravity: 0.06,
          });
        }

        // 4. 3D FACETED SHARDS & DEBRIS (18 tumbling chunky pieces)
        const shardCount = Math.round(18 * intensity);
        for (let i = 0; i < shardCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = baseSpeed * (0.9 + Math.random() * 1.4);

          // Irregular polygon vertices
          const pPoints = [
            { x: -0.8 + Math.random() * 0.3, y: -0.8 + Math.random() * 0.3 },
            { x: 0.7 + Math.random() * 0.4, y: -0.5 + Math.random() * 0.3 },
            { x: 0.6 + Math.random() * 0.4, y: 0.7 + Math.random() * 0.4 },
            { x: -0.7 + Math.random() * 0.3, y: 0.6 + Math.random() * 0.3 },
          ];

          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.0,
            color: i % 3 === 0 ? '#ECEFF1' : i % 2 === 0 ? '#FFA000' : '#FF6D00',
            size: (3.0 + Math.random() * 3.5) * intensity,
            maxSize: 6.0,
            alpha: 1.0,
            life: 0,
            maxLife: Math.round((22 + Math.random() * 14) * intensity),
            type: 'shard_debris',
            angle: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.35,
            scaleX: 1,
            points: pPoints,
            drag: 0.92,
            gravity: 0.14,
          });
        }

        // 5. GLOWING ENERGY EMBERS (12 floating motes)
        const emberCount = Math.round(12 * intensity);
        for (let i = 0; i < emberCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = baseSpeed * (0.4 + Math.random() * 0.8);

          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: '#FFEA00',
            size: (2.2 + Math.random() * 2.5) * intensity,
            maxSize: 4.5,
            alpha: 1.0,
            life: 0,
            maxLife: Math.round((28 + Math.random() * 15) * intensity),
            type: 'energy_ember',
            angle: 0,
            rotSpeed: 0,
            drag: 0.91,
            gravity: -0.02, // Gentle rise
          });
        }

        // 6. SOFT BACKGROUND DISSIPATION HAZE
        for (let h = 0; h < 4; h++) {
          const hAngle = (Math.PI * 2 * h) / 4 + Math.random() * 0.5;
          const hDist = cellSize * 0.35;
          particlesRef.current.push({
            x: x + Math.cos(hAngle) * hDist,
            y: y + Math.sin(hAngle) * hDist,
            vx: Math.cos(hAngle) * 0.5,
            vy: Math.sin(hAngle) * 0.5,
            color: candyColor,
            size: cellSize * 0.6,
            maxSize: cellSize * 1.5,
            alpha: 0.5,
            life: 0,
            maxLife: 26,
            type: 'haze_puff',
            angle: 0,
            rotSpeed: 0,
            drag: 0.94,
            gravity: 0,
          });
        }

        startAnimationLoop();
      },

      /**
       * 4. STAGGERED CANDY IMPACT & SHATTER
       * Triggered per candy reached by traveling wave:
       * - Hit flash at candy coordinate
       * - 8-12 candy-colored crystal shards flying away
       * - Secondary micro-burst
       */
      triggerStaggeredImpact: (pos: Position, colorHex: string, delayMs = 0) => {
        setTimeout(() => {
          const { x, y, cellSize } = getPixelCoords(pos);

          // Local candy hit flash & micro-burst
          secondaryBurstsRef.current.push({
            x,
            y,
            radius: 4,
            maxRadius: cellSize * (0.6 + Math.random() * 0.35),
            color: colorHex,
            alpha: 0.95,
            life: 0,
            maxLife: 12,
          });

          // 8-10 Shattered Candy Crystal Shards
          for (let i = 0; i < 9; i++) {
            const angle = (Math.PI * 2 * i) / 9 + (Math.random() * 0.4 - 0.2);
            const speed = cellSize * (0.12 + Math.random() * 0.16);

            particlesRef.current.push({
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 0.8,
              color: i % 2 === 0 ? colorHex : '#FFFFFF',
              size: 2.2 + Math.random() * 2.6,
              maxSize: 4.8,
              alpha: 1.0,
              life: 0,
              maxLife: 16 + Math.floor(Math.random() * 10),
              type: 'candy_crystal',
              angle: Math.random() * Math.PI,
              rotSpeed: (Math.random() - 0.5) * 0.4,
              scaleX: 1,
              drag: 0.91,
              gravity: 0.15,
            });
          }

          // 4 Needle Sparks
          for (let s = 0; s < 4; s++) {
            const sAngle = Math.random() * Math.PI * 2;
            const sSpeed = cellSize * (0.2 + Math.random() * 0.2);
            particlesRef.current.push({
              x,
              y,
              vx: Math.cos(sAngle) * sSpeed,
              vy: Math.sin(sAngle) * sSpeed,
              color: '#FFFFFF',
              size: 1.5,
              maxSize: 2.5,
              alpha: 1.0,
              life: 0,
              maxLife: 10,
              type: 'spark_streak',
              angle: 0,
              rotSpeed: 0,
              drag: 0.92,
              gravity: 0.05,
            });
          }

          startAnimationLoop();
        }, delayMs);
      },

      /**
       * 5. DIRECTIONAL LOCALIZED ENERGY BURST (Capped distance, no screen-spanning lines)
       */
      triggerLineBlast: (type: 'horizontal' | 'vertical', index: number, candyColor = '#FF8F00') => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const cellW = canvas.width / BOARD_COLS;
        const cellH = canvas.height / BOARD_ROWS;
        const centerPos: Position = type === 'horizontal' 
          ? { row: Math.min(BOARD_ROWS - 1, Math.max(0, index)), col: Math.floor(BOARD_COLS / 2) }
          : { row: Math.floor(BOARD_ROWS / 2), col: Math.min(BOARD_COLS - 1, Math.max(0, index)) };
        
        const { x, y, cellSize } = getPixelCoords(centerPos);

        // Localized multi-lobe directional pulse
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12 + (Math.random() * 0.3 - 0.15);
          const speed = cellSize * (0.12 + Math.random() * 0.18);
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: i % 2 === 0 ? '#FFFFFF' : candyColor,
            size: 2.2 + Math.random() * 2.0,
            maxSize: 4.2,
            alpha: 1,
            life: 0,
            maxLife: 16,
            type: 'spark_streak',
            angle: 0,
            rotSpeed: 0,
            drag: 0.92,
            gravity: 0.04,
          });
        }

        flashesRef.current.push({
          x,
          y,
          size: 8,
          maxSize: cellSize * 1.5,
          alpha: 0.95,
          maxAlpha: 0.95,
          color: candyColor,
          life: 0,
          maxLife: 14,
        });

        startAnimationLoop();
      },

      /**
       * 6. COLOR SUPERNOVA
       */
      triggerColorSupernova: (pos: Position, targetPositions?: Position[], color = '#FF007F') => {
        const { x, y, cellSize } = getPixelCoords(pos);

        flashesRef.current.push({
          x,
          y,
          size: 8,
          maxSize: cellSize * 2.2,
          alpha: 1.0,
          maxAlpha: 1.0,
          color,
          life: 0,
          maxLife: 16,
        });

        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = cellSize * (0.15 + Math.random() * 0.25);
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: i % 4 === 0 ? '#FFFFFF' : i % 3 === 0 ? '#00E5FF' : i % 2 === 0 ? '#FFD54F' : color,
            size: 2.2 + Math.random() * 2.2,
            maxSize: 4.0,
            alpha: 1,
            life: 0,
            maxLife: 20,
            type: 'energy_ember',
            angle: 0,
            rotSpeed: 0,
            drag: 0.92,
            gravity: 0,
          });
        }

        startAnimationLoop();
      },

      clear: () => {
        particlesRef.current = [];
        flashesRef.current = [];
        secondaryBurstsRef.current = [];
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      },
    }));

    return (
      <div ref={containerRef} className={`absolute inset-0 pointer-events-none z-35 overflow-hidden rounded-2xl ${className}`}>
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    );
  }
);

ExplosionCanvas.displayName = 'ExplosionCanvas';
