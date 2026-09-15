import { Disc, Ball, PitchDimensions, LevelConfig } from './types';

export interface AIShotDecision {
  discId: number;
  shotVx: number;
  shotVy: number;
  powerNormalized: number;
  aimAngle: number;
}

export class ButtonSoccerAI {
  public static computeBestShot(
    discs: Disc[],
    ball: Ball,
    dims: PitchDimensions,
    level: LevelConfig
  ): AIShotDecision | null {
    // Only choose from opponent discs
    const opponentDiscs = discs.filter((d) => d.team === 'opponent');
    if (opponentDiscs.length === 0) return null;

    const {
      centerX,
      pitchTop,
      pitchBottom,
      pitchLeft,
      pitchRight,
      goalWidth,
    } = dims;

    // Target is bottom goal (user's goal)
    const targetY = pitchBottom + 10;
    // Aim for left or right corner of goal to make it harder for goalkeeper, or center
    const goalHalfW = goalWidth * 0.42;
    const cornerBias = (Math.random() - 0.5) * goalHalfW;
    const targetX = centerX + cornerBias;

    // Evaluate each opponent disc and pick highest scoring tactical shot
    let bestDisc: Disc = opponentDiscs[0];
    let bestScore = -Infinity;
    let bestAimVector = { x: 0, y: 0 };
    let bestPower = 0.8;

    const ballInOwnHalf = ball.y < dims.centerY;

    for (const disc of opponentDiscs) {
      const distToBall = Math.hypot(ball.x - disc.x, ball.y - disc.y);

      // Desired direction the ball should travel (towards user's goal at bottom)
      const ballToGoalDx = targetX - ball.x;
      const ballToGoalDy = targetY - ball.y;
      const ballToGoalDist = Math.hypot(ballToGoalDx, ballToGoalDy) || 1;
      const ballToGoalNormX = ballToGoalDx / ballToGoalDist;
      const ballToGoalNormY = ballToGoalDy / ballToGoalDist;

      // The point behind the ball where the disc must strike
      const requiredImpactDist = disc.radius + ball.radius;
      const strikePointX = ball.x - ballToGoalNormX * requiredImpactDist;
      const strikePointY = ball.y - ballToGoalNormY * requiredImpactDist;

      // Vector from disc to strike point
      const aimDx = strikePointX - disc.x;
      const aimDy = strikePointY - disc.y;
      const aimDist = Math.hypot(aimDx, aimDy) || 1;
      const aimNormX = aimDx / aimDist;
      const aimNormY = aimDy / aimDist;

      // Alignment score: is the disc behind the ball relative to target goal?
      const alignment = aimNormX * ballToGoalNormX + aimNormY * ballToGoalNormY;

      let score = 0;

      if (ballInOwnHalf && disc.isGoalkeeper) {
        // Goalkeeper defensive clearance priority
        score += 800 - distToBall;
      } else {
        // General attacker / midfielder scoring
        score += alignment * 500;
        score += (1000 - distToBall) * 0.8;
        // Favor discs already higher up (near opponent goal line looking downfield)
        if (disc.y < ball.y) {
          score += 300;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestDisc = disc;
        bestAimVector = { x: aimNormX, y: aimNormY };

        // Power calculation based on distance to goal and ball
        const neededDistance = distToBall + ballToGoalDist;
        const basePower = Math.min(1.0, Math.max(0.65, neededDistance / 500));
        bestPower = basePower * level.aiPower;
      }
    }

    // Apply AI Precision (Very Difficult has minimal noise, Master has zero noise)
    const noiseAngle = (1 - level.aiPrecision) * (Math.random() - 0.5) * 0.25;
    const currentAngle = Math.atan2(bestAimVector.y, bestAimVector.x) + noiseAngle;

    const finalDirX = Math.cos(currentAngle);
    const finalDirY = Math.sin(currentAngle);

    // Max launch speed ~ 700 px/sec
    const maxSpeed = 720;
    const finalSpeed = bestPower * maxSpeed;

    return {
      discId: bestDisc.id,
      shotVx: finalDirX * finalSpeed,
      shotVy: finalDirY * finalSpeed,
      powerNormalized: bestPower,
      aimAngle: currentAngle,
    };
  }
}
