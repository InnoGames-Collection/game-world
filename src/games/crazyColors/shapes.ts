/**
 * Crazy Colors Shape Geometry & Collision Engine
 * Supports 17+ geometric configurations with exact segment math and color verification.
 */

import { CrazyColor, ShapeType, ColoredSegment } from './types';
import { COLOR_KEYS, GAME_PHYSICS } from './constants';

export function createShapeSegments(shapeType: ShapeType, scale: number = 1): ColoredSegment[] {
  const s = scale;
  const segments: ColoredSegment[] = [];

  switch (shapeType) {
    case 'square':
    case 'rotated_square': {
      const size = 65 * s;
      // 4 sides: Top, Right, Bottom, Left
      segments.push(
        { id: 'top', color: COLOR_KEYS[0], type: 'line', x1: -size, y1: -size, x2: size, y2: -size },
        { id: 'right', color: COLOR_KEYS[1], type: 'line', x1: size, y1: -size, x2: size, y2: size },
        { id: 'bottom', color: COLOR_KEYS[2], type: 'line', x1: size, y1: size, x2: -size, y2: size },
        { id: 'left', color: COLOR_KEYS[3], type: 'line', x1: -size, y1: size, x2: -size, y2: -size }
      );
      break;
    }

    case 'rectangle': {
      const w = 80 * s;
      const h = 55 * s;
      segments.push(
        { id: 'top', color: COLOR_KEYS[0], type: 'line', x1: -w, y1: -h, x2: w, y2: -h },
        { id: 'right', color: COLOR_KEYS[1], type: 'line', x1: w, y1: -h, x2: w, y2: h },
        { id: 'bottom', color: COLOR_KEYS[2], type: 'line', x1: w, y1: h, x2: -w, y2: h },
        { id: 'left', color: COLOR_KEYS[3], type: 'line', x1: -w, y1: h, x2: -w, y2: -h }
      );
      break;
    }

    case 'diamond': {
      const r = 75 * s;
      // 4 diagonal sides
      segments.push(
        { id: 'top-right', color: COLOR_KEYS[0], type: 'line', x1: 0, y1: -r, x2: r, y2: 0 },
        { id: 'bottom-right', color: COLOR_KEYS[1], type: 'line', x1: r, y2: r, x2: 0, y1: 0 },
        { id: 'bottom-left', color: COLOR_KEYS[2], type: 'line', x1: 0, y1: r, x2: -r, y2: 0 },
        { id: 'top-left', color: COLOR_KEYS[3], type: 'line', x1: -r, y1: 0, x2: 0, y2: -r }
      );
      break;
    }

    case 'open_square':
    case 'u_shape': {
      const size = 68 * s;
      // 3 sides: Left, Bottom, Right (Top is open for high-tension entry/exit)
      segments.push(
        { id: 'left', color: COLOR_KEYS[0], type: 'line', x1: -size, y1: -size * 0.7, x2: -size, y2: size },
        { id: 'bottom', color: COLOR_KEYS[1], type: 'line', x1: -size, y1: size, x2: size, y2: size },
        { id: 'right', color: COLOR_KEYS[2], type: 'line', x1: size, y1: size, x2: size, y2: -size * 0.7 },
        { id: 'extra', color: COLOR_KEYS[3], type: 'line', x1: -size * 0.4, y1: -size, x2: size * 0.4, y2: -size }
      );
      break;
    }

    case 'v_shape': {
      const h = 70 * s;
      const w = 75 * s;
      // 4 multi-colored segments forming a deep chevron V
      segments.push(
        { id: 'v1', color: COLOR_KEYS[0], type: 'line', x1: -w, y1: -h * 0.6, x2: -w * 0.5, y2: 0 },
        { id: 'v2', color: COLOR_KEYS[1], type: 'line', x1: -w * 0.5, y1: 0, x2: 0, y2: h * 0.7 },
        { id: 'v3', color: COLOR_KEYS[2], type: 'line', x1: 0, y1: h * 0.7, x2: w * 0.5, y2: 0 },
        { id: 'v4', color: COLOR_KEYS[3], type: 'line', x1: w * 0.5, y1: 0, x2: w, y2: -h * 0.6 }
      );
      break;
    }

    case 'inverted_v': {
      const h = 70 * s;
      const w = 75 * s;
      segments.push(
        { id: 'iv1', color: COLOR_KEYS[0], type: 'line', x1: -w, y1: h * 0.6, x2: -w * 0.5, y2: 0 },
        { id: 'iv2', color: COLOR_KEYS[1], type: 'line', x1: -w * 0.5, y1: 0, x2: 0, y2: -h * 0.7 },
        { id: 'iv3', color: COLOR_KEYS[2], type: 'line', x1: 0, y1: -h * 0.7, x2: w * 0.5, y2: 0 },
        { id: 'iv4', color: COLOR_KEYS[3], type: 'line', x1: w * 0.5, y1: 0, x2: w, y2: h * 0.6 }
      );
      break;
    }

    case 'c_shape': {
      const size = 68 * s;
      segments.push(
        { id: 'top', color: COLOR_KEYS[0], type: 'line', x1: size * 0.7, y1: -size, x2: -size, y2: -size },
        { id: 'left', color: COLOR_KEYS[1], type: 'line', x1: -size, y1: -size, x2: -size, y2: size },
        { id: 'bottom', color: COLOR_KEYS[2], type: 'line', x1: -size, y1: size, x2: size * 0.7, y2: size },
        { id: 'inside', color: COLOR_KEYS[3], type: 'line', x1: size * 0.4, y1: -size * 0.3, x2: size * 0.4, y2: size * 0.3 }
      );
      break;
    }

    case 'triangle': {
      const r = 78 * s;
      // 3 equilateral vertices at -90deg, 30deg, 150deg
      const p1 = { x: 0, y: -r };
      const p2 = { x: r * Math.cos(Math.PI / 6), y: r * Math.sin(Math.PI / 6) };
      const p3 = { x: -r * Math.cos(Math.PI / 6), y: r * Math.sin(Math.PI / 6) };

      // Divide 3 sides into 4 colored sections
      const mid1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      segments.push(
        { id: 't1', color: COLOR_KEYS[0], type: 'line', x1: p1.x, y1: p1.y, x2: mid1.x, y2: mid1.y },
        { id: 't2', color: COLOR_KEYS[1], type: 'line', x1: mid1.x, y1: mid1.y, x2: p2.x, y2: p2.y },
        { id: 't3', color: COLOR_KEYS[2], type: 'line', x1: p2.x, y1: p2.y, x2: p3.x, y2: p3.y },
        { id: 't4', color: COLOR_KEYS[3], type: 'line', x1: p3.x, y1: p3.y, x2: p1.x, y2: p1.y }
      );
      break;
    }

    case 'cross': {
      const arm = 75 * s;
      segments.push(
        { id: 'top', color: COLOR_KEYS[0], type: 'line', x1: 0, y1: 0, x2: 0, y2: -arm },
        { id: 'right', color: COLOR_KEYS[1], type: 'line', x1: 0, y1: 0, x2: arm, y2: 0 },
        { id: 'bottom', color: COLOR_KEYS[2], type: 'line', x1: 0, y1: 0, x2: 0, y2: arm },
        { id: 'left', color: COLOR_KEYS[3], type: 'line', x1: 0, y1: 0, x2: -arm, y2: 0 }
      );
      break;
    }

    case 'hexagon': {
      const r = 72 * s;
      for (let i = 0; i < 6; i++) {
        const a1 = (i * Math.PI) / 3;
        const a2 = ((i + 1) * Math.PI) / 3;
        segments.push({
          id: `hex-${i}`,
          color: COLOR_KEYS[i % 4],
          type: 'line',
          x1: r * Math.cos(a1),
          y1: r * Math.sin(a1),
          x2: r * Math.cos(a2),
          y2: r * Math.sin(a2),
        });
      }
      break;
    }

    case 'circle':
    case 'circle_ring': {
      const r = 75 * s;
      // 4 circular quadrants: 0 to 90 deg, 90 to 180 deg, 180 to 270 deg, 270 to 360 deg
      segments.push(
        { id: 'arc-0', color: COLOR_KEYS[0], type: 'arc', radius: r, startAngle: 0, endAngle: Math.PI / 2 },
        { id: 'arc-1', color: COLOR_KEYS[1], type: 'arc', radius: r, startAngle: Math.PI / 2, endAngle: Math.PI },
        { id: 'arc-2', color: COLOR_KEYS[2], type: 'arc', radius: r, startAngle: Math.PI, endAngle: 1.5 * Math.PI },
        { id: 'arc-3', color: COLOR_KEYS[3], type: 'arc', radius: r, startAngle: 1.5 * Math.PI, endAngle: 2 * Math.PI }
      );
      break;
    }

    case 'rounded_square': {
      const size = 66 * s;
      const corner = 18 * s;
      // 4 sides with rounded transition corners matching side colors
      // Top:
      segments.push({ id: 'top', color: COLOR_KEYS[0], type: 'line', x1: -size + corner, y1: -size, x2: size - corner, y2: -size });
      segments.push({ id: 'c-tr', color: COLOR_KEYS[0], type: 'line', x1: size - corner, y1: -size, x2: size, y2: -size + corner });
      // Right:
      segments.push({ id: 'right', color: COLOR_KEYS[1], type: 'line', x1: size, y1: -size + corner, x2: size, y2: size - corner });
      segments.push({ id: 'c-br', color: COLOR_KEYS[1], type: 'line', x1: size, y1: size - corner, x2: size - corner, y2: size });
      // Bottom:
      segments.push({ id: 'bottom', color: COLOR_KEYS[2], type: 'line', x1: size - corner, y1: size, x2: -size + corner, y2: size });
      segments.push({ id: 'c-bl', color: COLOR_KEYS[2], type: 'line', x1: -size + corner, y1: size, x2: -size, y2: size - corner });
      // Left:
      segments.push({ id: 'left', color: COLOR_KEYS[3], type: 'line', x1: -size, y1: size - corner, x2: -size, y2: -size + corner });
      segments.push({ id: 'c-tl', color: COLOR_KEYS[3], type: 'line', x1: -size, y1: -size + corner, x2: -size + corner, y2: -size });
      break;
    }

    case 'octagon': {
      const r = 76 * s;
      for (let i = 0; i < 8; i++) {
        const a1 = (i * 2 * Math.PI) / 8 - Math.PI / 8;
        const a2 = ((i + 1) * 2 * Math.PI) / 8 - Math.PI / 8;
        segments.push({
          id: `oct-${i}`,
          color: COLOR_KEYS[Math.floor(i / 2) % 4],
          type: 'line',
          x1: r * Math.cos(a1),
          y1: r * Math.sin(a1),
          x2: r * Math.cos(a2),
          y2: r * Math.sin(a2),
        });
      }
      break;
    }

    case 'double_ring': {
      const rInner = 55 * s;
      const rOuter = 85 * s;
      // Inner ring (4 quadrants)
      segments.push(
        { id: 'in-0', color: COLOR_KEYS[0], type: 'arc', radius: rInner, startAngle: 0, endAngle: Math.PI / 2 },
        { id: 'in-1', color: COLOR_KEYS[1], type: 'arc', radius: rInner, startAngle: Math.PI / 2, endAngle: Math.PI },
        { id: 'in-2', color: COLOR_KEYS[2], type: 'arc', radius: rInner, startAngle: Math.PI, endAngle: 1.5 * Math.PI },
        { id: 'in-3', color: COLOR_KEYS[3], type: 'arc', radius: rInner, startAngle: 1.5 * Math.PI, endAngle: 2 * Math.PI }
      );
      // Outer ring with shifted colors
      segments.push(
        { id: 'out-0', color: COLOR_KEYS[2], type: 'arc', radius: rOuter, startAngle: 0, endAngle: Math.PI / 2 },
        { id: 'out-1', color: COLOR_KEYS[3], type: 'arc', radius: rOuter, startAngle: Math.PI / 2, endAngle: Math.PI },
        { id: 'out-2', color: COLOR_KEYS[0], type: 'arc', radius: rOuter, startAngle: Math.PI, endAngle: 1.5 * Math.PI },
        { id: 'out-3', color: COLOR_KEYS[1], type: 'arc', radius: rOuter, startAngle: 1.5 * Math.PI, endAngle: 2 * Math.PI }
      );
      break;
    }

    case 'concentric_square': {
      const size1 = 50 * s;
      const size2 = 80 * s;
      segments.push(
        { id: 's1-top', color: COLOR_KEYS[0], type: 'line', x1: -size1, y1: -size1, x2: size1, y2: -size1 },
        { id: 's1-right', color: COLOR_KEYS[1], type: 'line', x1: size1, y1: -size1, x2: size1, y2: size1 },
        { id: 's1-bot', color: COLOR_KEYS[2], type: 'line', x1: size1, y1: size1, x2: -size1, y2: size1 },
        { id: 's1-left', color: COLOR_KEYS[3], type: 'line', x1: -size1, y1: size1, x2: -size1, y2: -size1 },
        { id: 's2-top', color: COLOR_KEYS[2], type: 'line', x1: -size2, y1: -size2, x2: size2, y2: -size2 },
        { id: 's2-right', color: COLOR_KEYS[3], type: 'line', x1: size2, y1: -size2, x2: size2, y2: size2 },
        { id: 's2-bot', color: COLOR_KEYS[0], type: 'line', x1: size2, y1: size2, x2: -size2, y2: size2 },
        { id: 's2-left', color: COLOR_KEYS[1], type: 'line', x1: -size2, y1: size2, x2: -size2, y2: -size2 }
      );
      break;
    }

    case 'horizontal_bars': {
      const len = 42 * s;
      const yOff = 0;
      // 4 horizontal sections in a line row across the lane
      segments.push(
        { id: 'hb-0', color: COLOR_KEYS[0], type: 'line', x1: -len * 2, y1: yOff, x2: -len, y2: yOff },
        { id: 'hb-1', color: COLOR_KEYS[1], type: 'line', x1: -len, y1: yOff, x2: 0, y2: yOff },
        { id: 'hb-2', color: COLOR_KEYS[2], type: 'line', x1: 0, y1: yOff, x2: len, y2: yOff },
        { id: 'hb-3', color: COLOR_KEYS[3], type: 'line', x1: len, y1: yOff, x2: len * 2, y2: yOff }
      );
      break;
    }

    case 'star_polygon': {
      const rOut = 80 * s;
      const rIn = 45 * s;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 8; i++) {
        const a1 = (i * 2 * Math.PI) / 8;
        const a2 = ((i * 2 + 1) * Math.PI) / 8;
        pts.push({ x: rOut * Math.cos(a1), y: rOut * Math.sin(a1) });
        pts.push({ x: rIn * Math.cos(a2), y: rIn * Math.sin(a2) });
      }
      for (let i = 0; i < pts.length; i++) {
        const next = pts[(i + 1) % pts.length];
        segments.push({
          id: `star-${i}`,
          color: COLOR_KEYS[i % 4],
          type: 'line',
          x1: pts[i].x,
          y1: pts[i].y,
          x2: next.x,
          y2: next.y,
        });
      }
      break;
    }

    default: {
      const size = 65 * s;
      segments.push(
        { id: 'top', color: COLOR_KEYS[0], type: 'line', x1: -size, y1: -size, x2: size, y2: -size },
        { id: 'right', color: COLOR_KEYS[1], type: 'line', x1: size, y1: -size, x2: size, y2: size },
        { id: 'bottom', color: COLOR_KEYS[2], type: 'line', x1: size, y1: size, x2: -size, y2: size },
        { id: 'left', color: COLOR_KEYS[3], type: 'line', x1: -size, y1: size, x2: -size, y2: -size }
      );
      break;
    }
  }

  return segments;
}

/**
 * Check if the ball collides with any segment in the obstacle.
 * Returns:
 *   - 'safe': ball is either not colliding, or colliding ONLY with a segment of the SAME color.
 *   - 'mismatch': ball is colliding with a segment of a DIFFERENT color!
 */
export function checkObstacleCollision(
  ballWorldX: number,
  ballWorldY: number,
  ballRadius: number,
  ballColor: CrazyColor,
  obstacleCenterX: number,
  obstacleCenterY: number,
  rotation: number,
  segments: ColoredSegment[]
): 'safe' | 'mismatch' {
  // Transform ball into local coordinate space of obstacle (rotate by -rotation)
  const dx = ballWorldX - obstacleCenterX;
  const dy = ballWorldY - obstacleCenterY;
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  const halfThick = GAME_PHYSICS.SEGMENT_THICKNESS / 2;
  const hitRadius = ballRadius + halfThick;

  for (const seg of segments) {
    let collides = false;

    if (seg.type === 'line' && seg.x1 !== undefined && seg.y1 !== undefined && seg.x2 !== undefined && seg.y2 !== undefined) {
      collides = pointToSegmentDistance(localX, localY, seg.x1, seg.y1, seg.x2, seg.y2) <= hitRadius;
    } else if (seg.type === 'arc' && seg.radius !== undefined && seg.startAngle !== undefined && seg.endAngle !== undefined) {
      collides = pointToArcDistance(localX, localY, seg.radius, seg.startAngle, seg.endAngle, halfThick, ballRadius);
    }

    if (collides) {
      if (seg.color !== ballColor) {
        return 'mismatch'; // Fatal collision with wrong color!
      }
      // If matching color, ball can safely pass through!
    }
  }

  return 'safe';
}

/**
 * Distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
 */
function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  // Projection parameter t
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(px - projX, py - projY);
}

/**
 * Check collision between point and arc segment
 */
function pointToArcDistance(
  px: number,
  py: number,
  arcRadius: number,
  startAngle: number,
  endAngle: number,
  halfThick: number,
  ballRadius: number
): boolean {
  const dist = Math.hypot(px, py);
  // Must be near the arc radius ring
  if (Math.abs(dist - arcRadius) > halfThick + ballRadius) {
    return false;
  }

  // Check angle
  let angle = Math.atan2(py, px);
  if (angle < 0) angle += 2 * Math.PI;

  let s = startAngle % (2 * Math.PI);
  let e = endAngle % (2 * Math.PI);
  if (s < 0) s += 2 * Math.PI;
  if (e < 0) e += 2 * Math.PI;

  if (s <= e) {
    return angle >= s && angle <= e;
  } else {
    // Wrap around 2*PI
    return angle >= s || angle <= e;
  }
}

/**
 * Shape Difficulty Bonus lookup
 * Simple/common shapes: 0
 * Less common / medium shapes: +2
 * Difficult / complex shapes: +4
 * Master / high-precision shapes: +5
 */
export function getShapeDifficultyBonus(shapeType: ShapeType): number {
  switch (shapeType) {
    case 'circle':
    case 'circle_ring':
    case 'square':
    case 'rotated_square':
      return 0; // Standard baseline
    case 'rounded_square':
    case 'rectangle':
    case 'diamond':
    case 'triangle':
    case 'open_square':
    case 'u_shape':
    case 'c_shape':
      return 2; // Medium difficulty
    case 'hexagon':
    case 'octagon':
    case 'v_shape':
    case 'inverted_v':
    case 'cross':
      return 4; // Difficult shape
    case 'star_polygon':
    case 'double_ring':
    case 'concentric_square':
    case 'horizontal_bars':
      return 5; // Master complexity
    default:
      return 0;
  }
}
