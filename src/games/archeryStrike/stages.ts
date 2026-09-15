import { StageDefinition } from './types';

/**
 * 10 Progressive Tournament Stages with distinct challenges, distances, multi-targets, and movement.
 */
export const ARCHERY_STAGES: StageDefinition[] = [
  // STAGE 1: One medium target, 30m, basic aiming challenge
  {
    stageNumber: 1,
    title: 'Stage 1: Opening Volley',
    subtitle: 'Standard 30m Range',
    description: 'Medium target at 30m with light breeze. Test your draw and sight alignment.',
    targetDistance: 30,
    targetScale: 1.0,
    wind: {
      speed: 1.2,
      directionDegrees: 90, // gentle wind to right
      label: 'Light Breeze',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's1-main',
        x: 0,
        y: 1.5,
        z: 30,
        radius: 0.9,
        label: '30m',
      },
    ],
  },

  // STAGE 2: Target farther away (40m), smaller scoring area
  {
    stageNumber: 2,
    title: 'Stage 2: Extended Distance',
    subtitle: '40m Deep Range',
    description: 'Distance increased to 40m. Account for increased ballistic gravity drop.',
    targetDistance: 40,
    targetScale: 0.9,
    wind: {
      speed: 2.4,
      directionDegrees: 270, // wind to left
      label: 'Steady Crosswind',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's2-main',
        x: 0,
        y: 1.5,
        z: 40,
        radius: 0.82,
        label: '40m',
      },
    ],
  },

  // STAGE 3: Elevated Hill Target (45m, high position)
  {
    stageNumber: 3,
    title: 'Stage 3: High Ridge',
    subtitle: '45m Elevated Crest',
    description: 'Target placed on an elevated platform. Aim higher to clear the incline.',
    targetDistance: 45,
    targetScale: 0.85,
    wind: {
      speed: 3.1,
      directionDegrees: 45, // diagonal up-right
      label: 'Ridge Updraft',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's3-high',
        x: 0,
        y: 3.2,
        z: 45,
        radius: 0.8,
        label: '45m Ridge',
      },
    ],
  },

  // STAGE 4: Dual Targets (35m Left & 45m Right)
  {
    stageNumber: 4,
    title: 'Stage 4: Dual Lane Challenge',
    subtitle: 'Two Staggered Targets',
    description: 'Two targets positioned across the range. Pick your mark with precision.',
    targetDistance: 45,
    targetScale: 0.8,
    wind: {
      speed: 3.8,
      directionDegrees: 180, // tailwind
      label: 'Tailwind Gust',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's4-left',
        x: -2.8,
        y: 1.5,
        z: 35,
        radius: 0.75,
        label: '35m Left',
      },
      {
        id: 's4-right',
        x: 2.6,
        y: 1.7,
        z: 45,
        radius: 0.8,
        label: '45m Right',
      },
    ],
  },

  // STAGE 5: Staggered Depth (Near 30m + Far 55m)
  {
    stageNumber: 5,
    title: 'Stage 5: Depth Stagger',
    subtitle: '30m Near & 55m Deep',
    description: 'Targets spaced in severe depth. Target the far mark for maximum score potential.',
    targetDistance: 55,
    targetScale: 0.78,
    wind: {
      speed: 4.2,
      directionDegrees: 75,
      label: 'Gusting Breeze',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's5-near',
        x: -3.2,
        y: 1.4,
        z: 30,
        radius: 0.75,
        label: '30m Near',
      },
      {
        id: 's5-far',
        x: 1.5,
        y: 1.6,
        z: 55,
        radius: 0.85,
        label: '55m Long',
      },
    ],
  },

  // STAGE 6: Small Precision Target (50m)
  {
    stageNumber: 6,
    title: 'Stage 6: Precision Compact',
    subtitle: '50m Compact Bullseye',
    description: 'Reduced target diameter at 50m. Only pristine center grouping will score high.',
    targetDistance: 50,
    targetScale: 0.65,
    wind: {
      speed: 4.8,
      directionDegrees: 255,
      label: 'Strong Crosswind',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's6-compact',
        x: 0,
        y: 1.6,
        z: 50,
        radius: 0.62,
        label: '50m Compact',
      },
    ],
  },

  // STAGE 7: Horizontally Moving Target (45m)
  {
    stageNumber: 7,
    title: 'Stage 7: Moving Trajectory',
    subtitle: '45m Moving Target Track',
    description: 'Target moves left and right on an automated rail. Lead your shot to hit bullseye.',
    targetDistance: 45,
    targetScale: 0.8,
    isMovingTarget: true,
    wind: {
      speed: 3.5,
      directionDegrees: 120,
      label: 'Shifting Airflow',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's7-moving',
        x: 0,
        y: 1.5,
        z: 45,
        radius: 0.8,
        isMoving: true,
        moveSpeed: 1.6,
        moveRange: 3.2,
        moveAxis: 'x',
        label: '45m Moving',
      },
    ],
  },

  // STAGE 8: Triple Target Formation (Staggered Lanes)
  {
    stageNumber: 8,
    title: 'Stage 8: Triple Formation',
    subtitle: '3 Staggered Range Positions',
    description: 'Three targets arranged in a triangular battery at 35m, 50m, and 60m.',
    targetDistance: 60,
    targetScale: 0.75,
    wind: {
      speed: 5.5,
      directionDegrees: 290,
      label: 'High Winds',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's8-left',
        x: -3.5,
        y: 1.4,
        z: 35,
        radius: 0.75,
        label: '35m',
      },
      {
        id: 's8-mid',
        x: 0,
        y: 2.2,
        z: 50,
        radius: 0.75,
        label: '50m High',
      },
      {
        id: 's8-right',
        x: 3.5,
        y: 1.5,
        z: 60,
        radius: 0.8,
        label: '60m Long',
      },
    ],
  },

  // STAGE 9: Moving Long Range Target (62m)
  {
    stageNumber: 9,
    title: 'Stage 9: Distant Kinetic Mark',
    subtitle: '62m Dynamic Long Range',
    description: 'Long distance plus continuous horizontal sweep and heavy crosswind drift.',
    targetDistance: 62,
    targetScale: 0.75,
    isMovingTarget: true,
    wind: {
      speed: 6.8,
      directionDegrees: 80,
      label: 'Gale Force Gust',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's9-moving-far',
        x: 0,
        y: 1.7,
        z: 62,
        radius: 0.78,
        isMoving: true,
        moveSpeed: 1.9,
        moveRange: 3.6,
        moveAxis: 'x',
        label: '62m Kinetic',
      },
    ],
  },

  // STAGE 10: Grand Master Precision Challenge (72m High Altitude + Swirling Wind)
  {
    stageNumber: 10,
    title: 'Stage 10: Grand Master Mark',
    subtitle: '72m Precision Championship',
    description: 'Extreme 72m distance on an elevated moving crest with maximum wind sheer. Only the elite will master this.',
    targetDistance: 72,
    targetScale: 0.7,
    isMovingTarget: true,
    wind: {
      speed: 8.0,
      directionDegrees: 260,
      label: 'Severe Cross-Sheer',
    },
    maxArrows: 1,
    targets: [
      {
        id: 's10-master',
        x: 0,
        y: 2.8,
        z: 72,
        radius: 0.7,
        isMoving: true,
        moveSpeed: 1.7,
        moveRange: 2.8,
        moveAxis: 'x',
        label: '72m Master',
      },
    ],
  },
];

/**
 * Deterministic PRNG based on string seed (e.g. '2026-08-31')
 */
function createSeededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let s = Math.abs(hash) || 12345;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates Daily Top-10 Competition Stages for the given date.
 * Every player on the same day gets identical wind, target positions, and movement speeds.
 */
export function getDailyArcheryStages(dateSeed?: string): StageDefinition[] {
  const seed = dateSeed || new Date().toISOString().split('T')[0];
  const rng = createSeededRandom(seed);

  return ARCHERY_STAGES.map((baseStage, idx) => {
    // Stage distance progression
    const dist = 30 + idx * 4.5;
    const windSpeed = 1.0 + rng() * (1.5 + idx * 0.7);
    const windDeg = Math.floor(rng() * 360);

    return {
      ...baseStage,
      targetDistance: dist,
      wind: {
        speed: Math.round(windSpeed * 10) / 10,
        directionDegrees: windDeg,
        label: `${Math.round(windSpeed * 10) / 10} m/s ${windDeg > 180 ? 'Left' : 'Right'} Airflow`,
      },
    };
  });
}

