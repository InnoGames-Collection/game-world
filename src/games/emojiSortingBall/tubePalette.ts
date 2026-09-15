/**
 * EMOJI SORTING BALL - Mandatory Official Tube Palette
 * 
 * STRICT SOURCE OF TRUTH (DO NOT MODIFY OR REPLACE):
 * TUBE 1: #FF6B6B
 * TUBE 2: #14B8A6
 * TUBE 3: #8B5CF6
 * TUBE 4: #F4B942
 * TUBE 5: #EC6FA9
 * TUBE 6: #38BDF8
 * TUBE 7: #22C55E
 * TUBE 8: #F97316
 */

export interface TubePaletteEntry {
  index: number;
  name: string;
  hex: string;
  threeColor: number;
}

export const EMOJI_TUBE_PALETTE: readonly TubePaletteEntry[] = [
  { index: 0, name: 'Coral Red', hex: '#FF6B6B', threeColor: 0xFF6B6B },
  { index: 1, name: 'Teal Green', hex: '#14B8A6', threeColor: 0x14B8A6 },
  { index: 2, name: 'Royal Violet', hex: '#8B5CF6', threeColor: 0x8B5CF6 },
  { index: 3, name: 'Golden Amber', hex: '#F4B942', threeColor: 0xF4B942 },
  { index: 4, name: 'Rose Pink', hex: '#EC6FA9', threeColor: 0xEC6FA9 },
  { index: 5, name: 'Sky Blue', hex: '#38BDF8', threeColor: 0x38BDF8 },
  { index: 6, name: 'Vibrant Green', hex: '#22C55E', threeColor: 0x22C55E },
  { index: 7, name: 'Vivid Orange', hex: '#F97316', threeColor: 0xF97316 },
] as const;

export const MANDATORY_TUBE_PALETTE = EMOJI_TUBE_PALETTE;

/**
 * Returns the exact tube palette entry for any tube index (cycles if > 8 tubes)
 * Order 1-8 strictly followed:
 * 1 → #FF6B6B
 * 2 → #14B8A6
 * 3 → #8B5CF6
 * 4 → #F4B942
 * 5 → #EC6FA9
 * 6 → #38BDF8
 * 7 → #22C55E
 * 8 → #F97316
 */
export function getTubePaletteColor(tubeIndex: number): TubePaletteEntry {
  const safeIdx = ((tubeIndex % EMOJI_TUBE_PALETTE.length) + EMOJI_TUBE_PALETTE.length) % EMOJI_TUBE_PALETTE.length;
  return EMOJI_TUBE_PALETTE[safeIdx];
}
