/**
 * Pop Piano - Melodic Tracks & Songs Library
 * Contains authentic 100-note melodic sequences tailored across 4 lanes (0, 1, 2, 3).
 * Each note triggers the precise piano pitch for harmonious acoustic gameplay.
 */

import { NOTE_FREQUENCIES } from './audioEngine';

export interface MelodicNote {
  lane: 0 | 1 | 2 | 3;
  pitch: string;
  frequency: number;
}

export interface SongTrack {
  id: string;
  title: string;
  subtitle: string;
  notes: MelodicNote[];
}

function makeNote(lane: 0 | 1 | 2 | 3, pitch: string): MelodicNote {
  return {
    lane,
    pitch,
    frequency: NOTE_FREQUENCIES[pitch] || 440,
  };
}

// Track 1: Für Elise (Beethoven) - 100 Notes
const furEliseMotif: Array<[0 | 1 | 2 | 3, string]> = [
  [3, 'E5'], [2, 'D#5'], [3, 'E5'], [2, 'D#5'], [3, 'E5'], [1, 'B4'], [2, 'D5'], [1, 'C5'], [0, 'A4'],
  [0, 'C4'], [1, 'E4'], [0, 'A4'], [1, 'B4'],
  [1, 'E4'], [2, 'G#4'], [1, 'B4'], [1, 'C5'],
  [0, 'E4'], [3, 'E5'], [2, 'D#5'], [3, 'E5'], [2, 'D#5'], [3, 'E5'], [1, 'B4'], [2, 'D5'], [1, 'C5'], [0, 'A4'],
  [0, 'C4'], [1, 'E4'], [0, 'A4'], [1, 'B4'],
  [0, 'E4'], [1, 'C5'], [1, 'B4'], [0, 'A4'],
  [1, 'B4'], [1, 'C5'], [2, 'D5'], [3, 'E5'],
  [0, 'G4'], [2, 'F5'], [3, 'E5'], [2, 'D5'],
  [1, 'F4'], [3, 'E5'], [2, 'D5'], [1, 'C5'],
  [0, 'E4'], [2, 'D5'], [1, 'C5'], [1, 'B4'],
  [0, 'E4'], [3, 'E5'], [2, 'D#5'], [3, 'E5'], [2, 'D#5'], [3, 'E5'], [1, 'B4'], [2, 'D5'], [1, 'C5'], [0, 'A4'],
  [0, 'C4'], [1, 'E4'], [0, 'A4'], [1, 'B4'],
  [1, 'E4'], [2, 'G#4'], [1, 'B4'], [1, 'C5'],
  [0, 'E4'], [3, 'E5'], [2, 'D#5'], [3, 'E5'], [2, 'D#5'], [3, 'E5'], [1, 'B4'], [2, 'D5'], [1, 'C5'], [0, 'A4'],
  [0, 'C4'], [1, 'E4'], [0, 'A4'], [1, 'B4'],
  [0, 'E4'], [1, 'C5'], [1, 'B4'], [0, 'A4'],
  [3, 'C6'], [1, 'B5'], [0, 'A5'], [2, 'G5'], [1, 'F5'], [3, 'E5'], [2, 'D5'], [1, 'C5'], [1, 'B4'], [0, 'A4'],
  [0, 'A4'], [1, 'C5'], [3, 'E5'], [0, 'A5']
];

// Track 2: Abyssinian Tizita Pentatonic - 100 Notes
const tizitaMotif: Array<[0 | 1 | 2 | 3, string]> = [
  [0, 'C4'], [1, 'D4'], [2, 'E4'], [3, 'G4'], [1, 'A4'], [2, 'C5'], [3, 'D5'], [2, 'E5'],
  [3, 'G5'], [2, 'E5'], [3, 'D5'], [2, 'C5'], [1, 'A4'], [3, 'G4'], [2, 'E4'], [1, 'D4'],
  [0, 'C4'], [2, 'E4'], [3, 'G4'], [2, 'C5'], [3, 'E5'], [3, 'G5'], [2, 'E5'], [3, 'D5'],
  [2, 'C5'], [1, 'A4'], [3, 'G4'], [1, 'A4'], [2, 'C5'], [1, 'D5'], [2, 'C5'], [1, 'A4'],
  [3, 'G4'], [2, 'E4'], [1, 'D4'], [0, 'C4'], [1, 'D4'], [2, 'E4'], [3, 'G4'], [1, 'A4'],
  [2, 'C5'], [3, 'D5'], [2, 'E5'], [3, 'G5'], [3, 'A5'], [3, 'G5'], [2, 'E5'], [3, 'D5'],
  [2, 'C5'], [1, 'A4'], [3, 'G4'], [2, 'E4'], [1, 'D4'], [0, 'C4'], [2, 'E4'], [3, 'G4'],
  [1, 'A4'], [2, 'C5'], [3, 'D5'], [2, 'E5'], [3, 'G5'], [2, 'E5'], [3, 'D5'], [2, 'C5'],
  [1, 'A4'], [3, 'G4'], [2, 'E4'], [1, 'D4'], [0, 'C4'], [1, 'D4'], [2, 'E4'], [3, 'G4'],
  [1, 'A4'], [2, 'C5'], [3, 'D5'], [2, 'E5'], [3, 'G5'], [2, 'E5'], [3, 'D5'], [2, 'C5'],
  [1, 'A4'], [3, 'G4'], [2, 'E4'], [1, 'D4'], [0, 'C4'], [1, 'E4'], [3, 'G4'], [2, 'C5'],
  [3, 'E5'], [3, 'G5'], [2, 'C6'], [3, 'G5'], [2, 'E5'], [3, 'D5'], [2, 'C5'], [1, 'A4'],
  [3, 'G4'], [2, 'E4'], [1, 'D4'], [0, 'C4']
];

// Track 3: Canon in D (Pachelbel) - 100 Notes
const canonMotif: Array<[0 | 1 | 2 | 3, string]> = [
  [2, 'D4'], [1, 'A3'], [1, 'B3'], [0, 'F#3'], [0, 'G3'], [2, 'D3'], [0, 'G3'], [1, 'A3'],
  [2, 'D4'], [0, 'F#4'], [1, 'A4'], [0, 'F#4'], [3, 'D5'], [1, 'A4'], [1, 'B4'], [0, 'F#4'],
  [0, 'G4'], [1, 'B4'], [2, 'D5'], [0, 'G4'], [1, 'A4'], [0, 'F#4'], [3, 'D5'], [1, 'A4'],
  [0, 'F#5'], [3, 'E5'], [3, 'D5'], [1, 'C#5'], [1, 'B4'], [1, 'A4'], [1, 'B4'], [1, 'C#5'],
  [3, 'D5'], [1, 'C#5'], [1, 'B4'], [1, 'A4'], [0, 'G4'], [0, 'F#4'], [0, 'G4'], [3, 'E4'],
  [2, 'D4'], [0, 'F#4'], [1, 'A4'], [0, 'G4'], [0, 'F#4'], [2, 'D4'], [0, 'F#4'], [3, 'E4'],
  [2, 'D4'], [1, 'B3'], [2, 'D4'], [1, 'A3'], [0, 'G3'], [1, 'B3'], [2, 'D4'], [3, 'E4'],
  [0, 'F#4'], [2, 'D4'], [3, 'E4'], [1, 'A4'], [0, 'F#4'], [1, 'A4'], [3, 'D5'], [1, 'A4'],
  [1, 'B4'], [0, 'G4'], [1, 'A4'], [0, 'F#4'], [0, 'G4'], [1, 'B4'], [1, 'A4'], [0, 'G4'],
  [0, 'F#4'], [2, 'D4'], [3, 'E4'], [1, 'C#4'], [2, 'D4'], [0, 'F#4'], [1, 'A4'], [3, 'D5'],
  [1, 'C#5'], [1, 'B4'], [1, 'A4'], [0, 'G4'], [0, 'F#4'], [3, 'E4'], [2, 'D4'], [1, 'C#4'],
  [1, 'B3'], [0, 'G3'], [1, 'A3'], [0, 'F#3'], [0, 'G3'], [1, 'B3'], [1, 'A3'], [0, 'G3'],
  [0, 'F#3'], [2, 'D4'], [0, 'F#4'], [3, 'D5']
];

export const SONGS_CATALOG: SongTrack[] = [
  {
    id: 'fur-elise',
    title: 'Für Elise',
    subtitle: 'Beethoven • Masterpiece',
    notes: furEliseMotif.slice(0, 100).map(([lane, pitch]) => makeNote(lane, pitch)),
  },
  {
    id: 'tizita-ethiopian',
    title: 'Tizita Opus',
    subtitle: 'EthioPentatonic Harmony',
    notes: tizitaMotif.slice(0, 100).map(([lane, pitch]) => makeNote(lane, pitch)),
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D',
    subtitle: 'Pachelbel • Classical Flow',
    notes: canonMotif.slice(0, 100).map(([lane, pitch]) => makeNote(lane, pitch)),
  },
];
