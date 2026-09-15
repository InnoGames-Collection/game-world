/**
 * Helix Jump Constants & Physical Parameters
 */

import { LevelTheme } from './types';

export const HELIX_DIMENSIONS = {
  TOWER_RADIUS: 0.95,
  TOWER_HEIGHT: 260,
  PLATFORM_OUTER_RADIUS: 2.7,
  PLATFORM_THICKNESS: 0.32,
  BALL_RADIUS: 0.26,
  RING_SPACING: 3.4,
  BALL_X_OFFSET: 0, // centered on tower front
  BALL_Z_OFFSET: 1.85, // situated at front of platform ring
};

export const HELIX_PHYSICS = {
  GRAVITY: -34.0,
  BOUNCE_IMPULSE: 11.2,
  TERMINAL_VELOCITY: -42.0,
  COMBO_SMASH_SPEED: -22.0,
  ROTATION_SENSITIVITY: 0.0058, // radians per pixel dragged
  ROTATION_DAMPING: 0.92,
};

export const STORAGE_KEY = 'teleplay_helix_jump_savedata_v1';

export const LEVEL_THEMES: LevelTheme[] = [
  // Level 1: Blue + Cyan + White + Orange accents
  {
    name: 'Azure Breeze',
    towerColor: '#e0caa3',
    safeColor: '#0ea5e9',
    safeColors: ['#38bdf8', '#0284c7', '#3b82f6', '#60a5fa', '#06b6d4', '#f8fafc'],
    dangerColor: '#ef4444',
    ballColor: '#f97316',
    bgGradientTop: '#38bdf8',
    bgGradientBottom: '#0369a1',
    fogColor: '#7dd3fc',
  },
  // Level 2: Purple + Magenta + Pink + White
  {
    name: 'Cosmic Magenta',
    towerColor: '#4c1d95',
    safeColor: '#a855f7',
    safeColors: ['#c084fc', '#d946ef', '#ec4899', '#f472b6', '#a855f7', '#fdf4ff'],
    dangerColor: '#ef4444',
    ballColor: '#facc15',
    bgGradientTop: '#9333ea',
    bgGradientBottom: '#3b0764',
    fogColor: '#c084fc',
  },
  // Level 3: Emerald + Green + Lime + Cyan
  {
    name: 'Verdant Lime',
    towerColor: '#064e3b',
    safeColor: '#10b981',
    safeColors: ['#34d399', '#10b981', '#84cc16', '#a3e635', '#06b6d4', '#ecfdf5'],
    dangerColor: '#ef4444',
    ballColor: '#f59e0b',
    bgGradientTop: '#10b981',
    bgGradientBottom: '#022c22',
    fogColor: '#6ee7b7',
  },
  // Level 4: Orange + Gold + Yellow + White
  {
    name: 'Solar Flare',
    towerColor: '#78350f',
    safeColor: '#f97316',
    safeColors: ['#fb923c', '#f59e0b', '#fbbf24', '#fde047', '#f97316', '#fffbeb'],
    dangerColor: '#dc2626',
    ballColor: '#0284c7',
    bgGradientTop: '#f97316',
    bgGradientBottom: '#431407',
    fogColor: '#fdba74',
  },
  // Level 5: Deep Blue + Violet + Cyan
  {
    name: 'Abyssal Violet',
    towerColor: '#1e1b4b',
    safeColor: '#6366f1',
    safeColors: ['#818cf8', '#6366f1', '#8b5cf6', '#a78bfa', '#06b6d4', '#e0e7ff'],
    dangerColor: '#ef4444',
    ballColor: '#fb7185',
    bgGradientTop: '#4338ca',
    bgGradientBottom: '#0f172a',
    fogColor: '#818cf8',
  },
  // Level 6: Pink + Purple + Blue
  {
    name: 'Neon Sunset',
    towerColor: '#581c87',
    safeColor: '#ec4899',
    safeColors: ['#f472b6', '#c084fc', '#818cf8', '#38bdf8', '#e879f9', '#fdf2f8'],
    dangerColor: '#dc2626',
    ballColor: '#22c55e',
    bgGradientTop: '#db2777',
    bgGradientBottom: '#1e1b4b',
    fogColor: '#f472b6',
  },
  // Level 7: Turquoise + Green + Yellow
  {
    name: 'Tropical Reef',
    towerColor: '#134e4a',
    safeColor: '#14b8a6',
    safeColors: ['#2dd4bf', '#10b981', '#22c55e', '#eab308', '#06b6d4', '#f0fdfa'],
    dangerColor: '#ef4444',
    ballColor: '#f43f5e',
    bgGradientTop: '#0d9488',
    bgGradientBottom: '#042f2e',
    fogColor: '#5eead4',
  },
  // Level 8: Orange + Red-Orange + Gold
  {
    name: 'Molten Amber',
    towerColor: '#451a03',
    safeColor: '#ea580c',
    safeColors: ['#f97316', '#fb923c', '#eab308', '#facc15', '#f59e0b', '#fff7ed'],
    dangerColor: '#dc2626',
    ballColor: '#0ea5e9',
    bgGradientTop: '#ea580c',
    bgGradientBottom: '#292524',
    fogColor: '#fb923c',
  },
  // Level 9: Electric Blue + Purple + White
  {
    name: 'Electric Pulse',
    towerColor: '#1e293b',
    safeColor: '#0284c7',
    safeColors: ['#38bdf8', '#60a5fa', '#a855f7', '#c084fc', '#e0e7ff', '#f8fafc'],
    dangerColor: '#ef4444',
    ballColor: '#f59e0b',
    bgGradientTop: '#0284c7',
    bgGradientBottom: '#090d16',
    fogColor: '#38bdf8',
  },
  // Level 10: Emerald + Cyan + Deep Blue
  {
    name: 'Aquamarine Core',
    towerColor: '#083344',
    safeColor: '#06b6d4',
    safeColors: ['#22d3ee', '#14b8a6', '#10b981', '#0284c7', '#38bdf8', '#ecfeff'],
    dangerColor: '#ef4444',
    ballColor: '#facc15',
    bgGradientTop: '#0891b2',
    bgGradientBottom: '#020617',
    fogColor: '#67e8f9',
  },
  // Level 11: Ruby & Gold
  {
    name: 'Crimson Sovereign',
    towerColor: '#2b0a12',
    safeColor: '#f59e0b',
    safeColors: ['#fbbf24', '#facc15', '#f97316', '#fdba74', '#fbbf24', '#fffbeb'],
    dangerColor: '#dc2626',
    ballColor: '#38bdf8',
    bgGradientTop: '#881337',
    bgGradientBottom: '#18181b',
    fogColor: '#f43f5e',
  },
  // Level 12: Frostbite Mint
  {
    name: 'Glacial Mint',
    towerColor: '#064e3b',
    safeColor: '#2dd4bf',
    safeColors: ['#5eead4', '#6ee7b7', '#38bdf8', '#7dd3fc', '#a7f3d0', '#f0fdf4'],
    dangerColor: '#ef4444',
    ballColor: '#f43f5e',
    bgGradientTop: '#0f766e',
    bgGradientBottom: '#022c22',
    fogColor: '#5eead4',
  },
  // Level 13: Lavender Haze
  {
    name: 'Lavender Dusk',
    towerColor: '#3b0764',
    safeColor: '#c084fc',
    safeColors: ['#d8b4fe', '#c084fc', '#e879f9', '#f472b6', '#a855f7', '#faf5ff'],
    dangerColor: '#ef4444',
    ballColor: '#22c55e',
    bgGradientTop: '#7e22ce',
    bgGradientBottom: '#1e1b4b',
    fogColor: '#d8b4fe',
  },
  // Level 14: Golden Citrine
  {
    name: 'Golden Citrine',
    towerColor: '#713f12',
    safeColor: '#eab308',
    safeColors: ['#facc15', '#fde047', '#f59e0b', '#fb923c', '#fef08a', '#fffbeb'],
    dangerColor: '#dc2626',
    ballColor: '#0284c7',
    bgGradientTop: '#ca8a04',
    bgGradientBottom: '#292524',
    fogColor: '#fde047',
  },
  // Level 15: Cyberpunk Cyan & Pink
  {
    name: 'Cyberpunk Surge',
    towerColor: '#090d16',
    safeColor: '#06b6d4',
    safeColors: ['#22d3ee', '#38bdf8', '#ec4899', '#f472b6', '#a855f7', '#fdf2f8'],
    dangerColor: '#ef4444',
    ballColor: '#fde047',
    bgGradientTop: '#0e7490',
    bgGradientBottom: '#030712',
    fogColor: '#22d3ee',
  },
  // Level 16: Forest Moss
  {
    name: 'Deep Forest',
    towerColor: '#14532d',
    safeColor: '#22c55e',
    safeColors: ['#4ade80', '#16a34a', '#84cc16', '#a3e635', '#6ee7b7', '#f0fdf4'],
    dangerColor: '#ef4444',
    ballColor: '#f97316',
    bgGradientTop: '#15803d',
    bgGradientBottom: '#052e16',
    fogColor: '#86efac',
  },
  // Level 17: Indigo Twilight
  {
    name: 'Indigo Twilight',
    towerColor: '#1e1b4b',
    safeColor: '#6366f1',
    safeColors: ['#818cf8', '#a5b4fc', '#3b82f6', '#60a5fa', '#93c5fd', '#eef2ff'],
    dangerColor: '#ef4444',
    ballColor: '#f59e0b',
    bgGradientTop: '#3730a3',
    bgGradientBottom: '#020617',
    fogColor: '#a5b4fc',
  },
  // Level 18: Coral Blossom
  {
    name: 'Coral Blossom',
    towerColor: '#4c0519',
    safeColor: '#fb7185',
    safeColors: ['#fda4af', '#f43f5e', '#fb923c', '#f97316', '#fbcfe8', '#fff1f2'],
    dangerColor: '#dc2626',
    ballColor: '#06b6d4',
    bgGradientTop: '#e11d48',
    bgGradientBottom: '#18181b',
    fogColor: '#fda4af',
  },
  // Level 19: Arctic Ice
  {
    name: 'Arctic Diamond',
    towerColor: '#0f172a',
    safeColor: '#38bdf8',
    safeColors: ['#7dd3fc', '#bae6fd', '#e0f2fe', '#67e8f9', '#a5f3fc', '#ffffff'],
    dangerColor: '#ef4444',
    ballColor: '#f97316',
    bgGradientTop: '#0284c7',
    bgGradientBottom: '#082f49',
    fogColor: '#bae6fd',
  },
  // Level 20: Volcanic Basalt
  {
    name: 'Volcanic Ash',
    towerColor: '#18181b',
    safeColor: '#f97316',
    safeColors: ['#fb923c', '#fdba74', '#f59e0b', '#fbbf24', '#fca5a5', '#fff7ed'],
    dangerColor: '#dc2626',
    ballColor: '#38bdf8',
    bgGradientTop: '#7c2d12',
    bgGradientBottom: '#09090b',
    fogColor: '#ea580c',
  },
  // Level 21: Midnight Teal
  {
    name: 'Midnight Teal',
    towerColor: '#042f2e',
    safeColor: '#14b8a6',
    safeColors: ['#2dd4bf', '#5eead4', '#06b6d4', '#22d3ee', '#99f6e4', '#f0fdfa'],
    dangerColor: '#ef4444',
    ballColor: '#f59e0b',
    bgGradientTop: '#0f766e',
    bgGradientBottom: '#020617',
    fogColor: '#2dd4bf',
  },
  // Level 22: Sakura Petals
  {
    name: 'Sakura Cascade',
    towerColor: '#500724',
    safeColor: '#f472b6',
    safeColors: ['#fbcfe8', '#f472b6', '#ec4899', '#db2777', '#fda4af', '#fff1f2'],
    dangerColor: '#dc2626',
    ballColor: '#10b981',
    bgGradientTop: '#be185d',
    bgGradientBottom: '#18181b',
    fogColor: '#fbcfe8',
  },
  // Level 23: Sunburst Lime
  {
    name: 'Sunburst Lime',
    towerColor: '#365314',
    safeColor: '#84cc16',
    safeColors: ['#a3e635', '#bef264', '#eab308', '#facc15', '#4ade80', '#f7fee7'],
    dangerColor: '#ef4444',
    ballColor: '#3b82f6',
    bgGradientTop: '#4d7c0f',
    bgGradientBottom: '#14532d',
    fogColor: '#bef264',
  },
  // Level 24: Deep Ultramarine
  {
    name: 'Deep Ultramarine',
    towerColor: '#172554',
    safeColor: '#3b82f6',
    safeColors: ['#60a5fa', '#93c5fd', '#818cf8', '#a5b4fc', '#38bdf8', '#eff6ff'],
    dangerColor: '#ef4444',
    ballColor: '#fbbf24',
    bgGradientTop: '#1d4ed8',
    bgGradientBottom: '#020617',
    fogColor: '#60a5fa',
  },
  // Level 25: Molten Copper
  {
    name: 'Molten Copper',
    towerColor: '#451a03',
    safeColor: '#ea580c',
    safeColors: ['#f97316', '#fb923c', '#d97706', '#f59e0b', '#fdba74', '#fff7ed'],
    dangerColor: '#dc2626',
    ballColor: '#06b6d4',
    bgGradientTop: '#9a3412',
    bgGradientBottom: '#1c1917',
    fogColor: '#f97316',
  },
  // Level 26: Poison Dart Neon
  {
    name: 'Poison Dart Neon',
    towerColor: '#0a0a0a',
    safeColor: '#22c55e',
    safeColors: ['#4ade80', '#84cc16', '#06b6d4', '#22d3ee', '#facc15', '#f0fdf4'],
    dangerColor: '#ef4444',
    ballColor: '#ec4899',
    bgGradientTop: '#15803d',
    bgGradientBottom: '#000000',
    fogColor: '#4ade80',
  },
  // Level 27: Royal Amethyst
  {
    name: 'Royal Amethyst',
    towerColor: '#2e1065',
    safeColor: '#9333ea',
    safeColors: ['#a855f7', '#c084fc', '#d8b4fe', '#7c3aed', '#8b5cf6', '#faf5ff'],
    dangerColor: '#ef4444',
    ballColor: '#facc15',
    bgGradientTop: '#6b21a8',
    bgGradientBottom: '#0f172a',
    fogColor: '#c084fc',
  },
  // Level 28: Desert Mirage
  {
    name: 'Desert Mirage',
    towerColor: '#78350f',
    safeColor: '#d97706',
    safeColors: ['#f59e0b', '#fbbf24', '#fde047', '#f97316', '#fcd34d', '#fffbeb'],
    dangerColor: '#dc2626',
    ballColor: '#0284c7',
    bgGradientTop: '#b45309',
    bgGradientBottom: '#292524',
    fogColor: '#fcd34d',
  },
  // Level 29: Mariana Trench
  {
    name: 'Mariana Trench',
    towerColor: '#020617',
    safeColor: '#0284c7',
    safeColors: ['#0369a1', '#0284c7', '#38bdf8', '#06b6d4', '#22d3ee', '#e0f2fe'],
    dangerColor: '#ef4444',
    ballColor: '#f43f5e',
    bgGradientTop: '#075985',
    bgGradientBottom: '#000000',
    fogColor: '#0284c7',
  },
  // Level 30: Cyber Matrix
  {
    name: 'Cyber Matrix',
    towerColor: '#052e16',
    safeColor: '#10b981',
    safeColors: ['#34d399', '#6ee7b7', '#22c55e', '#4ade80', '#a7f3d0', '#ecfdf5'],
    dangerColor: '#ef4444',
    ballColor: '#f97316',
    bgGradientTop: '#047857',
    bgGradientBottom: '#020617',
    fogColor: '#34d399',
  },
  // Level 31: Bloodmoon Eclipse
  {
    name: 'Bloodmoon Eclipse',
    towerColor: '#18181b',
    safeColor: '#f97316',
    safeColors: ['#fb923c', '#f59e0b', '#fbbf24', '#f87171', '#fdba74', '#fff7ed'],
    dangerColor: '#dc2626',
    ballColor: '#38bdf8',
    bgGradientTop: '#991b1b',
    bgGradientBottom: '#09090b',
    fogColor: '#b91c1c',
  },
  // Level 32: Celestial Nebula
  {
    name: 'Celestial Nebula',
    towerColor: '#1e1b4b',
    safeColor: '#8b5cf6',
    safeColors: ['#a78bfa', '#c4b5fd', '#ec4899', '#f472b6', '#38bdf8', '#f5f3ff'],
    dangerColor: '#ef4444',
    ballColor: '#facc15',
    bgGradientTop: '#5b21b6',
    bgGradientBottom: '#020617',
    fogColor: '#a78bfa',
  },
  // Level 33: Titanium Monolith
  {
    name: 'Titanium Monolith',
    towerColor: '#334155',
    safeColor: '#94a3b8',
    safeColors: ['#cbd5e1', '#e2e8f0', '#38bdf8', '#7dd3fc', '#f1f5f9', '#ffffff'],
    dangerColor: '#ef4444',
    ballColor: '#f59e0b',
    bgGradientTop: '#475569',
    bgGradientBottom: '#0f172a',
    fogColor: '#94a3b8',
  },
  // Level 34: Golden Aurelia
  {
    name: 'Golden Aurelia',
    towerColor: '#451a03',
    safeColor: '#f59e0b',
    safeColors: ['#fbbf24', '#facc15', '#fde047', '#fb923c', '#fef08a', '#fffbeb'],
    dangerColor: '#dc2626',
    ballColor: '#0284c7',
    bgGradientTop: '#b45309',
    bgGradientBottom: '#1c1917',
    fogColor: '#fde047',
  },
  // Level 35: Hyper Emerald
  {
    name: 'Hyper Emerald',
    towerColor: '#022c22',
    safeColor: '#059669',
    safeColors: ['#10b981', '#34d399', '#06b6d4', '#22d3ee', '#6ee7b7', '#ecfdf5'],
    dangerColor: '#ef4444',
    ballColor: '#fb7185',
    bgGradientTop: '#047857',
    bgGradientBottom: '#000000',
    fogColor: '#10b981',
  },
  // Level 36: Synthwave Horizon
  {
    name: 'Synthwave Horizon',
    towerColor: '#2e1065',
    safeColor: '#d946ef',
    safeColors: ['#e879f9', '#f0abfc', '#38bdf8', '#818cf8', '#f472b6', '#fdf4ff'],
    dangerColor: '#dc2626',
    ballColor: '#facc15',
    bgGradientTop: '#a21caf',
    bgGradientBottom: '#18022b',
    fogColor: '#e879f9',
  },
  // Level 37: Obsidian Magma
  {
    name: 'Obsidian Magma',
    towerColor: '#0c0a09',
    safeColor: '#ea580c',
    safeColors: ['#f97316', '#fb923c', '#fdba74', '#f59e0b', '#fbbf24', '#fff7ed'],
    dangerColor: '#dc2626',
    ballColor: '#38bdf8',
    bgGradientTop: '#7c2d12',
    bgGradientBottom: '#000000',
    fogColor: '#c2410c',
  },
  // Level 38: Starlight Prism
  {
    name: 'Starlight Prism',
    towerColor: '#1e293b',
    safeColor: '#38bdf8',
    safeColors: ['#67e8f9', '#a5f3fc', '#c084fc', '#f472b6', '#fde047', '#ffffff'],
    dangerColor: '#ef4444',
    ballColor: '#f97316',
    bgGradientTop: '#0369a1',
    bgGradientBottom: '#020617',
    fogColor: '#7dd3fc',
  },
  // Level 39: Singularity Void
  {
    name: 'Singularity Void',
    towerColor: '#000000',
    safeColor: '#8b5cf6',
    safeColors: ['#a78bfa', '#c4b5fd', '#38bdf8', '#818cf8', '#e0e7ff', '#f8fafc'],
    dangerColor: '#ef4444',
    ballColor: '#facc15',
    bgGradientTop: '#4c1d95',
    bgGradientBottom: '#000000',
    fogColor: '#7c3aed',
  },
  // Level 40: Grandmaster Championship
  {
    name: 'Grandmaster Pinnacle',
    towerColor: '#050505',
    safeColor: '#fbbf24',
    safeColors: ['#facc15', '#fde047', '#ffffff', '#38bdf8', '#c084fc', '#fef08a'],
    dangerColor: '#ef4444',
    ballColor: '#f59e0b',
    bgGradientTop: '#18181b',
    bgGradientBottom: '#000000',
    fogColor: '#27272a',
  },
];

export const HELIX_ACHIEVEMENTS: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'first_level',
    title: 'First Step',
    description: 'Complete your first level in Helix Jump.',
    icon: 'Flag',
  },
  {
    id: 'high_score',
    title: 'High Score Club',
    description: 'Score 1,000 or more points in a single run.',
    icon: 'Trophy',
  },
  {
    id: 'streak_3',
    title: 'Hot Streak',
    description: 'Complete 3 levels consecutively without dying.',
    icon: 'Zap',
  },
  {
    id: 'expert_tier',
    title: 'Helix Veteran',
    description: 'Unlock and reach Level 20.',
    icon: 'Shield',
  },
  {
    id: 'extreme_tier',
    title: 'Tower Master',
    description: 'Unlock and reach Level 30.',
    icon: 'Award',
  },
  {
    id: 'champion',
    title: 'Grandmaster Champion',
    description: 'Conquer the final Level 40 and complete the campaign.',
    icon: 'Crown',
  },
];

