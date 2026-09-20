/**
 * Crazy Colors 40-Level Championship Campaign
 * Progressive competitive difficulty from Level 1 (Hard, 10 color passes) to Level 40 (Final Challenge, 30 passes).
 * Every level features finite obstacles, diverse geometry (including Circle, Rounded Square, Octagon, Star, Diamond, etc.),
 * rotations, oscillations, and calibrated star thresholds matching competitive scoring.
 */

import { LevelDefinition, CrazyColor, ShapeType } from './types';

interface ObstacleDef {
  shapeType: ShapeType;
  rotationSpeed: number; // rad/s
  scale?: number;
  oscillationX?: { amplitude: number; speed: number };
}

// 4-tier difficulty categories
const TIER_NAMES: LevelDefinition['difficulty'][] = [
  'hard',
  'very_hard',
  'very_hard+',
  'expert',
  'expert+',
  'extreme',
  'master',
  'master+',
  'final_challenge',
];

const LEVEL_THEMES: Array<{
  title: string;
  description: string;
  startColor: CrazyColor;
  shapes: ShapeType[];
}> = [
  // 1-5: TIER 1 - HARD (10 to 18 passes)
  {
    title: 'Circle & Diamond Gateway',
    description: 'Master the 10-pass introductory championship course featuring vibrant circles, rounded squares, and diamonds.',
    startColor: 'pink',
    shapes: ['circle', 'rotated_square', 'circle_ring', 'square', 'rounded_square', 'diamond', 'circle', 'triangle', 'rounded_square', 'circle_ring'],
  },
  {
    title: 'Open U-Corridor',
    description: '12 rotating gates including open U-shapes, circles, and rounded squares with offset phases.',
    startColor: 'cyan',
    shapes: ['u_shape', 'circle', 'open_square', 'diamond', 'rounded_square', 'rotated_square', 'circle_ring', 'u_shape', 'triangle', 'square', 'circle', 'rounded_square'],
  },
  {
    title: 'Neon Chevrons & Rings',
    description: '14 intense obstacles featuring sharp V-chevrons, circles, and diamond barriers.',
    startColor: 'yellow',
    shapes: ['v_shape', 'circle', 'inverted_v', 'rounded_square', 'diamond', 'circle_ring', 'triangle', 'v_shape', 'rotated_square', 'inverted_v', 'circle', 'rectangle', 'u_shape', 'rounded_square'],
  },
  {
    title: 'Hexagonal Vault',
    description: '16 diverse geometric barriers incorporating 6-segment hexagons, circles, and rectangles.',
    startColor: 'purple',
    shapes: ['circle_ring', 'rounded_square', 'hexagon', 'diamond', 'circle', 'open_square', 'triangle', 'c_shape', 'rectangle', 'circle_ring', 'rotated_square', 'v_shape', 'hexagon', 'circle', 'rounded_square', 'diamond'],
  },
  {
    title: 'Octagonal Crossfire',
    description: '18 high-intensity obstacles featuring octagons, 4-arm crosses, and double concentric rings.',
    startColor: 'pink',
    shapes: ['octagon', 'circle', 'cross', 'rounded_square', 'hexagon', 'diamond', 'circle_ring', 'octagon', 'v_shape', 'inverted_v', 'square', 'circle', 'triangle', 'double_ring', 'c_shape', 'cross', 'rounded_square', 'circle_ring'],
  },

  // 6-10: TIER 2 - VERY HARD (18 to 22 passes)
  {
    title: 'Rectangular Pulse',
    description: '18 elongated gates and rotating circle arcs with sudden rhythm shifts.',
    startColor: 'cyan',
    shapes: ['rectangle', 'circle', 'u_shape', 'rounded_square', 'circle_ring', 'diamond', 'hexagon', 'octagon', 'rectangle', 'circle', 'triangle', 'rotated_square', 'v_shape', 'circle_ring', 'cross', 'rounded_square', 'rectangle', 'circle'],
  },
  {
    title: 'Inverted Chevrons & Octagons',
    description: '20 sharp inverted chevrons and octagonal rings with tighter entry clearances.',
    startColor: 'yellow',
    shapes: ['inverted_v', 'circle', 'v_shape', 'octagon', 'diamond', 'rounded_square', 'circle_ring', 'inverted_v', 'hexagon', 'triangle', 'circle', 'v_shape', 'square', 'octagon', 'rounded_square', 'circle_ring', 'cross', 'diamond', 'inverted_v', 'circle'],
  },
  {
    title: 'Curved C-Locks',
    description: '20 open C-shapes, circles, and diamond barriers with oscillating patterns.',
    startColor: 'purple',
    shapes: ['c_shape', 'circle', 'triangle', 'rounded_square', 'c_shape', 'rotated_square', 'hexagon', 'circle_ring', 'diamond', 'octagon', 'c_shape', 'circle', 'cross', 'rounded_square', 'v_shape', 'circle_ring', 'triangle', 'c_shape', 'double_ring', 'circle'],
  },
  {
    title: 'Neon Crossfire Array',
    description: '22 spinning neon cross arms and concentric geometries requiring rapid color recognition.',
    startColor: 'pink',
    shapes: ['cross', 'circle_ring', 'circle', 'rounded_square', 'rectangle', 'octagon', 'cross', 'diamond', 'triangle', 'circle', 'hexagon', 'v_shape', 'cross', 'circle_ring', 'rounded_square', 'concentric_square', 'inverted_v', 'circle', 'octagon', 'cross', 'diamond', 'circle'],
  },
  {
    title: 'Concentric Ring Gauntlet',
    description: '22 dual concentric rings and high-speed polygon gates spinning in counter-rotation.',
    startColor: 'cyan',
    shapes: ['double_ring', 'circle', 'diamond', 'rounded_square', 'concentric_square', 'v_shape', 'octagon', 'circle_ring', 'double_ring', 'triangle', 'circle', 'cross', 'hexagon', 'rounded_square', 'double_ring', 'inverted_v', 'circle', 'star_polygon', 'diamond', 'octagon', 'double_ring', 'circle'],
  },

  // 11-15: TIER 3 - VERY HARD+ (22 passes)
  {
    title: 'Hexagonal Prisms',
    description: '22 six-segment prisms and circular gates with accelerated orbital rotation.',
    startColor: 'yellow',
    shapes: ['hexagon', 'circle', 'triangle', 'rounded_square', 'hexagon', 'circle_ring', 'octagon', 'diamond', 'hexagon', 'v_shape', 'cross', 'circle', 'concentric_square', 'rounded_square', 'hexagon', 'double_ring', 'inverted_v', 'circle_ring', 'octagon', 'hexagon', 'diamond', 'circle'],
  },
  {
    title: 'Nested Squares Matrix',
    description: '22 nested inner and outer squares rotating with rapid phase shifts.',
    startColor: 'purple',
    shapes: ['concentric_square', 'circle', 'u_shape', 'rounded_square', 'concentric_square', 'inverted_v', 'octagon', 'circle_ring', 'concentric_square', 'triangle', 'cross', 'circle', 'hexagon', 'diamond', 'concentric_square', 'v_shape', 'circle_ring', 'rounded_square', 'double_ring', 'concentric_square', 'circle', 'star_polygon'],
  },
  {
    title: 'Star Polygon Nebula',
    description: '22 eight-pointed stars and octagons with sharp perimeter segments.',
    startColor: 'pink',
    shapes: ['star_polygon', 'circle', 'cross', 'rounded_square', 'star_polygon', 'diamond', 'octagon', 'circle_ring', 'star_polygon', 'hexagon', 'triangle', 'circle', 'concentric_square', 'v_shape', 'star_polygon', 'double_ring', 'rounded_square', 'inverted_v', 'circle_ring', 'star_polygon', 'octagon', 'circle'],
  },
  {
    title: 'Oscillating Diamond Drift',
    description: '22 diamonds and circular barriers floating with horizontal harmonic sway.',
    startColor: 'cyan',
    shapes: ['diamond', 'circle', 'rectangle', 'rounded_square', 'octagon', 'circle_ring', 'diamond', 'v_shape', 'cross', 'circle', 'hexagon', 'concentric_square', 'diamond', 'inverted_v', 'triangle', 'double_ring', 'rounded_square', 'diamond', 'circle_ring', 'octagon', 'star_polygon', 'circle'],
  },
  {
    title: 'Crosshair Synchrony',
    description: '22 spinning 4-point crosshairs paired with concentric rings.',
    startColor: 'yellow',
    shapes: ['cross', 'circle', 'double_ring', 'rounded_square', 'octagon', 'circle_ring', 'cross', 'diamond', 'triangle', 'circle', 'concentric_square', 'v_shape', 'cross', 'hexagon', 'rounded_square', 'inverted_v', 'circle_ring', 'cross', 'star_polygon', 'circle', 'octagon', 'double_ring'],
  },

  // 16-20: TIER 4 - EXPERT (24 passes)
  {
    title: 'Double Trouble Rings',
    description: '24 counter-rotating dual rings and rapid geometric gates.',
    startColor: 'purple',
    shapes: ['double_ring', 'circle', 'diamond', 'rounded_square', 'double_ring', 'v_shape', 'octagon', 'circle_ring', 'cross', 'hexagon', 'circle', 'concentric_square', 'double_ring', 'triangle', 'rounded_square', 'inverted_v', 'star_polygon', 'circle_ring', 'double_ring', 'octagon', 'circle', 'cross', 'diamond', 'double_ring'],
  },
  {
    title: 'Acute Delta Array',
    description: '24 razor-sharp rotating equilateral triangles and high-speed circles.',
    startColor: 'pink',
    shapes: ['triangle', 'circle', 'octagon', 'rounded_square', 'triangle', 'cross', 'circle_ring', 'diamond', 'hexagon', 'v_shape', 'circle', 'triangle', 'concentric_square', 'inverted_v', 'rounded_square', 'double_ring', 'triangle', 'star_polygon', 'circle_ring', 'octagon', 'circle', 'cross', 'diamond', 'triangle'],
  },
  {
    title: 'Concentric Vortex',
    description: '24 alternating nested squares and double rings testing spatial prediction.',
    startColor: 'cyan',
    shapes: ['concentric_square', 'circle', 'double_ring', 'rounded_square', 'octagon', 'circle_ring', 'concentric_square', 'diamond', 'cross', 'circle', 'hexagon', 'star_polygon', 'concentric_square', 'v_shape', 'rounded_square', 'inverted_v', 'circle_ring', 'double_ring', 'circle', 'octagon', 'triangle', 'concentric_square', 'cross', 'circle'],
  },
  {
    title: 'Quantum Octagon Field',
    description: '24 octagonal chambers spinning in high synchronization.',
    startColor: 'yellow',
    shapes: ['octagon', 'circle', 'star_polygon', 'rounded_square', 'octagon', 'cross', 'circle_ring', 'diamond', 'double_ring', 'hexagon', 'circle', 'octagon', 'concentric_square', 'v_shape', 'rounded_square', 'inverted_v', 'circle_ring', 'triangle', 'octagon', 'circle', 'cross', 'star_polygon', 'diamond', 'octagon'],
  },
  {
    title: 'Expert Tier Apex',
    description: '24 pinnacle expert obstacles requiring flawless color matching and rapid bounce control.',
    startColor: 'purple',
    shapes: ['star_polygon', 'circle', 'double_ring', 'rounded_square', 'concentric_square', 'octagon', 'circle_ring', 'cross', 'hexagon', 'diamond', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'double_ring', 'star_polygon', 'circle_ring', 'octagon', 'cross', 'circle', 'concentric_square', 'triangle', 'diamond', 'star_polygon'],
  },

  // 21-25: TIER 5 - EXPERT+ (24 passes)
  {
    title: 'Harmonic Drift Nexus',
    description: '24 obstacles with wide lateral oscillations and variable angular velocities.',
    startColor: 'pink',
    shapes: ['circle', 'diamond', 'octagon', 'rounded_square', 'double_ring', 'circle_ring', 'cross', 'hexagon', 'concentric_square', 'star_polygon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'octagon', 'cross', 'circle_ring', 'double_ring', 'diamond', 'circle', 'triangle', 'star_polygon', 'concentric_square', 'circle'],
  },
  {
    title: 'Prismatic Hex Gauntlet',
    description: '24 multi-segment hexagonal and octagonal gates demanding acute split-second timing.',
    startColor: 'cyan',
    shapes: ['hexagon', 'circle', 'octagon', 'rounded_square', 'hexagon', 'cross', 'circle_ring', 'diamond', 'star_polygon', 'double_ring', 'circle', 'hexagon', 'concentric_square', 'v_shape', 'rounded_square', 'inverted_v', 'circle_ring', 'octagon', 'hexagon', 'circle', 'cross', 'diamond', 'star_polygon', 'hexagon'],
  },
  {
    title: 'Dual Chevron Storm',
    description: '24 alternating V-chevrons and high-speed circular rings.',
    startColor: 'yellow',
    shapes: ['v_shape', 'circle', 'inverted_v', 'rounded_square', 'octagon', 'circle_ring', 'v_shape', 'cross', 'diamond', 'double_ring', 'circle', 'inverted_v', 'concentric_square', 'hexagon', 'rounded_square', 'v_shape', 'circle_ring', 'star_polygon', 'inverted_v', 'circle', 'octagon', 'cross', 'diamond', 'circle'],
  },
  {
    title: 'Serrated Star Array',
    description: '24 8-pointed star perimeters rotating at high velocity.',
    startColor: 'purple',
    shapes: ['star_polygon', 'circle', 'cross', 'rounded_square', 'octagon', 'circle_ring', 'star_polygon', 'diamond', 'double_ring', 'hexagon', 'circle', 'concentric_square', 'star_polygon', 'v_shape', 'rounded_square', 'inverted_v', 'circle_ring', 'star_polygon', 'circle', 'octagon', 'cross', 'diamond', 'double_ring', 'star_polygon'],
  },
  {
    title: 'Concentric Labyrinth',
    description: '24 dual-ring and double-square barriers with overlapping colored arms.',
    startColor: 'pink',
    shapes: ['concentric_square', 'circle', 'double_ring', 'rounded_square', 'octagon', 'circle_ring', 'cross', 'diamond', 'concentric_square', 'star_polygon', 'circle', 'hexagon', 'double_ring', 'v_shape', 'rounded_square', 'inverted_v', 'circle_ring', 'concentric_square', 'circle', 'octagon', 'cross', 'double_ring', 'diamond', 'concentric_square'],
  },

  // 26-30: TIER 6 - EXTREME (26 passes)
  {
    title: 'Velocity Shift Matrix',
    description: '26 high-speed shapes featuring abrupt rotational direction inversions.',
    startColor: 'cyan',
    shapes: ['circle', 'octagon', 'double_ring', 'rounded_square', 'star_polygon', 'circle_ring', 'cross', 'diamond', 'concentric_square', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'octagon', 'double_ring', 'circle_ring', 'star_polygon', 'cross', 'circle', 'triangle', 'concentric_square', 'diamond', 'hexagon', 'octagon', 'circle'],
  },
  {
    title: 'Synchronized Chaos',
    description: '26 multi-directional rotating obstacles with synchronized sinusoidal sway.',
    startColor: 'yellow',
    shapes: ['octagon', 'circle', 'cross', 'rounded_square', 'star_polygon', 'circle_ring', 'diamond', 'double_ring', 'hexagon', 'concentric_square', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'octagon', 'cross', 'circle_ring', 'star_polygon', 'double_ring', 'circle', 'diamond', 'hexagon', 'concentric_square', 'triangle', 'octagon', 'circle'],
  },
  {
    title: 'Starfall Velocity',
    description: '26 rapid star polygons and concentric rings with zero room for error.',
    startColor: 'purple',
    shapes: ['star_polygon', 'circle', 'double_ring', 'rounded_square', 'octagon', 'circle_ring', 'cross', 'diamond', 'concentric_square', 'star_polygon', 'circle', 'hexagon', 'v_shape', 'rounded_square', 'inverted_v', 'double_ring', 'circle_ring', 'star_polygon', 'octagon', 'circle', 'cross', 'concentric_square', 'diamond', 'star_polygon', 'hexagon', 'circle'],
  },
  {
    title: 'Quantum Gauntlet',
    description: '26 hyper-precision geometric shapes rotating at maximum stable speed.',
    startColor: 'pink',
    shapes: ['double_ring', 'circle', 'concentric_square', 'rounded_square', 'star_polygon', 'circle_ring', 'octagon', 'cross', 'diamond', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'double_ring', 'concentric_square', 'circle_ring', 'star_polygon', 'octagon', 'circle', 'cross', 'diamond', 'hexagon', 'double_ring', 'star_polygon', 'circle'],
  },
  {
    title: 'Extreme Apex',
    description: '26 relentless obstacles. The decisive filter before the Master Tiers.',
    startColor: 'cyan',
    shapes: ['star_polygon', 'circle', 'double_ring', 'rounded_square', 'octagon', 'concentric_square', 'circle_ring', 'cross', 'diamond', 'hexagon', 'circle', 'star_polygon', 'v_shape', 'inverted_v', 'rounded_square', 'double_ring', 'circle_ring', 'octagon', 'concentric_square', 'circle', 'cross', 'diamond', 'star_polygon', 'hexagon', 'double_ring', 'circle'],
  },

  // 31-35: TIER 7 - MASTER (28 passes)
  {
    title: 'Master Harmonic Gate',
    description: '28 master-tier obstacles featuring horizontal drift and complex geometries.',
    startColor: 'yellow',
    shapes: ['circle', 'octagon', 'double_ring', 'rounded_square', 'concentric_square', 'star_polygon', 'circle_ring', 'cross', 'diamond', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'octagon', 'double_ring', 'circle_ring', 'concentric_square', 'star_polygon', 'circle', 'cross', 'diamond', 'hexagon', 'triangle', 'double_ring', 'octagon', 'star_polygon', 'circle'],
  },
  {
    title: 'Oscillating Octagon Web',
    description: '28 octagonal and star barriers moving with opposing harmonic trajectories.',
    startColor: 'purple',
    shapes: ['octagon', 'circle', 'star_polygon', 'rounded_square', 'double_ring', 'circle_ring', 'concentric_square', 'cross', 'diamond', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'octagon', 'star_polygon', 'circle_ring', 'double_ring', 'concentric_square', 'circle', 'cross', 'diamond', 'octagon', 'star_polygon', 'hexagon', 'double_ring', 'octagon', 'circle'],
  },
  {
    title: 'Chrono Ring Inversion',
    description: '28 concentric rings and sharp polygons alternating rotation directions.',
    startColor: 'pink',
    shapes: ['double_ring', 'circle', 'concentric_square', 'rounded_square', 'octagon', 'circle_ring', 'star_polygon', 'cross', 'diamond', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'double_ring', 'concentric_square', 'circle_ring', 'octagon', 'star_polygon', 'circle', 'cross', 'diamond', 'hexagon', 'double_ring', 'concentric_square', 'octagon', 'star_polygon', 'circle'],
  },
  {
    title: 'Starlight Labyrinth',
    description: '28 complex star polygons and multi-layered geometries demanding acute rhythm.',
    startColor: 'cyan',
    shapes: ['star_polygon', 'circle', 'double_ring', 'rounded_square', 'octagon', 'circle_ring', 'concentric_square', 'cross', 'diamond', 'hexagon', 'circle', 'star_polygon', 'v_shape', 'inverted_v', 'rounded_square', 'double_ring', 'circle_ring', 'octagon', 'concentric_square', 'circle', 'star_polygon', 'cross', 'diamond', 'hexagon', 'double_ring', 'star_polygon', 'octagon', 'circle'],
  },
  {
    title: 'The Master Vanguard',
    description: '28 high-velocity barriers testing stamina and instant color identification.',
    startColor: 'yellow',
    shapes: ['concentric_square', 'circle', 'star_polygon', 'rounded_square', 'double_ring', 'circle_ring', 'octagon', 'cross', 'diamond', 'hexagon', 'circle', 'concentric_square', 'v_shape', 'inverted_v', 'rounded_square', 'star_polygon', 'circle_ring', 'double_ring', 'octagon', 'circle', 'cross', 'diamond', 'hexagon', 'concentric_square', 'star_polygon', 'double_ring', 'octagon', 'circle'],
  },

  // 36-40: TIER 8 & 9 - MASTER+ & FINAL CHALLENGE (28 to 30 passes)
  {
    title: 'Hyper Velocity Gauntlet',
    description: '28 ultra-fast rotating barriers pushing reaction times to the physical limit.',
    startColor: 'purple',
    shapes: ['double_ring', 'circle', 'star_polygon', 'rounded_square', 'octagon', 'concentric_square', 'circle_ring', 'cross', 'diamond', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'double_ring', 'star_polygon', 'circle_ring', 'octagon', 'concentric_square', 'circle', 'cross', 'diamond', 'hexagon', 'double_ring', 'star_polygon', 'octagon', 'concentric_square', 'circle'],
  },
  {
    title: 'Harmonic Chevron Apex',
    description: '28 synchronized chevrons and concentric rings drifting horizontally in counter-phase.',
    startColor: 'pink',
    shapes: ['v_shape', 'circle', 'inverted_v', 'rounded_square', 'double_ring', 'circle_ring', 'star_polygon', 'octagon', 'concentric_square', 'cross', 'circle', 'diamond', 'hexagon', 'rounded_square', 'v_shape', 'inverted_v', 'circle_ring', 'double_ring', 'star_polygon', 'circle', 'octagon', 'concentric_square', 'cross', 'diamond', 'v_shape', 'inverted_v', 'double_ring', 'circle'],
  },
  {
    title: 'Hyper Harmonic Drift',
    description: '30 high-velocity shapes with harmonic lateral drift across the central vertical axis.',
    startColor: 'cyan',
    shapes: ['star_polygon', 'circle', 'double_ring', 'rounded_square', 'octagon', 'circle_ring', 'concentric_square', 'cross', 'diamond', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'star_polygon', 'double_ring', 'circle_ring', 'octagon', 'concentric_square', 'circle', 'cross', 'diamond', 'hexagon', 'star_polygon', 'double_ring', 'octagon', 'concentric_square', 'circle', 'star_polygon', 'circle'],
  },
  {
    title: 'Championship Gate',
    description: '30 high-tier shapes in grueling succession before the Grand Finale.',
    startColor: 'yellow',
    shapes: ['concentric_square', 'circle', 'double_ring', 'rounded_square', 'star_polygon', 'circle_ring', 'octagon', 'cross', 'diamond', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'concentric_square', 'double_ring', 'circle_ring', 'star_polygon', 'octagon', 'circle', 'cross', 'diamond', 'hexagon', 'concentric_square', 'double_ring', 'star_polygon', 'octagon', 'circle', 'cross', 'circle'],
  },
  {
    title: 'Crazy Colors Grandmaster',
    description: 'The ultimate 30-obstacle championship course! Conquer all 30 color passes to become the undisputed Crazy Colors Grandmaster!',
    startColor: 'purple',
    shapes: ['double_ring', 'circle', 'star_polygon', 'rounded_square', 'concentric_square', 'circle_ring', 'octagon', 'cross', 'diamond', 'hexagon', 'circle', 'v_shape', 'inverted_v', 'rounded_square', 'double_ring', 'star_polygon', 'circle_ring', 'octagon', 'concentric_square', 'circle', 'cross', 'diamond', 'hexagon', 'double_ring', 'star_polygon', 'octagon', 'concentric_square', 'circle', 'star_polygon', 'double_ring'],
  },
];

export const CRAZY_COLORS_LEVELS: LevelDefinition[] = LEVEL_THEMES.map((theme, index) => {
  const levelId = index + 1;
  const tierIndex = Math.min(TIER_NAMES.length - 1, Math.floor((levelId - 1) / 5));
  const difficulty = TIER_NAMES[tierIndex];

  // Base rotation speed starts at 1.25 rad/s and scales up to 3.2 rad/s
  const baseSpeed = 1.25 + (levelId - 1) * 0.05;

  const obstacles: ObstacleDef[] = theme.shapes.map((shapeType, shapeIdx) => {
    // Alternating rotation directions with slight speed variance
    const dir = shapeIdx % 2 === 0 ? 1 : -1;
    const speedVariation = 0.05 * (shapeIdx % 3);
    const rotationSpeed = +(dir * (baseSpeed + speedVariation)).toFixed(2);

    const obs: ObstacleDef = {
      shapeType,
      rotationSpeed,
      scale: 1.0,
    };

    // For levels 10 and above, add slight horizontal oscillation on select obstacles
    if (levelId >= 10 && shapeIdx % 4 === 2) {
      const amp = Math.min(45, 20 + (levelId - 10) * 0.8);
      const oscSpeed = +(1.5 + (levelId - 10) * 0.05).toFixed(2);
      obs.oscillationX = { amplitude: amp, speed: oscSpeed };
    }

    return obs;
  });

  // Calculate star thresholds based on level multiplier and number of obstacles
  // Estimated average points per pass = 22 * levelMultiplier
  // Level completion perfect accuracy bonus = 100 * levelMultiplier
  const levelMultiplier = 1.0 + (levelId - 1) * 0.05;
  const estimatedPassScore = 22 * levelMultiplier;
  const maxPossible = Math.round(obstacles.length * estimatedPassScore + 100 * levelMultiplier);

  const starThresholds: [number, number, number, number, number] = [
    Math.round(maxPossible * 0.35),
    Math.round(maxPossible * 0.50),
    Math.round(maxPossible * 0.65),
    Math.round(maxPossible * 0.80),
    Math.round(maxPossible * 0.95),
  ];

  return {
    id: levelId,
    title: theme.title,
    difficulty,
    description: theme.description,
    obstacles,
    startColor: theme.startColor,
    starThresholds,
  };
});
