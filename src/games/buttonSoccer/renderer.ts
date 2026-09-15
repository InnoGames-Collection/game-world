import { Disc, Ball, PitchDimensions, AimState, Particle, TeamInfo } from './types';
import { drawFlagInsideCircle, TEAMS } from './teams';

/**
 * Draws a real 3D soccer ball with spherical geometry, directional lighting,
 * authentic curved panels, country-specific thematic branding, and specular gloss.
 */
export function draw3DSoccerBall(
  ctx: CanvasRenderingContext2D,
  team: TeamInfo,
  cx: number,
  cy: number,
  r: number,
  rotation: number = 0
) {
  ctx.save();

  // 1. Soft Contact Shadow (On grass surface)
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(
    cx + 2,
    cy + r * 0.7,
    r * 0.1,
    cx + 2,
    cy + r * 0.7,
    r * 1.05
  );
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(cx + 2, cy + r * 0.72, r * 1.05, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Ball Sphere Base (Clipped to circular boundary)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const theme = team.ballTheme || {
    baseColor: '#FFFFFF',
    patternColor1: '#1A1A1A',
    patternColor2: '#2B2B2B',
    seamColor: '#333333',
    patternType: 'classic',
  };

  // Base spherical base color
  ctx.fillStyle = theme.baseColor;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // 3. Curved 3D Panels Based on Country Theme
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const pType = theme.patternType;

  if (pType === 'ethiopia') {
    // Ethiopia 3D Ball: Curved Green, Yellow, and Red aerodynamic panels with Gold Star
    // Top-Left Curved Green Ribbon
    ctx.fillStyle = theme.patternColor1; // #078930
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.3, r * 0.6, r * 0.35, Math.PI * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Bottom-Right Curved Red Ribbon
    ctx.fillStyle = theme.patternColor2; // #DA121A
    ctx.beginPath();
    ctx.ellipse(r * 0.35, r * 0.35, r * 0.65, r * 0.35, Math.PI * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Central Blue Disc with Golden Pentagram Star
    ctx.fillStyle = '#0F47AF';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.starOrEmblemColor || '#FCDD09';
    ctx.beginPath();
    const starR = r * 0.32;
    const innerR = starR * 0.45;
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? starR : innerR;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Yellow accent contour rings
    ctx.strokeStyle = '#FCDD09';
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.43, 0, Math.PI * 2);
    ctx.stroke();
  } else if (pType === 'brazil') {
    // Brazil 3D Ball: Yellow base with Emerald Green & Blue curved swooshes
    // Green curved arcs
    ctx.fillStyle = theme.patternColor1; // Green
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.35, r * 0.65, r * 0.35, Math.PI * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Blue curved arcs
    ctx.fillStyle = theme.patternColor2; // Deep Blue
    ctx.beginPath();
    ctx.ellipse(r * 0.25, r * 0.35, r * 0.6, r * 0.32, -Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Central white stars badge
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#002776';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (pType === 'argentina') {
    // Argentina 3D Ball: Sky Blue curved stripes with Sun of May
    ctx.fillStyle = theme.patternColor1; // Sky blue
    ctx.beginPath();
    ctx.ellipse(-r * 0.45, 0, r * 0.3, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(r * 0.45, 0, r * 0.3, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Sun
    ctx.fillStyle = theme.starOrEmblemColor || '#F6B40E';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.26, 0, Math.PI * 2);
    ctx.fill();

    // Golden rays
    ctx.strokeStyle = '#B7791F';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.26, Math.sin(a) * r * 0.26);
      ctx.lineTo(Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.38);
      ctx.stroke();
    }
  } else if (pType === 'cross') {
    // England St George 3D cross ribbons
    ctx.fillStyle = theme.patternColor1; // Red
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.28, Math.PI * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.28, r * 0.9, Math.PI * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (pType === 'sun') {
    // Japan 3D Hinomaru Ball
    ctx.fillStyle = theme.patternColor1; // Blue swoosh
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.7, r * 0.3, Math.PI * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.patternColor2; // Red Sun
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
  } else if (pType === 'stars') {
    // Morocco 3D Ball
    ctx.fillStyle = theme.patternColor1; // Green
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.35, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pentagram
    ctx.strokeStyle = '#006233';
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    const starR = r * 0.42;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const step = (i * 2) % 5;
      const a = (step * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = Math.cos(a) * starR;
      const py = Math.sin(a) * starR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  } else {
    // Classic / Stripes Tournament 3D Ball
    ctx.fillStyle = theme.patternColor1;
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.3, r * 0.55, r * 0.3, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.patternColor2;
    ctx.beginPath();
    ctx.ellipse(r * 0.35, r * 0.3, r * 0.55, r * 0.3, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();

    if (theme.starOrEmblemColor) {
      ctx.fillStyle = theme.starOrEmblemColor;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Seam Lines (Curved 3D Geodesic football seams)
  ctx.strokeStyle = theme.seamColor;
  ctx.lineWidth = Math.max(1, r * 0.04);

  // Center pentagon patch seams
  const pentaR = r * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(a) * pentaR;
    const py = Math.sin(a) * pentaR;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Seams radiating to outer curved horizon
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(a) * pentaR;
    const py = Math.sin(a) * pentaR;
    const outerX = Math.cos(a) * (r * 0.95);
    const outerY = Math.sin(a) * (r * 0.95);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(outerX, outerY);
    ctx.stroke();
  }

  ctx.restore(); // Undo rotation

  // 4. Photorealistic 3D Spherical Volume Shading
  // Light from top-left (-0.45, -0.45)
  const sphereShading = ctx.createRadialGradient(
    cx - r * 0.35,
    cy - r * 0.4,
    r * 0.05,
    cx,
    cy,
    r
  );
  sphereShading.addColorStop(0, 'rgba(255, 255, 255, 0.45)'); // Specular bloom
  sphereShading.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
  sphereShading.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
  sphereShading.addColorStop(0.92, 'rgba(0, 0, 0, 0.55)');
  sphereShading.addColorStop(1, 'rgba(0, 0, 0, 0.85)'); // Shadow terminator

  ctx.fillStyle = sphereShading;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // 5. Secondary Pitch Grass Ambient Bounce Light (Bottom-right rim)
  const bounceShading = ctx.createRadialGradient(
    cx + r * 0.5,
    cy + r * 0.6,
    r * 0.2,
    cx + r * 0.5,
    cy + r * 0.6,
    r * 0.8
  );
  bounceShading.addColorStop(0, 'rgba(40, 120, 50, 0.18)');
  bounceShading.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bounceShading;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // 6. Crisp Glossy Specular Highlights (Polyurethane soccer ball finish)
  // Primary Specular Dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.32, cy - r * 0.36, r * 0.24, r * 0.16, -Math.PI * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Secondary Micro Glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.38, Math.max(1.5, r * 0.08), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // Undo sphere clip

  // 7. Subtle Ball Horizon Rim
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export class ButtonSoccerRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 400;
  private height: number = 700;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  // ---------------------------------------------------------------------------
  // 1. Render Stadium Background & Football Pitch
  // ---------------------------------------------------------------------------
  public renderPitch(dims: PitchDimensions, timeMs: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1.1 Outer Stadium Environment (Deep Navy/Charcoal with subtle floodlight glows)
    const envGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.2, w * 0.5, h * 0.5, h * 0.8);
    envGrad.addColorStop(0, '#0F1E2E');
    envGrad.addColorStop(0.7, '#071018');
    envGrad.addColorStop(1, '#02060A');
    ctx.fillStyle = envGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle corner floodlights
    const lightColor = 'rgba(180, 220, 255, 0.04)';
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, Math.PI * 2);
    ctx.arc(w, 0, 120, 0, Math.PI * 2);
    ctx.arc(0, h, 120, 0, Math.PI * 2);
    ctx.arc(w, h, 120, 0, Math.PI * 2);
    ctx.fill();

    // 1.2 Pitch Grass Surface with Alternating Vertical Mowing Stripes
    const {
      pitchLeft,
      pitchRight,
      pitchTop,
      pitchBottom,
      centerX,
      centerY,
      centerCircleRadius,
      penaltyAreaWidth,
      penaltyAreaHeight,
      goalAreaWidth,
      goalAreaHeight,
      goalWidth,
      topGoalY,
      bottomGoalY,
    } = dims;

    const pitchWidth = pitchRight - pitchLeft;
    const pitchHeight = pitchBottom - pitchTop;

    ctx.save();
    // Pitch drop shadow on stadium floor
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#1D7A3F';
    ctx.fillRect(pitchLeft, pitchTop, pitchWidth, pitchHeight);
    ctx.restore();

    // Vertical mowing stripes (10 stripes across pitch)
    const stripeCount = 10;
    const stripeW = pitchWidth / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#1D7A3F' : '#238947';
      ctx.fillRect(pitchLeft + i * stripeW, pitchTop, stripeW, pitchHeight);
    }

    // 1.3 Football Pitch White Markings
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer Boundary Touchlines & Goallines
    ctx.strokeRect(pitchLeft, pitchTop, pitchWidth, pitchHeight);

    // Halfway Line
    ctx.beginPath();
    ctx.moveTo(pitchLeft, centerY);
    ctx.lineTo(pitchRight, centerY);
    ctx.stroke();

    // Center Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerCircleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center Spot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Corner Arcs
    const cornerR = 12;
    // Top-Left
    ctx.beginPath();
    ctx.arc(pitchLeft, pitchTop, cornerR, 0, Math.PI * 0.5);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.arc(pitchRight, pitchTop, cornerR, Math.PI * 0.5, Math.PI);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.arc(pitchLeft, pitchBottom, cornerR, Math.PI * 1.5, Math.PI * 2);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.arc(pitchRight, pitchBottom, cornerR, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // 1.4 TOP PENALTY AREA & GOAL AREA
    const penHalfW = penaltyAreaWidth * 0.5;
    const goalHalfW = goalAreaWidth * 0.5;

    // Top Penalty Area Box
    ctx.strokeRect(centerX - penHalfW, pitchTop, penaltyAreaWidth, penaltyAreaHeight);
    // Top Penalty Spot
    ctx.beginPath();
    ctx.arc(centerX, pitchTop + penaltyAreaHeight * 0.72, 3, 0, Math.PI * 2);
    ctx.fill();
    // Top Penalty Arc (D-arc outside box)
    ctx.beginPath();
    ctx.arc(centerX, pitchTop + penaltyAreaHeight * 0.72, centerCircleRadius * 0.7, 0.65, Math.PI - 0.65);
    ctx.stroke();
    // Top Goal Area Box (6-yard box)
    ctx.strokeRect(centerX - goalHalfW, pitchTop, goalAreaWidth, goalAreaHeight);

    // 1.5 BOTTOM PENALTY AREA & GOAL AREA
    // Bottom Penalty Area Box
    ctx.strokeRect(centerX - penHalfW, pitchBottom - penaltyAreaHeight, penaltyAreaWidth, penaltyAreaHeight);
    // Bottom Penalty Spot
    ctx.beginPath();
    ctx.arc(centerX, pitchBottom - penaltyAreaHeight * 0.72, 3, 0, Math.PI * 2);
    ctx.fill();
    // Bottom Penalty Arc
    ctx.beginPath();
    ctx.arc(centerX, pitchBottom - penaltyAreaHeight * 0.72, centerCircleRadius * 0.7, Math.PI + 0.65, Math.PI * 2 - 0.65);
    ctx.stroke();
    // Bottom Goal Area Box
    ctx.strokeRect(centerX - goalHalfW, pitchBottom - goalAreaHeight, goalAreaWidth, goalAreaHeight);

    ctx.restore();

    // 1.6 GOAL NETS AND POSTS
    this.renderGoals(dims);
  }

  // ---------------------------------------------------------------------------
  // 2. Render Goal Mouths, 3D Netting Texture and Posts
  // ---------------------------------------------------------------------------
  private renderGoals(dims: PitchDimensions) {
    const ctx = this.ctx;
    const {
      centerX,
      pitchTop,
      pitchBottom,
      goalWidth,
      topGoalY,
      bottomGoalY,
    } = dims;

    const goalLeftX = centerX - goalWidth * 0.5;
    const goalRightX = centerX + goalWidth * 0.5;

    ctx.save();

    // 2.1 TOP GOAL (Opponent Goal)
    ctx.fillStyle = 'rgba(10, 30, 20, 0.75)';
    ctx.fillRect(goalLeftX, topGoalY, goalWidth, pitchTop - topGoalY);

    // Net mesh grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    const netSpacing = 6;
    for (let x = goalLeftX; x <= goalRightX; x += netSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, topGoalY);
      ctx.lineTo(x, pitchTop);
      ctx.stroke();
    }
    for (let y = topGoalY; y <= pitchTop; y += netSpacing) {
      ctx.beginPath();
      ctx.moveTo(goalLeftX, y);
      ctx.lineTo(goalRightX, y);
      ctx.stroke();
    }

    // Top Goal Posts & Crossbar
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(goalLeftX, topGoalY, goalWidth, pitchTop - topGoalY);

    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(goalLeftX, pitchTop);
    ctx.lineTo(goalLeftX, topGoalY);
    ctx.moveTo(goalRightX, pitchTop);
    ctx.lineTo(goalRightX, topGoalY);
    ctx.stroke();

    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.arc(goalLeftX, pitchTop, 4, 0, Math.PI * 2);
    ctx.arc(goalRightX, pitchTop, 4, 0, Math.PI * 2);
    ctx.fill();

    // 2.2 BOTTOM GOAL (User Goal)
    ctx.fillStyle = 'rgba(10, 30, 20, 0.75)';
    ctx.fillRect(goalLeftX, pitchBottom, goalWidth, bottomGoalY - pitchBottom);

    // Bottom Net mesh grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let x = goalLeftX; x <= goalRightX; x += netSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, pitchBottom);
      ctx.lineTo(x, bottomGoalY);
      ctx.stroke();
    }
    for (let y = pitchBottom; y <= bottomGoalY; y += netSpacing) {
      ctx.beginPath();
      ctx.moveTo(goalLeftX, y);
      ctx.lineTo(goalRightX, y);
      ctx.stroke();
    }

    // Bottom Goal Posts & Crossbar
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(goalLeftX, pitchBottom, goalWidth, bottomGoalY - pitchBottom);

    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(goalLeftX, pitchBottom);
    ctx.lineTo(goalLeftX, bottomGoalY);
    ctx.moveTo(goalRightX, pitchBottom);
    ctx.lineTo(goalRightX, bottomGoalY);
    ctx.stroke();

    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.arc(goalLeftX, pitchBottom, 4, 0, Math.PI * 2);
    ctx.arc(goalRightX, pitchBottom, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 3. Render 3D Soccer Ball With Authentic Country Theming
  // ---------------------------------------------------------------------------
  public renderBall(ball: Ball, userTeam: TeamInfo, opponentTeam: TeamInfo) {
    // Determine active ball theme:
    // User's chosen country controls the ball asset!
    const activeTeam = ball.themeCountryId ? TEAMS[ball.themeCountryId] || userTeam : userTeam;
    const rotation = ball.spin + (ball.rollAngleX || 0) + (ball.rollAngleY || 0);

    draw3DSoccerBall(this.ctx, activeTeam, ball.x, ball.y, ball.radius, rotation);
  }

  // ---------------------------------------------------------------------------
  // 4. Render Player Discs (3D Metallic Rim, National Flag Emblem & Shadows)
  // ---------------------------------------------------------------------------
  public renderDiscs(
    discs: Disc[],
    userTeam: TeamInfo,
    opponentTeam: TeamInfo,
    selectedDiscId: number | null,
    timeMs: number
  ) {
    const ctx = this.ctx;

    for (const disc of discs) {
      const team = disc.team === 'user' ? userTeam : opponentTeam;
      const isSelected = disc.id === selectedDiscId;
      const r = disc.radius;

      // 4.1 Soft Drop Shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(disc.x, disc.y + r * 0.35, r * 1.05, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4.2 Animated Selection Glow / Ring (for active user disc)
      if (isSelected) {
        ctx.save();
        const pulse = Math.sin(timeMs * 0.007) * 2.5;
        // Outer glowing cyan ring
        ctx.strokeStyle = '#00E5FF';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(disc.x, disc.y, r + 5 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner white accent ring for high contrast
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(disc.x, disc.y, r + 2.5, 0, Math.PI * 2);
        ctx.stroke();

        // Subtle indicator chevron above the selected disc pointing down
        ctx.fillStyle = '#00E5FF';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;
        const arrowY = disc.y - r - 10 - pulse;
        ctx.beginPath();
        ctx.moveTo(disc.x, arrowY + 6);
        ctx.lineTo(disc.x - 5, arrowY);
        ctx.lineTo(disc.x + 5, arrowY);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 4.3 Outer 3D Metallic Beveled Rim
      ctx.save();
      const rimGrad = ctx.createLinearGradient(
        disc.x - r,
        disc.y - r,
        disc.x + r,
        disc.y + r
      );
      rimGrad.addColorStop(0, '#FFFFFF');
      rimGrad.addColorStop(0.3, team.secondaryColor);
      rimGrad.addColorStop(0.7, team.primaryColor);
      rimGrad.addColorStop(1, '#1A232A');

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(disc.x, disc.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Subtle rim edge border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4.4 Inner Team Color Collar
      ctx.fillStyle = team.primaryColor;
      ctx.beginPath();
      ctx.arc(disc.x, disc.y, r * 0.82, 0, Math.PI * 2);
      ctx.fill();

      // 4.5 Central Circular National Flag Emblem
      const flagR = r * 0.72;
      drawFlagInsideCircle(ctx, team.flagType, disc.x, disc.y, flagR);

      // 4.6 Goalkeeper Badge Indicator
      if (disc.isGoalkeeper) {
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(disc.x, disc.y - flagR * 0.75, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 4.7 Top Crescent Specular Highlight (3D Button Depth)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(disc.x, disc.y - r * 0.45, r * 0.55, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Render Drag-Back Aiming Line & Power Vector (Signature Control Visual)
  // ---------------------------------------------------------------------------
  public renderAiming(aim: AimState, discs: Disc[], isAI: boolean = false) {
    if (!aim.isAiming || aim.discId === null) return;
    const disc = discs.find((d) => d.id === aim.discId);
    if (!disc) return;

    const ctx = this.ctx;
    const { startX, startY, currentX, currentY, power, angle } = aim;

    let aimDirX: number;
    let aimDirY: number;
    let aimAngle: number;

    if (isAI) {
      // AI aiming: angle is direct forward angle
      aimAngle = angle;
      aimDirX = Math.cos(aimAngle);
      aimDirY = Math.sin(aimAngle);
    } else {
      // User aiming: drag vector = currentPointer - discCenter
      const dragDx = currentX - startX;
      const dragDy = currentY - startY;
      const dragDist = Math.hypot(dragDx, dragDy);
      if (dragDist < 6) return;

      // Aim is opposite of drag (drag back to shoot forward)
      aimDirX = -dragDx / dragDist;
      aimDirY = -dragDy / dragDist;
      aimAngle = Math.atan2(aimDirY, aimDirX);
    }

    ctx.save();

    if (!isAI) {
      // 5.1 Backward Drag Elastic Line (shows user drag connection)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Touch handle finger indicator
      ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(currentX, currentY, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5.2 Forward Aiming Arrow & Trajectory Guide
    const maxLineLen = 130;
    const lineLen = 35 + power * maxLineLen;

    // Color shift based on power:
    // AI: Coral / Red-Amber
    // User: Cyan -> Yellow -> Orange
    let powerColor = '#00E5FF';
    if (isAI) {
      powerColor = power > 0.7 ? '#FF1744' : '#FF9100';
    } else {
      if (power > 0.7) powerColor = '#FF9100';
      else if (power > 0.4) powerColor = '#FFEA00';
    }

    ctx.shadowColor = powerColor;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = powerColor;
    ctx.lineWidth = 3.5;

    // Main Aim Line
    const targetEndX = disc.x + aimDirX * lineLen;
    const targetEndY = disc.y + aimDirY * lineLen;

    ctx.beginPath();
    ctx.moveTo(disc.x + aimDirX * (disc.radius + 2), disc.y + aimDirY * (disc.radius + 2));
    ctx.lineTo(targetEndX, targetEndY);
    ctx.stroke();

    // Pulsing Trajectory Power Dots
    const dotCount = Math.floor(4 + power * 6);
    for (let i = 1; i <= dotCount; i++) {
      const t = i / dotCount;
      const dotX = disc.x + aimDirX * (lineLen * t);
      const dotY = disc.y + aimDirY * (lineLen * t);
      const dotR = 2.5 + t * 2.5;

      ctx.fillStyle = powerColor;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arrowhead at the tip
    const arrowHeadLen = 14;
    const arrowA1 = aimAngle + Math.PI * 0.85;
    const arrowA2 = aimAngle - Math.PI * 0.85;

    ctx.fillStyle = powerColor;
    ctx.beginPath();
    ctx.moveTo(targetEndX, targetEndY);
    ctx.lineTo(
      targetEndX + Math.cos(arrowA1) * arrowHeadLen,
      targetEndY + Math.sin(arrowA1) * arrowHeadLen
    );
    ctx.lineTo(
      targetEndX + Math.cos(arrowA2) * arrowHeadLen,
      targetEndY + Math.sin(arrowA2) * arrowHeadLen
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 6. Render Confetti & Turf Dust Particles
  // ---------------------------------------------------------------------------
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
