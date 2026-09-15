/**
 * Pop Piano - HTML5 Canvas Gameplay Renderer
 * 
 * Features:
 * - 4 equal-width vertical lanes on crisp ivory/white piano surface
 * - Deep black rectangular piano tiles with subtle depth, rounded corners (12px), gloss sheen
 * - Clean hit baseline with target indicators
 * - Visual tap compress and hit bloom animations
 * - Zero clutter: NO musical notation (no D#5, E5, #4, etc.)
 */

import { PianoTileModel, HitEffectParticle } from './types';

export class PianoCanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Main Render Pass
   */
  public render(
    tiles: PianoTileModel[],
    hitEffects: HitEffectParticle[],
    pressedLanes: Record<number, boolean>,
    laneFlashes: Record<number, 'hit' | 'miss' | null>,
    hitLineY: number
  ) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (w <= 0 || h <= 0) return;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Clean Piano Board Background & 4 Lanes
    this.drawLanes(pressedLanes, laneFlashes, hitLineY);

    // 2. Draw Piano Tiles
    this.drawTiles(tiles);

    // 3. Draw Hit Floating Particles
    this.drawParticles(hitEffects);
  }

  /**
   * Draws the 4 vertical lanes with crisp dividers and touch active states
   */
  private drawLanes(
    pressedLanes: Record<number, boolean>,
    laneFlashes: Record<number, 'hit' | 'miss' | null>,
    hitLineY: number
  ) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const laneWidth = w / 4;

    // Background base: Pristine ivory/pearl
    ctx.fillStyle = '#FAFBFD';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 4; i++) {
      const x = i * laneWidth;
      const isPressed = pressedLanes[i];
      const flash = laneFlashes[i];

      // Lane fill feedback on tap or hit/miss
      if (flash === 'hit') {
        ctx.fillStyle = 'rgba(139, 203, 61, 0.24)';
        ctx.fillRect(x, 0, laneWidth, h);
      } else if (flash === 'miss') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.32)';
        ctx.fillRect(x, 0, laneWidth, h);
      } else if (isPressed) {
        ctx.fillStyle = 'rgba(22, 136, 201, 0.16)';
        ctx.fillRect(x, 0, laneWidth, h);
      }

      // Vertical lane divider lines (subtle, clean)
      if (i > 0) {
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Bottom Key Touch Indicator Bar
      const keyBoxW = laneWidth * 0.86;
      const keyBoxH = 44;
      const keyBoxX = x + (laneWidth - keyBoxW) / 2;
      const keyBoxY = h - keyBoxH - 8;

      ctx.save();
      if (isPressed) {
        ctx.fillStyle = '#1688C9';
        ctx.strokeStyle = '#0E6BA8';
        this.roundRect(ctx, keyBoxX, keyBoxY + 2, keyBoxW, keyBoxH - 2, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TAP', keyBoxX + keyBoxW / 2, keyBoxY + keyBoxH / 2 + 1);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        this.roundRect(ctx, keyBoxX, keyBoxY, keyBoxW, keyBoxH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TAP', keyBoxX + keyBoxW / 2, keyBoxY + keyBoxH / 2);
      }
      ctx.restore();
    }
  }

  /**
   * Draws rectangular black piano tiles with realistic depth, gradients and gloss highlights
   * NO unnecessary note text/numbers on the tiles.
   */
  private drawTiles(tiles: PianoTileModel[]) {
    const ctx = this.ctx;
    const laneWidth = this.width / 4;

    for (const tile of tiles) {
      if (tile.isMissed) continue;

      const tileW = laneWidth * 0.90;
      const tileH = tile.height;
      const x = tile.lane * laneWidth + (laneWidth - tileW) / 2;
      const y = tile.y;

      // Only draw if within visible vertical viewport
      if (y + tileH < -30 || y > this.height + 60) continue;

      ctx.save();

      if (tile.isHit) {
        // Hit Dissolve / Illumination Animation (0 to 140ms)
        const progress = Math.min(1, tile.hitAnimTime / 140);
        const alpha = Math.max(0, 1 - progress);
        const scale = 1 + progress * 0.08;

        ctx.globalAlpha = alpha;
        ctx.translate(x + tileW / 2, y + tileH / 2);
        ctx.scale(scale, scale);
        ctx.translate(-(x + tileW / 2), -(y + tileH / 2));

        // Vibrant green hit flash
        ctx.fillStyle = '#8BCB3D';
        this.roundRect(ctx, x, y, tileW, tileH, 12);
        ctx.fill();

        ctx.restore();
        continue;
      }

      // Default Active Piano Tile: Deep obsidian/jet-black gradient with realistic shine
      ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      const grad = ctx.createLinearGradient(x, y, x, y + tileH);
      grad.addColorStop(0, '#242930');
      grad.addColorStop(0.18, '#15191F');
      grad.addColorStop(0.85, '#0B0D11');
      grad.addColorStop(1, '#030406');

      ctx.fillStyle = grad;
      this.roundRect(ctx, x, y, tileW, tileH, 12);
      ctx.fill();

      // Subtle metallic edge border
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Top Specular Gloss Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      this.roundRect(ctx, x + 6, y + 4, tileW - 12, 3, 2);
      ctx.fill();

      // Bottom Bevel Depth Lip
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.roundRect(ctx, x + 6, y + tileH - 5, tileW - 12, 2, 1);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Draws floating hit particles (+4 PTS, PERFECT, GREAT)
   */
  private drawParticles(particles: HitEffectParticle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      if (p.alpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.scale(p.scale, p.scale);

      // Text Badge
      const isPerfect = p.type === 'PERFECT';
      const badgeBg = isPerfect ? '#8BCB3D' : '#1688C9';

      ctx.fillStyle = badgeBg;
      ctx.shadowColor = badgeBg;
      ctx.shadowBlur = 6;
      this.roundRect(ctx, -36, -11, 72, 22, 6);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, 0, 0);

      ctx.restore();
    }
  }

  /**
   * Helper to draw rounded rectangle on Canvas
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
