/**
 * Country Flag Soccer Ball Visual Renderer for Soccer Shooter
 * 
 * Replaces plain colored bubbles with authentic 3D tournament soccer balls
 * displaying national flags (Ethiopia, Brazil, Argentina, Germany, France, England).
 * Uses high-resolution offscreen canvas texture caching for silky smooth 60 FPS gameplay.
 */

import { BubbleColor } from './types';

export interface CountryFlagInfo {
  colorKey: BubbleColor;
  countryName: string;
  amharicName: string;
  code: string;
  primaryColor: string;
  secondaryColor: string;
}

export const COUNTRY_FLAG_BALL_INFO: Record<BubbleColor, CountryFlagInfo> = {
  GREEN: {
    colorKey: 'GREEN',
    countryName: 'Ethiopia',
    amharicName: 'ኢትዮጵያ',
    code: 'ET',
    primaryColor: '#078930',
    secondaryColor: '#FCDD09',
  },
  YELLOW: {
    colorKey: 'YELLOW',
    countryName: 'Brazil',
    amharicName: 'ብራዚል',
    code: 'BR',
    primaryColor: '#FEDD00',
    secondaryColor: '#009739',
  },
  BLUE: {
    colorKey: 'BLUE',
    countryName: 'Argentina',
    amharicName: 'አርጀንቲና',
    code: 'AR',
    primaryColor: '#74ACDF',
    secondaryColor: '#FFFFFF',
  },
  RED: {
    colorKey: 'RED',
    countryName: 'Germany',
    amharicName: 'ጀርመን',
    code: 'DE',
    primaryColor: '#DD0000',
    secondaryColor: '#FFCE00',
  },
  PURPLE: {
    colorKey: 'PURPLE',
    countryName: 'France',
    amharicName: 'ፈረንሳይ',
    code: 'FR',
    primaryColor: '#002654',
    secondaryColor: '#ED2939',
  },
  WHITE: {
    colorKey: 'WHITE',
    countryName: 'England',
    amharicName: 'እንግሊዝ',
    code: 'ENG',
    primaryColor: '#FFFFFF',
    secondaryColor: '#CE1124',
  },
};

// Texture cache for high-performance offscreen rendering
const TEXTURE_SIZE = 256;
const textureCache: Partial<Record<BubbleColor, HTMLCanvasElement>> = {};

/**
 * Draw five-pointed star helper
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

/**
 * Draw Ethiopia Flag on Ball
 */
function drawEthiopiaFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Horizontal triband: Green (top), Yellow (middle), Red (bottom)
  const bandH = (r * 2) / 3;

  // Top band: Forest Green
  ctx.fillStyle = '#078930';
  ctx.fillRect(cx - r, cy - r, r * 2, bandH);

  // Middle band: Golden Yellow
  ctx.fillStyle = '#FCDD09';
  ctx.fillRect(cx - r, cy - r + bandH, r * 2, bandH);

  // Bottom band: Crimson Red
  ctx.fillStyle = '#DA121A';
  ctx.fillRect(cx - r, cy - r + bandH * 2, r * 2, bandH);

  // Central Emblem: Blue circular disc with golden star and rays
  const discRadius = r * 0.44;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, discRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0F47AF';
  ctx.fill();
  ctx.strokeStyle = '#FCDD09';
  ctx.lineWidth = Math.max(1.5, r * 0.035);
  ctx.stroke();

  // Golden star with radiating rays
  ctx.fillStyle = '#FCDD09';
  drawStar(ctx, cx, cy, 5, discRadius * 0.72, discRadius * 0.32);
  ctx.fill();

  // Star ray spikes
  ctx.strokeStyle = '#FCDD09';
  ctx.lineWidth = Math.max(1.2, r * 0.03);
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI / 2) * 3 + (i * Math.PI * 2) / 5 + Math.PI / 5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (discRadius * 0.28), cy + Math.sin(angle) * (discRadius * 0.28));
    ctx.lineTo(cx + Math.cos(angle) * (discRadius * 0.88), cy + Math.sin(angle) * (discRadius * 0.88));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draw Brazil Flag on Ball
 */
function drawBrazilFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Base field: Rich Emerald Green
  ctx.fillStyle = '#009739';
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // Canary Yellow Rhombus (Diamond)
  ctx.fillStyle = '#FEDD00';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.72);
  ctx.lineTo(cx + r * 0.84, cy);
  ctx.lineTo(cx, cy + r * 0.72);
  ctx.lineTo(cx - r * 0.84, cy);
  ctx.closePath();
  ctx.fill();

  // Celestial Blue Globe
  const globeRadius = r * 0.42;
  ctx.beginPath();
  ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#012169';
  ctx.fill();

  // White Curved Equatorial Band
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
  ctx.clip();

  ctx.beginPath();
  ctx.ellipse(cx, cy + globeRadius * 0.45, globeRadius * 1.15, globeRadius * 0.4, -0.15, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(2, r * 0.055);
  ctx.stroke();

  // Southern cross tiny stars
  ctx.fillStyle = '#FFFFFF';
  const stars = [
    { x: cx - r * 0.1, y: cy - r * 0.08 },
    { x: cx + r * 0.12, y: cy - r * 0.12 },
    { x: cx + r * 0.05, y: cy + r * 0.14 },
    { x: cx - r * 0.08, y: cy + r * 0.18 },
    { x: cx + r * 0.15, y: cy + r * 0.22 },
  ];
  for (const s of stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, Math.max(1, r * 0.02), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw Argentina Flag on Ball
 */
function drawArgentinaFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Horizontal triband: Celestial Sky Blue, White, Celestial Sky Blue
  const bandH = (r * 2) / 3;

  ctx.fillStyle = '#74ACDF';
  ctx.fillRect(cx - r, cy - r, r * 2, bandH);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx - r, cy - r + bandH, r * 2, bandH);

  ctx.fillStyle = '#74ACDF';
  ctx.fillRect(cx - r, cy - r + bandH * 2, r * 2, bandH);

  // Central Sol de Mayo (Sun of May)
  const sunRadius = r * 0.22;
  const rayOuter = r * 0.38;

  // Rays
  ctx.strokeStyle = '#F6B40E';
  ctx.lineWidth = Math.max(1.4, r * 0.035);
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (sunRadius * 0.8), cy + Math.sin(angle) * (sunRadius * 0.8));
    ctx.lineTo(cx + Math.cos(angle) * rayOuter, cy + Math.sin(angle) * rayOuter);
    ctx.stroke();
  }

  // Sun Disc
  ctx.beginPath();
  ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#F6B40E';
  ctx.fill();
  ctx.strokeStyle = '#8A5A00';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Subtle sun facial eyes
  ctx.fillStyle = '#8A5A00';
  ctx.beginPath();
  ctx.arc(cx - sunRadius * 0.35, cy - sunRadius * 0.15, Math.max(1, r * 0.02), 0, Math.PI * 2);
  ctx.arc(cx + sunRadius * 0.35, cy - sunRadius * 0.15, Math.max(1, r * 0.02), 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw Germany Flag on Ball
 */
function drawGermanyFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Horizontal triband: Black, Red, Gold
  const bandH = (r * 2) / 3;

  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(cx - r, cy - r, r * 2, bandH);

  ctx.fillStyle = '#DD0000';
  ctx.fillRect(cx - r, cy - r + bandH, r * 2, bandH);

  ctx.fillStyle = '#FFCE00';
  ctx.fillRect(cx - r, cy - r + bandH * 2, r * 2, bandH);

  // Subtle centered eagle crest outline / champion star
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  drawStar(ctx, cx, cy, 5, r * 0.22, r * 0.1);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw France Flag on Ball
 */
function drawFranceFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Vertical triband: Navy Blue, White, Red
  const bandW = (r * 2) / 3;

  ctx.fillStyle = '#002654';
  ctx.fillRect(cx - r, cy - r, bandW, r * 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx - r + bandW, cy - r, bandW, r * 2);

  ctx.fillStyle = '#ED2939';
  ctx.fillRect(cx - r + bandW * 2, cy - r, bandW, r * 2);

  // Centered French Golden Champion Star
  ctx.save();
  ctx.fillStyle = '#F5B041';
  ctx.strokeStyle = '#7D510F';
  ctx.lineWidth = 1;
  drawStar(ctx, cx, cy, 5, r * 0.22, r * 0.1);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw England Flag on Ball
 */
function drawEnglandFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // White field with Red St George's Cross
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  const crossW = r * 0.44;

  ctx.fillStyle = '#CE1124';
  // Vertical arm
  ctx.fillRect(cx - crossW / 2, cy - r, crossW, r * 2);
  // Horizontal arm
  ctx.fillRect(cx - r, cy - crossW / 2, r * 2, crossW);

  // Centered gold star
  ctx.save();
  ctx.fillStyle = '#F5B041';
  ctx.strokeStyle = '#7D510F';
  ctx.lineWidth = 1;
  drawStar(ctx, cx, cy, 5, r * 0.22, r * 0.1);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw Authentic Soccer Ball Panels & Inset Seams
 */
function drawSoccerBallSeams(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();

  // Center pentagon panel
  const pentagonR = r * 0.38;
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    vertices.push({
      x: cx + Math.cos(angle) * pentagonR,
      y: cy + Math.sin(angle) * pentagonR,
    });
  }

  // Draw center pentagon seams
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < 5; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y);
  }
  ctx.closePath();

  // Dark seam groove
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.lineWidth = Math.max(1.8, r * 0.045);
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Seam bright highlight for 3D indentation
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = Math.max(0.8, r * 0.02);
  ctx.stroke();

  // Radial seams extending outward to hexagon junctions
  const outerR = r * 0.74;
  const outerVertices: { x: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const ox = cx + Math.cos(angle) * outerR;
    const oy = cy + Math.sin(angle) * outerR;
    outerVertices.push({ x: ox, y: oy });

    // Radial line from pentagon vertex to outer vertex
    ctx.beginPath();
    ctx.moveTo(vertices[i].x, vertices[i].y);
    ctx.lineTo(ox, oy);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.lineWidth = Math.max(1.8, r * 0.045);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = Math.max(0.8, r * 0.02);
    ctx.stroke();
  }

  // Connecting outer hexagon panels to each other and edge of ball
  for (let i = 0; i < 5; i++) {
    const nextIdx = (i + 1) % 5;
    ctx.beginPath();
    ctx.moveTo(outerVertices[i].x, outerVertices[i].y);
    ctx.lineTo(outerVertices[nextIdx].x, outerVertices[nextIdx].y);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.lineWidth = Math.max(1.5, r * 0.04);
    ctx.stroke();

    // Seam heading directly to ball perimeter
    const midAngle = -Math.PI / 2 + (i * Math.PI * 2) / 5 + Math.PI / 5;
    ctx.beginPath();
    ctx.moveTo(
      (outerVertices[i].x + outerVertices[nextIdx].x) / 2,
      (outerVertices[i].y + outerVertices[nextIdx].y) / 2
    );
    ctx.lineTo(cx + Math.cos(midAngle) * r, cy + Math.sin(midAngle) * r);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.lineWidth = Math.max(1.5, r * 0.04);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Apply 3D Spherical Volume Shading, Ambient Occlusion, and Glossy Light Sheen
 */
function applySphericalLighting(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();

  // 1. Curvature Depth & Rim Ambient Occlusion
  const depthGrad = ctx.createRadialGradient(
    cx - r * 0.28,
    cy - r * 0.28,
    r * 0.05,
    cx,
    cy,
    r
  );
  depthGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  depthGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  depthGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.25)');
  depthGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = depthGrad;
  ctx.fill();

  // 2. High-gloss specular highlight (Match ball polyurethane shine)
  ctx.save();
  ctx.translate(cx - r * 0.32, cy - r * 0.32);
  ctx.rotate(-Math.PI / 4);
  const specGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.35);
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
  specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.35)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.38, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = specGrad;
  ctx.fill();
  ctx.restore();

  // 3. Secondary micro-specular dot
  ctx.beginPath();
  ctx.arc(cx + r * 0.28, cy - r * 0.28, r * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();

  // 4. Subtle bottom-right stadium floodlight rim bounce
  const rimGrad = ctx.createRadialGradient(
    cx + r * 0.35,
    cy + r * 0.35,
    r * 0.6,
    cx + r * 0.35,
    cy + r * 0.35,
    r
  );
  rimGrad.addColorStop(0, 'transparent');
  rimGrad.addColorStop(0.85, 'transparent');
  rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.22)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = rimGrad;
  ctx.fill();

  ctx.restore();
}

/**
 * Generate offscreen high-resolution texture for a country flag soccer ball
 */
function createBallTexture(color: BubbleColor): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const cx = TEXTURE_SIZE / 2;
  const cy = TEXTURE_SIZE / 2;
  const r = (TEXTURE_SIZE / 2) - 4; // Padding for outer border and anti-aliasing

  ctx.save();

  // 1. Clip strictly to circular ball silhouette
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // 2. Draw national flag across the spherical ball surface
  switch (color) {
    case 'GREEN':
      drawEthiopiaFlag(ctx, cx, cy, r);
      break;
    case 'YELLOW':
      drawBrazilFlag(ctx, cx, cy, r);
      break;
    case 'BLUE':
      drawArgentinaFlag(ctx, cx, cy, r);
      break;
    case 'RED':
      drawGermanyFlag(ctx, cx, cy, r);
      break;
    case 'PURPLE':
      drawFranceFlag(ctx, cx, cy, r);
      break;
    case 'WHITE':
      drawEnglandFlag(ctx, cx, cy, r);
      break;
  }

  // 3. Draw authentic soccer ball panel seams & stitching
  drawSoccerBallSeams(ctx, cx, cy, r);

  // 4. Apply 3D spherical volume shading and glossy specular sheen
  applySphericalLighting(ctx, cx, cy, r);

  ctx.restore();

  // 5. Outer seam border ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.lineWidth = 2;
  ctx.stroke();

  return canvas;
}

/**
 * Ensure all textures are pre-rendered into the offscreen cache
 */
function getTexture(color: BubbleColor): HTMLCanvasElement {
  if (!textureCache[color]) {
    textureCache[color] = createBallTexture(color);
  }
  return textureCache[color]!;
}

/**
 * Primary Render Function:
 * Renders a complete 3D Country Flag Soccer Ball at (cx, cy) with radius r and optional rotation.
 * Compatible with all existing Bubble Shooter / Soccer Shooter coordinates and dimensions.
 */
export function renderCountryFlagBall(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: BubbleColor,
  rotation = 0
) {
  if (r <= 0) return;

  ctx.save();

  // 1. Subtle soft contact shadow underneath the ball
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.14, r * 0.94, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fill();

  // 2. Blit pre-cached high-resolution texture with optional rotation
  const texture = getTexture(color);
  const size = r * 2;

  if (rotation !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.drawImage(texture, -r, -r, size, size);
  } else {
    ctx.drawImage(texture, cx - r, cy - r, size, size);
  }

  ctx.restore();
}
