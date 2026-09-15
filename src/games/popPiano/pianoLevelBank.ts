/**
 * Pop Piano - 40 Tournament Progression Levels & Procedural Pattern Engine
 * 
 * Strict Directives:
 * - Exactly 40 levels (Level 1 to Level 40). Never Level 41.
 * - Level 1 is Hard tournament standard: MANDATORY 100 BLACK TILES.
 * - Tier Progression:
 *   - Level 1–5: Hard
 *   - Level 6–10: Very Hard
 *   - Level 11–20: Expert
 *   - Level 21–30: Expert+
 *   - Level 31–39: Extreme
 *   - Level 40: Master (320 black tiles, 950 px/s, virtuoso hybrid)
 * - Deterministic, fair, mathematically solvable patterns.
 */

import { NOTE_FREQUENCIES } from './audioEngine';
import { MelodicNote } from './melodyTracks';
import type { PopPianoLevelConfig, DifficultyTier, PatternStyle, MusicalScaleType } from './types';

export type { PopPianoLevelConfig, DifficultyTier, PatternStyle, MusicalScaleType };

export const POP_PIANO_LEVELS: PopPianoLevelConfig[] = [
  // -------------------------------------------------------------------
  // TIER: HARD (Levels 1–5) — Tournament standard intro, requires 100+ tiles
  // -------------------------------------------------------------------
  {
    level: 1,
    name: 'Allegro Prelude',
    tier: 'Hard',
    targetNotes: 100,
    speed: 400,
    spacingRatio: 1.38,
    patternStyle: 'linear_melodic',
    musicalScale: 'major',
    description: 'Press 100 Black Tiles to clear Level 1',
  },
  {
    level: 2,
    name: 'Alternating Duo',
    tier: 'Hard',
    targetNotes: 110,
    speed: 415,
    spacingRatio: 1.36,
    patternStyle: 'alternating_duo',
    musicalScale: 'pentatonic',
    description: 'Master 110 rhythmic alternating black tiles',
  },
  {
    level: 3,
    name: 'Staircase Cascade',
    tier: 'Hard',
    targetNotes: 120,
    speed: 430,
    spacingRatio: 1.34,
    patternStyle: 'staircase_cascade',
    musicalScale: 'major',
    description: 'Sweep across 120 cascading black tiles',
  },
  {
    level: 4,
    name: 'Arpeggio Leap',
    tier: 'Hard',
    targetNotes: 130,
    speed: 445,
    spacingRatio: 1.32,
    patternStyle: 'arpeggio_jumps',
    musicalScale: 'harmonic_minor',
    description: 'Execute 130 wide-lane arpeggio leaps',
  },
  {
    level: 5,
    name: 'Syncopated Beat',
    tier: 'Hard',
    targetNotes: 140,
    speed: 460,
    spacingRatio: 1.30,
    patternStyle: 'syncopated_bursts',
    musicalScale: 'canon',
    description: 'Complete 140 syncopated burst tiles',
  },

  // -------------------------------------------------------------------
  // TIER: VERY HARD (Levels 6–10) — Faster tempo (480–560 px/s), tight spacing
  // -------------------------------------------------------------------
  {
    level: 6,
    name: 'Trill Swarm',
    tier: 'Very Hard',
    targetNotes: 150,
    speed: 480,
    spacingRatio: 1.28,
    patternStyle: 'trill_swarms',
    musicalScale: 'major',
    description: 'Hit 150 high-speed trill black tiles',
  },
  {
    level: 7,
    name: 'Pentatonic Rush',
    tier: 'Very Hard',
    targetNotes: 160,
    speed: 500,
    spacingRatio: 1.26,
    patternStyle: 'alternating_duo',
    musicalScale: 'pentatonic',
    description: 'Conquer 160 rapid pentatonic transitions',
  },
  {
    level: 8,
    name: 'Minor Cadence',
    tier: 'Very Hard',
    targetNotes: 170,
    speed: 520,
    spacingRatio: 1.25,
    patternStyle: 'staircase_cascade',
    musicalScale: 'harmonic_minor',
    description: 'Navigate 170 four-lane staircase cascades',
  },
  {
    level: 9,
    name: 'Chromatic Jumps',
    tier: 'Very Hard',
    targetNotes: 180,
    speed: 540,
    spacingRatio: 1.23,
    patternStyle: 'arpeggio_jumps',
    musicalScale: 'chromatic',
    description: 'Execute 180 complex lane-skipping arpeggios',
  },
  {
    level: 10,
    name: 'Sonata Rhapsody',
    tier: 'Very Hard',
    targetNotes: 190,
    speed: 560,
    spacingRatio: 1.22,
    patternStyle: 'virtuoso_hybrid',
    musicalScale: 'canon',
    description: 'Complete 190 hybrid phrasing black tiles',
  },

  // -------------------------------------------------------------------
  // TIER: EXPERT (Levels 11–20) — Pro tempo (580–690 px/s), 195–240 tiles
  // -------------------------------------------------------------------
  {
    level: 11,
    name: 'Vivace Momentum',
    tier: 'Expert',
    targetNotes: 195,
    speed: 580,
    spacingRatio: 1.21,
    patternStyle: 'syncopated_bursts',
    musicalScale: 'major',
    description: 'Maintain rhythm across 195 Vivace bursts',
  },
  {
    level: 12,
    name: 'Nocturne Flight',
    tier: 'Expert',
    targetNotes: 200,
    speed: 595,
    spacingRatio: 1.20,
    patternStyle: 'trill_swarms',
    musicalScale: 'pentatonic',
    description: 'Execute 200 rapid dual-lane trills',
  },
  {
    level: 13,
    name: 'Fugue Spiral',
    tier: 'Expert',
    targetNotes: 205,
    speed: 610,
    spacingRatio: 1.19,
    patternStyle: 'staircase_cascade',
    musicalScale: 'harmonic_minor',
    description: 'Flow through 205 bidirectional cascades',
  },
  {
    level: 14,
    name: 'Polonaise Strike',
    tier: 'Expert',
    targetNotes: 210,
    speed: 625,
    spacingRatio: 1.18,
    patternStyle: 'arpeggio_jumps',
    musicalScale: 'canon',
    description: 'Command 210 rhythmic arpeggio leaps',
  },
  {
    level: 15,
    name: 'Etude Velocity',
    tier: 'Expert',
    targetNotes: 215,
    speed: 640,
    spacingRatio: 1.18,
    patternStyle: 'alternating_duo',
    musicalScale: 'chromatic',
    description: 'Conquer 215 high-speed alternating tiles',
  },
  {
    level: 16,
    name: 'Scherzo Storm',
    tier: 'Expert',
    targetNotes: 220,
    speed: 650,
    spacingRatio: 1.17,
    patternStyle: 'syncopated_bursts',
    musicalScale: 'major',
    description: 'Survive 220 syncopated storm phrases',
  },
  {
    level: 17,
    name: 'Toccata Pulse',
    tier: 'Expert',
    targetNotes: 225,
    speed: 660,
    spacingRatio: 1.17,
    patternStyle: 'trill_swarms',
    musicalScale: 'pentatonic',
    description: 'Tackle 225 split-lane rapid trills',
  },
  {
    level: 18,
    name: 'Appassionata Wave',
    tier: 'Expert',
    targetNotes: 230,
    speed: 670,
    spacingRatio: 1.16,
    patternStyle: 'staircase_cascade',
    musicalScale: 'harmonic_minor',
    description: 'Chain 230 flawless cascading strokes',
  },
  {
    level: 19,
    name: 'Rondo Brillante',
    tier: 'Expert',
    targetNotes: 235,
    speed: 680,
    spacingRatio: 1.16,
    patternStyle: 'arpeggio_jumps',
    musicalScale: 'canon',
    description: 'Nail 235 fast lane-switching arpeggios',
  },
  {
    level: 20,
    name: 'Virtuoso Gateway',
    tier: 'Expert',
    targetNotes: 240,
    speed: 690,
    spacingRatio: 1.15,
    patternStyle: 'virtuoso_hybrid',
    musicalScale: 'chromatic',
    description: 'Clear 240 expert hybrid phrases',
  },

  // -------------------------------------------------------------------
  // TIER: EXPERT+ (Levels 21–30) — Rapid cadence (705–820 px/s), 245–290 tiles
  // -------------------------------------------------------------------
  {
    level: 21,
    name: 'Presto Tempest',
    tier: 'Expert+',
    targetNotes: 245,
    speed: 705,
    spacingRatio: 1.15,
    patternStyle: 'syncopated_bursts',
    musicalScale: 'major',
    description: 'React to 245 relentless tempo shifts',
  },
  {
    level: 22,
    name: 'Titanium Keys',
    tier: 'Expert+',
    targetNotes: 250,
    speed: 720,
    spacingRatio: 1.14,
    patternStyle: 'trill_swarms',
    musicalScale: 'pentatonic',
    description: 'Strike 250 rapid alternating hammer-notes',
  },
  {
    level: 23,
    name: 'Abyssinian Fire',
    tier: 'Expert+',
    targetNotes: 255,
    speed: 735,
    spacingRatio: 1.14,
    patternStyle: 'alternating_duo',
    musicalScale: 'harmonic_minor',
    description: 'Conquer 255 high-octane pentatonic keys',
  },
  {
    level: 24,
    name: 'Moonlight Rondo',
    tier: 'Expert+',
    targetNotes: 260,
    speed: 750,
    spacingRatio: 1.13,
    patternStyle: 'staircase_cascade',
    musicalScale: 'canon',
    description: 'Control 260 continuous sweep cascades',
  },
  {
    level: 25,
    name: 'Cosmic Fugue',
    tier: 'Expert+',
    targetNotes: 265,
    speed: 765,
    spacingRatio: 1.13,
    patternStyle: 'arpeggio_jumps',
    musicalScale: 'chromatic',
    description: 'Nail 265 outer-to-inner arpeggio leaps',
  },
  {
    level: 26,
    name: 'Ballade Horizon',
    tier: 'Expert+',
    targetNotes: 270,
    speed: 780,
    spacingRatio: 1.12,
    patternStyle: 'virtuoso_hybrid',
    musicalScale: 'major',
    description: 'Endure 270 hybrid rhythmic measures',
  },
  {
    level: 27,
    name: 'Lightning Cadenza',
    tier: 'Expert+',
    targetNotes: 275,
    speed: 790,
    spacingRatio: 1.12,
    patternStyle: 'syncopated_bursts',
    musicalScale: 'pentatonic',
    description: 'Master 275 high-velocity syncopations',
  },
  {
    level: 28,
    name: 'Chromatic Cyclone',
    tier: 'Expert+',
    targetNotes: 280,
    speed: 800,
    spacingRatio: 1.11,
    patternStyle: 'trill_swarms',
    musicalScale: 'harmonic_minor',
    description: 'Hit 280 furious chromatic trill notes',
  },
  {
    level: 29,
    name: 'Inferno Cantata',
    tier: 'Expert+',
    targetNotes: 285,
    speed: 810,
    spacingRatio: 1.11,
    patternStyle: 'staircase_cascade',
    musicalScale: 'canon',
    description: 'Sweep 285 relentless lane-crossing cascades',
  },
  {
    level: 30,
    name: 'Apex Concerto',
    tier: 'Expert+',
    targetNotes: 290,
    speed: 820,
    spacingRatio: 1.10,
    patternStyle: 'virtuoso_hybrid',
    musicalScale: 'chromatic',
    description: 'Conquer 290 Expert+ champion measures',
  },

  // -------------------------------------------------------------------
  // TIER: EXTREME (Levels 31–39) — Extreme velocity (835–935 px/s), 295–318 tiles
  // -------------------------------------------------------------------
  {
    level: 31,
    name: 'Hyperion Surge',
    tier: 'Extreme',
    targetNotes: 295,
    speed: 835,
    spacingRatio: 1.10,
    patternStyle: 'arpeggio_jumps',
    musicalScale: 'major',
    description: 'Execute 295 extreme arpeggio shifts',
  },
  {
    level: 32,
    name: 'Supersonic Trill',
    tier: 'Extreme',
    targetNotes: 300,
    speed: 850,
    spacingRatio: 1.09,
    patternStyle: 'trill_swarms',
    musicalScale: 'pentatonic',
    description: 'Survive 300 supersonic trill collisions',
  },
  {
    level: 33,
    name: 'Phantom Velocity',
    tier: 'Extreme',
    targetNotes: 302,
    speed: 865,
    spacingRatio: 1.09,
    patternStyle: 'alternating_duo',
    musicalScale: 'harmonic_minor',
    description: 'Tackle 302 split-second lane switches',
  },
  {
    level: 34,
    name: 'Vortex Rhapsody',
    tier: 'Extreme',
    targetNotes: 305,
    speed: 880,
    spacingRatio: 1.08,
    patternStyle: 'staircase_cascade',
    musicalScale: 'canon',
    description: 'Trace 305 vortex waterfall cascades',
  },
  {
    level: 35,
    name: 'Supernova Bursts',
    tier: 'Extreme',
    targetNotes: 308,
    speed: 890,
    spacingRatio: 1.08,
    patternStyle: 'syncopated_bursts',
    musicalScale: 'chromatic',
    description: 'React instantly to 308 supernova pairs',
  },
  {
    level: 36,
    name: 'Eclipse Sonata',
    tier: 'Extreme',
    targetNotes: 310,
    speed: 900,
    spacingRatio: 1.07,
    patternStyle: 'virtuoso_hybrid',
    musicalScale: 'major',
    description: 'Channel 310 supreme rhythm notes',
  },
  {
    level: 37,
    name: 'Plasma Trillium',
    tier: 'Extreme',
    targetNotes: 312,
    speed: 910,
    spacingRatio: 1.07,
    patternStyle: 'trill_swarms',
    musicalScale: 'pentatonic',
    description: 'Precision tap 312 high-velocity trills',
  },
  {
    level: 38,
    name: 'Omega Arpeggio',
    tier: 'Extreme',
    targetNotes: 315,
    speed: 920,
    spacingRatio: 1.06,
    patternStyle: 'arpeggio_jumps',
    musicalScale: 'harmonic_minor',
    description: 'Navigate 315 wide-span outer lane leaps',
  },
  {
    level: 39,
    name: 'Titan Odyssey',
    tier: 'Extreme',
    targetNotes: 318,
    speed: 935,
    spacingRatio: 1.06,
    patternStyle: 'virtuoso_hybrid',
    musicalScale: 'canon',
    description: 'Survive the 318-note prelude to the Master',
  },

  // -------------------------------------------------------------------
  // TIER: MASTER (Level 40) — Ultimate Tournament Masterpiece (320 tiles, 950 px/s)
  // -------------------------------------------------------------------
  {
    level: 40,
    name: 'Grand Master Rhapsody',
    tier: 'Master',
    targetNotes: 320,
    speed: 950,
    spacingRatio: 1.05,
    patternStyle: 'virtuoso_hybrid',
    musicalScale: 'chromatic',
    description: 'Final Tournament Master: Clear 320 Black Tiles at 950 px/s',
  },
];

// Scale definition tables for pitch generation
const SCALE_NOTES: Record<MusicalScaleType, string[]> = {
  major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'G5'],
  pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'],
  harmonic_minor: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4', 'B4', 'C5', 'E5'],
  canon: ['D4', 'A3', 'B3', 'F#3', 'G3', 'D3', 'G3', 'A3', 'D4', 'F#4', 'A4', 'D5'],
  chromatic: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'],
};

function makeMelodicNote(lane: 0 | 1 | 2 | 3, pitch: string): MelodicNote {
  return {
    lane,
    pitch,
    frequency: NOTE_FREQUENCIES[pitch] || 440,
  };
}

/**
 * Returns level configuration for any level from 1 to 40.
 * Clamped strictly to 1..40 (never Level 41).
 */
export function getPopPianoLevel(levelNum: number): PopPianoLevelConfig {
  const safeLevel = Math.max(1, Math.min(40, levelNum));
  return POP_PIANO_LEVELS[safeLevel - 1] || POP_PIANO_LEVELS[0];
}

/**
 * Procedural & Controlled Pattern Generator
 * Guarantees fair, responsive, non-impossible lane progressions with authentic musical harmony.
 * Strictly guarantees consecutive notes never fall in the exact same lane.
 */
export function generatePatternForLevel(config: PopPianoLevelConfig, seedOffset: number = 0): MelodicNote[] {
  const notes: MelodicNote[] = [];
  const scale = SCALE_NOTES[config.musicalScale] || SCALE_NOTES.major;
  const targetCount = config.targetNotes;

  let currentLane: 0 | 1 | 2 | 3 = ((seedOffset + config.level) % 4) as 0 | 1 | 2 | 3;
  let pitchIndex = (seedOffset * 3 + config.level) % scale.length;

  // Helper to pick next lane ensuring no impossible same-lane spamming
  const pickNextLane = (desiredLane: 0 | 1 | 2 | 3): 0 | 1 | 2 | 3 => {
    if (desiredLane === currentLane) {
      const alt = (desiredLane === 3 ? 2 : desiredLane + 1) as 0 | 1 | 2 | 3;
      return alt;
    }
    return desiredLane;
  };

  for (let i = 0; i < targetCount; i++) {
    let nextLane: 0 | 1 | 2 | 3 = 0;

    switch (config.patternStyle) {
      case 'linear_melodic': {
        const step = (i % 6 < 3) ? 1 : -1;
        const candidate = (currentLane + step + 4) % 4 as 0 | 1 | 2 | 3;
        nextLane = pickNextLane(candidate);
        break;
      }

      case 'alternating_duo': {
        const pairBase = (Math.floor(i / 6) % 2 === 0) ? 0 : 1;
        const laneInPair = (i % 2 === 0) ? pairBase : pairBase + 2;
        nextLane = pickNextLane(laneInPair as 0 | 1 | 2 | 3);
        break;
      }

      case 'staircase_cascade': {
        const cycle = Math.floor(i / 4) % 2;
        const step = i % 4;
        const candidate = (cycle === 0 ? step : 3 - step) as 0 | 1 | 2 | 3;
        nextLane = pickNextLane(candidate);
        break;
      }

      case 'arpeggio_jumps': {
        const motif = (Math.floor(i / 4) % 2 === 0) ? [0, 2, 1, 3] : [3, 1, 2, 0];
        const candidate = motif[i % 4] as 0 | 1 | 2 | 3;
        nextLane = pickNextLane(candidate);
        break;
      }

      case 'syncopated_bursts': {
        const burstMotifs = [
          [0, 1], [2, 3], [1, 2], [3, 0], [2, 1], [0, 2], [1, 3]
        ];
        const motif = burstMotifs[Math.floor(i / 2) % burstMotifs.length];
        const candidate = motif[i % 2] as 0 | 1 | 2 | 3;
        nextLane = pickNextLane(candidate);
        break;
      }

      case 'trill_swarms': {
        const trillType = Math.floor(i / 8) % 3;
        if (trillType === 0) {
          nextLane = (i % 2 === 0 ? 1 : 2);
        } else if (trillType === 1) {
          nextLane = (i % 2 === 0 ? 0 : 2);
        } else {
          nextLane = (i % 2 === 0 ? 1 : 3);
        }
        nextLane = pickNextLane(nextLane);
        break;
      }

      case 'virtuoso_hybrid':
      default: {
        const phrase = Math.floor(i / 8) % 4;
        if (phrase === 0) {
          const step = i % 4;
          nextLane = pickNextLane(step as 0 | 1 | 2 | 3);
        } else if (phrase === 1) {
          const arpeggio = [0, 2, 1, 3];
          nextLane = pickNextLane(arpeggio[i % 4] as 0 | 1 | 2 | 3);
        } else if (phrase === 2) {
          nextLane = pickNextLane(i % 2 === 0 ? 0 : 3);
        } else {
          nextLane = pickNextLane(i % 2 === 0 ? 1 : 2);
        }
        break;
      }
    }

    currentLane = nextLane;
    pitchIndex = (pitchIndex + 1) % scale.length;
    const pitch = scale[pitchIndex];

    notes.push(makeMelodicNote(currentLane, pitch));
  }

  return notes;
}
