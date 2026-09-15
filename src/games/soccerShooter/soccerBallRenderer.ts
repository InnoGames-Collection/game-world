/**
 * Soccer Shooter - Premium 3D National-Flag Soccer Ball Canvas Renderer
 * Renders authentic 3D spherical match footballs wrapped with curved national flags,
 * realistic leather panel seams (truncated icosahedron), Blinn-Phong specular glares,
 * spherical ambient occlusion, and pitch bounce illumination.
 */

import { SoccerTeamColor, TeamColorDefinition } from './types';

export const SOCCER_TEAM_PALETTES: Record<SoccerTeamColor, TeamColorDefinition> = {
  BRAZIL: {
    id: 'BRAZIL',
    name: 'Brazil',
    country: 'Brazil',
    flagEmoji: '🇧🇷',
    primary: '#009739',   // Canary Green
    secondary: '#FEDD00', // Brazilian Gold
    accent: '#012169',    // Celestial Blue
    highlight: '#E6F4EA',
    shadow: '#004218',
    seamColor: '#002B11',
    glow: 'rgba(0, 151, 57, 0.55)',
  },
  ARGENTINA: {
    id: 'ARGENTINA',
    name: 'Argentina',
    country: 'Argentina',
    flagEmoji: '🇦🇷',
    primary: '#75AADB',   // Argentine Sky Blue
    secondary: '#FFFFFF', // Pure Pearl White
    accent: '#F6B40E',    // Sun of May Gold
    highlight: '#EBF4FC',
    shadow: '#2A527A',
    seamColor: '#1E3C5C',
    glow: 'rgba(117, 170, 219, 0.55)',
  },
  ENGLAND: {
    id: 'ENGLAND',
    name: 'England',
    country: 'England',
    flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    primary: '#FFFFFF',   // Match Leather White
    secondary: '#CF081F', // St George Crimson Cross
    accent: '#00247D',    // Navy Blue
    highlight: '#FFFFFF',
    shadow: '#8C101C',
    seamColor: '#2B3342',
    glow: 'rgba(207, 8, 31, 0.55)',
  },
  FRANCE: {
    id: 'FRANCE',
    name: 'France',
    country: 'France',
    flagEmoji: '🇫🇷',
    primary: '#002654',   // Bleus Royal Blue
    secondary: '#ED2939', // French Tricolor Red
    accent: '#FFFFFF',    // Pure White
    highlight: '#E8F0FE',
    shadow: '#001026',
    seamColor: '#0A1728',
    glow: 'rgba(0, 38, 84, 0.55)',
  },
  SPAIN: {
    id: 'SPAIN',
    name: 'Spain',
    country: 'Spain',
    flagEmoji: '🇪🇸',
    primary: '#AA151B',   // Spanish Crimson
    secondary: '#F1BF00', // Gold Yellow
    accent: '#800C12',    // Deep Royal Red
    highlight: '#FCE8E6',
    shadow: '#59060B',
    seamColor: '#3B0407',
    glow: 'rgba(170, 21, 27, 0.55)',
  },
  GERMANY: {
    id: 'GERMANY',
    name: 'Germany',
    country: 'Germany',
    flagEmoji: '🇩🇪',
    primary: '#F8FAFC',   // White Leather Base
    secondary: '#0F172A', // Black Telstar Ribbon
    accent: '#DD0000',    // Red / Gold Trim
    highlight: '#FFFFFF',
    shadow: '#1E293B',
    seamColor: '#020617',
    glow: 'rgba(15, 23, 42, 0.5)',
  },
  ITALY: {
    id: 'ITALY',
    name: 'Italy',
    country: 'Italy',
    flagEmoji: '🇮🇹',
    primary: '#004DB3',   // Azzurri Cobalt
    secondary: '#008C45', // Italian Emerald
    accent: '#FFFFFF',    // White
    highlight: '#E8F0FE',
    shadow: '#002966',
    seamColor: '#001A40',
    glow: 'rgba(0, 77, 179, 0.55)',
  },
  ETHIOPIA: {
    id: 'ETHIOPIA',
    name: 'Ethiopia',
    country: 'Ethiopia',
    flagEmoji: '🇪🇹',
    primary: '#009A44',   // Emerald Green
    secondary: '#FED100', // Radiant Yellow
    accent: '#EF3340',    // Crimson Red
    highlight: '#E6F4EA',
    shadow: '#004218',
    seamColor: '#00260E',
    glow: 'rgba(0, 154, 68, 0.55)',
  },
  PORTUGAL: {
    id: 'PORTUGAL',
    name: 'Portugal',
    country: 'Portugal',
    flagEmoji: '🇵🇹',
    primary: '#006600',   // Portugal Olive Green
    secondary: '#FF0000', // Scarlet Red
    accent: '#FFCC00',    // Armillary Gold
    highlight: '#FCE8E6',
    shadow: '#3D0000',
    seamColor: '#2B0000',
    glow: 'rgba(255, 0, 0, 0.55)',
  },
  NETHERLANDS: {
    id: 'NETHERLANDS',
    name: 'Netherlands',
    country: 'Netherlands',
    flagEmoji: '🇳🇱',
    primary: '#F36C21',   // Dutch Royal Oranje
    secondary: '#FFFFFF', // Pure White
    accent: '#21468B',    // Royal Blue
    highlight: '#FEF3EB',
    shadow: '#7C2D12',
    seamColor: '#451A03',
    glow: 'rgba(243, 108, 33, 0.55)',
  },
  JAPAN: {
    id: 'JAPAN',
    name: 'Japan',
    country: 'Japan',
    flagEmoji: '🇯🇵',
    primary: '#FFFFFF',   // White Leather Base
    secondary: '#BC002D', // Hinomaru Crimson Sun
    accent: '#001E62',    // Samurai Navy Trim
    highlight: '#FFFFFF',
    shadow: '#334155',
    seamColor: '#0F172A',
    glow: 'rgba(188, 0, 45, 0.55)',
  },
  SPECIAL_GOLD: {
    id: 'SPECIAL_GOLD',
    name: 'Golden Ball',
    country: 'Championship',
    flagEmoji: '⚽🌟',
    primary: '#F59E0B',   // 24K Gold
    secondary: '#FEF08A', // Brilliant Gold Highlight
    accent: '#78350F',    // Deep Bronze
    highlight: '#FFFBEB',
    shadow: '#92400E',
    seamColor: '#451A03',
    glow: 'rgba(245, 158, 11, 0.85)',
    isSpecial: true,
  },
};

/**
 * High-Resolution Pre-Rendered Texture Atlas for 3D National Flag Balls
 * Eliminates per-frame ray-sphere calculations while delivering photorealistic
 * 3D spherical rendering, seamless national flag spherical warping, and 60+ FPS performance.
 */
const BALL_CACHE_SIZE = 256;
const ballCanvasCache: Map<string, HTMLCanvasElement> = new Map();

/**
 * Initializes and caches a 3D national team football onto an offscreen canvas
 */
function getOrCreateBallCanvas(color: SoccerTeamColor): HTMLCanvasElement {
  const cached = ballCanvasCache.get(color);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = BALL_CACHE_SIZE;
  canvas.height = BALL_CACHE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const team = SOCCER_TEAM_PALETTES[color] || SOCCER_TEAM_PALETTES.BRAZIL;
  const center = BALL_CACHE_SIZE / 2;
  const radius = center - 6; // Leave slight gutter for soft antialiasing

  ctx.save();
  ctx.translate(center, center);

  // 1. Base Circular Clip
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();

  // 2. Base Premium Football Leather Material (very light pearl white base)
  const baseGrad = ctx.createRadialGradient(
    -radius * 0.35,
    -radius * 0.4,
    radius * 0.05,
    0,
    0,
    radius
  );
  if (team.isSpecial) {
    baseGrad.addColorStop(0, '#FFFBEB');
    baseGrad.addColorStop(0.2, '#FEF08A');
    baseGrad.addColorStop(0.5, '#F59E0B');
    baseGrad.addColorStop(0.85, '#B45309');
    baseGrad.addColorStop(1, '#78350F');
  } else {
    baseGrad.addColorStop(0, '#FFFFFF');
    baseGrad.addColorStop(0.3, '#F8FAFC');
    baseGrad.addColorStop(0.7, '#E2E8F0');
    baseGrad.addColorStop(1, '#94A3B8');
  }
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // 3. Render the National Flag with Spherical Curvature
  renderSphericalNationalFlag(ctx, radius, team);

  // 4. Render Authentic 3D Truncated Icosahedron Football Seams & Leather Panels
  renderSphericalFootballSeams(ctx, radius, team);

  // 5. Spherical Ambient Occlusion & 3D Shading
  // Darkens the perimeter to create deep physical curvature
  const aoGrad = ctx.createRadialGradient(
    -radius * 0.15,
    -radius * 0.2,
    radius * 0.45,
    0,
    0,
    radius
  );
  aoGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  aoGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.1)');
  aoGrad.addColorStop(0.88, 'rgba(0, 0, 0, 0.42)');
  aoGrad.addColorStop(1, 'rgba(0, 0, 0, 0.72)');
  ctx.fillStyle = aoGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // 6. Directional Stadium Floodlight Diffuse Shading
  // Matches top-left stadium illumination
  const diffuseLight = ctx.createLinearGradient(
    -radius * 0.75,
    -radius * 0.75,
    radius * 0.75,
    radius * 0.75
  );
  diffuseLight.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  diffuseLight.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
  diffuseLight.addColorStop(0.8, 'rgba(0, 0, 0, 0.15)');
  diffuseLight.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = diffuseLight;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // 7. Pitch Green Turf Bounce Illumination (Bottom-Right Rim)
  const turfBounce = ctx.createRadialGradient(
    radius * 0.6,
    radius * 0.6,
    radius * 0.05,
    0,
    0,
    radius
  );
  turfBounce.addColorStop(0.82, 'rgba(16, 185, 129, 0)');
  turfBounce.addColorStop(1, 'rgba(16, 185, 129, 0.35)');
  ctx.fillStyle = turfBounce;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // 8. Glossy Multi-Layer Specular Highlights (Top-Left Stadium Floodlights)
  // Primary soft elongated glossy reflection
  ctx.save();
  ctx.translate(-radius * 0.34, -radius * 0.38);
  ctx.rotate(-Math.PI / 4);
  const specGrad1 = ctx.createRadialGradient(0, 0, radius * 0.02, 0, 0, radius * 0.48);
  specGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  specGrad1.addColorStop(0.3, 'rgba(255, 255, 255, 0.45)');
  specGrad1.addColorStop(0.65, 'rgba(255, 255, 255, 0.12)');
  specGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = specGrad1;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.45, radius * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Secondary sharp pinpoint specular glare (floodlight lamp focus)
  ctx.beginPath();
  ctx.arc(-radius * 0.42, -radius * 0.44, radius * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();

  // Subtle tertiary secondary rim highlight
  const rimGrad = ctx.createRadialGradient(0, 0, radius * 0.88, 0, 0, radius);
  rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  rimGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
  rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // End base clip

  // 9. Crisp Outer Silhouette (Subtle anti-aliased edge seam)
  ctx.save();
  ctx.translate(center, center);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(2, 6, 23, 0.45)';
  ctx.stroke();
  ctx.restore();

  ballCanvasCache.set(color, canvas);
  return canvas;
}

/**
 * Draws national team flags wrapped with spherical perspective curvature
 */
function renderSphericalNationalFlag(
  ctx: CanvasRenderingContext2D,
  r: number,
  team: TeamColorDefinition
): void {
  ctx.save();

  switch (team.id) {
    case 'BRAZIL': {
      // Canary Green Field
      ctx.fillStyle = '#009739';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Spherical Curved Golden Rhombus (Diamond)
      ctx.fillStyle = '#FEDD00';
      ctx.beginPath();
      // Curved vertices following spherical latitude/longitude
      ctx.moveTo(0, -r * 0.72);
      ctx.bezierCurveTo(r * 0.35, -r * 0.45, r * 0.65, -r * 0.2, r * 0.8, 0);
      ctx.bezierCurveTo(r * 0.65, r * 0.2, r * 0.35, r * 0.45, 0, r * 0.72);
      ctx.bezierCurveTo(-r * 0.35, r * 0.45, -r * 0.65, r * 0.2, -r * 0.8, 0);
      ctx.bezierCurveTo(-r * 0.65, -r * 0.2, -r * 0.35, -r * 0.45, 0, -r * 0.72);
      ctx.closePath();
      ctx.fill();

      // Celestial Blue Sphere with 3D spherical shading
      const blueRadius = r * 0.38;
      ctx.fillStyle = '#012169';
      ctx.beginPath();
      ctx.arc(0, 0, blueRadius, 0, Math.PI * 2);
      ctx.fill();

      // White Celestial Equator Band
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(2, r * 0.045);
      ctx.beginPath();
      ctx.arc(0, -blueRadius * 0.2, blueRadius * 0.9, 0.25, Math.PI - 0.25);
      ctx.stroke();

      // Golden Southern Cross Stars
      ctx.fillStyle = '#FFFFFF';
      const stars = [
        [0, -blueRadius * 0.4],
        [-blueRadius * 0.25, blueRadius * 0.15],
        [blueRadius * 0.25, blueRadius * 0.18],
        [0, blueRadius * 0.45],
        [blueRadius * 0.08, blueRadius * 0.22],
      ];
      stars.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'ARGENTINA': {
      // Sky Blue Top Curved Band
      ctx.fillStyle = '#75AADB';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Pure White Central Curved Band (following spherical latitude)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.32);
      ctx.bezierCurveTo(-r * 0.5, -r * 0.26, r * 0.5, -r * 0.26, r, -r * 0.32);
      ctx.lineTo(r, r * 0.32);
      ctx.bezierCurveTo(r * 0.5, r * 0.38, -r * 0.5, r * 0.38, -r, r * 0.32);
      ctx.closePath();
      ctx.fill();

      // Golden 'Sol de Mayo' (Sun of May) with 16 Radiant Rays
      const sunR = r * 0.22;
      ctx.save();
      // Sun Disc
      const sunGrad = ctx.createRadialGradient(0, 0, sunR * 0.2, 0, 0, sunR);
      sunGrad.addColorStop(0, '#FEF08A');
      sunGrad.addColorStop(0.7, '#F6B40E');
      sunGrad.addColorStop(1, '#D97706');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sunR, 0, Math.PI * 2);
      ctx.fill();

      // 16 Curved & Straight Alternating Rays
      ctx.strokeStyle = '#F6B40E';
      ctx.lineWidth = Math.max(1.5, r * 0.035);
      for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 * i) / 16;
        const r1 = sunR * 1.05;
        const r2 = i % 2 === 0 ? sunR * 1.55 : sunR * 1.35;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
        ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'ENGLAND': {
      // Classic White Pearl Match Leather Base
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // St. George's Curved Crimson Cross
      ctx.fillStyle = '#CF081F';
      const armWidth = r * 0.34;

      // Vertical Curved Arm
      ctx.beginPath();
      ctx.moveTo(-armWidth / 2, -r);
      ctx.bezierCurveTo(-armWidth * 0.4, 0, -armWidth * 0.4, 0, -armWidth / 2, r);
      ctx.lineTo(armWidth / 2, r);
      ctx.bezierCurveTo(armWidth * 0.4, 0, armWidth * 0.4, 0, armWidth / 2, -r);
      ctx.closePath();
      ctx.fill();

      // Horizontal Curved Arm
      ctx.beginPath();
      ctx.moveTo(-r, -armWidth / 2);
      ctx.bezierCurveTo(0, -armWidth * 0.4, 0, -armWidth * 0.4, r, -armWidth / 2);
      ctx.lineTo(r, armWidth / 2);
      ctx.bezierCurveTo(0, armWidth * 0.4, 0, armWidth * 0.4, -r, armWidth / 2);
      ctx.closePath();
      ctx.fill();

      // Navy Blue Outline Piping
      ctx.strokeStyle = '#00247D';
      ctx.lineWidth = Math.max(1.5, r * 0.03);
      ctx.strokeRect(-armWidth / 2, -r, armWidth, r * 2);
      ctx.strokeRect(-r, -armWidth / 2, r * 2, armWidth);
      break;
    }

    case 'FRANCE': {
      // French Tricolor: Vertical Curved Bands (Bleu, Blanc, Rouge)
      // Left Blue
      ctx.fillStyle = '#002654';
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI / 2, (Math.PI * 3) / 2);
      ctx.lineTo(0, -r);
      ctx.bezierCurveTo(-r * 0.45, -r * 0.6, -r * 0.45, r * 0.6, 0, r);
      ctx.closePath();
      ctx.fill();

      // Center White
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(-r * 0.45, -r * 0.6, -r * 0.45, r * 0.6, 0, r);
      ctx.lineTo(0, r);
      ctx.bezierCurveTo(r * 0.45, r * 0.6, r * 0.45, -r * 0.6, 0, -r);
      ctx.closePath();
      ctx.fill();

      // Right Red
      ctx.fillStyle = '#ED2939';
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(0, r);
      ctx.bezierCurveTo(r * 0.45, r * 0.6, r * 0.45, -r * 0.6, 0, -r);
      ctx.closePath();
      ctx.fill();

      // Golden French Rooster Silhouette on Center
      drawGallicRoosterSilhouette(ctx, 0, 0, r * 0.28, '#F59E0B');
      break;
    }

    case 'GERMANY': {
      // White Base
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Curved German Flag Ribbon (Black, Red, Gold)
      const bandH = r * 0.24;

      // Top Black Ribbon
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(-r, -bandH * 1.5);
      ctx.bezierCurveTo(-r * 0.4, -bandH * 1.2, r * 0.4, -bandH * 1.2, r, -bandH * 1.5);
      ctx.lineTo(r, -bandH * 0.5);
      ctx.bezierCurveTo(r * 0.4, -bandH * 0.2, -r * 0.4, -bandH * 0.2, -r, -bandH * 0.5);
      ctx.closePath();
      ctx.fill();

      // Middle Red Ribbon
      ctx.fillStyle = '#DD0000';
      ctx.beginPath();
      ctx.moveTo(-r, -bandH * 0.5);
      ctx.bezierCurveTo(-r * 0.4, -bandH * 0.2, r * 0.4, -bandH * 0.2, r, -bandH * 0.5);
      ctx.lineTo(r, bandH * 0.5);
      ctx.bezierCurveTo(r * 0.4, bandH * 0.8, -r * 0.4, bandH * 0.8, -r, bandH * 0.5);
      ctx.closePath();
      ctx.fill();

      // Bottom Gold Ribbon
      ctx.fillStyle = '#FFCE00';
      ctx.beginPath();
      ctx.moveTo(-r, bandH * 0.5);
      ctx.bezierCurveTo(-r * 0.4, bandH * 0.8, r * 0.4, bandH * 0.8, r, bandH * 0.5);
      ctx.lineTo(r, bandH * 1.5);
      ctx.bezierCurveTo(r * 0.4, bandH * 1.8, -r * 0.4, bandH * 1.8, -r, bandH * 1.5);
      ctx.closePath();
      ctx.fill();

      // 4 World Cup Championship Gold Stars
      for (let i = -1.5; i <= 1.5; i++) {
        drawStar(ctx, i * (r * 0.2), -r * 0.62, 5, r * 0.08, r * 0.04, '#FEF08A');
      }
      break;
    }

    case 'SPAIN': {
      // Spanish Crimson Outer Bands
      ctx.fillStyle = '#AA151B';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Central Spanish Gold Curved Band
      ctx.fillStyle = '#F1BF00';
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.44);
      ctx.bezierCurveTo(-r * 0.4, -r * 0.38, r * 0.4, -r * 0.38, r, -r * 0.44);
      ctx.lineTo(r, r * 0.44);
      ctx.bezierCurveTo(r * 0.4, r * 0.5, -r * 0.4, r * 0.5, -r, r * 0.44);
      ctx.closePath();
      ctx.fill();

      // Crowned Spanish Royal Shield Crest
      drawSpanishCrest(ctx, -r * 0.22, 0, r * 0.24);
      break;
    }

    case 'ITALY': {
      // Azzurri Cobalt Blue Base
      ctx.fillStyle = '#004DB3';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Italian Tricolore Curved Diagonal Sash (Green, White, Red)
      const sashW = r * 0.18;
      ctx.save();
      ctx.rotate(-Math.PI / 4);

      // Green
      ctx.fillStyle = '#008C45';
      ctx.fillRect(-r, -sashW * 1.5, r * 2, sashW);

      // White
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-r, -sashW * 0.5, r * 2, sashW);

      // Red
      ctx.fillStyle = '#CD212A';
      ctx.fillRect(-r, sashW * 0.5, r * 2, sashW);
      ctx.restore();

      // 4 Italian World Cup Stars
      for (let i = -1.5; i <= 1.5; i++) {
        drawStar(ctx, i * (r * 0.22), -r * 0.58, 5, r * 0.08, r * 0.04, '#FEF08A');
      }
      break;
    }

    case 'ETHIOPIA': {
      // Ethiopia Green, Yellow, Red Horizontal Curved Tricolor
      // Top Green
      ctx.fillStyle = '#009A44';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Center Yellow
      ctx.fillStyle = '#FED100';
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.32);
      ctx.bezierCurveTo(-r * 0.4, -r * 0.26, r * 0.4, -r * 0.26, r, -r * 0.32);
      ctx.lineTo(r, r * 0.32);
      ctx.bezierCurveTo(r * 0.4, r * 0.38, -r * 0.4, r * 0.38, -r, r * 0.32);
      ctx.closePath();
      ctx.fill();

      // Bottom Red
      ctx.fillStyle = '#EF3340';
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.32);
      ctx.bezierCurveTo(-r * 0.4, r * 0.38, r * 0.4, r * 0.38, r, r * 0.32);
      ctx.arc(0, 0, r, 0.33, Math.PI - 0.33);
      ctx.closePath();
      ctx.fill();

      // National Blue Emblem Disc & Radiant Yellow Star of Solomon
      const emblemR = r * 0.34;
      ctx.fillStyle = '#0F47AF';
      ctx.beginPath();
      ctx.arc(0, 0, emblemR, 0, Math.PI * 2);
      ctx.fill();

      // Radiant 5-Point Star with 5 Rays
      drawStar(ctx, 0, 0, 5, emblemR * 0.72, emblemR * 0.32, '#FED100');
      // Sun Rays emanating from star
      ctx.strokeStyle = '#FED100';
      ctx.lineWidth = Math.max(1.2, r * 0.03);
      for (let i = 0; i < 5; i++) {
        const ang = (Math.PI * 2 * i) / 5 - Math.PI / 2 + Math.PI / 5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (emblemR * 0.32), Math.sin(ang) * (emblemR * 0.32));
        ctx.lineTo(Math.cos(ang) * (emblemR * 0.88), Math.sin(ang) * (emblemR * 0.88));
        ctx.stroke();
      }
      break;
    }

    case 'PORTUGAL': {
      // Portugal Green & Red Vertical Split
      // Left Green (2/5)
      ctx.fillStyle = '#006600';
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI / 2, (Math.PI * 3) / 2);
      ctx.lineTo(0, -r);
      ctx.bezierCurveTo(-r * 0.3, -r * 0.6, -r * 0.3, r * 0.6, 0, r);
      ctx.closePath();
      ctx.fill();

      // Right Red (3/5)
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(0, r);
      ctx.bezierCurveTo(-r * 0.3, r * 0.6, -r * 0.3, -r * 0.6, 0, -r);
      ctx.closePath();
      ctx.fill();

      // Golden Armillary Sphere & Portuguese Shield at boundary
      const armR = r * 0.32;
      ctx.save();
      ctx.translate(-r * 0.1, 0);
      // Armillary Sphere
      ctx.strokeStyle = '#FFCC00';
      ctx.lineWidth = Math.max(2, r * 0.04);
      ctx.beginPath();
      ctx.arc(0, 0, armR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, armR, armR * 0.45, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      // White Heraldic Shield with Blue Quinas
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-armR * 0.45, -armR * 0.5);
      ctx.lineTo(armR * 0.45, -armR * 0.5);
      ctx.lineTo(armR * 0.45, armR * 0.2);
      ctx.bezierCurveTo(armR * 0.45, armR * 0.65, 0, armR * 0.8, 0, armR * 0.8);
      ctx.bezierCurveTo(0, armR * 0.8, -armR * 0.45, armR * 0.65, -armR * 0.45, armR * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#990000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'NETHERLANDS': {
      // Royal Dutch Oranje Base
      ctx.fillStyle = '#F36C21';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Curved Red, White, Blue Dutch National Ribbon
      const bandW = r * 0.16;
      ctx.save();
      ctx.rotate(Math.PI / 6);

      // Red
      ctx.fillStyle = '#AE1C28';
      ctx.fillRect(-r, -bandW * 1.5, r * 2, bandW);

      // White
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-r, -bandW * 0.5, r * 2, bandW);

      // Royal Blue
      ctx.fillStyle = '#21468B';
      ctx.fillRect(-r, bandW * 0.5, r * 2, bandW);
      ctx.restore();

      // Royal Dutch Lion Crest Silhouette
      drawDutchLionSilhouette(ctx, 0, 0, r * 0.28, '#FFFFFF');
      break;
    }

    case 'JAPAN': {
      // Pure White Textured Leather Base
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Samurai Navy Geometric Panel Flairs
      ctx.strokeStyle = '#001E62';
      ctx.lineWidth = Math.max(2, r * 0.045);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0.4, Math.PI * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, Math.PI + 0.4, Math.PI * 1.8);
      ctx.stroke();

      // Hinomaru Crimson Sun Disc with Spherical 3D Volume
      const sunDiscR = r * 0.42;
      const sunGrad = ctx.createRadialGradient(
        -sunDiscR * 0.25,
        -sunDiscR * 0.25,
        sunDiscR * 0.05,
        0,
        0,
        sunDiscR
      );
      sunGrad.addColorStop(0, '#EF4444');
      sunGrad.addColorStop(0.75, '#BC002D');
      sunGrad.addColorStop(1, '#83001F');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sunDiscR, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'SPECIAL_GOLD': {
      // 24K Polished Trophy Gold Surface
      const goldGrad = ctx.createRadialGradient(
        -r * 0.35,
        -r * 0.35,
        r * 0.05,
        0,
        0,
        r
      );
      goldGrad.addColorStop(0, '#FFFBEB');
      goldGrad.addColorStop(0.25, '#FEF08A');
      goldGrad.addColorStop(0.65, '#F59E0B');
      goldGrad.addColorStop(0.85, '#D97706');
      goldGrad.addColorStop(1, '#78350F');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Championship 5-Star Trophy Emblem
      drawStar(ctx, 0, -r * 0.05, 5, r * 0.38, r * 0.18, '#FFFBEB');
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4 Surrounding Satellite Stars
      const satR = r * 0.65;
      for (let i = 0; i < 4; i++) {
        const ang = (Math.PI * 2 * i) / 4 + Math.PI / 4;
        drawStar(ctx, Math.cos(ang) * satR, Math.sin(ang) * satR, 5, r * 0.12, r * 0.06, '#FEF08A');
      }
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws authentic truncated icosahedron football seams with perspective foreshortening
 * and two-tone embossed leather stitching grooves.
 */
function renderSphericalFootballSeams(
  ctx: CanvasRenderingContext2D,
  r: number,
  team: TeamColorDefinition
): void {
  ctx.save();

  // Central Facing Pentagon (Facing the Camera)
  const pSize = r * 0.36;
  const pPoints: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    pPoints.push([Math.cos(angle) * pSize, Math.sin(angle) * (pSize * 0.92)]);
  }

  // 1. Pentagon Panel Seam (Dark Groove + Light Highlight)
  ctx.beginPath();
  ctx.moveTo(pPoints[0][0], pPoints[0][1]);
  for (let i = 1; i < 5; i++) {
    ctx.lineTo(pPoints[i][0], pPoints[i][1]);
  }
  ctx.closePath();

  // Draw Dark Leather Groove
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.lineWidth = Math.max(1.8, r * 0.055);
  ctx.stroke();

  // Draw Soft Leather Highlight on Light-Facing Side
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = Math.max(1.0, r * 0.025);
  ctx.stroke();

  // 2. Seams Radiating Outward to Surrounding Panels (Foreshortening to Edge)
  for (let i = 0; i < 5; i++) {
    const [px, py] = pPoints[i];
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;

    // Curved seam radiating to edge
    const outerX = Math.cos(angle) * (r * 0.95);
    const outerY = Math.sin(angle) * (r * 0.92);

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(outerX, outerY);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.lineWidth = Math.max(1.5, r * 0.045);
    ctx.stroke();

    // Connecting Hexagonal Perimeter Arcs
    const nextIdx = (i + 1) % 5;
    const midAngle = angle + Math.PI / 5;
    const edgeX = Math.cos(midAngle) * (r * 0.97);
    const edgeY = Math.sin(midAngle) * (r * 0.94);

    ctx.beginPath();
    ctx.moveTo(outerX, outerY);
    ctx.lineTo(edgeX, edgeY);
    ctx.lineTo(
      Math.cos(angle + (Math.PI * 2) / 5 - Math.PI / 2) * (r * 0.95),
      Math.sin(angle + (Math.PI * 2) / 5 - Math.PI / 2) * (r * 0.92)
    );
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.lineWidth = Math.max(1.4, r * 0.04);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Helper: Draws a 5-point star
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fillColor: string
): void {
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
  ctx.fillStyle = fillColor;
  ctx.fill();
}

/**
 * Helper: Draws the Gallic Rooster Silhouette for France
 */
function drawGallicRoosterSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.beginPath();
  // Body
  ctx.ellipse(0, size * 0.1, size * 0.35, size * 0.45, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();
  // Head & Comb
  ctx.beginPath();
  ctx.arc(-size * 0.25, -size * 0.35, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Beak
  ctx.beginPath();
  ctx.moveTo(-size * 0.42, -size * 0.35);
  ctx.lineTo(-size * 0.62, -size * 0.3);
  ctx.lineTo(-size * 0.42, -size * 0.25);
  ctx.closePath();
  ctx.fill();
  // Tail Plumes
  ctx.beginPath();
  ctx.moveTo(size * 0.2, -size * 0.1);
  ctx.bezierCurveTo(size * 0.7, -size * 0.6, size * 0.8, size * 0.1, size * 0.3, size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Helper: Draws Spanish Royal Crown & Shield
 */
function drawSpanishCrest(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  // Crown
  ctx.fillStyle = '#AA151B';
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, -size * 0.45);
  ctx.lineTo(size * 0.4, -size * 0.45);
  ctx.lineTo(size * 0.28, -size * 0.15);
  ctx.lineTo(-size * 0.28, -size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Shield
  ctx.fillStyle = '#AA151B';
  ctx.beginPath();
  ctx.moveTo(-size * 0.32, -size * 0.1);
  ctx.lineTo(size * 0.32, -size * 0.1);
  ctx.lineTo(size * 0.32, size * 0.35);
  ctx.bezierCurveTo(size * 0.32, size * 0.65, 0, size * 0.8, 0, size * 0.8);
  ctx.bezierCurveTo(0, size * 0.8, -size * 0.32, size * 0.65, -size * 0.32, size * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/**
 * Helper: Draws Dutch Lion Silhouette
 */
function drawDutchLionSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  // Lion Body & Mane
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Crown
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, -size * 0.45);
  ctx.lineTo(size * 0.25, -size * 0.45);
  ctx.lineTo(0, -size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Main Public API: Renders a Photorealistic 3D National Flag Match Soccer Ball
 *
 * @param ctx Target canvas 2D rendering context
 * @param x Center X
 * @param y Center Y
 * @param radius Desired ball radius in physical pixels
 * @param color Team/Country color id
 * @param rotationAngle Optional rotation angle in radians (for falling / shooting balls)
 * @param isShooterActive Optional flag to indicate the player's active launcher ball
 */
export function renderSoccerBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: SoccerTeamColor,
  rotationAngle: number = 0,
  isShooterActive: boolean = false
): void {
  const ballCanvas = getOrCreateBallCanvas(color);

  ctx.save();
  ctx.translate(x, y);

  // 1. Soft Realistic Contact Shadow underneath the ball
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(
    0,
    radius * 0.94,
    radius * 0.15,
    0,
    radius * 0.94,
    radius * 0.9
  );
  shadowGrad.addColorStop(0, 'rgba(2, 6, 23, 0.45)');
  shadowGrad.addColorStop(0.5, 'rgba(2, 6, 23, 0.18)');
  shadowGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.94, radius * 0.88, radius * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Active Shooter Ball Elevation Glow
  if (isShooterActive) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Rotation Transform
  if (rotationAngle !== 0) {
    ctx.rotate(rotationAngle);
  }

  // 4. Draw Cached 3D Spherical Ball (Ultra-High Quality GPU Blit)
  const drawSize = radius * 2;
  ctx.drawImage(ballCanvas, -radius, -radius, drawSize, drawSize);

  // 5. Special Gold Ball Championship Shimmer
  if (color === 'SPECIAL_GOLD') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius + 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
