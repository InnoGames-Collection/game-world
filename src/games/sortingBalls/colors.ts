/**
 * SORTING BALLS - Official 3D Ball Material & Chromatic Palette
 * Matches the reference video: glossy, high-saturation, specular spheres
 */

import { BallColorKey, BallColorDefinition } from './types';

export const BALL_COLORS: Record<BallColorKey, BallColorDefinition> = {
  yellow: {
    key: 'yellow',
    name: 'Sun Yellow',
    hex: '#F4E900',
    threeColor: 0xF4E900,
    highlightHex: '#FFFDC0',
    shadowHex: '#B29700',
  },
  red: {
    key: 'red',
    name: 'Ruby Red',
    hex: '#F20D16',
    threeColor: 0xF20D16,
    highlightHex: '#FFA0A3',
    shadowHex: '#990006',
  },
  cyan: {
    key: 'cyan',
    name: 'Cyan Frost',
    hex: '#11CBE8',
    threeColor: 0x11CBE8,
    highlightHex: '#A2F6FF',
    shadowHex: '#087D91',
  },
  blue: {
    key: 'blue',
    name: 'Cobalt Blue',
    hex: '#155DEB',
    threeColor: 0x155DEB,
    highlightHex: '#A8C7FF',
    shadowHex: '#0A338A',
  },
  green: {
    key: 'green',
    name: 'Emerald Green',
    hex: '#27D33F',
    threeColor: 0x27D33F,
    highlightHex: '#A4F7AF',
    shadowHex: '#127F22',
  },
  white: {
    key: 'white',
    name: 'Pearl White',
    hex: '#F4F4F4',
    threeColor: 0xF4F4F4,
    highlightHex: '#FFFFFF',
    shadowHex: '#B8B8B8',
  },
  orange: {
    key: 'orange',
    name: 'Amber Orange',
    hex: '#FF7A00',
    threeColor: 0xFF7A00,
    highlightHex: '#FFD1A4',
    shadowHex: '#A84C00',
  },
  purple: {
    key: 'purple',
    name: 'Deep Violet',
    hex: '#8B2BE2',
    threeColor: 0x8B2BE2,
    highlightHex: '#D6A6FF',
    shadowHex: '#52138C',
  },
  magenta: {
    key: 'magenta',
    name: 'Bright Magenta',
    hex: '#E91E63',
    threeColor: 0xE91E63,
    highlightHex: '#FF9EC2',
    shadowHex: '#910C37',
  },
  brown: {
    key: 'brown',
    name: 'Rich Walnut',
    hex: '#8D4925',
    threeColor: 0x8D4925,
    highlightHex: '#D99B7C',
    shadowHex: '#542912',
  },
  gray: {
    key: 'gray',
    name: 'Steel Slate',
    hex: '#475569',
    threeColor: 0x475569,
    highlightHex: '#94A3B8',
    shadowHex: '#1E293B',
  },
};
