/**
 * KNIFE MADNESS - 3D Canvas Rendering Engine
 * Authentic 3D targets, knives, fruits, particles, fracture fragments, and floating telemetry
 * Built to make targets visually POP with 3D depth, cast shadows, and material distinction.
 */

import {
  TargetTheme,
  EmbeddedKnife,
  TargetApple,
  ShatterFragment,
  SlicedApplePart,
  ImpactParticle,
  FloatingFeedback,
  FruitType,
} from './types';

export class KnifeRenderer3D {
  /**
   * Draw authentic dark navy-blue wooden plank environment
   */
  public static drawDarkWoodBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    targetCenterX: number,
    targetCenterY: number
  ) {
    // 1. Deep solid dark navy foundation
    ctx.fillStyle = '#061224';
    ctx.fillRect(0, 0, width, height);

    // 2. Vertical Plank Arrangement (7 planks across width)
    const plankCount = 7;
    const plankWidth = width / plankCount;

    const plankColors = [
      '#091b34',
      '#0c2342',
      '#08172e',
      '#0e274a',
      '#0a1e38',
      '#0d2546',
      '#07162b',
    ];

    for (let i = 0; i < plankCount; i++) {
      const px = i * plankWidth;
      const pw = plankWidth;

      // Base plank wood tone
      ctx.fillStyle = plankColors[i % plankColors.length];
      ctx.fillRect(px, 0, pw, height);

      // Fine vertical wood grain fibers
      ctx.save();
      const grainCount = 6;
      for (let g = 0; g < grainCount; g++) {
        const gx = px + (pw / (grainCount + 1)) * (g + 1);
        const wave = Math.sin(i * 3 + g * 5) * 6;

        ctx.strokeStyle = g % 2 === 0 ? 'rgba(1, 8, 20, 0.4)' : 'rgba(125, 211, 252, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.quadraticCurveTo(gx + wave, height * 0.5, gx - wave * 0.5, height);
        ctx.stroke();
      }

      // Wood knots on alternating planks
      if (i === 1 || i === 4 || i === 6) {
        const knotY = height * 0.22 * (i === 1 ? 1 : i === 4 ? 3.2 : 2.1);
        const knotX = px + pw * 0.52;

        ctx.strokeStyle = 'rgba(2, 8, 22, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(knotX, knotY, 8, 18, 0.1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(knotX, knotY, 4, 10, 0.1, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3D Recessed Seam between planks
      if (i > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(px - 1, 0, 1, height);

        ctx.fillStyle = '#020610';
        ctx.fillRect(px, 0, 2.5, height);
      }

      // Heavy forged iron nails/rivets near top & bottom
      const nailPositions = [82, height - 70];
      nailPositions.forEach((ny) => {
        const nx = px + pw / 2;
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx - 1, ny - 1, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });

      ctx.restore();
    }

    // 3. Soft Radial Spotlight centered behind the Target
    const spotlight = ctx.createRadialGradient(
      targetCenterX,
      targetCenterY,
      20,
      targetCenterX,
      targetCenterY,
      Math.max(width, height) * 0.55
    );
    spotlight.addColorStop(0, 'rgba(14, 65, 125, 0.5)');
    spotlight.addColorStop(0.5, 'rgba(8, 38, 75, 0.25)');
    spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, width, height);

    // 4. Subtle Vignette darkening edges and corners
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.7, 'rgba(2, 6, 14, 0.35)');
    vignette.addColorStop(1, 'rgba(2, 6, 12, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw the 3D rotating target with enhanced depth, cast shadows, and rim lighting
   */
  public static drawTarget(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    rotation: number,
    theme: TargetTheme,
    scale: number = 1
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // 1. Target Deep Directional Cast Shadow (Separates target from background planks)
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 22, radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.filter = 'blur(14px)';
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();

    // 2. Secondary Sharp Ambient Occlusion Ring directly behind target
    ctx.beginPath();
    ctx.arc(0, 10, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(2, 6, 16, 0.8)';
    ctx.fill();

    // 3. 3D Cylindrical Extrusion Base (Side Rim Thickness)
    // Simulates physical thickness of cylinder facing viewer
    const rimGradient = ctx.createLinearGradient(-radius, -radius, radius, radius + 20);
    rimGradient.addColorStop(0, 'rgba(35, 40, 50, 0.98)');
    rimGradient.addColorStop(0.5, 'rgba(20, 24, 32, 0.99)');
    rimGradient.addColorStop(1, 'rgba(5, 7, 12, 1)');
    ctx.beginPath();
    ctx.arc(0, 7, radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = rimGradient;
    ctx.fill();

    // 4. Subtle Specular Rim Light around perimeter to ensure crisp separation
    ctx.beginPath();
    ctx.arc(0, 0, radius + 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 5. Rotate to target's current angle for front face
    ctx.rotate(rotation);

    // Draw theme-specific face
    switch (theme) {
      case 'wood_log':
        this.drawWoodLogTheme(ctx, radius);
        break;
      case 'apple':
        this.drawAppleTheme(ctx, radius);
        break;
      case 'orange':
        this.drawOrangeTheme(ctx, radius);
        break;
      case 'watermelon':
        this.drawWatermelonTheme(ctx, radius);
        break;
      case 'golden_boss':
        this.drawGoldenBossTheme(ctx, radius);
        break;
      case 'green_apple':
        this.drawGreenAppleTheme(ctx, radius);
        break;
      case 'coconut':
        this.drawCoconutTheme(ctx, radius);
        break;
      case 'pumpkin':
        this.drawPumpkinTheme(ctx, radius);
        break;
      case 'kiwi':
        this.drawKiwiTheme(ctx, radius);
        break;
      case 'golden_shield':
        this.drawGoldenShieldTheme(ctx, radius);
        break;
      case 'tire':
        this.drawTireTheme(ctx, radius);
        break;
      case 'cheese':
        this.drawCheeseTheme(ctx, radius);
        break;
      case 'waffle':
        this.drawWaffleTheme(ctx, radius);
        break;
      case 'peach':
        this.drawPeachTheme(ctx, radius);
        break;
      case 'plum':
        this.drawPlumTheme(ctx, radius);
        break;
      case 'dragon_fruit':
        this.drawDragonFruitTheme(ctx, radius);
        break;
      case 'metal_gear':
        this.drawMetalGearTheme(ctx, radius);
        break;
      case 'eight_ball':
        this.drawEightBallTheme(ctx, radius);
        break;
      case 'lifebuoy':
        this.drawLifebuoyTheme(ctx, radius);
        break;
      case 'basketball':
        this.drawBasketballTheme(ctx, radius);
        break;
      case 'stone_disc':
      default:
        this.drawStoneDiscTheme(ctx, radius);
        break;
    }

    // Specular 3D highlight sheen across face (light source from top-left)
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const lightGlow = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, 12, 0, 0, radius);
    lightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
    lightGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
    lightGlow.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = lightGlow;
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // TARGET THEME IMPLEMENTATIONS
  // =========================================================================

  /**
   * Classic Polished Wood Log
   */
  private static drawWoodLogTheme(ctx: CanvasRenderingContext2D, r: number) {
    // 1. Outer Rugged Bark Ring with crevices
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#271206';
    ctx.fill();

    const barkNotches = 24;
    for (let b = 0; b < barkNotches; b++) {
      const ba = (b * Math.PI * 2) / barkNotches;
      ctx.save();
      ctx.rotate(ba);
      ctx.fillStyle = b % 2 === 0 ? '#1b0a02' : '#3e1a06';
      ctx.fillRect(r - 8, -3, 8, 6);
      ctx.restore();
    }

    // 2. Beveled Cambium Rim
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.91, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();

    // 3. Natural Golden Amber Wood Core
    const woodGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, r * 0.86);
    woodGrad.addColorStop(0, '#ffedd5');
    woodGrad.addColorStop(0.35, '#fed7aa');
    woodGrad.addColorStop(0.7, '#fcd34d');
    woodGrad.addColorStop(1, '#b45309');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2);
    ctx.fillStyle = woodGrad;
    ctx.fill();

    // 4. Concentric Organic Tree Growth Rings
    const rings = [0.22, 0.38, 0.54, 0.68, 0.8];
    rings.forEach((ringFrac, rIdx) => {
      ctx.beginPath();
      const ringRad = r * ringFrac;
      const ringPoints = 32;
      for (let p = 0; p <= ringPoints; p++) {
        const theta = (p * Math.PI * 2) / ringPoints;
        const wobble = Math.sin(theta * 4 + rIdx * 2) * 1.5;
        const px = Math.cos(theta) * (ringRad + wobble);
        const py = Math.sin(theta) * (ringRad + wobble);
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = rIdx % 2 === 0 ? 'rgba(146, 64, 14, 0.5)' : 'rgba(120, 53, 15, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });

    // 5. Radial Heartwood Cracks
    const crackAngles = [0.35, 2.1, 4.4];
    crackAngles.forEach((ca) => {
      ctx.save();
      ctx.rotate(ca);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(r * 0.45, 2);
      ctx.lineTo(r * 0.76, -1);
      ctx.stroke();
      ctx.restore();
    });

    // 6. Tree Heart Center Core
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();
  }

  /**
   * Red Apple Target Face
   */
  private static drawAppleTheme(ctx: CanvasRenderingContext2D, r: number) {
    // 1. Apple Deep Red Outer Rim
    const redGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 5, 0, 0, r);
    redGrad.addColorStop(0, '#f87171');
    redGrad.addColorStop(0.35, '#ef4444');
    redGrad.addColorStop(0.75, '#b91c1c');
    redGrad.addColorStop(1, '#7f1d1d');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = redGrad;
    ctx.fill();

    // 2. Beveled Peel Edge
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 202, 202, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Crisp Apple Flesh Core
    const fleshGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 0.82);
    fleshGrad.addColorStop(0, '#ffffff');
    fleshGrad.addColorStop(0.6, '#fef9c3');
    fleshGrad.addColorStop(1, '#fde047');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    ctx.fillStyle = fleshGrad;
    ctx.fill();

    // 4. Five-pointed star apple core
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5;
      const sx = Math.cos(a) * (r * 0.3);
      const sy = Math.sin(a) * (r * 0.3);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 5, 2.5, a + Math.PI / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#451a03';
      ctx.fill();
    }

    // Center star pip
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();
  }

  /**
   * Orange Citrus Target Face
   */
  private static drawOrangeTheme(ctx: CanvasRenderingContext2D, r: number) {
    // 1. Textured Orange Rind
    const peelGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r);
    peelGrad.addColorStop(0, '#fb923c');
    peelGrad.addColorStop(0.7, '#ea580c');
    peelGrad.addColorStop(1, '#9a3412');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = peelGrad;
    ctx.fill();

    // 2. White Pith Ring
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = '#fffbeb';
    ctx.fill();

    // 3. 8 Citrus Pulp Segments
    const segments = 8;
    const segRadius = r * 0.82;
    for (let i = 0; i < segments; i++) {
      const a1 = (i * 2 * Math.PI) / segments + 0.08;
      const a2 = ((i + 1) * 2 * Math.PI) / segments - 0.08;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, segRadius, a1, a2);
      ctx.closePath();

      const segGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, segRadius);
      segGrad.addColorStop(0, '#f97316');
      segGrad.addColorStop(0.7, '#ea580c');
      segGrad.addColorStop(1, '#c2410c');
      ctx.fillStyle = segGrad;
      ctx.fill();

      // Pulp vesicles lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      const midAngle = (a1 + a2) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(midAngle) * 8, Math.sin(midAngle) * 8);
      ctx.lineTo(Math.cos(midAngle) * (segRadius - 4), Math.sin(midAngle) * (segRadius - 4));
      ctx.stroke();
    }

    // 4. White Center Column
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#fffbeb';
    ctx.fill();
  }

  /**
   * Striped Watermelon Target Face
   */
  private static drawWatermelonTheme(ctx: CanvasRenderingContext2D, r: number) {
    // 1. Dark Green Striped Rind
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#14532d';
    ctx.fill();

    const stripes = 16;
    for (let s = 0; s < stripes; s++) {
      if (s % 2 === 0) {
        ctx.save();
        ctx.rotate((s * Math.PI * 2) / stripes);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(0, 0, r, -0.1, 0.1);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. White / Pale Jade Pith Band
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = '#f0fdf4';
    ctx.fill();

    // 3. Rich Crimson Watermelon Pulp Core
    const pulpGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r * 0.82);
    pulpGrad.addColorStop(0, '#fb7185');
    pulpGrad.addColorStop(0.5, '#f43f5e');
    pulpGrad.addColorStop(1, '#e11d48');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    ctx.fillStyle = pulpGrad;
    ctx.fill();

    // 4. Watermelon Black Seeds in ring
    const seedCount = 10;
    for (let i = 0; i < seedCount; i++) {
      const sa = (i * 2 * Math.PI) / seedCount;
      const sx = Math.cos(sa) * (r * 0.52);
      const sy = Math.sin(sa) * (r * 0.52);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 4.5, 2.2, sa + Math.PI / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    }
  }

  /**
   * Golden Boss Medallion / Target Face
   */
  private static drawGoldenBossTheme(ctx: CanvasRenderingContext2D, r: number) {
    // 1. Royal Burnished Gold Rim with Crown Points
    const goldGrad = ctx.createLinearGradient(-r, -r, r, r);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.3, '#eab308');
    goldGrad.addColorStop(0.7, '#ca8a04');
    goldGrad.addColorStop(1, '#78350f');

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = goldGrad;
    ctx.fill();

    // 2. Crown Filigree Crest Rim Studs
    const studs = 12;
    for (let i = 0; i < studs; i++) {
      const a = (i * 2 * Math.PI) / studs;
      const sx = Math.cos(a) * (r * 0.9);
      const sy = Math.sin(a) * (r * 0.9);
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // 3. Sunburst Rays
    ctx.save();
    for (let ray = 0; ray < 16; ray++) {
      ctx.rotate(Math.PI / 8);
      ctx.fillStyle = ray % 2 === 0 ? 'rgba(254, 240, 138, 0.25)' : 'rgba(202, 138, 4, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, r * 0.75);
      ctx.lineTo(6, r * 0.75);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 4. Inner Royal Medallion
    const innerGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r * 0.6);
    innerGrad.addColorStop(0, '#fde047');
    innerGrad.addColorStop(0.8, '#b45309');
    innerGrad.addColorStop(1, '#78350f');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // 5. Boss Ruby Center Jewel
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-2, -2, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  /**
   * Crisp Green Apple / Lime Face
   */
  private static drawGreenAppleTheme(ctx: CanvasRenderingContext2D, r: number) {
    const limeGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 5, 0, 0, r);
    limeGrad.addColorStop(0, '#a3e635');
    limeGrad.addColorStop(0.6, '#65a30d');
    limeGrad.addColorStop(1, '#365314');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = limeGrad;
    ctx.fill();

    // Inner crisp pulp
    const fleshGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r * 0.82);
    fleshGrad.addColorStop(0, '#f7fee7');
    fleshGrad.addColorStop(0.7, '#d9f99d');
    fleshGrad.addColorStop(1, '#bef264');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    ctx.fillStyle = fleshGrad;
    ctx.fill();

    // Subtle star core
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5;
      const sx = Math.cos(a) * (r * 0.28);
      const sy = Math.sin(a) * (r * 0.28);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 4, 2, a + Math.PI / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#365314';
      ctx.fill();
    }
  }

  /**
   * Coconut Target Face
   */
  private static drawCoconutTheme(ctx: CanvasRenderingContext2D, r: number) {
    // Fibrous brown husk
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#451a03';
    ctx.fill();

    // Coconut husk fibers
    const fibers = 30;
    for (let f = 0; f < fibers; f++) {
      const fa = (f * Math.PI * 2) / fibers;
      ctx.save();
      ctx.rotate(fa);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(r - 10, 0);
      ctx.lineTo(r, (f % 2 === 0 ? 2 : -2));
      ctx.stroke();
      ctx.restore();
    }

    // Hard dark shell
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = '#271206';
    ctx.fill();

    // Pure white coconut meat core
    const meatGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 0.8);
    meatGrad.addColorStop(0, '#ffffff');
    meatGrad.addColorStop(0.8, '#f8fafc');
    meatGrad.addColorStop(1, '#e2e8f0');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = meatGrad;
    ctx.fill();

    // Coconut water hollow center
    const waterGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 0.35);
    waterGrad.addColorStop(0, '#e0f2fe');
    waterGrad.addColorStop(1, '#bae6fd');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = waterGrad;
    ctx.fill();
  }

  /**
   * Autumn Pumpkin Target Face
   */
  private static drawPumpkinTheme(ctx: CanvasRenderingContext2D, r: number) {
    // Outer pumpkin rind
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#c2410c';
    ctx.fill();

    // 8 Ribbed Pumpkin Segments
    const ribs = 8;
    for (let i = 0; i < ribs; i++) {
      const a = (i * 2 * Math.PI) / ribs;
      ctx.save();
      ctx.rotate(a);
      const ribGrad = ctx.createLinearGradient(0, -r * 0.4, 0, r * 0.4);
      ribGrad.addColorStop(0, '#f97316');
      ribGrad.addColorStop(0.5, '#ea580c');
      ribGrad.addColorStop(1, '#9a3412');

      ctx.beginPath();
      ctx.ellipse(r * 0.5, 0, r * 0.45, r * 0.16, 0, 0, Math.PI * 2);
      ctx.fillStyle = ribGrad;
      ctx.fill();
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Pumpkin stem in center
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#15803d';
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * Kiwi Target Face
   */
  private static drawKiwiTheme(ctx: CanvasRenderingContext2D, r: number) {
    // Fuzzy brown kiwi rind
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();

    // Vivid emerald green pulp
    const kiwiGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r * 0.88);
    kiwiGrad.addColorStop(0, '#fef08a');
    kiwiGrad.addColorStop(0.4, '#84cc16');
    kiwiGrad.addColorStop(0.85, '#65a30d');
    kiwiGrad.addColorStop(1, '#4d7c0f');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = kiwiGrad;
    ctx.fill();

    // Radiating pale green sunburst lines
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 1.2;
    const rays = 18;
    for (let i = 0; i < rays; i++) {
      const a = (i * 2 * Math.PI) / rays;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r * 0.2), Math.sin(a) * (r * 0.2));
      ctx.lineTo(Math.cos(a) * (r * 0.72), Math.sin(a) * (r * 0.72));
      ctx.stroke();
    }

    // Ring of black kiwi seeds
    for (let s = 0; s < 18; s++) {
      const sa = (s * 2 * Math.PI) / 18 + 0.1;
      const sx = Math.cos(sa) * (r * 0.46);
      const sy = Math.sin(sa) * (r * 0.46);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 2.5, 1.2, sa + Math.PI / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    }

    // Pale cream center
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.22, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fef9c3';
    ctx.fill();
  }

  /**
   * Peach Target Face
   */
  private static drawPeachTheme(ctx: CanvasRenderingContext2D, r: number) {
    const peachGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, 6, 0, 0, r);
    peachGrad.addColorStop(0, '#fed7aa');
    peachGrad.addColorStop(0.5, '#fb923c');
    peachGrad.addColorStop(0.85, '#f43f5e');
    peachGrad.addColorStop(1, '#be123c');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = peachGrad;
    ctx.fill();

    // Natural peach groove cleft
    ctx.strokeStyle = '#9f1239';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.quadraticCurveTo(r * 0.1, 0, 0, r * 0.85);
    ctx.stroke();

    // Pit core
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.24, r * 0.16, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = '#881337';
    ctx.fill();
  }

  /**
   * Plum Target Face
   */
  private static drawPlumTheme(ctx: CanvasRenderingContext2D, r: number) {
    const plumGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, 6, 0, 0, r);
    plumGrad.addColorStop(0, '#c084fc');
    plumGrad.addColorStop(0.6, '#7e22ce');
    plumGrad.addColorStop(1, '#3b0764');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = plumGrad;
    ctx.fill();

    // Gold inner flesh hint
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Seed
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.22, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#581c87';
    ctx.fill();
  }

  /**
   * Dragon Fruit Target Face
   */
  private static drawDragonFruitTheme(ctx: CanvasRenderingContext2D, r: number) {
    // Magenta scales outer rind
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#be185d';
    ctx.fill();

    // Green rind tip scales
    const scales = 10;
    for (let sc = 0; sc < scales; sc++) {
      const sa = (sc * 2 * Math.PI) / scales;
      ctx.save();
      ctx.rotate(sa);
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(r - 4, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Pure white pulp core
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2);
    ctx.fillStyle = '#fdf4ff';
    ctx.fill();

    // Black poppy seeds scattered
    for (let p = 0; p < 24; p++) {
      const pa = (p * 137.5 * Math.PI) / 180;
      const dist = Math.sqrt((p + 1) / 25) * (r * 0.72);
      ctx.beginPath();
      ctx.arc(Math.cos(pa) * dist, Math.sin(pa) * dist, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
    }
  }

  /**
   * Armored Tire Theme
   */
  private static drawTireTheme(ctx: CanvasRenderingContext2D, r: number) {
    const rubberGrad = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r);
    rubberGrad.addColorStop(0, '#3a3d42');
    rubberGrad.addColorStop(0.7, '#24272c');
    rubberGrad.addColorStop(1, '#15171a');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = rubberGrad;
    ctx.fill();

    // Tread notches on outer rim
    const treads = 16;
    for (let i = 0; i < treads; i++) {
      const a = (i * Math.PI * 2) / treads;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = '#111315';
      ctx.fillRect(r - 10, -4, 10, 8);
      ctx.restore();
    }

    // Alloy silver rim
    const rimGrad = ctx.createLinearGradient(-r * 0.55, -r * 0.55, r * 0.55, r * 0.55);
    rimGrad.addColorStop(0, '#e2e8f0');
    rimGrad.addColorStop(0.5, '#94a3b8');
    rimGrad.addColorStop(1, '#475569');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Center hub & lug nuts
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.26, 0, Math.PI * 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();

    const lugs = 6;
    for (let i = 0; i < lugs; i++) {
      const la = (i * Math.PI * 2) / lugs;
      const lx = Math.cos(la) * (r * 0.38);
      const ly = Math.sin(la) * (r * 0.38);
      ctx.beginPath();
      ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx - 1, ly - 1, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  /**
   * Swiss Cheese Theme
   */
  private static drawCheeseTheme(ctx: CanvasRenderingContext2D, r: number) {
    const cheeseGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    cheeseGrad.addColorStop(0, '#fed7aa');
    cheeseGrad.addColorStop(0.7, '#f59e0b');
    cheeseGrad.addColorStop(1, '#d97706');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = cheeseGrad;
    ctx.fill();

    // Cheese holes
    const holes = [
      { x: -r * 0.45, y: -r * 0.2, rad: 14 },
      { x: r * 0.35, y: -r * 0.4, rad: 18 },
      { x: r * 0.2, y: r * 0.45, rad: 12 },
      { x: -r * 0.25, y: r * 0.35, rad: 16 },
      { x: 0, y: -r * 0.55, rad: 10 },
      { x: r * 0.5, y: r * 0.1, rad: 11 },
    ];
    holes.forEach((h) => {
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.rad, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(h.x + 1.5, h.y + 1.5, h.rad * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#92400e';
      ctx.fill();
    });
  }

  /**
   * Golden Waffle Theme
   */
  private static drawWaffleTheme(ctx: CanvasRenderingContext2D, r: number) {
    const waffleGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    waffleGrad.addColorStop(0, '#fef08a');
    waffleGrad.addColorStop(0.6, '#eab308');
    waffleGrad.addColorStop(1, '#ca8a04');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = waffleGrad;
    ctx.fill();

    ctx.fillStyle = '#a16207';
    const gridCount = 5;
    const step = (r * 1.5) / gridCount;
    for (let x = -gridCount / 2; x < gridCount / 2; x++) {
      for (let y = -gridCount / 2; y < gridCount / 2; y++) {
        const gx = x * step + 4;
        const gy = y * step + 4;
        if (Math.hypot(gx, gy) < r * 0.72) {
          ctx.beginPath();
          ctx.roundRect(gx, gy, step - 8, step - 8, 4);
          ctx.fill();
        }
      }
    }

    // Melting butter pat
    ctx.beginPath();
    ctx.roundRect(-16, -16, 32, 32, 6);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();
  }

  /**
   * Golden Shield Theme
   */
  private static drawGoldenShieldTheme(ctx: CanvasRenderingContext2D, r: number) {
    const shieldGrad = ctx.createLinearGradient(-r, -r, r, r);
    shieldGrad.addColorStop(0, '#fef08a');
    shieldGrad.addColorStop(0.3, '#f59e0b');
    shieldGrad.addColorStop(0.7, '#d97706');
    shieldGrad.addColorStop(1, '#78350f');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = shieldGrad;
    ctx.fill();

    // Rivet studs
    const rivets = 16;
    for (let i = 0; i < rivets; i++) {
      const a = (i * Math.PI * 2) / rivets;
      const rx = Math.cos(a) * (r * 0.88);
      const ry = Math.sin(a) * (r * 0.88);
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Center Lion Crest
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();
  }

  /**
   * Eight Ball Theme
   */
  private static drawEightBallTheme(ctx: CanvasRenderingContext2D, r: number) {
    const ballGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 10, 0, 0, r);
    ballGrad.addColorStop(0, '#334155');
    ballGrad.addColorStop(0.5, '#0f172a');
    ballGrad.addColorStop(1, '#020617');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = ballGrad;
    ctx.fill();

    // Center white circle
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.44, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // '8' Text
    ctx.font = `bold ${Math.round(r * 0.55)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('8', 0, 2);
  }

  /**
   * Metal Gear / Cog Theme
   */
  private static drawMetalGearTheme(ctx: CanvasRenderingContext2D, r: number) {
    const teeth = 10;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a1 = (i * 2 * Math.PI) / teeth;
      const a2 = a1 + (Math.PI / teeth) * 0.45;
      const a3 = a1 + (Math.PI / teeth) * 0.75;
      const a4 = ((i + 1) * 2 * Math.PI) / teeth;
      const rOuter = r;
      const rInner = r * 0.82;

      const x1 = Math.cos(a1) * rInner;
      const y1 = Math.sin(a1) * rInner;
      const x2 = Math.cos(a2) * rOuter;
      const y2 = Math.sin(a2) * rOuter;
      const x3 = Math.cos(a3) * rOuter;
      const y3 = Math.sin(a3) * rOuter;
      const x4 = Math.cos(a4) * rInner;
      const y4 = Math.sin(a4) * rInner;

      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
    }
    ctx.closePath();
    const gearGrad = ctx.createLinearGradient(-r, -r, r, r);
    gearGrad.addColorStop(0, '#e2e8f0');
    gearGrad.addColorStop(0.5, '#64748b');
    gearGrad.addColorStop(1, '#334155');
    ctx.fillStyle = gearGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Recessed center plate
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
  }

  /**
   * Lifebuoy Theme
   */
  private static drawLifebuoyTheme(ctx: CanvasRenderingContext2D, r: number) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    // 4 White quadrant wraps
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r * 0.18, -r, r * 0.36, r * 0.4);
      ctx.restore();
    }

    // Center donut hole
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#091b34';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();
  }

  /**
   * Basketball Theme
   */
  private static drawBasketballTheme(ctx: CanvasRenderingContext2D, r: number) {
    const ballGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 10, 0, 0, r);
    ballGrad.addColorStop(0, '#fb923c');
    ballGrad.addColorStop(0.7, '#ea580c');
    ballGrad.addColorStop(1, '#9a3412');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = ballGrad;
    ctx.fill();

    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-r * 0.7, 0, r * 0.75, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.7, 0, r * 0.75, (2 * Math.PI) / 3, (4 * Math.PI) / 3);
    ctx.stroke();
  }

  /**
   * Ancient Stone Rune Disc
   */
  private static drawStoneDiscTheme(ctx: CanvasRenderingContext2D, r: number) {
    const stoneGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, r);
    stoneGrad.addColorStop(0, '#94a3b8');
    stoneGrad.addColorStop(0.7, '#64748b');
    stoneGrad.addColorStop(1, '#334155');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = stoneGrad;
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Rune markings
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-2, r * 0.45, 4, 12);
      ctx.restore();
    }
  }

  // =========================================================================
  // KNIVES & WEAPONS RENDERING
  // =========================================================================

  /**
   * Draw the authentic player throw knife with metallic bevels, crossguard & grip
   */
  public static drawKnife(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number = 1,
    rotation: number = 0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // 1. Blade Drop Shadow
    ctx.beginPath();
    ctx.moveTo(3, 4);
    ctx.lineTo(-7, 60);
    ctx.lineTo(9, 60);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Dual-Tone 3D Beveled Metallic Blade
    // Left bevel (light source side)
    const bladeLeft = ctx.createLinearGradient(-8, 0, 0, 60);
    bladeLeft.addColorStop(0, '#ffffff');
    bladeLeft.addColorStop(0.3, '#f1f5f9');
    bladeLeft.addColorStop(0.7, '#cbd5e1');
    bladeLeft.addColorStop(1, '#94a3b8');

    ctx.beginPath();
    ctx.moveTo(0, 0); // Blade Tip
    ctx.lineTo(-7.5, 58);
    ctx.lineTo(0, 58); // Center spine
    ctx.closePath();
    ctx.fillStyle = bladeLeft;
    ctx.fill();

    // Right bevel (shadow side)
    const bladeRight = ctx.createLinearGradient(0, 0, 8, 60);
    bladeRight.addColorStop(0, '#e2e8f0');
    bladeRight.addColorStop(0.5, '#64748b');
    bladeRight.addColorStop(1, '#475569');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7.5, 58);
    ctx.lineTo(0, 58);
    ctx.closePath();
    ctx.fillStyle = bladeRight;
    ctx.fill();

    // Center blade edge highlight
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(0, 56);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 3. Crossguard
    const hiltGrad = ctx.createLinearGradient(-13, 58, 13, 62);
    hiltGrad.addColorStop(0, '#d97706');
    hiltGrad.addColorStop(0.5, '#fde68a');
    hiltGrad.addColorStop(1, '#b45309');
    ctx.beginPath();
    ctx.roundRect(-12, 58, 24, 6, 2.5);
    ctx.fillStyle = hiltGrad;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#78350f';
    ctx.stroke();

    // 4. Textured Grip Handle
    const handleGrad = ctx.createLinearGradient(-5, 64, 5, 64);
    handleGrad.addColorStop(0, '#1e293b');
    handleGrad.addColorStop(0.5, '#334155');
    handleGrad.addColorStop(1, '#0f172a');
    ctx.beginPath();
    ctx.roundRect(-5.5, 64, 11, 38, 2);
    ctx.fillStyle = handleGrad;
    ctx.fill();

    // Golden handle wrap bands
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    for (let band = 70; band < 100; band += 7) {
      ctx.beginPath();
      ctx.moveTo(-5.5, band);
      ctx.lineTo(5.5, band + 2);
      ctx.stroke();
    }

    // 5. Crown Pommel
    const pommelGrad = ctx.createRadialGradient(0, 103, 1, 0, 103, 6);
    pommelGrad.addColorStop(0, '#fef08a');
    pommelGrad.addColorStop(0.7, '#d97706');
    pommelGrad.addColorStop(1, '#78350f');
    ctx.beginPath();
    ctx.arc(0, 104, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = pommelGrad;
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw Embedded Knives & Obstacles attached to rotating target
   */
  public static drawEmbeddedKnives(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    targetRadius: number,
    rotation: number,
    knives: EmbeddedKnife[],
    scale: number = 1
  ) {
    knives.forEach((k) => {
      const worldAngle = k.angle + rotation;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(worldAngle);
      ctx.scale(scale, scale);

      // Embedded depth: knife tip enters 14px into target perimeter
      const embedY = targetRadius - 14;

      if (k.type === 'bone') {
        this.drawBoneObstacle(ctx, embedY);
      } else if (k.type === 'dagger') {
        this.drawDaggerObstacle(ctx, embedY);
      } else if (k.type === 'pin') {
        this.drawPinObstacle(ctx, embedY);
      } else {
        // Standard embedded knife: tip at embedY, handle extending outward
        ctx.translate(0, embedY);
        this.drawKnife(ctx, 0, 0, 0.9, 0);
      }

      ctx.restore();
    });
  }

  private static drawBoneObstacle(ctx: CanvasRenderingContext2D, embedY: number) {
    ctx.save();
    ctx.translate(0, embedY);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 48, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-5, 48, 5, 0, Math.PI * 2);
    ctx.arc(5, 48, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.restore();
  }

  private static drawDaggerObstacle(ctx: CanvasRenderingContext2D, embedY: number) {
    ctx.save();
    ctx.translate(0, embedY);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, 38);
    ctx.lineTo(6, 38);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-9, 38, 18, 5);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-4, 43, 8, 22);
    ctx.restore();
  }

  private static drawPinObstacle(ctx: CanvasRenderingContext2D, embedY: number) {
    ctx.save();
    ctx.translate(0, embedY);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-2, 0, 4, 40);
    ctx.beginPath();
    ctx.arc(0, 44, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // FRUITS & APPLES RENDERING
  // =========================================================================

  /**
   * Draw target apples and all fruit variations
   */
  public static drawTargetApples(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    targetRadius: number,
    rotation: number,
    apples: TargetApple[],
    scale: number = 1
  ) {
    apples.forEach((apple) => {
      if (apple.sliced) return; // sliced fruits rendered in sliced layer

      const worldAngle = apple.angle + rotation;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(worldAngle);
      ctx.scale(scale, scale);

      ctx.translate(0, targetRadius - 4);

      // 1. Fruit Shadow onto target rim
      ctx.beginPath();
      ctx.ellipse(0, 6, 12, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();

      // Render fruit type
      const fruitType: FruitType = apple.type || 'apple';
      this.drawFruitGraphic(ctx, fruitType);

      ctx.restore();
    });
  }

  /**
   * Draw single fruit graphic
   */
  public static drawFruitGraphic(ctx: CanvasRenderingContext2D, type: FruitType) {
    switch (type) {
      case 'orange': {
        const orangeGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14);
        orangeGrad.addColorStop(0, '#fdba74');
        orangeGrad.addColorStop(0.6, '#f97316');
        orangeGrad.addColorStop(1, '#c2410c');
        ctx.beginPath();
        ctx.arc(0, 2, 11, 0, Math.PI * 2);
        ctx.fillStyle = orangeGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-3, -3, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(2, -13);
        ctx.stroke();

        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(4, -12, 4.5, 2.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'lemon': {
        const lemonGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14);
        lemonGrad.addColorStop(0, '#fef08a');
        lemonGrad.addColorStop(0.6, '#eab308');
        lemonGrad.addColorStop(1, '#a16207');
        ctx.beginPath();
        ctx.ellipse(0, 2, 12, 9, Math.PI / 6, 0, Math.PI * 2);
        ctx.fillStyle = lemonGrad;
        ctx.fill();

        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(3, -9, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'watermelon': {
        // Mini watermelon slice
        ctx.beginPath();
        ctx.arc(0, 4, 13, 0, Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#15803d';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 4, 11, 0, Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#f87171';
        ctx.fill();

        // Seeds
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-3, 6, 1.5, 2);
        ctx.fillRect(2, 6, 1.5, 2);
        break;
      }

      case 'kiwi': {
        // Kiwi half
        ctx.beginPath();
        ctx.arc(0, 2, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 2, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#84cc16';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();
        break;
      }

      case 'strawberry': {
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.quadraticCurveTo(-10, 2, -7, -2);
        ctx.quadraticCurveTo(0, -6, 7, -2);
        ctx.quadraticCurveTo(10, 2, 0, 14);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        // Leaves
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'peach': {
        ctx.beginPath();
        ctx.arc(0, 2, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#fb923c';
        ctx.fill();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(3, 2, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'coconut': {
        ctx.beginPath();
        ctx.arc(0, 2, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 2, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        break;
      }

      case 'apple':
      default: {
        const appleGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14);
        appleGrad.addColorStop(0, '#f87171');
        appleGrad.addColorStop(0.6, '#dc2626');
        appleGrad.addColorStop(1, '#991b1b');

        ctx.beginPath();
        ctx.arc(-5, 0, 8.5, 0, Math.PI * 2);
        ctx.arc(5, 0, 8.5, 0, Math.PI * 2);
        ctx.arc(0, 5, 9.5, 0, Math.PI * 2);
        ctx.fillStyle = appleGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-4, -4, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.quadraticCurveTo(2, -12, 4, -14);
        ctx.stroke();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(5, -11, 4.5, 2.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }

  /**
   * Draw shatter fragments on level completion
   */
  public static drawShatterFragments(
    ctx: CanvasRenderingContext2D,
    fragments: ShatterFragment[]
  ) {
    fragments.forEach((frag) => {
      ctx.save();
      ctx.translate(frag.x, frag.y);
      ctx.rotate(frag.rotation);
      ctx.globalAlpha = frag.opacity;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, frag.radius, frag.startAngle, frag.endAngle);
      ctx.closePath();

      ctx.fillStyle = '#64748b';
      if (frag.theme === 'tire') ctx.fillStyle = '#334155';
      if (frag.theme === 'cheese') ctx.fillStyle = '#f59e0b';
      if (frag.theme === 'wood_log') ctx.fillStyle = '#b45309';
      if (frag.theme === 'apple') ctx.fillStyle = '#dc2626';
      if (frag.theme === 'orange') ctx.fillStyle = '#ea580c';
      if (frag.theme === 'watermelon') ctx.fillStyle = '#e11d48';
      if (frag.theme === 'golden_boss') ctx.fillStyle = '#eab308';
      if (frag.theme === 'green_apple') ctx.fillStyle = '#65a30d';
      if (frag.theme === 'coconut') ctx.fillStyle = '#78350f';
      if (frag.theme === 'pumpkin') ctx.fillStyle = '#c2410c';
      if (frag.theme === 'kiwi') ctx.fillStyle = '#84cc16';
      if (frag.theme === 'waffle') ctx.fillStyle = '#d97706';
      if (frag.theme === 'golden_shield') ctx.fillStyle = '#f59e0b';
      if (frag.theme === 'metal_gear') ctx.fillStyle = '#94a3b8';

      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.stroke();

      ctx.restore();
    });
  }

  /**
   * Draw sliced fruit halves
   */
  public static drawSlicedApples(
    ctx: CanvasRenderingContext2D,
    apples: SlicedApplePart[]
  ) {
    apples.forEach((part) => {
      ctx.save();
      ctx.translate(part.x, part.y);
      ctx.rotate(part.rotation);
      ctx.globalAlpha = part.opacity;

      const isOrange = part.type === 'orange';
      const isLemon = part.type === 'lemon';

      ctx.beginPath();
      if (part.side === 'left') {
        ctx.arc(0, 0, 12, Math.PI * 0.5, Math.PI * 1.5);
      } else {
        ctx.arc(0, 0, 12, Math.PI * 1.5, Math.PI * 0.5);
      }
      ctx.closePath();
      ctx.fillStyle = isOrange ? '#ea580c' : isLemon ? '#ca8a04' : '#dc2626';
      ctx.fill();

      // White pith
      ctx.beginPath();
      if (part.side === 'left') {
        ctx.arc(0, 0, 10, Math.PI * 0.5, Math.PI * 1.5);
      } else {
        ctx.arc(0, 0, 10, Math.PI * 1.5, Math.PI * 0.5);
      }
      ctx.closePath();
      ctx.fillStyle = '#fef08a';
      ctx.fill();

      // Inner pulp
      ctx.beginPath();
      if (part.side === 'left') {
        ctx.arc(0, 0, 8, Math.PI * 0.5, Math.PI * 1.5);
      } else {
        ctx.arc(0, 0, 8, Math.PI * 1.5, Math.PI * 0.5);
      }
      ctx.closePath();
      ctx.fillStyle = isOrange ? '#f97316' : isLemon ? '#eab308' : '#fef9c3';
      ctx.fill();

      ctx.restore();
    });
  }

  /**
   * Draw impact particles
   */
  public static drawParticles(
    ctx: CanvasRenderingContext2D,
    particles: ImpactParticle[]
  ) {
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * Draw floating score & precision feedback indicators
   */
  public static drawFloatingFeedback(
    ctx: CanvasRenderingContext2D,
    feedbacks: FloatingFeedback[]
  ) {
    feedbacks.forEach((fb) => {
      ctx.save();
      ctx.globalAlpha = fb.opacity;
      ctx.translate(fb.x, fb.y);
      ctx.scale(fb.scale, fb.scale);

      ctx.font = '900 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.strokeText(fb.text, 0, 0);

      // Fill
      ctx.fillStyle = fb.color;
      ctx.fillText(fb.text, 0, 0);

      ctx.restore();
    });
  }
}
