/**
 * Crazy Colors Constants
 * Authentic neon palette, physics coefficients, dimensions, and styling tokens.
 */

import { CrazyColor } from './types';

export const CRAZY_COLORS_PALETTE: Record<
  CrazyColor,
  {
    hex: string;
    rgb: [number, number, number];
    glow: string;
    light: string;
    dark: string;
  }
> = {
  pink: {
    hex: '#FF008C',
    rgb: [255, 0, 140],
    glow: 'rgba(255, 0, 140, 0.7)',
    light: '#FF66BA',
    dark: '#B30062',
  },
  cyan: {
    hex: '#00D9FF',
    rgb: [0, 217, 255],
    glow: 'rgba(0, 217, 255, 0.7)',
    light: '#66E8FF',
    dark: '#0097B3',
  },
  yellow: {
    hex: '#FFD800',
    rgb: [255, 216, 0],
    glow: 'rgba(255, 216, 0, 0.7)',
    light: '#FFE766',
    dark: '#B39700',
  },
  purple: {
    hex: '#7A00FF',
    rgb: [122, 0, 255],
    glow: 'rgba(122, 0, 255, 0.7)',
    light: '#B366FF',
    dark: '#5200B3',
  },
};

export const COLOR_KEYS: CrazyColor[] = ['pink', 'cyan', 'yellow', 'purple'];

export const GAME_PHYSICS = {
  GRAVITY: 980, // pixels/s^2
  JUMP_IMPULSE: -380, // upward velocity on tap (jump)
  MAX_FALL_SPEED: 480, // terminal fall velocity
  BALL_RADIUS: 9, // consistent diameter ~18px in standard virtual viewport
  SEGMENT_THICKNESS: 14, // substantial, premium neon thickness with rounded caps
  VIRTUAL_WIDTH: 390, // internal logical coordinate width for perfect responsiveness
  VIRTUAL_HEIGHT: 700, // internal logical height
  OBSTACLE_SPACING: 320, // vertical distance between obstacles in world space
};

export const STORAGE_KEY = 'teleplay_crazy_colors_savedata_v1';
