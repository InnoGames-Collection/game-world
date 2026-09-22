/**
 * Mapping of Game IDs to high-quality 4:3 WebP covers imported from innoarcade-deploy.
 */

export const GAME_COVER_MAP: Record<string, string> = {
  'candy-blast': '/covers/candy_crush.webp',
  'helix-jump': '/covers/helix_jump.webp',
  'royal-water-sort': '/covers/royal_water_sort.webp',
  'sorting-balls': '/covers/emoji_sorting_ball.webp',
  'fruit-slice': '/covers/fruit_ninja.webp',
  'knife-madness': '/covers/knife_hit.webp',
  'hill-rider': '/covers/hill_climb.webp',
  'pop-piano': '/covers/pop_piano.webp',
  'bubble-shooter': '/covers/bubble_shooter.webp',
  'juicy-match': '/covers/candy_juice.webp',
  'puzzle-block': '/covers/block_blast.webp',
  'crazy-colors': '/covers/crazy_color.webp',
  'color-rush': '/covers/crazy_color.webp',
  'archery-strike': '/covers/arrow_shot.webp',
  'memory-match': '/covers/memory_match.webp',
  'world-legends': '/covers/word_legend.webp',
  'solitaire': '/covers/solitaire.webp',
  'emoji-fun': '/covers/emoji_fun.webp',
  'emoji-iq': '/covers/emoji_fun.webp',
  'emoji-sorting-ball': '/covers/emoji_sorting_ball.webp',
  'halloween-fruit-slice': '/covers/halloween_fruit_slice.webp',
  'soccer-shooter': '/covers/soccer_shooter.webp',
  'moto-race': '/covers/moto_race.webp',
  'button-soccer': '/covers/button_soccer.webp',
  'soccer-ping-pong': '/covers/soccer_ping_pong.webp',
  'dama': '/covers/dama.webp',
  'pop-balloon': '/covers/pop_ballon.webp',
};

export function getCoverUrlForGame(gameId: string, fallbackUrl?: string): string {
  if (fallbackUrl && !fallbackUrl.startsWith('data:') && !fallbackUrl.includes('canvas')) {
    return fallbackUrl;
  }
  return GAME_COVER_MAP[gameId] || `/covers/${gameId.replace(/-/g, '_')}.webp`;
}
