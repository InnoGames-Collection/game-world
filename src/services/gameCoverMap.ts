/**
 * Mapping of Game IDs to high-quality 4:3 WebP covers imported from innoarcade-deploy.
 */

export const GAME_COVER_MAP: Record<string, string> = {
  'candy-blast': '/covers/candy_blast.webp',
  'helix-jump': '/covers/helix_jump.webp',
  'royal-water-sort': '/covers/water_sort.webp',
  'sorting-balls': '/covers/ball_sort.webp',
  'fruit-slice': '/covers/fruit_slice.webp',
  'knife-madness': '/covers/knife_hit.webp',
  'hill-rider': '/covers/hill_climb.webp',
  'pop-piano': '/covers/piano_tiles.webp',
  'bubble-shooter': '/covers/bubble_pop.webp',
  'juicy-match': '/covers/jewel_match.webp',
  'puzzle-block': '/covers/block_blast.webp',
  'crazy-colors': '/covers/color_switch.webp',
  'color-rush': '/covers/color_switch.webp',
  'archery-strike': '/covers/arrow_shot.webp',
  'memory-match': '/covers/memory_match.webp',
  'world-legends': '/covers/temple_dash.webp',
  'solitaire': '/covers/slide_puzzle.webp',
  'emoji-fun': '/covers/rhyme_time.webp',
  'emoji-iq': '/covers/logic_grid.webp',
  'emoji-sorting-ball': '/covers/ball_sort.webp',
  'halloween-fruit-slice': '/covers/fruit_slice.webp',
  'soccer-shooter': '/covers/target_24.webp',
  'moto-race': '/covers/race_car.webp',
  'button-soccer': '/covers/race_car.webp',
  'soccer-ping-pong': '/covers/zigzag.webp',
  'dama': '/covers/sequence.webp',
};

export function getCoverUrlForGame(gameId: string, fallbackUrl?: string): string {
  if (fallbackUrl && !fallbackUrl.startsWith('data:') && !fallbackUrl.includes('canvas')) {
    return fallbackUrl;
  }
  return GAME_COVER_MAP[gameId] || `/covers/${gameId.replace(/-/g, '_')}.webp`;
}
