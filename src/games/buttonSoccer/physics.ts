import { Disc, Ball, PitchDimensions } from './types';
import { buttonSoccerAudio } from './audio';

export interface CollisionCallbacks {
  onKick?: (power: number) => void;
  onDiscClack?: (intensity: number) => void;
  onWallBounce?: (intensity: number) => void;
  onGoal?: (scoringTeam: 'user' | 'opponent') => void;
}

export class ButtonSoccerPhysics {
  public dims: PitchDimensions;
  public callbacks: CollisionCallbacks;
  public hasScoredThisPlay: boolean = false;
  private lastWallBounceTime: number = 0;
  private lastDiscClackTime: number = 0;
  private lastKickSoundTime: number = 0;

  constructor(dims: PitchDimensions, callbacks: CollisionCallbacks = {}) {
    this.dims = dims;
    this.callbacks = callbacks;
  }

  private triggerWallBounce(speed: number) {
    if (speed < 40) return;
    const now = performance.now();
    if (now - this.lastWallBounceTime < 90) return;
    this.lastWallBounceTime = now;
    this.callbacks.onWallBounce?.(Math.min(1, speed / 300));
  }

  private triggerDiscClack(relSpeed: number) {
    if (relSpeed < 45) return;
    const now = performance.now();
    if (now - this.lastDiscClackTime < 90) return;
    this.lastDiscClackTime = now;
    this.callbacks.onDiscClack?.(Math.min(1, relSpeed / 350));
  }

  private triggerKick(relSpeed: number) {
    if (relSpeed < 35) return;
    const now = performance.now();
    if (now - this.lastKickSoundTime < 90) return;
    this.lastKickSoundTime = now;
    this.callbacks.onKick?.(Math.min(1, relSpeed / 450));
  }

  public updateDimensions(dims: PitchDimensions) {
    this.dims = dims;
  }

  /**
   * Primary frame-rate independent physics step using delta-time
   */
  public step(dt: number, discs: Disc[], ball: Ball): { goalScored: 'user' | 'opponent' | null } {
    let goalScored: 'user' | 'opponent' | null = null;
    const clampedDt = Math.min(Math.max(dt, 0.001), 0.04);
    const subSteps = 4;
    const subDt = clampedDt / subSteps;

    for (let s = 0; s < subSteps; s++) {
      // 1. Integrate Disc Positions
      for (const disc of discs) {
        disc.x += disc.vx * subDt;
        disc.y += disc.vy * subDt;

        // Apply grass rolling friction (frame-rate independent decay)
        const frictionFactor = Math.pow(disc.friction, subDt * 60);
        disc.vx *= frictionFactor;
        disc.vy *= frictionFactor;

        // Zero out minimal drift
        if (Math.hypot(disc.vx, disc.vy) < 1.5) {
          disc.vx = 0;
          disc.vy = 0;
        }

        // Disc vs Pitch Walls & Posts
        this.resolveDiscPitchCollision(disc);
      }

      // 2. Integrate Ball Position
      ball.x += ball.vx * subDt;
      ball.y += ball.vy * subDt;

      // Realistic 3D rolling angle accumulation
      const speed = Math.hypot(ball.vx, ball.vy);
      if (speed > 1) {
        ball.rollAngleX = (ball.rollAngleX || 0) + (ball.vx * subDt) / ball.radius;
        ball.rollAngleY = (ball.rollAngleY || 0) + (ball.vy * subDt) / ball.radius;
      }

      const ballFriction = Math.pow(ball.friction, subDt * 60);
      ball.vx *= ballFriction;
      ball.vy *= ballFriction;

      // Ball spin decay
      ball.spin *= 0.98;

      if (Math.hypot(ball.vx, ball.vy) < 1.5) {
        ball.vx = 0;
        ball.vy = 0;
      }

      // Ball vs Pitch Walls, Net, Posts, and Goal Detection
      const checkGoal = this.resolveBallPitchCollision(ball);
      if (checkGoal && !this.hasScoredThisPlay) {
        this.hasScoredThisPlay = true;
        goalScored = checkGoal;
      }

      // 3. Disc vs Disc Collisions
      for (let i = 0; i < discs.length; i++) {
        for (let j = i + 1; j < discs.length; j++) {
          this.resolveDiscDiscCollision(discs[i], discs[j]);
        }
      }

      // 4. Disc vs Ball Collisions
      for (const disc of discs) {
        this.resolveDiscBallCollision(disc, ball);
      }
    }

    return { goalScored };
  }

  /**
   * Check if all objects have come to rest
   */
  public isMotionSettled(discs: Disc[], ball: Ball): boolean {
    const SPEED_THRESHOLD = 5.0; // px/sec
    if (Math.hypot(ball.vx, ball.vy) > SPEED_THRESHOLD) return false;
    for (const d of discs) {
      if (Math.hypot(d.vx, d.vy) > SPEED_THRESHOLD) return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Disc vs Pitch Boundary
  // ---------------------------------------------------------------------------
  private resolveDiscPitchCollision(disc: Disc) {
    const { pitchLeft, pitchRight, pitchTop, pitchBottom } = this.dims;
    const r = disc.radius;
    const rest = disc.restitution;

    // Left wall
    if (disc.x - r < pitchLeft) {
      disc.x = pitchLeft + r;
      if (disc.vx < 0) {
        disc.vx = -disc.vx * rest;
        this.triggerWallBounce(Math.abs(disc.vx));
      }
    }
    // Right wall
    if (disc.x + r > pitchRight) {
      disc.x = pitchRight - r;
      if (disc.vx > 0) {
        disc.vx = -disc.vx * rest;
        this.triggerWallBounce(Math.abs(disc.vx));
      }
    }
    // Top line
    if (disc.y - r < pitchTop) {
      disc.y = pitchTop + r;
      if (disc.vy < 0) {
        disc.vy = -disc.vy * rest;
        this.triggerWallBounce(Math.abs(disc.vy));
      }
    }
    // Bottom line
    if (disc.y + r > pitchBottom) {
      disc.y = pitchBottom - r;
      if (disc.vy > 0) {
        disc.vy = -disc.vy * rest;
        this.triggerWallBounce(Math.abs(disc.vy));
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Ball vs Pitch Boundary, Posts & Goals
  // ---------------------------------------------------------------------------
  private resolveBallPitchCollision(ball: Ball): 'user' | 'opponent' | null {
    const {
      pitchLeft,
      pitchRight,
      pitchTop,
      pitchBottom,
      centerX,
      goalWidth,
      topGoalY,
      bottomGoalY,
    } = this.dims;

    const r = ball.radius;
    const rest = ball.restitution;
    const goalHalfW = goalWidth * 0.5;
    const goalLeftX = centerX - goalHalfW;
    const goalRightX = centerX + goalHalfW;

    // Left Touchline
    if (ball.x - r < pitchLeft) {
      ball.x = pitchLeft + r;
      if (ball.vx < 0) {
        ball.vx = -ball.vx * rest;
        this.triggerWallBounce(Math.abs(ball.vx));
      }
    }

    // Right Touchline
    if (ball.x + r > pitchRight) {
      ball.x = pitchRight - r;
      if (ball.vx > 0) {
        ball.vx = -ball.vx * rest;
        this.triggerWallBounce(Math.abs(ball.vx));
      }
    }

    // TOP GOAL & GOALLINE
    const isWithinTopGoalMouthX = ball.x >= goalLeftX && ball.x <= goalRightX;
    if (isWithinTopGoalMouthX) {
      // Ball is heading into top goal mouth
      if (ball.y < pitchTop) {
        // Inside top net area: back wall collision
        if (ball.y - r < topGoalY) {
          ball.y = topGoalY + r;
          ball.vy = Math.abs(ball.vy) * 0.4;
        }
        // Net side walls
        if (ball.x - r < goalLeftX) {
          ball.x = goalLeftX + r;
          ball.vx = Math.abs(ball.vx) * 0.5;
        } else if (ball.x + r > goalRightX) {
          ball.x = goalRightX - r;
          ball.vx = -Math.abs(ball.vx) * 0.5;
        }

        // GOAL CHECK: Ball fully across top goalline!
        if (ball.y + r < pitchTop) {
          return 'user'; // User scored on opponent's top goal!
        }
      }
    } else {
      // Outside top goal mouth -> solid wall
      if (ball.y - r < pitchTop) {
        ball.y = pitchTop + r;
        if (ball.vy < 0) {
          ball.vy = -ball.vy * rest;
          this.triggerWallBounce(Math.abs(ball.vy));
        }
      }
    }

    // BOTTOM GOAL & GOALLINE
    const isWithinBottomGoalMouthX = ball.x >= goalLeftX && ball.x <= goalRightX;
    if (isWithinBottomGoalMouthX) {
      // Ball is heading into bottom goal mouth
      if (ball.y > pitchBottom) {
        // Inside bottom net area: back wall collision
        if (ball.y + r > bottomGoalY) {
          ball.y = bottomGoalY - r;
          ball.vy = -Math.abs(ball.vy) * 0.4;
        }
        // Net side walls
        if (ball.x - r < goalLeftX) {
          ball.x = goalLeftX + r;
          ball.vx = Math.abs(ball.vx) * 0.5;
        } else if (ball.x + r > goalRightX) {
          ball.x = goalRightX - r;
          ball.vx = -Math.abs(ball.vx) * 0.5;
        }

        // GOAL CHECK: Ball fully across bottom goalline!
        if (ball.y - r > pitchBottom) {
          return 'opponent'; // Opponent scored on user's bottom goal!
        }
      }
    } else {
      // Outside bottom goal mouth -> solid wall
      if (ball.y + r > pitchBottom) {
        ball.y = pitchBottom - r;
        if (ball.vy > 0) {
          ball.vy = -ball.vy * rest;
          this.triggerWallBounce(Math.abs(ball.vy));
        }
      }
    }

    // Goal Post Collisions (Top Posts and Bottom Posts)
    const posts = [
      { x: goalLeftX, y: pitchTop },
      { x: goalRightX, y: pitchTop },
      { x: goalLeftX, y: pitchBottom },
      { x: goalRightX, y: pitchBottom },
    ];
    const postR = 6;

    for (const post of posts) {
      const dx = ball.x - post.x;
      const dy = ball.y - post.y;
      const dist = Math.hypot(dx, dy);
      const minDist = ball.radius + postR;
      if (dist < minDist && dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        // Position correction
        ball.x = post.x + nx * minDist;
        ball.y = post.y + ny * minDist;

        // Velocity reflection
        const dot = ball.vx * nx + ball.vy * ny;
        if (dot < 0) {
          ball.vx -= (1 + rest) * dot * nx;
          ball.vy -= (1 + rest) * dot * ny;
          this.triggerWallBounce(Math.hypot(ball.vx, ball.vy));
        }
      }
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Disc vs Disc Elastic Collision
  // ---------------------------------------------------------------------------
  private resolveDiscDiscCollision(d1: Disc, d2: Disc) {
    const dx = d2.x - d1.x;
    const dy = d2.y - d1.y;
    const dist = Math.hypot(dx, dy);
    const minDist = d1.radius + d2.radius;

    if (dist < minDist && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;

      // Position correction to prevent overlap
      const overlap = minDist - dist;
      const percent = 0.5;
      d1.x -= nx * overlap * percent;
      d1.y -= ny * overlap * percent;
      d2.x += nx * overlap * percent;
      d2.y += ny * overlap * percent;

      // Relative velocity
      const rvx = d2.vx - d1.vx;
      const rvy = d2.vy - d1.vy;
      const velAlongNormal = rvx * nx + rvy * ny;

      // Do not resolve if velocities are separating
      if (velAlongNormal > 0) return;

      const restitution = Math.min(d1.restitution, d2.restitution);
      const impulseMag = (-(1 + restitution) * velAlongNormal) / (1 / d1.mass + 1 / d2.mass);

      const impulseX = impulseMag * nx;
      const impulseY = impulseMag * ny;

      d1.vx -= impulseX / d1.mass;
      d1.vy -= impulseY / d1.mass;
      d2.vx += impulseX / d2.mass;
      d2.vy += impulseY / d2.mass;

      this.triggerDiscClack(Math.abs(velAlongNormal));
    }
  }

  // ---------------------------------------------------------------------------
  // Disc vs Ball Impulse Collision
  // ---------------------------------------------------------------------------
  private resolveDiscBallCollision(disc: Disc, ball: Ball) {
    const dx = ball.x - disc.x;
    const dy = ball.y - disc.y;
    const dist = Math.hypot(dx, dy);
    const minDist = disc.radius + ball.radius;

    if (dist < minDist && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;

      // Positional correction: separate mostly by pushing the lighter ball
      const overlap = minDist - dist;
      ball.x += nx * overlap * 0.85;
      ball.y += ny * overlap * 0.85;
      disc.x -= nx * overlap * 0.15;
      disc.y -= ny * overlap * 0.15;

      const rvx = ball.vx - disc.vx;
      const rvy = ball.vy - disc.vy;
      const velAlongNormal = rvx * nx + rvy * ny;

      if (velAlongNormal > 0) return;

      const restitution = 0.88;
      const impulseMag = (-(1 + restitution) * velAlongNormal) / (1 / disc.mass + 1 / ball.mass);

      const impulseX = impulseMag * nx;
      const impulseY = impulseMag * ny;

      disc.vx -= impulseX / disc.mass;
      disc.vy -= impulseY / disc.mass;
      ball.vx += impulseX / ball.mass;
      ball.vy += impulseY / ball.mass;

      // Ball spin inducement based on tangential velocity
      const tx = -ny;
      const ty = nx;
      const tangVel = rvx * tx + rvy * ty;
      ball.spin += tangVel * 0.02;

      this.triggerKick(Math.abs(velAlongNormal));
    }
  }
}
