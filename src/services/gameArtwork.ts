/**
 * GameON Tele - Official High-Definition 3D Game Promotional Key-Art Engine
 * Generates bespoke, cinema-grade promotional key-art posters and banners (960x540)
 * matching modern mobile gaming ecosystems (Google Play, Samsung Gaming Hub, App Store).
 *
 * Strict Architectural Standards:
 * - 20 dedicated, distinct key-art concepts for each individual game (zero shared templates)
 * - Safe central composition (50-70% focal area, visible at all card and banner ratios)
 * - Zero non-gaming icons, zero emojis, zero gameplay HUDs, zero timer bars, zero score numbers
 * - 16:9 master resolution (960x540) with offscreen canvas generation and base64 memory caching
 */

const artworkCache: Record<string, string> = {};

function createOffscreen(w: number = 960, h: number = 540): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  return { canvas, ctx };
}

// -----------------------------------------------------------------------------
// Helper: Draw 3D Glossy Sphere with Drop Shadow, Gradient & Specular Highlights
// -----------------------------------------------------------------------------
function draw3DSphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  c1: string,
  c2: string,
  c3: string,
  shadowAlpha = 0.4
) {
  ctx.save();
  // Drop Shadow
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.1, cy + r * 0.85, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.fill();

  // Base 3D Sphere Body
  const sphereGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.08, cx, cy, r);
  sphereGrad.addColorStop(0, c1);
  sphereGrad.addColorStop(0.55, c2);
  sphereGrad.addColorStop(1, c3);
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Rim Light on Dark Side
  const rimGrad = ctx.createRadialGradient(cx + r * 0.3, cy + r * 0.4, r * 0.6, cx, cy, r);
  rimGrad.addColorStop(0, 'transparent');
  rimGrad.addColorStop(0.85, 'transparent');
  rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Primary Curved Specular Glint
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.32, cy - r * 0.35, r * 0.38, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  const specGrad = ctx.createLinearGradient(
    cx - r * 0.5, cy - r * 0.5,
    cx - r * 0.15, cy - r * 0.2
  );
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  specGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = specGrad;
  ctx.fill();

  // Secondary Micro Pin-Point Highlight
  ctx.beginPath();
  ctx.arc(cx - r * 0.15, cy - r * 0.48, r * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();

  ctx.restore();
}

// -----------------------------------------------------------------------------
// Helper: Draw 4-point Sparkle Star
// -----------------------------------------------------------------------------
function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#ffffff') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.fill();
  // Center gleam
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

// =============================================================================
// 01. CANDY CRUSH (id: candy-blast)
// Premium colorful confectionery universe, glossy candy clusters, sparkling bursts
// =============================================================================
function renderCandyCrushArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Rich magenta/violet cosmos background
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#3b0764');
  bg.addColorStop(0.45, '#1e1b4b');
  bg.addColorStop(0.85, '#0f172a');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft sugar bokeh orbs
  const bokehs = [
    { x: w * 0.15, y: h * 0.2, r: 85, c: 'rgba(244, 63, 94, 0.25)' },
    { x: w * 0.85, y: h * 0.3, r: 100, c: 'rgba(56, 189, 248, 0.25)' },
    { x: w * 0.25, y: h * 0.8, r: 110, c: 'rgba(234, 179, 8, 0.2)' },
    { x: w * 0.75, y: h * 0.75, r: 90, c: 'rgba(139, 203, 61, 0.25)' },
  ];
  for (const b of bokehs) {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, b.c);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Radiating sugar energy waves
  ctx.save();
  ctx.translate(w * 0.52, h * 0.5);
  for (let ring = 1; ring <= 3; ring++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 140 * ring, 90 * ring, -0.15, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.28 / ring})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  for (let i = 0; i < 14; i++) {
    const angle = (i * Math.PI * 2) / 14;
    const len = 160 + (i % 3) * 35;
    const gx = Math.cos(angle) * len;
    const gy = Math.sin(angle) * len;
    const ray = ctx.createLinearGradient(0, 0, gx, gy);
    ray.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    ray.addColorStop(0.6, i % 2 === 0 ? 'rgba(244, 63, 94, 0.5)' : 'rgba(56, 189, 248, 0.5)');
    ray.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(gx, gy);
    ctx.strokeStyle = ray;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();

  // Peripheral floating 3D candies
  draw3DSphere(ctx, w * 0.22, h * 0.42, 46, '#fb7185', '#e11d48', '#881337'); // Ruby cherry
  draw3DSphere(ctx, w * 0.82, h * 0.44, 44, '#fde047', '#eab308', '#854d0e'); // Lemon drop
  draw3DSphere(ctx, w * 0.35, h * 0.72, 42, '#38bdf8', '#0284c7', '#0c4a6e'); // Blue mint
  draw3DSphere(ctx, w * 0.68, h * 0.74, 40, '#a3e635', '#65a30d', '#365314'); // Lime drop

  // Central 3D Swirled Lollipop (The Hero)
  const lcx = w * 0.52;
  const lcy = h * 0.46;
  const lr = 76;

  // Lollipop stick
  ctx.save();
  ctx.beginPath();
  ctx.rect(lcx - 8, lcy + 40, 16, 150);
  const stickGrad = ctx.createLinearGradient(lcx - 8, 0, lcx + 8, 0);
  stickGrad.addColorStop(0, '#ffffff');
  stickGrad.addColorStop(0.5, '#f1f5f9');
  stickGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = stickGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.restore();

  // Swirl Head
  draw3DSphere(ctx, lcx, lcy, lr, '#fda4af', '#e11d48', '#4c0519');

  // Spiral swirl overlay
  ctx.save();
  ctx.translate(lcx, lcy);
  ctx.rotate(-0.3);
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    ctx.beginPath();
    ctx.arc(0, 0, lr * 0.9, angle, angle + 0.45);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  ctx.restore();

  // Extra Sparkles
  drawSparkle(ctx, w * 0.44, h * 0.28, 16, '#ffffff');
  drawSparkle(ctx, w * 0.64, h * 0.32, 18, '#fef08a');
  drawSparkle(ctx, w * 0.52, h * 0.2, 22, '#ffffff');
  drawSparkle(ctx, w * 0.28, h * 0.32, 14, '#38bdf8');
  drawSparkle(ctx, w * 0.76, h * 0.6, 15, '#fb7185');
}

// =============================================================================
// 02. WORD LEGEND (id: world-legends)
// Floating 3D glowing alphabet letter tiles, ancient runic pedestal, golden rays
// =============================================================================
function renderWordLegendArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Midnight obsidian & deep amber atmosphere
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 30, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.4, '#0f172a');
  bg.addColorStop(0.85, '#020617');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Golden volumetric rays radiating from center
  ctx.save();
  ctx.translate(w * 0.5, h * 0.52);
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    const len = 220;
    const ray = ctx.createLinearGradient(0, 0, Math.cos(angle) * len, Math.sin(angle) * len);
    ray.addColorStop(0, 'rgba(245, 158, 11, 0.55)');
    ray.addColorStop(0.5, 'rgba(217, 119, 6, 0.2)');
    ray.addColorStop(1, 'transparent');
    ctx.fillStyle = ray;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, len, angle - 0.08, angle + 0.08);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Floating Runic Pedestal / Compass Ring
  ctx.save();
  ctx.translate(w * 0.5, h * 0.62);
  ctx.scale(1, 0.4);
  ctx.beginPath();
  ctx.arc(0, 0, 180, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Helper to draw 3D floating beveled wooden/gold letter tile
  function drawLetterTile(x: number, y: number, size: number, letter: string, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Drop shadow
    ctx.beginPath();
    ctx.roundRect(-size * 0.5 + 8, -size * 0.5 + 12, size, size, 14);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();

    // 3D Depth Extrusion
    ctx.beginPath();
    ctx.roundRect(-size * 0.5, -size * 0.5 + 8, size, size, 14);
    ctx.fillStyle = '#78350f';
    ctx.fill();

    // Top Beveled Face
    ctx.beginPath();
    ctx.roundRect(-size * 0.5, -size * 0.5, size, size, 14);
    const tileGrad = ctx.createLinearGradient(-size * 0.5, -size * 0.5, size * 0.5, size * 0.5);
    tileGrad.addColorStop(0, '#fef3c7');
    tileGrad.addColorStop(0.5, '#fde68a');
    tileGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = tileGrad;
    ctx.fill();

    // Inset golden border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Letter Glyph
    ctx.fillStyle = '#451a03';
    ctx.font = `900 ${size * 0.58}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 0, 2);

    // Letter Specular Highlight
    drawSparkle(ctx, size * 0.35, -size * 0.35, 8, '#ffffff');

    ctx.restore();
  }

  // Floating Letters: "W", "O", "R", "D"
  drawLetterTile(w * 0.3, h * 0.44, 76, 'W', -0.15);
  drawLetterTile(w * 0.44, h * 0.35, 84, 'O', 0.08);
  drawLetterTile(w * 0.58, h * 0.4, 82, 'R', -0.06);
  drawLetterTile(w * 0.72, h * 0.48, 76, 'D', 0.16);

  // Golden dust particles
  for (let i = 0; i < 20; i++) {
    const px = w * 0.2 + ((i * 37) % (w * 0.6));
    const py = h * 0.2 + ((i * 29) % (h * 0.6));
    drawSparkle(ctx, px, py, 6 + (i % 4) * 2, '#fef08a');
  }
}

// =============================================================================
// 03. CANDY JUICY (id: juicy-match)
// Translucent juicy fruit candies, fresh dew drops, vibrant nectar splashes
// =============================================================================
function renderCandyJuicyArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Tropical citrus sunrise gradient
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#f97316');
  bg.addColorStop(0.4, '#db2777');
  bg.addColorStop(0.8, '#4c0519');
  bg.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Nectar splash droplets
  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  for (let i = 0; i < 18; i++) {
    const angle = (i * Math.PI * 2) / 18 + 0.1;
    const dist = 110 + (i % 4) * 35;
    const r = 8 + (i % 3) * 6;
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(253, 224, 71, 0.75)' : 'rgba(251, 113, 133, 0.75)';
    ctx.fill();
  }
  ctx.restore();

  // Central Juicy Candies
  // 1. Ruby Strawberry Gumdrop
  draw3DSphere(ctx, w * 0.38, h * 0.46, 56, '#f43f5e', '#be123c', '#4c0519');
  // 2. Translucent Orange Wedge Candy
  draw3DSphere(ctx, w * 0.62, h * 0.46, 56, '#fbbf24', '#f97316', '#7c2d12');
  // 3. Electric Lime Drop
  draw3DSphere(ctx, w * 0.5, h * 0.62, 50, '#bef264', '#65a30d', '#14532d');
  // 4. Blueberry Gummy
  draw3DSphere(ctx, w * 0.5, h * 0.3, 44, '#38bdf8', '#0284c7', '#082f49');

  // Dynamic Splash arcs
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, 95, 0.8, 2.4);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Fresh Sparkles
  drawSparkle(ctx, w * 0.36, h * 0.36, 18, '#ffffff');
  drawSparkle(ctx, w * 0.64, h * 0.38, 16, '#fef08a');
  drawSparkle(ctx, w * 0.5, h * 0.22, 14, '#ffffff');
}

// =============================================================================
// 04. SOLITAIRE (id: solitaire)
// Emerald felt, dramatic overhead card lighting, fanned cards (Ace, King, Queen)
// =============================================================================
function renderSolitaireArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep emerald green casino-grade felt with dramatic vignette
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.48, 50, w * 0.5, h * 0.48, w * 0.65);
  bg.addColorStop(0, '#065f46');
  bg.addColorStop(0.5, '#064e3b');
  bg.addColorStop(0.85, '#022c22');
  bg.addColorStop(1, '#011910');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle overhead spotlight cone
  const spot = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, 240);
  spot.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  spot.addColorStop(1, 'transparent');
  ctx.fillStyle = spot;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.45, 240, 0, Math.PI * 2);
  ctx.fill();

  // Helper to draw realistic 3D playing card
  function drawCard(x: number, y: number, width: number, height: number, suit: string, rank: string, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Soft drop shadow
    ctx.beginPath();
    ctx.roundRect(-width * 0.5 + 8, -height * 0.5 + 10, width, height, 12);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();

    // Card Body
    ctx.beginPath();
    ctx.roundRect(-width * 0.5, -height * 0.5, width, height, 12);
    const cardGrad = ctx.createLinearGradient(-width * 0.5, -height * 0.5, width * 0.5, height * 0.5);
    cardGrad.addColorStop(0, '#ffffff');
    cardGrad.addColorStop(0.65, '#f8fafc');
    cardGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = cardGrad;
    ctx.fill();

    // Beveled Edge
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const isRed = suit === '♥' || suit === '♦';
    const suitColor = isRed ? '#dc2626' : '#0f172a';

    // Corner Ranks
    ctx.fillStyle = suitColor;
    ctx.font = '900 24px serif';
    ctx.textAlign = 'left';
    ctx.fillText(rank, -width * 0.5 + 10, -height * 0.5 + 26);
    ctx.font = '22px serif';
    ctx.fillText(suit, -width * 0.5 + 10, -height * 0.5 + 50);

    // Large Center Emblem
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '64px serif';
    ctx.fillText(suit, 0, 4);

    // Specular corner sheen
    drawSparkle(ctx, -width * 0.5 + 14, -height * 0.5 + 14, 6, 'rgba(255,255,255,0.8)');

    ctx.restore();
  }

  // Fanned Hand of Cards: 10, Jack, Queen, King, Ace
  drawCard(w * 0.32, h * 0.52, 90, 130, '♣', 'J', -0.25);
  drawCard(w * 0.42, h * 0.48, 90, 130, '♦', 'Q', -0.12);
  drawCard(w * 0.52, h * 0.45, 95, 138, '♥', 'K', 0.02);
  drawCard(w * 0.64, h * 0.48, 95, 138, '♠', 'A', 0.16);

  // Atmospheric golden chips/specular gleams
  drawSparkle(ctx, w * 0.66, h * 0.35, 16, '#fde047');
  drawSparkle(ctx, w * 0.34, h * 0.38, 12, '#ffffff');
}

// =============================================================================
// 05. BLOCK (id: puzzle-block)
// Glossy 3D crystalline polyomino blocks, isometric perspective, rich lighting
// =============================================================================
function renderBlockArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep indigo/slate spatial horizon
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.45, '#0f172a');
  bg.addColorStop(0.85, '#020617');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle isometric grid lines on ground
  ctx.save();
  ctx.translate(w * 0.5, h * 0.7);
  ctx.scale(1, 0.45);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 1.5;
  for (let x = -300; x <= 300; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, -200);
    ctx.lineTo(x, 200);
    ctx.stroke();
  }
  for (let y = -200; y <= 200; y += 40) {
    ctx.beginPath();
    ctx.moveTo(-300, y);
    ctx.lineTo(300, y);
    ctx.stroke();
  }
  ctx.restore();

  // Helper to draw single 3D glossy block
  function drawJewelCube(bx: number, by: number, size: number, c1: string, c2: string, c3: string) {
    ctx.save();
    // Drop shadow
    ctx.beginPath();
    ctx.roundRect(bx + 6, by + 8, size, size, 8);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Main Face
    ctx.beginPath();
    ctx.roundRect(bx, by, size, size, 8);
    const grad = ctx.createLinearGradient(bx, by, bx + size, by + size);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.5, c2);
    grad.addColorStop(1, c3);
    ctx.fillStyle = grad;
    ctx.fill();

    // Inner Glass Bevel
    ctx.beginPath();
    ctx.roundRect(bx + 4, by + 4, size - 8, size - 8, 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top-left Specular Sheen
    ctx.beginPath();
    ctx.moveTo(bx + 4, by + 4);
    ctx.lineTo(bx + size * 0.6, by + 4);
    ctx.lineTo(bx + 4, by + size * 0.6);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    ctx.restore();
  }

  const s = 48;
  const cx = w * 0.5;
  const cy = h * 0.46;

  // L-Piece (Cyan)
  drawJewelCube(cx - s * 2, cy - s, s, '#38bdf8', '#0284c7', '#0c4a6e');
  drawJewelCube(cx - s * 2, cy, s, '#38bdf8', '#0284c7', '#0c4a6e');
  drawJewelCube(cx - s * 2, cy + s, s, '#38bdf8', '#0284c7', '#0c4a6e');
  drawJewelCube(cx - s, cy + s, s, '#38bdf8', '#0284c7', '#0c4a6e');

  // T-Piece (Ruby Red)
  drawJewelCube(cx, cy - s, s, '#fb7185', '#e11d48', '#881337');
  drawJewelCube(cx + s, cy - s, s, '#fb7185', '#e11d48', '#881337');
  drawJewelCube(cx + s * 2, cy - s, s, '#fb7185', '#e11d48', '#881337');
  drawJewelCube(cx + s, cy, s, '#fb7185', '#e11d48', '#881337');

  // Golden Square Cube (Gold / Amber)
  drawJewelCube(cx, cy + s * 0.5, s, '#fde047', '#eab308', '#78350f');
  drawJewelCube(cx + s, cy + s * 0.5, s, '#fde047', '#eab308', '#78350f');

  // Sparkles
  drawSparkle(ctx, cx - s * 1.8, cy - s * 0.8, 14, '#ffffff');
  drawSparkle(ctx, cx + s * 2.2, cy - s * 0.8, 16, '#fef08a');
  drawSparkle(ctx, cx + s * 0.5, cy + s * 1.8, 12, '#38bdf8');
}

// =============================================================================
// 06. SORTING BALLS (id: sorting-balls)
// Transparent cylindrical glass tubes, glossy stacked 3D spheres, reflections
// =============================================================================
function renderSortingBallArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark studio gradient
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 50, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.45, '#0f172a');
  bg.addColorStop(0.85, '#020617');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft glow pool on base
  const floorGlow = ctx.createRadialGradient(w * 0.5, h * 0.85, 30, w * 0.5, h * 0.85, 240);
  floorGlow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
  floorGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = floorGlow;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.85, 260, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helper to draw realistic glass cylinder tube
  function drawGlassTube(tx: number, ty: number, tw: number, th: number) {
    ctx.save();
    // Glass drop shadow
    ctx.beginPath();
    ctx.roundRect(tx - tw * 0.5, ty, tw, th, [0, 0, tw * 0.5, tw * 0.5]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fill();

    // Glass Wall Outline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Specular Highlight Line (left rim)
    ctx.beginPath();
    ctx.moveTo(tx - tw * 0.4, ty + 10);
    ctx.lineTo(tx - tw * 0.4, ty + th - 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Top Rim Collar
    ctx.beginPath();
    ctx.ellipse(tx, ty, tw * 0.54, 8, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  const tw = 68;
  const th = 220;
  const ty = h * 0.32;
  const r = 26;

  // Tube 1: Amber Spheres
  drawGlassTube(w * 0.34, ty, tw, th);
  draw3DSphere(ctx, w * 0.34, ty + th - r - 6, r, '#fde047', '#eab308', '#78350f');
  draw3DSphere(ctx, w * 0.34, ty + th - r * 3 - 8, r, '#fde047', '#eab308', '#78350f');
  draw3DSphere(ctx, w * 0.34, ty + th - r * 5 - 10, r, '#fde047', '#eab308', '#78350f');

  // Tube 2: Crimson & Turquoise Spheres
  drawGlassTube(w * 0.5, ty, tw, th);
  draw3DSphere(ctx, w * 0.5, ty + th - r - 6, r, '#fb7185', '#e11d48', '#881337');
  draw3DSphere(ctx, w * 0.5, ty + th - r * 3 - 8, r, '#fb7185', '#e11d48', '#881337');

  // Floating Hero Sphere (Levitating out of middle tube)
  draw3DSphere(ctx, w * 0.5, ty - 35, r + 4, '#38bdf8', '#0284c7', '#0c4a6e');

  // Trajectory arc
  ctx.beginPath();
  ctx.arc(w * 0.58, ty - 10, 60, Math.PI, 0);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tube 3: Neon Green & Turquoise
  drawGlassTube(w * 0.66, ty, tw, th);
  draw3DSphere(ctx, w * 0.66, ty + th - r - 6, r, '#a3e635', '#65a30d', '#14532d');
  draw3DSphere(ctx, w * 0.66, ty + th - r * 3 - 8, r, '#a3e635', '#65a30d', '#14532d');

  // Sparkles
  drawSparkle(ctx, w * 0.5, ty - 65, 18, '#ffffff');
  drawSparkle(ctx, w * 0.34, ty + 20, 14, '#fde047');
  drawSparkle(ctx, w * 0.66, ty + 20, 14, '#a3e635');
}

// =============================================================================
// 07. BUBBLE SHOOTER (id: bubble-shooter)
// Translucent glossy bubble clusters, iridescent rainbow sheen, burst explosion
// =============================================================================
function renderBubbleShooterArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep galactic cobalt background
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.48, 50, w * 0.5, h * 0.48, w * 0.7);
  bg.addColorStop(0, '#0369a1');
  bg.addColorStop(0.4, '#0c4a6e');
  bg.addColorStop(0.8, '#020617');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Burst shockwave ring
  ctx.beginPath();
  ctx.arc(w * 0.58, h * 0.42, 130, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Helper to draw iridescent translucent soap bubble
  function drawBubble(bx: number, by: number, br: number, hue: string, glow: string) {
    ctx.save();
    // Inner Glow
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    g.addColorStop(0.7, glow);
    g.addColorStop(1, hue);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();

    // Iridescent Rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Curved Specular Crescent
    ctx.beginPath();
    ctx.ellipse(bx - br * 0.35, by - br * 0.35, br * 0.4, br * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    ctx.restore();
  }

  // Hexagonal Cluster of Bubbles
  const br = 36;
  drawBubble(w * 0.42, h * 0.34, br, '#38bdf8', 'rgba(56, 189, 248, 0.4)');
  drawBubble(w * 0.5, h * 0.34, br, '#fb7185', 'rgba(251, 113, 133, 0.4)');
  drawBubble(w * 0.58, h * 0.34, br, '#fde047', 'rgba(253, 224, 71, 0.4)');

  drawBubble(w * 0.38, h * 0.46, br, '#a3e635', 'rgba(163, 230, 53, 0.4)');
  drawBubble(w * 0.46, h * 0.46, br, '#c084fc', 'rgba(192, 132, 252, 0.4)');
  drawBubble(w * 0.54, h * 0.46, br, '#38bdf8', 'rgba(56, 189, 248, 0.4)');

  // Bursting bubble particles at w * 0.62, h * 0.46
  for (let i = 0; i < 14; i++) {
    const angle = (i * Math.PI * 2) / 14;
    const dist = 45 + (i % 3) * 20;
    const px = w * 0.62 + Math.cos(angle) * dist;
    const py = h * 0.46 + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.arc(px, py, 4 + (i % 3) * 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
    ctx.fill();
  }

  // Laser Pointer Guidance Line
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.88);
  ctx.lineTo(w * 0.54, h * 0.55);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sparkles
  drawSparkle(ctx, w * 0.62, h * 0.42, 20, '#ffffff');
  drawSparkle(ctx, w * 0.42, h * 0.25, 14, '#38bdf8');
}

// =============================================================================
// 08. MEMORY MATCH (id: memory-match)
// 3D beveled memory cards flipping open, ancient relics, glowing magic symbols
// =============================================================================
function renderMemoryMatchArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Mysterious midnight violet gradient
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#312e81');
  bg.addColorStop(0.45, '#1e1b4b');
  bg.addColorStop(0.85, '#0f172a');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Floating magic orbs
  for (let i = 0; i < 12; i++) {
    const ox = w * 0.15 + ((i * 67) % (w * 0.7));
    const oy = h * 0.15 + ((i * 47) % (h * 0.7));
    const or = 8 + (i % 4) * 4;
    const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
    og.addColorStop(0, 'rgba(192, 132, 252, 0.7)');
    og.addColorStop(1, 'transparent');
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.arc(ox, oy, or, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helper to draw flipping 3D Memory Card
  function drawMemoryCard(cx: number, cy: number, cw: number, ch: number, symbol: string, isFaceUp: boolean, rot = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Drop shadow
    ctx.beginPath();
    ctx.roundRect(-cw * 0.5 + 8, -ch * 0.5 + 10, cw, ch, 14);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();

    // Card Body
    ctx.beginPath();
    ctx.roundRect(-cw * 0.5, -ch * 0.5, cw, ch, 14);
    if (isFaceUp) {
      const fg = ctx.createLinearGradient(-cw * 0.5, -ch * 0.5, cw * 0.5, ch * 0.5);
      fg.addColorStop(0, '#fef08a');
      fg.addColorStop(0.5, '#f59e0b');
      fg.addColorStop(1, '#b45309');
      ctx.fillStyle = fg;
    } else {
      const bgCard = ctx.createLinearGradient(-cw * 0.5, -ch * 0.5, cw * 0.5, ch * 0.5);
      bgCard.addColorStop(0, '#4338ca');
      bgCard.addColorStop(0.5, '#312e81');
      bgCard.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgCard;
    }
    ctx.fill();

    // Gold rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center Emblem
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isFaceUp) {
      ctx.fillStyle = '#451a03';
      ctx.font = '54px serif';
      ctx.fillText(symbol, 0, 2);
    } else {
      // Intricate filigree pattern
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '28px serif';
      ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.fillText('✦', 0, 2);
    }

    ctx.restore();
  }

  // Three cards: One Face-Down, Two Face-Up Matching
  drawMemoryCard(w * 0.32, h * 0.48, 92, 132, '', false, -0.18);
  drawMemoryCard(w * 0.48, h * 0.45, 96, 138, '★', true, 0.05);
  drawMemoryCard(w * 0.64, h * 0.48, 96, 138, '★', true, 0.16);

  // Sparkles
  drawSparkle(ctx, w * 0.56, h * 0.32, 18, '#ffffff');
  drawSparkle(ctx, w * 0.48, h * 0.28, 16, '#fef08a');
}

// =============================================================================
// 09. HELIX JUMP (id: helix-jump)
// Twisting 3D cylindrical helix tower, stepped spiral platforms, bouncy ball
// =============================================================================
function renderHelixJumpArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep arcade vertical gradient
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#111827');
  bg.addColorStop(0.5, '#030712');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const poleW = 60;

  // Center Metallic Titanium Pole
  const poleGrad = ctx.createLinearGradient(cx - poleW * 0.5, 0, cx + poleW * 0.5, 0);
  poleGrad.addColorStop(0, '#374151');
  poleGrad.addColorStop(0.3, '#9ca3af');
  poleGrad.addColorStop(0.6, '#4b5563');
  poleGrad.addColorStop(1, '#1f2937');
  ctx.fillStyle = poleGrad;
  ctx.fillRect(cx - poleW * 0.5, 0, poleW, h);

  // Stepped Spiral Helix Disks (3 tiers)
  function drawHelixDisk(dy: number, tilt: number, color: string) {
    ctx.save();
    ctx.translate(cx, dy);
    ctx.scale(1, 0.32);

    ctx.beginPath();
    ctx.arc(0, 0, 160, tilt, tilt + Math.PI * 1.35);
    ctx.lineWidth = 42;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  drawHelixDisk(h * 0.78, 0.4, '#f97316');
  drawHelixDisk(h * 0.58, 1.8, '#84cc16');
  drawHelixDisk(h * 0.38, 0.2, '#f97316');

  // Paint Splatter on Platform beneath ball
  ctx.save();
  ctx.translate(cx + 45, h * 0.48);
  ctx.scale(1, 0.35);
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
  ctx.fill();
  ctx.restore();

  // High-Gloss 3D Bouncing Ball (Suspended in air)
  draw3DSphere(ctx, cx + 45, h * 0.38, 30, '#f87171', '#dc2626', '#7f1d1d');

  // Motion Blur Trails
  ctx.beginPath();
  ctx.moveTo(cx + 45, h * 0.28);
  ctx.lineTo(cx + 45, h * 0.36);
  ctx.strokeStyle = 'rgba(252, 165, 165, 0.6)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Sparkles
  drawSparkle(ctx, cx + 55, h * 0.32, 14, '#ffffff');
  drawSparkle(ctx, cx - 80, h * 0.42, 12, '#f97316');
}

// =============================================================================
// 10. CRAZY COLOR (id: crazy-colors)
// Concentric neon rotating arc gates (pink, cyan, yellow, purple), pulsing core
// =============================================================================
function renderCrazyColorArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Obsidian dark arcade space
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#18181b');
  bg.addColorStop(0.5, '#09090b');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.5;

  // Concentric Neon Arc Rings (Crazy Color Gate)
  const arcs = [
    { r: 160, start: 0, end: 1.5, color: '#f43f5e', w: 16 },
    { r: 160, start: 1.6, end: 3.1, color: '#38bdf8', w: 16 },
    { r: 160, start: 3.2, end: 4.7, color: '#facc15', w: 16 },
    { r: 160, start: 4.8, end: 6.2, color: '#a855f7', w: 16 },

    { r: 115, start: 0.8, end: 2.3, color: '#38bdf8', w: 14 },
    { r: 115, start: 2.4, end: 3.9, color: '#facc15', w: 14 },
    { r: 115, start: 4.0, end: 5.5, color: '#a855f7', w: 14 },
    { r: 115, start: 5.6, end: 0.7, color: '#f43f5e', w: 14 },

    { r: 75, start: 0.2, end: 1.7, color: '#facc15', w: 12 },
    { r: 75, start: 1.8, end: 3.3, color: '#a855f7', w: 12 },
    { r: 75, start: 3.4, end: 4.9, color: '#f43f5e', w: 12 },
    { r: 75, start: 5.0, end: 0.1, color: '#38bdf8', w: 12 },
  ];

  for (const arc of arcs) {
    ctx.beginPath();
    ctx.arc(cx, cy, arc.r, arc.start, arc.end);
    ctx.strokeStyle = arc.color;
    ctx.lineWidth = arc.w;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Central Glowing Chromatic Sphere
  draw3DSphere(ctx, cx, cy, 32, '#ffffff', '#f43f5e', '#881337');

  // Radiating Particle Sparkles
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    const dist = 195 + (i % 3) * 25;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;
    drawSparkle(ctx, px, py, 10 + (i % 3) * 4, i % 2 === 0 ? '#38bdf8' : '#facc15');
  }
}

// =============================================================================
// 11. COLOR RUSH (id: color-rush)
// Intense high-velocity neon motion trails, speed runner cutting prismatic gates
// =============================================================================
function renderColorRushArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Midnight grid perspective
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 30, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.5, '#0f172a');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Converging speed perspective lines
  const cx = w * 0.5;
  const cy = h * 0.45;

  ctx.save();
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    const len = 450;
    const ray = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ray.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    ray.addColorStop(0.3, i % 2 === 0 ? 'rgba(244, 63, 94, 0.6)' : 'rgba(56, 189, 248, 0.6)');
    ray.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.strokeStyle = ray;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();

  // Aerodynamic Glowing Prism Runner (Hero)
  ctx.save();
  ctx.translate(cx, cy + 20);

  // Twin Neon Exhaust Trails
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-45, 140);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(25, 0);
  ctx.lineTo(45, 140);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Delta Ship / Prism Body
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.lineTo(40, 45);
  ctx.lineTo(0, 25);
  ctx.lineTo(-40, 45);
  ctx.closePath();

  const shipGrad = ctx.createLinearGradient(0, -60, 0, 45);
  shipGrad.addColorStop(0, '#ffffff');
  shipGrad.addColorStop(0.5, '#38bdf8');
  shipGrad.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = shipGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();

  drawSparkle(ctx, cx, cy - 45, 22, '#ffffff');
  drawSparkle(ctx, cx - 120, cy + 50, 16, '#f43f5e');
  drawSparkle(ctx, cx + 120, cy + 50, 16, '#38bdf8');
}

// =============================================================================
// 12. KNIFE MADNESS (id: knife-madness)
// Stylized circular wooden target, polished steel throwing knives, wood splinters
// =============================================================================
function renderKnifeMadnessArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark crimson bronze ambient gradient
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#450a0a');
  bg.addColorStop(0.5, '#1c1917');
  bg.addColorStop(1, '#0c0a09');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.48;
  const tr = 115;

  // 1. Circular Target Log / Block
  ctx.save();
  // Target Drop Shadow
  ctx.beginPath();
  ctx.arc(cx + 10, cy + 12, tr, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fill();

  // Wood Trunk Rings
  const woodGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, tr);
  woodGrad.addColorStop(0, '#fde68a');
  woodGrad.addColorStop(0.4, '#d97706');
  woodGrad.addColorStop(0.8, '#92400e');
  woodGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, tr, 0, Math.PI * 2);
  ctx.fill();

  // Steel Outer Rim
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.75)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Concentric Target Rings
  for (let r = 30; r < tr; r += 28) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();

  // Helper to draw realistic steel throwing knife
  function drawThrowingKnife(kx: number, ky: number, len: number, rot: number) {
    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(rot);

    // Blade
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.6);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 5);
    ctx.lineTo(-8, 0);
    ctx.closePath();

    const bladeGrad = ctx.createLinearGradient(-8, 0, 8, 0);
    bladeGrad.addColorStop(0, '#f8fafc');
    bladeGrad.addColorStop(0.5, '#cbd5e1');
    bladeGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = bladeGrad;
    ctx.fill();

    // Blade Specular Gleam
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.6);
    ctx.lineTo(0, 5);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Braided Handle
    ctx.beginPath();
    ctx.rect(-5, 5, 10, len * 0.4);
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    ctx.restore();
  }

  // Embedded Knives in Target
  drawThrowingKnife(cx, cy - tr * 0.85, 75, 0);
  drawThrowingKnife(cx - tr * 0.6, cy - tr * 0.4, 75, -Math.PI / 4);
  drawThrowingKnife(cx + tr * 0.6, cy - tr * 0.4, 75, Math.PI / 4);

  // Incoming High-Velocity Knife (Hero Shot)
  drawThrowingKnife(cx, cy + 95, 95, Math.PI);

  // Wood Splinter Particles
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10;
    const dist = tr + 12 + (i % 3) * 10;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.rect(sx, sy, 4, 8);
    ctx.fillStyle = '#fde68a';
    ctx.fill();
  }

  // Sparkles
  drawSparkle(ctx, cx, cy - tr * 0.85 - 20, 16, '#ffffff');
  drawSparkle(ctx, cx, cy + 50, 18, '#ffffff');
}

// =============================================================================
// 13. POP BALLON (id: archery-strike)
// Bright azure sky, glossy 3D helium balloons, bursting confetti starburst
// =============================================================================
function renderPopBallonArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Radiant azure sky with sunlit cloud glow
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.35, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#38bdf8');
  bg.addColorStop(0.4, '#0284c7');
  bg.addColorStop(0.85, '#0369a1');
  bg.addColorStop(1, '#075985');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Sunburst Rays
  ctx.save();
  ctx.translate(w * 0.5, h * 0.3);
  for (let i = 0; i < 14; i++) {
    const angle = (i * Math.PI * 2) / 14;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 240, angle - 0.1, angle + 0.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fill();
  }
  ctx.restore();

  // Helper to draw glossy 3D teardrop balloon
  function drawBalloon(bx: number, by: number, br: number, c1: string, c2: string, c3: string, rot = 0) {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);

    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(8, br + 20, br * 0.6, br * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();

    // Balloon Body
    ctx.beginPath();
    ctx.ellipse(0, 0, br * 0.85, br, 0, 0, Math.PI * 2);
    const bgGrad = ctx.createRadialGradient(-br * 0.3, -br * 0.3, br * 0.1, 0, 0, br);
    bgGrad.addColorStop(0, c1);
    bgGrad.addColorStop(0.55, c2);
    bgGrad.addColorStop(1, c3);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Curved Specular Gleam
    ctx.beginPath();
    ctx.ellipse(-br * 0.35, -br * 0.35, br * 0.32, br * 0.16, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();

    // Tie Knot & Ribbon
    ctx.beginPath();
    ctx.moveTo(-5, br);
    ctx.lineTo(5, br);
    ctx.lineTo(0, br + 8);
    ctx.closePath();
    ctx.fillStyle = c2;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, br + 8);
    ctx.quadraticCurveTo(15, br + 35, 0, br + 60);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // Cluster of Balloons
  drawBalloon(w * 0.32, h * 0.52, 54, '#fde047', '#eab308', '#854d0e', -0.15); // Yellow
  drawBalloon(w * 0.68, h * 0.52, 52, '#a3e635', '#65a30d', '#14532d', 0.18); // Lime
  drawBalloon(w * 0.42, h * 0.44, 58, '#38bdf8', '#0284c7', '#0c4a6e', -0.06); // Sky Blue

  // Bursting Ruby Balloon (Hero) at w * 0.56, h * 0.42
  const popX = w * 0.56;
  const popY = h * 0.42;

  // Burst Air Shockwave
  ctx.beginPath();
  ctx.arc(popX, popY, 85, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Confetti Starburst
  for (let i = 0; i < 20; i++) {
    const angle = (i * Math.PI * 2) / 20;
    const dist = 40 + (i % 4) * 20;
    const px = popX + Math.cos(angle) * dist;
    const py = popY + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.rect(px, py, 6, 10);
    ctx.fillStyle = i % 2 === 0 ? '#f43f5e' : '#fef08a';
    ctx.fill();
  }

  drawSparkle(ctx, popX, popY, 26, '#ffffff');
  drawSparkle(ctx, w * 0.34, h * 0.38, 16, '#ffffff');
}

// =============================================================================
// 14. FRUIT NINJA (id: fruit-slice)
// Sliced watermelon split in two, orange half, glowing katana blade trail, juice splash
// =============================================================================
function renderFruitNinjaArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark rustic dojo / wood ambiance
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#1c1917');
  bg.addColorStop(0.5, '#0c0a09');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Glowing Katana Blade Trail (Diagonal Strike)
  ctx.save();
  const bladeGrad = ctx.createLinearGradient(w * 0.15, h * 0.85, w * 0.85, h * 0.15);
  bladeGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
  bladeGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.6)');
  bladeGrad.addColorStop(0.5, '#ffffff');
  bladeGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.6)');
  bladeGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.85);
  ctx.lineTo(w * 0.85, h * 0.15);
  ctx.strokeStyle = bladeGrad;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Watermelon Half 1 (Top Left Flying Half)
  ctx.save();
  ctx.translate(w * 0.44, h * 0.4);
  ctx.rotate(-0.35);
  // Green Rind
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI);
  ctx.fillStyle = '#15803d';
  ctx.fill();
  // White Pith
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI);
  ctx.fillStyle = '#fecdd3';
  ctx.fill();
  // Red Pulp
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI);
  ctx.fillStyle = '#e11d48';
  ctx.fill();
  // Black Seeds
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(-22, 25, 3.5, 0, Math.PI * 2);
  ctx.arc(0, 32, 3.5, 0, Math.PI * 2);
  ctx.arc(22, 25, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Watermelon Half 2 (Bottom Right Flying Half)
  ctx.save();
  ctx.translate(w * 0.56, h * 0.56);
  ctx.rotate(0.4);
  // Green Rind
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI);
  ctx.fillStyle = '#15803d';
  ctx.fill();
  // White Pith
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI);
  ctx.fillStyle = '#fecdd3';
  ctx.fill();
  // Red Pulp
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI);
  ctx.fillStyle = '#e11d48';
  ctx.fill();
  ctx.restore();

  // Orange Half Splattering at w * 0.72, h * 0.42
  ctx.save();
  ctx.translate(w * 0.72, h * 0.42);
  ctx.rotate(0.2);
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fillStyle = '#f97316';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
  ctx.restore();

  // Red & Orange Juice Splatter Droplets
  for (let i = 0; i < 18; i++) {
    const angle = (i * Math.PI * 2) / 18;
    const dist = 80 + (i % 4) * 25;
    const px = w * 0.5 + Math.cos(angle) * dist;
    const py = h * 0.48 + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.arc(px, py, 4 + (i % 3) * 2, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(225, 29, 72, 0.85)' : 'rgba(249, 115, 22, 0.85)';
    ctx.fill();
  }

  drawSparkle(ctx, w * 0.5, h * 0.48, 24, '#ffffff');
}

// =============================================================================
// 15. HILL CLIMB (id: hill-rider)
// Stylized 4x4 off-road vehicle climbing rugged mountain ridge, dust plumes, sunrise
// =============================================================================
function renderHillClimbArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dramatic sunrise mountain sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, '#f97316');
  sky.addColorStop(0.4, '#eab308');
  sky.addColorStop(0.8, '#38bdf8');
  sky.addColorStop(1, '#0284c7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Mountain Silhouette
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  ctx.lineTo(w * 0.35, h * 0.35);
  ctx.lineTo(w * 0.65, h * 0.5);
  ctx.lineTo(w, h * 0.25);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Foreground Highland Ridge (Steep Incline)
  ctx.beginPath();
  ctx.moveTo(0, h * 0.9);
  ctx.quadraticCurveTo(w * 0.45, h * 0.85, w, h * 0.42);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  const hillGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
  hillGrad.addColorStop(0, '#65a30d');
  hillGrad.addColorStop(0.5, '#4d7c0f');
  hillGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = hillGrad;
  ctx.fill();

  // Red 4x4 Off-Road Rover (Hero Vehicle climbing slope)
  ctx.save();
  ctx.translate(w * 0.52, h * 0.56);
  ctx.rotate(-0.35); // Steep pitch up

  // Vehicle Chassis Body
  ctx.beginPath();
  ctx.roundRect(-50, -28, 100, 32, 8);
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cabin / Roll Cage
  ctx.beginPath();
  ctx.roundRect(-25, -52, 55, 26, 6);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Wheels (Chunky 3D Off-Road Tires)
  function drawTire(tx: number, ty: number) {
    ctx.beginPath();
    ctx.arc(tx, ty, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 4;
    ctx.stroke();
    // Inner Rim
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#eab308';
    ctx.fill();
  }

  drawTire(-35, 10);
  drawTire(35, 10);

  ctx.restore();

  // Dust Plumes from spinning rear tires
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(w * 0.4 - i * 14, h * 0.68 + i * 4, 12 + i * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(254, 240, 138, ${0.4 - i * 0.04})`;
    ctx.fill();
  }

  drawSparkle(ctx, w * 0.6, h * 0.44, 20, '#ffffff');
}

// =============================================================================
// 16. MOTO RACE (id: moto-race)
// Grand Prix asphalt track, high-speed superbike leaning into apex corner, neon trails
// =============================================================================
function renderMotoRaceArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Twilight racing sky
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.4, '#1e1b4b');
  bg.addColorStop(0.75, '#172554');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // High-Speed Asphalt Track with Red/White Curbs
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h);
  ctx.lineTo(w * 0.65, h * 0.45);
  ctx.lineTo(w * 0.85, h * 0.45);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  // Red & White Rumble Strips
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const y = h * 0.48 + i * 20;
    ctx.beginPath();
    ctx.rect(w * 0.12 - i * 6, y, 22, 14);
    ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#ffffff';
    ctx.fill();
  }
  ctx.restore();

  // Racing Superbike Leaning into Corner
  ctx.save();
  ctx.translate(w * 0.52, h * 0.6);
  ctx.rotate(0.38); // Steep knee-down lean

  // Twin Neon Taillight Streaks
  ctx.beginPath();
  ctx.moveTo(-15, 20);
  ctx.lineTo(-45, 80);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Sleek Aerodynamic Bike Body
  ctx.beginPath();
  ctx.moveTo(-45, 10);
  ctx.lineTo(45, -15);
  ctx.lineTo(15, -35);
  ctx.lineTo(-25, -25);
  ctx.closePath();
  const bikeGrad = ctx.createLinearGradient(-45, 0, 45, 0);
  bikeGrad.addColorStop(0, '#3b82f6');
  bikeGrad.addColorStop(0.5, '#60a5fa');
  bikeGrad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = bikeGrad;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rider Helmet & Leathers
  ctx.beginPath();
  ctx.arc(0, -45, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#18181b';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Wheels
  ctx.beginPath();
  ctx.ellipse(-35, 15, 16, 26, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#09090b';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(35, -5, 16, 26, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#09090b';
  ctx.fill();

  ctx.restore();

  drawSparkle(ctx, w * 0.58, h * 0.52, 22, '#ffffff');
}

// =============================================================================
// 17. SOCCER PING PONG (id: soccer-ping-pong)
// Futuristic neon table soccer court, dual-color floodlights, glowing ball trajectory
// =============================================================================
function renderSoccerPingPongArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Stadium arena background
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 40, w * 0.5, h * 0.45, w * 0.7);
  bg.addColorStop(0, '#042f2e');
  bg.addColorStop(0.5, '#022c22');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Table Soccer Court (Perspective)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.85);
  ctx.lineTo(w * 0.32, h * 0.35);
  ctx.lineTo(w * 0.68, h * 0.35);
  ctx.lineTo(w * 0.82, h * 0.85);
  ctx.closePath();
  ctx.fillStyle = '#065f46';
  ctx.fill();
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Midfield Net Barrier
  ctx.beginPath();
  ctx.moveTo(w * 0.25, h * 0.6);
  ctx.lineTo(w * 0.75, h * 0.6);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Glowing High-Velocity 3D Soccer Ball in Trajectory
  const bx = w * 0.52;
  const by = h * 0.46;
  const br = 36;

  // Ball Comet Tail
  ctx.beginPath();
  ctx.moveTo(w * 0.32, h * 0.7);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Soccer Ball Body
  draw3DSphere(ctx, bx, by, br, '#ffffff', '#e2e8f0', '#475569');

  // Hexagonal Black Patches
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(bx, by, br * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Dual Player Paddles (Neon Cyan vs Neon Green)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(w * 0.22, h * 0.68, 64, 16, 8);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(w * 0.68, h * 0.4, 52, 14, 8);
  ctx.fillStyle = '#84cc16';
  ctx.fill();
  ctx.restore();

  drawSparkle(ctx, bx, by - 25, 20, '#ffffff');
}

// =============================================================================
// 18. SOCCER SHOOTER (id: soccer-shooter)
// 3D official soccer ball curving into top goal corner, stadium floodlights, net
// =============================================================================
function renderSoccerShooterArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Epic night stadium background with brilliant floodlights
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, 40, w * 0.5, h * 0.4, w * 0.7);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.5, '#020617');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Twin Stadium Floodlights
  const fl1 = ctx.createRadialGradient(w * 0.15, h * 0.18, 10, w * 0.15, h * 0.18, 180);
  fl1.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  fl1.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
  fl1.addColorStop(1, 'transparent');
  ctx.fillStyle = fl1;
  ctx.fillRect(0, 0, w * 0.4, h * 0.5);

  const fl2 = ctx.createRadialGradient(w * 0.85, h * 0.18, 10, w * 0.85, h * 0.18, 180);
  fl2.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  fl2.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
  fl2.addColorStop(1, 'transparent');
  ctx.fillStyle = fl2;
  ctx.fillRect(w * 0.6, 0, w * 0.4, h * 0.5);

  // Goal Crossbar and Net Grid (Top Corner)
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.25);
  ctx.lineTo(w * 0.88, h * 0.25);
  ctx.lineTo(w * 0.88, h * 0.85);
  ctx.stroke();

  // Net mesh grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  for (let x = w * 0.2; x <= w * 0.88; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.25);
    ctx.lineTo(x + 20, h * 0.85);
    ctx.stroke();
  }
  for (let y = h * 0.25; y <= h * 0.85; y += 25) {
    ctx.beginPath();
    ctx.moveTo(w * 0.2, y);
    ctx.lineTo(w * 0.88, y);
    ctx.stroke();
  }
  ctx.restore();

  // 3D Official Soccer Ball Ripping into Top Corner
  const bx = w * 0.62;
  const by = h * 0.42;
  const br = 52;

  // Kinetic Shockwave Rings
  ctx.beginPath();
  ctx.ellipse(bx - 30, by + 10, 80, 45, -0.3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Ball Body
  draw3DSphere(ctx, bx, by, br, '#ffffff', '#f1f5f9', '#334155');

  // Pentagon Black Patches
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(bx, by, br * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawSparkle(ctx, bx + 25, by - 30, 24, '#ffffff');
  drawSparkle(ctx, bx - 40, by - 15, 18, '#fde047');
}

// =============================================================================
// 19. DAMA (id: dama)
// Polished wooden draughts pieces, dark walnut board, warm brass spotlight
// =============================================================================
function renderDamaArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Rich mahogany / walnut ambient background
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.48, 50, w * 0.5, h * 0.48, w * 0.65);
  bg.addColorStop(0, '#451a03');
  bg.addColorStop(0.5, '#291002');
  bg.addColorStop(1, '#0f0501');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Warm overhead brass spotlight
  const spot = ctx.createRadialGradient(w * 0.5, h * 0.45, 30, w * 0.5, h * 0.45, 240);
  spot.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
  spot.addColorStop(1, 'transparent');
  ctx.fillStyle = spot;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.45, 240, 0, Math.PI * 2);
  ctx.fill();

  // Checkerboard Perspective Platform
  ctx.save();
  ctx.translate(w * 0.5, h * 0.58);
  ctx.scale(1, 0.45);

  const sq = 44;
  for (let r = -3; r <= 3; r++) {
    for (let c = -4; c <= 4; c++) {
      ctx.beginPath();
      ctx.rect(c * sq, r * sq, sq, sq);
      ctx.fillStyle = (r + c) % 2 === 0 ? '#d97706' : '#78350f';
      ctx.fill();
    }
  }
  ctx.restore();

  // Helper to draw 3D glossy draughts piece
  function drawDamaPiece(px: number, py: number, r: number, isIvory: boolean, isKing = false) {
    ctx.save();
    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(px + 4, py + r * 0.6, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fill();

    // 3D Rim Extrusion
    ctx.beginPath();
    ctx.ellipse(px, py + 10, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = isIvory ? '#d6d3d1' : '#0c0a09';
    ctx.fill();

    // Top Disc Face
    ctx.beginPath();
    ctx.ellipse(px, py, r, r * 0.38, 0, 0, Math.PI * 2);
    const pieceGrad = ctx.createLinearGradient(px - r, py, px + r, py);
    if (isIvory) {
      pieceGrad.addColorStop(0, '#ffffff');
      pieceGrad.addColorStop(0.5, '#f5f5f4');
      pieceGrad.addColorStop(1, '#d6d3d1');
    } else {
      pieceGrad.addColorStop(0, '#27272a');
      pieceGrad.addColorStop(0.5, '#18181b');
      pieceGrad.addColorStop(1, '#09090b');
    }
    ctx.fillStyle = pieceGrad;
    ctx.fill();

    // Concentric Carved Rings
    ctx.strokeStyle = isIvory ? '#a8a29e' : '#52525b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(px, py, r * 0.65, r * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (isKing) {
      // Crown emblem for King piece
      ctx.fillStyle = '#f59e0b';
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♛', px, py);
    }

    ctx.restore();
  }

  // Tactical Pieces Arranged on Board
  drawDamaPiece(w * 0.32, h * 0.52, 34, false); // Dark piece
  drawDamaPiece(w * 0.45, h * 0.58, 34, true);  // Ivory piece
  drawDamaPiece(w * 0.68, h * 0.54, 34, false); // Dark piece

  // Crowned Double-Decker King Piece (Hero)
  drawDamaPiece(w * 0.55, h * 0.42, 38, true, true);

  drawSparkle(ctx, w * 0.55, h * 0.32, 18, '#fde047');
}

// =============================================================================
// 20. POP PIANO (id: pop-piano)
// Luminous 3D grand piano keys, glowing musical notes, rhythm frequency beams
// =============================================================================
function renderPopPianoArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Concert hall darkness with royal purple/midnight haze
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#2e1065');
  bg.addColorStop(0.45, '#172554');
  bg.addColorStop(0.85, '#020617');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Descending Neon Rhythm Beams (Cyan, Magenta, Gold)
  ctx.save();
  const beamColors = ['rgba(56, 189, 248, 0.4)', 'rgba(244, 63, 94, 0.4)', 'rgba(250, 204, 21, 0.4)'];
  for (let i = 0; i < 6; i++) {
    const bx = w * 0.25 + i * 85;
    const beam = ctx.createLinearGradient(bx, 0, bx, h * 0.7);
    beam.addColorStop(0, 'transparent');
    beam.addColorStop(0.5, beamColors[i % 3]);
    beam.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    ctx.fillStyle = beam;
    ctx.fillRect(bx - 15, 0, 30, h * 0.7);
  }
  ctx.restore();

  // Grand Piano Keyboard (Angled 3D Perspective)
  ctx.save();
  ctx.translate(w * 0.5, h * 0.65);
  ctx.rotate(-0.12);

  // White Keys
  const numKeys = 14;
  const kw = 34;
  const kh = 120;
  for (let i = -numKeys / 2; i < numKeys / 2; i++) {
    const kx = i * (kw + 3);
    ctx.beginPath();
    ctx.roundRect(kx, 0, kw, kh, [0, 0, 8, 8]);
    const keyGrad = ctx.createLinearGradient(kx, 0, kx, kh);
    keyGrad.addColorStop(0, '#f8fafc');
    keyGrad.addColorStop(0.8, '#e2e8f0');
    keyGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = keyGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Black Keys
  for (let i = -numKeys / 2; i < numKeys / 2 - 1; i++) {
    if (i % 7 !== 2 && i % 7 !== 6) {
      const kx = i * (kw + 3) + kw * 0.7;
      ctx.beginPath();
      ctx.roundRect(kx, 0, kw * 0.65, kh * 0.62, [0, 0, 5, 5]);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  ctx.restore();

  // Luminous Floating Musical Notes (Treble Clef & Quavers)
  ctx.save();
  ctx.fillStyle = '#fef08a';
  ctx.font = '72px serif';
  ctx.fillText('♫', w * 0.32, h * 0.36);
  ctx.fillText('♪', w * 0.68, h * 0.38);
  ctx.font = '84px serif';
  ctx.fillText('𝄞', w * 0.5, h * 0.32);
  ctx.restore();

  drawSparkle(ctx, w * 0.5, h * 0.28, 24, '#ffffff');
  drawSparkle(ctx, w * 0.34, h * 0.34, 18, '#38bdf8');
  drawSparkle(ctx, w * 0.66, h * 0.34, 18, '#f43f5e');
}

// -----------------------------------------------------------------------------
// 21. HALLOWEEN FRUIT SLICE: Bespoke 3D Haunted Night, Sliced Pumpkin & Monster Fruits
// -----------------------------------------------------------------------------
function renderHalloweenFruitSliceArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 1. Spooky Teal-to-Navy Haunted Night Sky
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#031726');
  bg.addColorStop(0.5, '#072a3e');
  bg.addColorStop(1, '#020d17');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Large Glowing Full Moon behind center
  const moonX = w * 0.5;
  const moonY = h * 0.44;
  const moonR = 145;

  const moonAura = ctx.createRadialGradient(moonX, moonY, moonR * 0.7, moonX, moonY, moonR * 2.2);
  moonAura.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
  moonAura.addColorStop(0.5, 'rgba(255, 235, 59, 0.15)');
  moonAura.addColorStop(1, 'transparent');
  ctx.fillStyle = moonAura;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR * 2.2, 0, Math.PI * 2);
  ctx.fill();

  const moonGrad = ctx.createRadialGradient(moonX - 40, moonY - 40, 20, moonX, moonY, moonR);
  moonGrad.addColorStop(0, '#FFFDE7');
  moonGrad.addColorStop(0.6, '#FFF59D');
  moonGrad.addColorStop(1, '#FBC02D');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  // Moon craters
  ctx.fillStyle = 'rgba(245, 127, 23, 0.2)';
  ctx.beginPath();
  ctx.arc(moonX - 45, moonY - 35, 24, 0, Math.PI * 2);
  ctx.arc(moonX + 50, moonY + 40, 32, 0, Math.PI * 2);
  ctx.arc(moonX + 60, moonY - 50, 18, 0, Math.PI * 2);
  ctx.fill();

  // Silhouette Bats in flight
  const bats = [
    { x: w * 0.25, y: h * 0.22, s: 22 },
    { x: w * 0.32, y: h * 0.18, s: 16 },
    { x: w * 0.72, y: h * 0.24, s: 20 },
    { x: w * 0.8, y: h * 0.19, s: 15 },
  ];
  ctx.fillStyle = '#020C14';
  bats.forEach((b) => {
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.s * 1.5, b.s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(b.x - b.s * 0.8, b.y - b.s * 0.4, b.s * 0.8, 0.3, Math.PI - 0.3);
    ctx.arc(b.x + b.s * 0.8, b.y - b.s * 0.4, b.s * 0.8, 0.3, Math.PI - 0.3);
    ctx.fill();
  });

  // 3. Bright Glowing White-and-Cyan Katana Slash Trail through center
  ctx.save();
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 30;
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.78);
  ctx.quadraticCurveTo(w * 0.5, h * 0.46, w * 0.82, h * 0.2);
  ctx.stroke();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.78);
  ctx.quadraticCurveTo(w * 0.5, h * 0.46, w * 0.82, h * 0.2);
  ctx.stroke();
  ctx.restore();

  // 4. Sliced Pumpkin Halves Splitting Apart
  const pLeftX = w * 0.44;
  const pLeftY = h * 0.54;
  const pRightX = w * 0.57;
  const pRightY = h * 0.42;
  const pRadius = 78;

  // Left Pumpkin Half
  ctx.save();
  ctx.translate(pLeftX, pLeftY);
  ctx.rotate(-0.35);
  ctx.beginPath();
  ctx.arc(0, 0, pRadius, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
  ctx.fillStyle = '#FF6B00';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, pRadius * 0.85, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.fillStyle = '#FFA726';
  ctx.fill();
  ctx.restore();

  // Right Pumpkin Half
  ctx.save();
  ctx.translate(pRightX, pRightY);
  ctx.rotate(0.35);
  ctx.beginPath();
  ctx.arc(0, 0, pRadius, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fillStyle = '#FF6B00';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, pRadius * 0.85, -Math.PI / 2, Math.PI / 2);
  ctx.fillStyle = '#FFA726';
  ctx.fill();
  ctx.restore();

  // 5. Spooky Green Monster Melon (Left)
  draw3DSphere(ctx, w * 0.26, h * 0.52, 54, '#B4F835', '#72C812', '#346E04');
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(w * 0.26, h * 0.5, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#00BCD4';
  ctx.beginPath();
  ctx.arc(w * 0.26, h * 0.5, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(w * 0.26, h * 0.5, 6, 0, Math.PI * 2);
  ctx.fill();

  // 6. Flying Spooky Bomb with glowing spark fuse (Right)
  draw3DSphere(ctx, w * 0.74, h * 0.54, 52, '#546E7A', '#263238', '#0D1317');
  ctx.strokeStyle = '#D7CCC8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.74, h * 0.54 - 50);
  ctx.quadraticCurveTo(w * 0.78, h * 0.54 - 75, w * 0.76, h * 0.54 - 95);
  ctx.stroke();
  drawSparkle(ctx, w * 0.76, h * 0.54 - 95, 24, '#FFD54F');
  drawSparkle(ctx, w * 0.76, h * 0.54 - 95, 12, '#FFFFFF');

  // 7. Juicy Splatter Droplets and Starburst Sparks
  for (let i = 0; i < 22; i++) {
    const sx = w * 0.5 + (Math.random() - 0.5) * 220;
    const sy = h * 0.48 + (Math.random() - 0.5) * 140;
    const sr = Math.random() * 6 + 2;
    ctx.fillStyle = Math.random() > 0.5 ? '#FF7D00' : '#76FF03';
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSparkle(ctx, w * 0.5, h * 0.48, 28, '#FFFFFF');
  drawSparkle(ctx, w * 0.42, h * 0.58, 18, '#FFEB3B');
  drawSparkle(ctx, w * 0.6, h * 0.38, 18, '#00E5FF');
}

// =============================================================================
// 22. BUTTON SOCCER (id: button-soccer)
// World Tour championship table soccer with 3D discs, football & stadium pitch
// =============================================================================
function renderButtonSoccerArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Stadium background with floodlight radial glow
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.65);
  bg.addColorStop(0, '#0F263D');
  bg.addColorStop(0.5, '#071524');
  bg.addColorStop(1, '#02070D');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Corner floodlight beams
  ctx.fillStyle = 'rgba(180, 230, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(0, 0, 180, 0, Math.PI * 2);
  ctx.arc(w, 0, 180, 0, Math.PI * 2);
  ctx.arc(0, h, 180, 0, Math.PI * 2);
  ctx.arc(w, h, 180, 0, Math.PI * 2);
  ctx.fill();

  // Vibrant striped football pitch in perspective
  const pitchLeft = w * 0.12;
  const pitchRight = w * 0.88;
  const pitchTop = h * 0.14;
  const pitchBottom = h * 0.86;
  const pitchW = pitchRight - pitchLeft;
  const pitchH = pitchBottom - pitchTop;

  // Drop shadow for pitch
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(pitchLeft + 8, pitchTop + 8, pitchW, pitchH);

  // Mowing stripes
  const stripes = 8;
  const sW = pitchW / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1E824C' : '#27AE60';
    ctx.fillRect(pitchLeft + i * sW, pitchTop, sW, pitchH);
  }

  // Pitch white line markings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 4;
  ctx.strokeRect(pitchLeft, pitchTop, pitchW, pitchH);

  // Center Line & Circle
  ctx.beginPath();
  ctx.moveTo(w * 0.5, pitchTop);
  ctx.lineTo(w * 0.5, pitchBottom);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, 75, 0, Math.PI * 2);
  ctx.stroke();

  // Kinetic speed trails
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(w * 0.28, h * 0.62);
  ctx.lineTo(w * 0.5, h * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Disc 1: Brazil (Bottom Left moving toward ball)
  ctx.save();
  const d1X = w * 0.32;
  const d1Y = h * 0.6;
  const dR = 56;
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(d1X, d1Y + 14, dR * 1.1, dR * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Metallic gold beveled rim
  const rimGrad1 = ctx.createLinearGradient(d1X - dR, d1Y - dR, d1X + dR, d1Y + dR);
  rimGrad1.addColorStop(0, '#FFFFFF');
  rimGrad1.addColorStop(0.3, '#FFD54F');
  rimGrad1.addColorStop(0.7, '#FFA000');
  rimGrad1.addColorStop(1, '#009C3B');
  ctx.fillStyle = rimGrad1;
  ctx.beginPath();
  ctx.arc(d1X, d1Y, dR, 0, Math.PI * 2);
  ctx.fill();
  // Green base
  ctx.fillStyle = '#009C3B';
  ctx.beginPath();
  ctx.arc(d1X, d1Y, dR * 0.8, 0, Math.PI * 2);
  ctx.fill();
  // Yellow rhombus
  ctx.fillStyle = '#FFDF00';
  ctx.beginPath();
  ctx.moveTo(d1X, d1Y - dR * 0.5);
  ctx.lineTo(d1X + dR * 0.65, d1Y);
  ctx.lineTo(d1X, d1Y + dR * 0.5);
  ctx.lineTo(d1X - dR * 0.65, d1Y);
  ctx.closePath();
  ctx.fill();
  // Blue globe
  ctx.fillStyle = '#002776';
  ctx.beginPath();
  ctx.arc(d1X, d1Y, dR * 0.28, 0, Math.PI * 2);
  ctx.fill();
  // Gloss crescent
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(d1X, d1Y - dR * 0.4, dR * 0.55, dR * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Disc 2: South Africa (Top Right defending)
  ctx.save();
  const d2X = w * 0.68;
  const d2Y = h * 0.38;
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(d2X, d2Y + 14, dR * 1.1, dR * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rim
  const rimGrad2 = ctx.createLinearGradient(d2X - dR, d2Y - dR, d2X + dR, d2Y + dR);
  rimGrad2.addColorStop(0, '#FFFFFF');
  rimGrad2.addColorStop(0.3, '#FFB612');
  rimGrad2.addColorStop(0.7, '#007749');
  rimGrad2.addColorStop(1, '#0D1B2A');
  ctx.fillStyle = rimGrad2;
  ctx.beginPath();
  ctx.arc(d2X, d2Y, dR, 0, Math.PI * 2);
  ctx.fill();
  // Green base
  ctx.fillStyle = '#007749';
  ctx.beginPath();
  ctx.arc(d2X, d2Y, dR * 0.8, 0, Math.PI * 2);
  ctx.fill();
  // Red top
  ctx.fillStyle = '#DE3831';
  ctx.beginPath();
  ctx.arc(d2X, d2Y, dR * 0.75, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();
  // Blue bottom
  ctx.fillStyle = '#002395';
  ctx.beginPath();
  ctx.arc(d2X, d2Y, dR * 0.75, Math.PI * 0.05, Math.PI * 0.95);
  ctx.fill();
  // Gloss
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(d2X, d2Y - dR * 0.4, dR * 0.55, dR * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Central 3D Football with Pentagon patches
  const bX = w * 0.5;
  const bY = h * 0.5;
  const bR = 34;

  // Ball shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(bX + 4, bY + 12, bR * 1.1, bR * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3D Sphere
  const ballGrad = ctx.createRadialGradient(bX - 10, bY - 10, 3, bX, bY, bR);
  ballGrad.addColorStop(0, '#FFFFFF');
  ballGrad.addColorStop(0.75, '#ECEFF1');
  ballGrad.addColorStop(1, '#90A4AE');
  ctx.fillStyle = ballGrad;
  ctx.beginPath();
  ctx.arc(bX, bY, bR, 0, Math.PI * 2);
  ctx.fill();

  // Pentagon Center
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  const pR = bR * 0.4;
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = bX + Math.cos(a) * pR;
    const py = bY + Math.sin(a) * pR;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Seam lines
  ctx.strokeStyle = '#37474F';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = bX + Math.cos(a) * pR;
    const py = bY + Math.sin(a) * pR;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(bX + Math.cos(a) * (bR * 0.95), bY + Math.sin(a) * (bR * 0.95));
    ctx.stroke();
  }

  // Specular highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(bX - 9, bY - 9, 8, 0, Math.PI * 2);
  ctx.fill();

  // Sparkles
  drawSparkle(ctx, bX, bY, 18, '#FFFFFF');
  drawSparkle(ctx, d1X + 20, d1Y - 20, 14, '#FFD54F');
  drawSparkle(ctx, d2X - 20, d2Y - 20, 14, '#00E5FF');
}

/**
 * 22. ROYAL WATER SORT ARTWORK (3D Glass Bottles, Liquid Layers, Golden Crown, Cosmic Royal Ballroom)
 */
function renderRoyalWaterSortArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep royal cosmic gradient
  const bg = ctx.createRadialGradient(w / 2, h * 0.45, 80, w / 2, h / 2, w * 0.7);
  bg.addColorStop(0, '#1E1B4B');
  bg.addColorStop(0.45, '#0E1742');
  bg.addColorStop(1, '#050A20');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle star field & cosmic sparkles
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137.5) % w;
    const sy = (i * 223.7) % h;
    const sr = (i % 3) + 1;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden Crown (Top Center)
  const cx = w / 2;
  const cy = h * 0.22;
  ctx.save();
  ctx.translate(cx, cy);

  // Crown Glow
  const crownGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
  crownGlow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
  crownGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = crownGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 90, 0, Math.PI * 2);
  ctx.fill();

  // Crown Base
  const crownGrad = ctx.createLinearGradient(-50, 0, 50, 0);
  crownGrad.addColorStop(0, '#FFA000');
  crownGrad.addColorStop(0.5, '#FFE082');
  crownGrad.addColorStop(1, '#FF8F00');
  ctx.fillStyle = crownGrad;

  ctx.beginPath();
  ctx.moveTo(-55, 20);
  ctx.lineTo(55, 20);
  ctx.lineTo(45, -20);
  ctx.lineTo(25, 0);
  ctx.lineTo(0, -35);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-45, -20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Gemstones on crown
  const gems = [
    { x: 0, y: -35, c: '#F04444' },
    { x: -45, y: -20, c: '#25DCE8' },
    { x: 45, y: -20, c: '#9B59FF' },
  ];
  gems.forEach((g) => {
    ctx.fillStyle = g.c;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
  ctx.restore();

  // 4 3D Glass Bottles with Vibrant Liquid Layers
  const bottleWidth = 54;
  const bottleHeight = 160;
  const startX = cx - 120;
  const bottleY = h * 0.46;

  const bottlesData = [
    { layers: ['#F04444', '#F04444', '#F04444', '#F04444'], cork: true }, // Ruby
    { layers: ['#25DCE8', '#4285F4', '#25DCE8', '#4285F4'], cork: false }, // Cyan/Blue
    { layers: ['#42D66B', '#FFD83D', '#42D66B', '#FFD83D'], cork: false }, // Green/Yellow
    { layers: ['#9B59FF', '#FF4FA3', '#9B59FF', '#FF4FA3'], cork: false }, // Purple/Pink
  ];

  bottlesData.forEach((b, idx) => {
    const bx = startX + idx * 80;
    const by = bottleY;

    // Glass Inner Shadow / Liquid
    ctx.save();
    // Clip to rounded bottle
    ctx.beginPath();
    ctx.roundRect(bx - bottleWidth / 2, by - bottleHeight / 2, bottleWidth, bottleHeight, [12, 12, 22, 22]);
    ctx.clip();

    // Fill Liquid Layers
    const layerH = bottleHeight / 4;
    b.layers.forEach((col, lIdx) => {
      const ly = by + bottleHeight / 2 - (lIdx + 1) * layerH;
      const lGrad = ctx.createLinearGradient(bx - bottleWidth / 2, 0, bx + bottleWidth / 2, 0);
      lGrad.addColorStop(0, '#FFFFFF');
      lGrad.addColorStop(0.2, col);
      lGrad.addColorStop(0.85, col);
      lGrad.addColorStop(1, '#000000');
      ctx.fillStyle = lGrad;
      ctx.fillRect(bx - bottleWidth / 2, ly, bottleWidth, layerH + 1);

      // Top meniscus ellipse
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(bx, ly, bottleWidth / 2 - 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    // 3D Glass Body Stroke & Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bx - bottleWidth / 2, by - bottleHeight / 2, bottleWidth, bottleHeight, [12, 12, 22, 22]);
    ctx.stroke();

    // Specular Highlight Streak
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx - bottleWidth / 2 + 6, by - bottleHeight / 2 + 10);
    ctx.lineTo(bx - bottleWidth / 2 + 6, by + bottleHeight / 2 - 20);
    ctx.stroke();

    // Cork if completed
    if (b.cork) {
      ctx.fillStyle = '#FFA000';
      ctx.beginPath();
      ctx.roundRect(bx - 12, by - bottleHeight / 2 - 10, 24, 12, 4);
      ctx.fill();
      drawSparkle(ctx, bx, by - bottleHeight / 2 - 12, 14, '#FFD54F');
    }
  });

  // Flowing Liquid Arc between Bottle 2 and Bottle 3
  ctx.save();
  ctx.strokeStyle = '#25DCE8';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(startX + 80, bottleY - bottleHeight / 2 + 4);
  ctx.quadraticCurveTo(startX + 120, bottleY - bottleHeight / 2 - 24, startX + 160, bottleY - bottleHeight / 2 + 12);
  ctx.stroke();
  ctx.restore();

  // Championship Typography at bottom
  ctx.save();
  ctx.textAlign = 'center';

  // Title: ROYAL WATER SORT
  ctx.font = '900 46px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillText('ROYAL WATER SORT', cx, h * 0.84);

  // Subtitle
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FBBF24';
  ctx.shadowBlur = 8;
  ctx.fillText('40 CHAMPIONSHIP LEVELS • 3D GLASS PUZZLE', cx, h * 0.91);
  ctx.restore();
}

// -----------------------------------------------------------------------------
// Concept: EMOJI FUN (Vibrant 3D Emoji Tournament Puzzle Art)
// -----------------------------------------------------------------------------
function renderEmojiFunArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5;
  const cy = h * 0.44;

  // Background Pastel Pink/Purple/Blue Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#f472b6');
  bgGrad.addColorStop(0.5, '#c084fc');
  bgGrad.addColorStop(1, '#60a5fa');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Soft Radial Glow in Center
  const glow = ctx.createRadialGradient(cx, cy, 50, cx, cy, 320);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Floating decorative spheres (emojis)
  draw3DSphere(ctx, cx - 180, cy + 30, 52, '#fde047', '#eab308', '#ca8a04');
  draw3DSphere(ctx, cx + 180, cy + 20, 56, '#f87171', '#ef4444', '#b91c1c');
  draw3DSphere(ctx, cx - 90, cy - 80, 42, '#4ade80', '#22c55e', '#15803d');
  draw3DSphere(ctx, cx + 100, cy - 70, 48, '#38bdf8', '#0ea5e9', '#0369a1');

  // Hero Central 3D Golden Sphere
  draw3DSphere(ctx, cx, cy - 10, 84, '#fef08a', '#eab308', '#854d0e', 0.5);

  // Title: EMOJI FUN
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 56px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(76, 29, 149, 0.7)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillText('EMOJI FUN', cx, h * 0.84);

  // Subtitle
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.shadowBlur = 10;
  ctx.fillText('40 TOURNAMENT LEVELS • SKILL-BASED SCORING', cx, h * 0.91);
  ctx.restore();
}

// =============================================================================
// EMOJI IQ (id: emoji-iq)
// Tournament Emoji & Number Calculation Challenge with mandatory palette
// =============================================================================
function renderEmojiIqArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5;
  const cy = h * 0.44;

  // Background: Dark violet #241F3D with #6C5CE7 & #00B8D9 gradients
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#241F3D');
  bgGrad.addColorStop(0.5, '#35295c');
  bgGrad.addColorStop(1, '#1b1630');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Soft Radial Glow
  const glow = ctx.createRadialGradient(cx, cy, 40, cx, cy, 300);
  glow.addColorStop(0, 'rgba(108, 92, 231, 0.45)');
  glow.addColorStop(0.6, 'rgba(0, 184, 217, 0.25)');
  glow.addColorStop(1, 'rgba(36, 31, 61, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Floating 3D decorative spheres (Emoji symbols)
  draw3DSphere(ctx, cx - 180, cy + 20, 50, '#ff7675', '#d63031', '#780c0d');
  draw3DSphere(ctx, cx + 180, cy + 10, 54, '#ffeaa7', '#fdcb6e', '#e17055');
  draw3DSphere(ctx, cx - 100, cy - 70, 42, '#00B8D9', '#0097ad', '#006575');
  draw3DSphere(ctx, cx + 110, cy - 60, 46, '#20C997', '#0fb981', '#065f46');

  // Hero Central Golden Brain/IQ Sphere
  draw3DSphere(ctx, cx, cy - 10, 84, '#FFB703', '#f59e0b', '#b45309', 0.5);

  // Mathematical equation badge overlay in center
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#241F3D';
  ctx.fillText('IQ', cx, cy - 10);
  ctx.restore();

  // Title: EMOJI IQ
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 58px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(108, 92, 231, 0.8)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fillText('EMOJI IQ', cx, h * 0.84);

  // Subtitle
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFB703';
  ctx.shadowBlur = 10;
  ctx.fillText('40 STAGES • TOURNAMENT MATH & LOGIC', cx, h * 0.91);
  ctx.restore();
}

// =============================================================================
// EMOJI SORTING BALL (id: emoji-sorting-ball)
// Stylized 3D Emoji vinyl spheres in crystal cylinders with mandatory tube palette
// =============================================================================
function renderEmojiSortingBallArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Midnight purple-violet ambient studio gradient
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 40, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#2e1065');
  bg.addColorStop(0.45, '#1e1b4b');
  bg.addColorStop(0.85, '#090514');
  bg.addColorStop(1, '#030108');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft glow pool on base
  const floorGlow = ctx.createRadialGradient(w * 0.5, h * 0.85, 30, w * 0.5, h * 0.85, 260);
  floorGlow.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
  floorGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = floorGlow;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.85, 280, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw crystal tube with colored glow rim
  function drawColoredTube(tx: number, ty: number, tw: number, th: number, rimColor: string) {
    ctx.save();
    // Glass cylinder body
    ctx.beginPath();
    ctx.roundRect(tx - tw * 0.5, ty, tw, th, [0, 0, tw * 0.5, tw * 0.5]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();

    // Colored wall outline
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Specular Highlight Line
    ctx.beginPath();
    ctx.moveTo(tx - tw * 0.38, ty + 10);
    ctx.lineTo(tx - tw * 0.38, ty + th - 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Top Rim Collar
    ctx.beginPath();
    ctx.ellipse(tx, ty, tw * 0.54, 8, 0, 0, Math.PI * 2);
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  }

  // Draw 3D Emoji Sphere with emoji symbol on front
  function drawEmojiSphere(cx: number, cy: number, r: number, emoji: string, c1: string, c2: string, c3: string) {
    draw3DSphere(ctx, cx, cy, r, c1, c2, c3, 0.45);
    ctx.save();
    ctx.font = `${Math.round(r * 1.05)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.fillText(emoji, cx, cy + 2);
    ctx.restore();
  }

  const tw = 74;
  const th = 225;
  const ty = h * 0.30;
  const r = 27;

  // Tube 1: Aqua Cyan (#22D3EE) with Smiling Emojis
  drawColoredTube(w * 0.33, ty, tw, th, '#22D3EE');
  drawEmojiSphere(w * 0.33, ty + th - r - 6, r, '😀', '#fde047', '#eab308', '#78350f');
  drawEmojiSphere(w * 0.33, ty + th - r * 3 - 8, r, '😀', '#fde047', '#eab308', '#78350f');
  drawEmojiSphere(w * 0.33, ty + th - r * 5 - 10, r, '😀', '#fde047', '#eab308', '#78350f');

  // Tube 2: Royal Violet (#8B5CF6) with Party Emojis
  drawColoredTube(w * 0.50, ty, tw, th, '#8B5CF6');
  drawEmojiSphere(w * 0.50, ty + th - r - 6, r, '🥳', '#c084fc', '#8b5cf6', '#4c1d95');
  drawEmojiSphere(w * 0.50, ty + th - r * 3 - 8, r, '🥳', '#c084fc', '#8b5cf6', '#4c1d95');

  // Floating Hero Emoji Ball (Levitating out of middle tube)
  drawEmojiSphere(w * 0.50, ty - 40, r + 5, '😎', '#fbbf24', '#d97706', '#78350f');

  // Trajectory arc
  ctx.beginPath();
  ctx.arc(w * 0.59, ty - 15, 65, Math.PI, 0);
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tube 3: Rose Pink (#F472B6) with Cool Emojis
  drawColoredTube(w * 0.67, ty, tw, th, '#F472B6');
  drawEmojiSphere(w * 0.67, ty + th - r - 6, r, '😎', '#fbbf24', '#d97706', '#78350f');
  drawEmojiSphere(w * 0.67, ty + th - r * 3 - 8, r, '😎', '#fbbf24', '#d97706', '#78350f');

  // Title Banner at Bottom
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.fillText('EMOJI SORTING BALL', w * 0.5, h * 0.84);

  ctx.font = '800 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#f472b6';
  ctx.shadowBlur = 10;
  ctx.fillText('3D TOURNAMENT PUZZLE • 40 ISOMORPHIC LEVELS', w * 0.5, h * 0.91);
  ctx.restore();

  drawSparkle(ctx, w * 0.50, ty - 75, 20, '#ffffff');
  drawSparkle(ctx, w * 0.33, ty + 15, 15, '#22d3ee');
  drawSparkle(ctx, w * 0.67, ty + 15, 15, '#f472b6');
}

// =============================================================================
// Public Artwork Dispatcher & Cached Master Generator
// =============================================================================
export function getGameArtworkUrl(gameId: string): string {
  if (artworkCache[gameId]) {
    return artworkCache[gameId];
  }

  if (typeof document === 'undefined') {
    return '';
  }

  const { canvas, ctx } = createOffscreen(960, 540);

  switch (gameId) {
    case 'emoji-sorting-ball':
      renderEmojiSortingBallArt(ctx, canvas.width, canvas.height);
      break;
    case 'royal-water-sort':
      renderRoyalWaterSortArt(ctx, canvas.width, canvas.height);
      break;
    case 'button-soccer':
      renderButtonSoccerArt(ctx, canvas.width, canvas.height);
      break;
    case 'halloween-fruit-slice':
      renderHalloweenFruitSliceArt(ctx, canvas.width, canvas.height);
      break;
    case 'candy-blast':
      renderCandyCrushArt(ctx, canvas.width, canvas.height);
      break;
    case 'world-legends':
      renderWordLegendArt(ctx, canvas.width, canvas.height);
      break;
    case 'juicy-match':
      renderCandyJuicyArt(ctx, canvas.width, canvas.height);
      break;
    case 'solitaire':
      renderSolitaireArt(ctx, canvas.width, canvas.height);
      break;
    case 'puzzle-block':
      renderBlockArt(ctx, canvas.width, canvas.height);
      break;
    case 'sorting-balls':
      renderSortingBallArt(ctx, canvas.width, canvas.height);
      break;
    case 'bubble-shooter':
      renderBubbleShooterArt(ctx, canvas.width, canvas.height);
      break;
    case 'memory-match':
      renderMemoryMatchArt(ctx, canvas.width, canvas.height);
      break;
    case 'helix-jump':
      renderHelixJumpArt(ctx, canvas.width, canvas.height);
      break;
    case 'crazy-colors':
      renderCrazyColorArt(ctx, canvas.width, canvas.height);
      break;
    case 'color-rush':
      renderColorRushArt(ctx, canvas.width, canvas.height);
      break;
    case 'knife-madness':
      renderKnifeMadnessArt(ctx, canvas.width, canvas.height);
      break;
    case 'archery-strike':
    case 'pop-balloon':
    case 'pop-ballon':
      renderPopBallonArt(ctx, canvas.width, canvas.height);
      break;
    case 'fruit-slice':
      renderFruitNinjaArt(ctx, canvas.width, canvas.height);
      break;
    case 'hill-rider':
    case 'hill-climb':
      renderHillClimbArt(ctx, canvas.width, canvas.height);
      break;
    case 'moto-race':
      renderMotoRaceArt(ctx, canvas.width, canvas.height);
      break;
    case 'soccer-ping-pong':
      renderSoccerPingPongArt(ctx, canvas.width, canvas.height);
      break;
    case 'soccer-shooter':
      renderSoccerShooterArt(ctx, canvas.width, canvas.height);
      break;
    case 'dama':
      renderDamaArt(ctx, canvas.width, canvas.height);
      break;
    case 'pop-piano':
      renderPopPianoArt(ctx, canvas.width, canvas.height);
      break;
    case 'emoji-fun':
    case 'math-emoji':
      renderEmojiFunArt(ctx, canvas.width, canvas.height);
      break;
    case 'emoji-iq':
      renderEmojiIqArt(ctx, canvas.width, canvas.height);
      break;
    default:
      renderColorRushArt(ctx, canvas.width, canvas.height);
      break;
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
  artworkCache[gameId] = dataUrl;
  return dataUrl;
}
