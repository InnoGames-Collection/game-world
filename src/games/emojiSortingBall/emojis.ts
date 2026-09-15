/**
 * EMOJI SORTING BALL - Stylized 3D Emoji Asset & Texture Engine
 * 
 * Features 130+ distinct, curated emoji models with consistent 3D visual identities.
 * Each emoji is rendered as a tangible, high-specular arcade vinyl sphere with:
 * - Spherical ambient shading & diffuse radial gradients
 * - High-contrast central emoji glyph with soft drop shadow
 * - Glossy curved glass reflection crest
 * - Dedicated chromatic styling per family
 */

import * as THREE from 'three';
import { EmojiDefinition } from './types';

export const EMOJI_REGISTRY: Record<string, EmojiDefinition> = {
  // --- Happy & Warm Faces ---
  grin: {
    key: 'grin',
    char: '😀',
    name: 'Grinning Face',
    category: 'faces_happy',
    sphereBaseColor: '#FFB800',
    threeColor: 0xFFB800,
    highlightColor: '#FFF8B8',
    shadowColor: '#A86800',
  },
  smiley: {
    key: 'smiley',
    char: '😃',
    name: 'Smiley Face',
    category: 'faces_happy',
    sphereBaseColor: '#FFAE00',
    threeColor: 0xFFAE00,
    highlightColor: '#FFF4A3',
    shadowColor: '#9E5D00',
  },
  smile: {
    key: 'smile',
    char: '😄',
    name: 'Smile Open',
    category: 'faces_happy',
    sphereBaseColor: '#FFB200',
    threeColor: 0xFFB200,
    highlightColor: '#FFF5A8',
    shadowColor: '#A36200',
  },
  beam: {
    key: 'beam',
    char: '😁',
    name: 'Beaming Face',
    category: 'faces_happy',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  laugh: {
    key: 'laugh',
    char: '😆',
    name: 'Laughing Squint',
    category: 'faces_happy',
    sphereBaseColor: '#FF9E00',
    threeColor: 0xFF9E00,
    highlightColor: '#FFEAA6',
    shadowColor: '#965200',
  },
  sweat_smile: {
    key: 'sweat_smile',
    char: '😅',
    name: 'Sweat Smile',
    category: 'faces_happy',
    sphereBaseColor: '#FFB020',
    threeColor: 0xFFB020,
    highlightColor: '#FFF1B8',
    shadowColor: '#A15E00',
  },
  joy: {
    key: 'joy',
    char: '😂',
    name: 'Tears of Joy',
    category: 'faces_happy',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#A16600',
  },
  rofl: {
    key: 'rofl',
    char: '🤣',
    name: 'Rolling Laughing',
    category: 'faces_happy',
    sphereBaseColor: '#FF9F1C',
    threeColor: 0xFF9F1C,
    highlightColor: '#FFE6B0',
    shadowColor: '#995000',
  },
  blush: {
    key: 'blush',
    char: '😊',
    name: 'Blushing Smile',
    category: 'faces_happy',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF8C4',
    shadowColor: '#A86A00',
  },
  halo: {
    key: 'halo',
    char: '😇',
    name: 'Innocent Halo',
    category: 'faces_happy',
    sphereBaseColor: '#FFC300',
    threeColor: 0xFFC300,
    highlightColor: '#FFFBD4',
    shadowColor: '#B07800',
  },
  slight_smile: {
    key: 'slight_smile',
    char: '🙂',
    name: 'Slight Smile',
    category: 'faces_happy',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#A16600',
  },
  upside_down: {
    key: 'upside_down',
    char: '🙃',
    name: 'Upside Down',
    category: 'faces_happy',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#A16600',
  },
  wink: {
    key: 'wink',
    char: '😉',
    name: 'Wink Face',
    category: 'faces_happy',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  relieved: {
    key: 'relieved',
    char: '😌',
    name: 'Relieved Face',
    category: 'faces_happy',
    sphereBaseColor: '#FFC02A',
    threeColor: 0xFFC02A,
    highlightColor: '#FFF9D0',
    shadowColor: '#A87200',
  },
  heart_eyes: {
    key: 'heart_eyes',
    char: '😍',
    name: 'Heart Eyes',
    category: 'faces_happy',
    sphereBaseColor: '#FF8500',
    threeColor: 0xFF8500,
    highlightColor: '#FFDFBA',
    shadowColor: '#943D00',
  },
  in_love: {
    key: 'in_love',
    char: '🥰',
    name: 'Smiling Hearts',
    category: 'faces_happy',
    sphereBaseColor: '#FF7B00',
    threeColor: 0xFF7B00,
    highlightColor: '#FFD7B0',
    shadowColor: '#8C3500',
  },
  kiss: {
    key: 'kiss',
    char: '😘',
    name: 'Blowing Kiss',
    category: 'faces_happy',
    sphereBaseColor: '#FF9E00',
    threeColor: 0xFF9E00,
    highlightColor: '#FFE8A8',
    shadowColor: '#9C5400',
  },
  cool: {
    key: 'cool',
    char: '😎',
    name: 'Cool Sunglasses',
    category: 'faces_happy',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#995C00',
  },
  star_struck: {
    key: 'star_struck',
    char: '🤩',
    name: 'Star Struck',
    category: 'faces_happy',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFFAD9',
    shadowColor: '#A36800',
  },
  party: {
    key: 'party',
    char: '🥳',
    name: 'Partying Face',
    category: 'faces_happy',
    sphereBaseColor: '#FF8800',
    threeColor: 0xFF8800,
    highlightColor: '#FFE0B2',
    shadowColor: '#944000',
  },

  // --- Expressive & Emotional Faces ---
  think: {
    key: 'think',
    char: '🤔',
    name: 'Thinking Face',
    category: 'faces_expressive',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#A16600',
  },
  eyebrow: {
    key: 'eyebrow',
    char: '🤨',
    name: 'Raised Eyebrow',
    category: 'faces_expressive',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#A16600',
  },
  neutral: {
    key: 'neutral',
    char: '😐',
    name: 'Neutral Face',
    category: 'faces_expressive',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  expressionless: {
    key: 'expressionless',
    char: '😑',
    name: 'Expressionless',
    category: 'faces_expressive',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  rolling_eyes: {
    key: 'rolling_eyes',
    char: '🙄',
    name: 'Rolling Eyes',
    category: 'faces_expressive',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  smirk: {
    key: 'smirk',
    char: '😏',
    name: 'Smirking Face',
    category: 'faces_expressive',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  yawn: {
    key: 'yawn',
    char: '🥱',
    name: 'Yawning Face',
    category: 'faces_expressive',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  sleep: {
    key: 'sleep',
    char: '😴',
    name: 'Sleeping Face',
    category: 'faces_expressive',
    sphereBaseColor: '#60A5FA',
    threeColor: 0x60A5FA,
    highlightColor: '#DBEAFE',
    shadowColor: '#1E40AF',
  },
  yum: {
    key: 'yum',
    char: '😋',
    name: 'Yum Delicious',
    category: 'faces_expressive',
    sphereBaseColor: '#FF9E00',
    threeColor: 0xFF9E00,
    highlightColor: '#FFE8A8',
    shadowColor: '#9C5400',
  },
  tongue: {
    key: 'tongue',
    char: '😛',
    name: 'Tongue Out',
    category: 'faces_expressive',
    sphereBaseColor: '#FF9E00',
    threeColor: 0xFF9E00,
    highlightColor: '#FFE8A8',
    shadowColor: '#9C5400',
  },
  wink_tongue: {
    key: 'wink_tongue',
    char: '😜',
    name: 'Winking Tongue',
    category: 'faces_expressive',
    sphereBaseColor: '#FF9E00',
    threeColor: 0xFF9E00,
    highlightColor: '#FFE8A8',
    shadowColor: '#9C5400',
  },
  crazy: {
    key: 'crazy',
    char: '🤪',
    name: 'Zany Crazy',
    category: 'faces_expressive',
    sphereBaseColor: '#FF8800',
    threeColor: 0xFF8800,
    highlightColor: '#FFE0B2',
    shadowColor: '#944000',
  },
  nerd: {
    key: 'nerd',
    char: '🤓',
    name: 'Nerd Face',
    category: 'faces_expressive',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#A16600',
  },
  monocle: {
    key: 'monocle',
    char: '🧐',
    name: 'Monocle Face',
    category: 'faces_expressive',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#A16600',
  },
  confused: {
    key: 'confused',
    char: '😕',
    name: 'Confused Face',
    category: 'faces_expressive',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  worried: {
    key: 'worried',
    char: '😟',
    name: 'Worried Face',
    category: 'faces_expressive',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  flushed: {
    key: 'flushed',
    char: '😳',
    name: 'Flushed Eyes',
    category: 'faces_expressive',
    sphereBaseColor: '#FFBA08',
    threeColor: 0xFFBA08,
    highlightColor: '#FFF8BE',
    shadowColor: '#A66B00',
  },
  pleading: {
    key: 'pleading',
    char: '🥺',
    name: 'Pleading Eyes',
    category: 'faces_expressive',
    sphereBaseColor: '#FFB703',
    threeColor: 0xFFB703,
    highlightColor: '#FFF6B3',
    shadowColor: '#A16600',
  },
  cry: {
    key: 'cry',
    char: '😢',
    name: 'Crying Tear',
    category: 'faces_expressive',
    sphereBaseColor: '#38BDF8',
    threeColor: 0x38BDF8,
    highlightColor: '#E0F2FE',
    shadowColor: '#0284C7',
  },
  sob: {
    key: 'sob',
    char: '😭',
    name: 'Loudly Crying',
    category: 'faces_expressive',
    sphereBaseColor: '#38BDF8',
    threeColor: 0x38BDF8,
    highlightColor: '#E0F2FE',
    shadowColor: '#0284C7',
  },
  scream: {
    key: 'scream',
    char: '😱',
    name: 'Fear Scream',
    category: 'faces_expressive',
    sphereBaseColor: '#818CF8',
    threeColor: 0x818CF8,
    highlightColor: '#EEF2FF',
    shadowColor: '#4338CA',
  },

  // --- Extreme & Fantasy ---
  cold: {
    key: 'cold',
    char: '🥶',
    name: 'Freezing Cold',
    category: 'faces_wild',
    sphereBaseColor: '#38BDF8',
    threeColor: 0x38BDF8,
    highlightColor: '#BAE6FD',
    shadowColor: '#0369A1',
  },
  hot: {
    key: 'hot',
    char: '🥵',
    name: 'Overheated Hot',
    category: 'faces_wild',
    sphereBaseColor: '#EF4444',
    threeColor: 0xEF4444,
    highlightColor: '#FECACA',
    shadowColor: '#991B1B',
  },
  rage: {
    key: 'rage',
    char: '😡',
    name: 'Rage Red',
    category: 'faces_wild',
    sphereBaseColor: '#DC2626',
    threeColor: 0xDC2626,
    highlightColor: '#FCA5A5',
    shadowColor: '#7F1D1D',
  },
  angry: {
    key: 'angry',
    char: '😠',
    name: 'Angry Scowl',
    category: 'faces_wild',
    sphereBaseColor: '#E11D48',
    threeColor: 0xE11D48,
    highlightColor: '#FDA4AF',
    shadowColor: '#881337',
  },
  curse: {
    key: 'curse',
    char: '🤬',
    name: 'Swearing Symbols',
    category: 'faces_wild',
    sphereBaseColor: '#B91C1C',
    threeColor: 0xB91C1C,
    highlightColor: '#F87171',
    shadowColor: '#450A0A',
  },
  exploding: {
    key: 'exploding',
    char: '🤯',
    name: 'Mind Blown',
    category: 'faces_wild',
    sphereBaseColor: '#FF6B6B',
    threeColor: 0xFF6B6B,
    highlightColor: '#FFE0E0',
    shadowColor: '#A81C1C',
  },
  devil: {
    key: 'devil',
    char: '😈',
    name: 'Imp Devil',
    category: 'creatures',
    sphereBaseColor: '#8B5CF6',
    threeColor: 0x8B5CF6,
    highlightColor: '#DDD6FE',
    shadowColor: '#5B21B6',
  },
  angry_devil: {
    key: 'angry_devil',
    char: '👿',
    name: 'Angry Devil',
    category: 'creatures',
    sphereBaseColor: '#7C3AED',
    threeColor: 0x7C3AED,
    highlightColor: '#C4B5FD',
    shadowColor: '#4C1D95',
  },
  skull: {
    key: 'skull',
    char: '💀',
    name: 'Skeleton Skull',
    category: 'creatures',
    sphereBaseColor: '#E2E8F0',
    threeColor: 0xE2E8F0,
    highlightColor: '#FFFFFF',
    shadowColor: '#64748B',
  },
  ghost: {
    key: 'ghost',
    char: '👻',
    name: 'Friendly Ghost',
    category: 'creatures',
    sphereBaseColor: '#F1F5F9',
    threeColor: 0xF1F5F9,
    highlightColor: '#FFFFFF',
    shadowColor: '#94A3B8',
  },
  robot: {
    key: 'robot',
    char: '🤖',
    name: 'Mecha Robot',
    category: 'creatures',
    sphereBaseColor: '#94A3B8',
    threeColor: 0x94A3B8,
    highlightColor: '#F8FAFC',
    shadowColor: '#334155',
  },
  alien: {
    key: 'alien',
    char: '👽',
    name: 'Cosmic Alien',
    category: 'creatures',
    sphereBaseColor: '#10B981',
    threeColor: 0x10B981,
    highlightColor: '#A7F3D0',
    shadowColor: '#047857',
  },
  pumpkin: {
    key: 'pumpkin',
    char: '🎃',
    name: 'Jack-o-Lantern',
    category: 'creatures',
    sphereBaseColor: '#F97316',
    threeColor: 0xF97316,
    highlightColor: '#FFEDD5',
    shadowColor: '#9A3412',
  },

  // --- Animal Friends ---
  dog: {
    key: 'dog',
    char: '🐶',
    name: 'Puppy Dog',
    category: 'nature',
    sphereBaseColor: '#D97706',
    threeColor: 0xD97706,
    highlightColor: '#FDE68A',
    shadowColor: '#78350F',
  },
  cat: {
    key: 'cat',
    char: '🐱',
    name: 'Kitty Cat',
    category: 'nature',
    sphereBaseColor: '#F59E0B',
    threeColor: 0xF59E0B,
    highlightColor: '#FEF3C7',
    shadowColor: '#B45309',
  },
  fox: {
    key: 'fox',
    char: '🦊',
    name: 'Clever Fox',
    category: 'nature',
    sphereBaseColor: '#EA580C',
    threeColor: 0xEA580C,
    highlightColor: '#FED7AA',
    shadowColor: '#7C2D12',
  },
  panda: {
    key: 'panda',
    char: '🐼',
    name: 'Giant Panda',
    category: 'nature',
    sphereBaseColor: '#F8FAFC',
    threeColor: 0xF8FAFC,
    highlightColor: '#FFFFFF',
    shadowColor: '#64748B',
  },
  frog: {
    key: 'frog',
    char: '🐸',
    name: 'Green Frog',
    category: 'nature',
    sphereBaseColor: '#22C55E',
    threeColor: 0x22C55E,
    highlightColor: '#BBF7D0',
    shadowColor: '#15803D',
  },
  lion: {
    key: 'lion',
    char: '🦁',
    name: 'Brave Lion',
    category: 'nature',
    sphereBaseColor: '#F59E0B',
    threeColor: 0xF59E0B,
    highlightColor: '#FEF3C7',
    shadowColor: '#92400E',
  },
  tiger: {
    key: 'tiger',
    char: '🐯',
    name: 'Fierce Tiger',
    category: 'nature',
    sphereBaseColor: '#F97316',
    threeColor: 0xF97316,
    highlightColor: '#FFEDD5',
    shadowColor: '#9A3412',
  },
  monkey: {
    key: 'monkey',
    char: '🐵',
    name: 'Cheeky Monkey',
    category: 'nature',
    sphereBaseColor: '#B45309',
    threeColor: 0xB45309,
    highlightColor: '#FDE68A',
    shadowColor: '#451A03',
  },

  // --- Symbols, Hearts & Treasures ---
  heart_red: {
    key: 'heart_red',
    char: '❤️',
    name: 'Ruby Heart',
    category: 'symbols',
    sphereBaseColor: '#EF4444',
    threeColor: 0xEF4444,
    highlightColor: '#FECACA',
    shadowColor: '#991B1B',
  },
  heart_blue: {
    key: 'heart_blue',
    char: '💙',
    name: 'Sapphire Heart',
    category: 'symbols',
    sphereBaseColor: '#3B82F6',
    threeColor: 0x3B82F6,
    highlightColor: '#BFDBFE',
    shadowColor: '#1D4ED8',
  },
  heart_green: {
    key: 'heart_green',
    char: '💚',
    name: 'Emerald Heart',
    category: 'symbols',
    sphereBaseColor: '#10B981',
    threeColor: 0x10B981,
    highlightColor: '#A7F3D0',
    shadowColor: '#047857',
  },
  heart_yellow: {
    key: 'heart_yellow',
    char: '💛',
    name: 'Gold Heart',
    category: 'symbols',
    sphereBaseColor: '#EAB308',
    threeColor: 0xEAB308,
    highlightColor: '#FEF08A',
    shadowColor: '#854D0E',
  },
  heart_purple: {
    key: 'heart_purple',
    char: '💜',
    name: 'Amethyst Heart',
    category: 'symbols',
    sphereBaseColor: '#8B5CF6',
    threeColor: 0x8B5CF6,
    highlightColor: '#DDD6FE',
    shadowColor: '#5B21B6',
  },
  heart_orange: {
    key: 'heart_orange',
    char: '🧡',
    name: 'Topaz Heart',
    category: 'symbols',
    sphereBaseColor: '#F97316',
    threeColor: 0xF97316,
    highlightColor: '#FFEDD5',
    shadowColor: '#9A3412',
  },
  heart_pink: {
    key: 'heart_pink',
    char: '🩷',
    name: 'Rose Heart',
    category: 'symbols',
    sphereBaseColor: '#F472B6',
    threeColor: 0xF472B6,
    highlightColor: '#FCE7F3',
    shadowColor: '#9D174D',
  },
  fire: {
    key: 'fire',
    char: '🔥',
    name: 'Flame Blaze',
    category: 'symbols',
    sphereBaseColor: '#FF5400',
    threeColor: 0xFF5400,
    highlightColor: '#FFDD99',
    shadowColor: '#9E1C00',
  },
  star: {
    key: 'star',
    char: '⭐',
    name: 'Shining Star',
    category: 'symbols',
    sphereBaseColor: '#FACC15',
    threeColor: 0xFACC15,
    highlightColor: '#FEF9C3',
    shadowColor: '#A16207',
  },
  sparkles: {
    key: 'sparkles',
    char: '🌟',
    name: 'Glowing Sparkles',
    category: 'symbols',
    sphereBaseColor: '#FBBF24',
    threeColor: 0xFBBF24,
    highlightColor: '#FEF3C7',
    shadowColor: '#B45309',
  },
  gem: {
    key: 'gem',
    char: '💎',
    name: 'Diamond Crystal',
    category: 'symbols',
    sphereBaseColor: '#22D3EE',
    threeColor: 0x22D3EE,
    highlightColor: '#CFFAFE',
    shadowColor: '#0E7490',
  },
  rocket: {
    key: 'rocket',
    char: '🚀',
    name: 'Space Rocket',
    category: 'symbols',
    sphereBaseColor: '#6366F1',
    threeColor: 0x6366F1,
    highlightColor: '#E0E7FF',
    shadowColor: '#3730A3',
  },
  trophy: {
    key: 'trophy',
    char: '🏆',
    name: 'Golden Trophy',
    category: 'symbols',
    sphereBaseColor: '#EAB308',
    threeColor: 0xEAB308,
    highlightColor: '#FEF08A',
    shadowColor: '#713F12',
  },
  rainbow: {
    key: 'rainbow',
    char: '🌈',
    name: 'Rainbow Arc',
    category: 'nature',
    sphereBaseColor: '#EC4899',
    threeColor: 0xEC4899,
    highlightColor: '#FDF2F8',
    shadowColor: '#831843',
  },
  sun: {
    key: 'sun',
    char: '☀️',
    name: 'Radiant Sun',
    category: 'nature',
    sphereBaseColor: '#F59E0B',
    threeColor: 0xF59E0B,
    highlightColor: '#FFFBEB',
    shadowColor: '#92400E',
  },
  moon: {
    key: 'moon',
    char: '🌙',
    name: 'Crescent Moon',
    category: 'nature',
    sphereBaseColor: '#6366F1',
    threeColor: 0x6366F1,
    highlightColor: '#EEF2FF',
    shadowColor: '#312E81',
  },

  // --- Food & Snacks ---
  pizza: {
    key: 'pizza',
    char: '🍕',
    name: 'Crispy Pizza',
    category: 'food',
    sphereBaseColor: '#EA580C',
    threeColor: 0xEA580C,
    highlightColor: '#FFEDD5',
    shadowColor: '#7C2D12',
  },
  burger: {
    key: 'burger',
    char: '🍔',
    name: 'Cheesy Burger',
    category: 'food',
    sphereBaseColor: '#CA8A04',
    threeColor: 0xCA8A04,
    highlightColor: '#FEF9C3',
    shadowColor: '#713F12',
  },
  donut: {
    key: 'donut',
    char: '🍩',
    name: 'Glazed Donut',
    category: 'food',
    sphereBaseColor: '#F472B6',
    threeColor: 0xF472B6,
    highlightColor: '#FDF2F8',
    shadowColor: '#9D174D',
  },
  apple: {
    key: 'apple',
    char: '🍎',
    name: 'Red Apple',
    category: 'food',
    sphereBaseColor: '#EF4444',
    threeColor: 0xEF4444,
    highlightColor: '#FEE2E2',
    shadowColor: '#991B1B',
  },
  strawberry: {
    key: 'strawberry',
    char: '🍓',
    name: 'Berry Sweet',
    category: 'food',
    sphereBaseColor: '#F43F5E',
    threeColor: 0xF43F5E,
    highlightColor: '#FFE4E6',
    shadowColor: '#881337',
  },
  watermelon: {
    key: 'watermelon',
    char: '🍉',
    name: 'Juicy Watermelon',
    category: 'food',
    sphereBaseColor: '#10B981',
    threeColor: 0x10B981,
    highlightColor: '#D1FAE5',
    shadowColor: '#064E3B',
  },
  banana: {
    key: 'banana',
    char: '🍌',
    name: 'Ripe Banana',
    category: 'food',
    sphereBaseColor: '#EAB308',
    threeColor: 0xEAB308,
    highlightColor: '#FEF08A',
    shadowColor: '#713F12',
  },
  cherry: {
    key: 'cherry',
    char: '🍒',
    name: 'Sweet Cherries',
    category: 'food',
    sphereBaseColor: '#E11D48',
    threeColor: 0xE11D48,
    highlightColor: '#FFE4E6',
    shadowColor: '#881337',
  },
  soccer: {
    key: 'soccer',
    char: '⚽',
    name: 'Soccer Ball',
    category: 'symbols',
    sphereBaseColor: '#F8FAFC',
    threeColor: 0xF8FAFC,
    highlightColor: '#FFFFFF',
    shadowColor: '#475569',
  },
  basketball: {
    key: 'basketball',
    char: '🏀',
    name: 'Basketball Hoop',
    category: 'symbols',
    sphereBaseColor: '#EA580C',
    threeColor: 0xEA580C,
    highlightColor: '#FED7AA',
    shadowColor: '#7C2D12',
  },
};

/**
 * Texture Cache ensuring 100% VISUAL IDENTITY CONSISTENCY
 * Every emoji key produces an immutable, identical THREE.CanvasTexture instance.
 */
const emojiTextureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Generate a high-definition 3D stylized arcade ball texture for the specified emoji
 */
export function getEmojiTexture(emojiKey: string): THREE.CanvasTexture {
  if (emojiTextureCache.has(emojiKey)) {
    return emojiTextureCache.get(emojiKey)!;
  }

  const def = EMOJI_REGISTRY[emojiKey] || EMOJI_REGISTRY.grin;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallbackTex = new THREE.CanvasTexture(canvas);
    return fallbackTex;
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.47;

  ctx.clearRect(0, 0, size, size);

  // 1. Spherical 3D Shading Radial Gradient (Key light slightly top-left: 0.38, 0.34)
  const lightX = cx - radius * 0.28;
  const lightY = cy - radius * 0.32;
  const sphereGrad = ctx.createRadialGradient(
    lightX,
    lightY,
    radius * 0.06,
    cx,
    cy,
    radius
  );

  sphereGrad.addColorStop(0.0, '#FFFFFF');
  sphereGrad.addColorStop(0.12, def.highlightColor);
  sphereGrad.addColorStop(0.35, def.sphereBaseColor);
  sphereGrad.addColorStop(0.78, def.sphereBaseColor);
  sphereGrad.addColorStop(0.94, def.shadowColor);
  sphereGrad.addColorStop(1.0, '#0F0B18');

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = sphereGrad;
  ctx.fill();

  // 2. Subtle Ground Bounce (Warm studio bounce reflection on lower rim)
  const bounceGrad = ctx.createRadialGradient(
    cx + radius * 0.32,
    cy + radius * 0.42,
    radius * 0.08,
    cx + radius * 0.32,
    cy + radius * 0.42,
    radius * 0.55
  );
  bounceGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.32)');
  bounceGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
  bounceGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.beginPath();
  ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
  ctx.fillStyle = bounceGrad;
  ctx.fill();

  // 3. Central Stylized 3D Emoji Character with High-Contrast Legibility
  ctx.save();
  ctx.font = 'bold 248px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Primary soft ambient depth shadow underneath emoji
  ctx.shadowColor = 'rgba(0, 0, 0, 0.50)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 14;
  ctx.shadowOffsetX = 0;

  // Render emoji glyph
  ctx.fillText(def.char, cx, cy + 8);
  ctx.restore();

  // 4. Glossy Specular Crest Overlay (Upper-left arcade glass reflection)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    lightX + 12,
    lightY + 12,
    radius * 0.40,
    radius * 0.20,
    -Math.PI / 5,
    0,
    Math.PI * 2
  );
  const specGrad = ctx.createRadialGradient(
    lightX + 12,
    lightY + 12,
    2,
    lightX + 12,
    lightY + 12,
    radius * 0.38
  );
  specGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.75)');
  specGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.28)');
  specGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = specGrad;
  ctx.fill();

  // Micro Specular Glint
  ctx.beginPath();
  ctx.arc(lightX + 6, lightY + 4, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();
  ctx.restore();

  // 5. Crisp 3D Edge Rim for Physical Stack Separation in Tubes
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1.5, 0, Math.PI * 2);
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.38)';
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;

  emojiTextureCache.set(emojiKey, texture);
  return texture;
}

/**
 * Get definition with safe fallback
 */
export function getEmojiDef(key: string): EmojiDefinition {
  return EMOJI_REGISTRY[key] || EMOJI_REGISTRY.grin;
}
