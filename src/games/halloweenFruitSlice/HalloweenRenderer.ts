import { 
  FlyingObject, 
  SlicedHalf, 
  SplatterDecal, 
  Particle, 
  FloatingText, 
  SlashPoint,
  FruitKind 
} from './types';

export class HalloweenRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  // ---------------------------------------------------------------------------
  // 1. Haunted Dungeon & Teal Atmospheric Background
  // ---------------------------------------------------------------------------
  public renderBackground(timeMs: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Deep haunted teal-to-dark-blue gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#041724');
    bgGrad.addColorStop(0.45, '#072436');
    bgGrad.addColorStop(0.85, '#041824');
    bgGrad.addColorStop(1, '#020C14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle stone dungeon brick pattern
    ctx.save();
    ctx.strokeStyle = 'rgba(2, 28, 44, 0.45)';
    ctx.lineWidth = 1.5;
    const rowH = 46;
    const colW = 84;
    const rows = Math.ceil(h / rowH);

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      const offset = (r % 2) * (colW / 2);
      for (let x = offset; x < w + colW; x += colW) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }

    // Atmospheric wall scratches / claw marks
    ctx.strokeStyle = 'rgba(10, 48, 72, 0.35)';
    ctx.lineWidth = 2;
    const scratches = [
      { x: w * 0.22, y: h * 0.25, len: 45, angle: 0.6 },
      { x: w * 0.23, y: h * 0.26, len: 50, angle: 0.58 },
      { x: w * 0.78, y: h * 0.42, len: 40, angle: -0.7 },
      { x: w * 0.79, y: h * 0.43, len: 44, angle: -0.68 },
      { x: w * 0.45, y: h * 0.72, len: 38, angle: 0.4 },
    ];
    scratches.forEach((s) => {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + Math.cos(s.angle) * s.len, s.y + Math.sin(s.angle) * s.len);
      ctx.stroke();
    });

    // Side wall stone borders with glowing torches
    const borderW = Math.min(24, w * 0.045);
    const sideGrad = ctx.createLinearGradient(0, 0, borderW, 0);
    sideGrad.addColorStop(0, 'rgba(0, 10, 18, 0.95)');
    sideGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sideGrad;
    ctx.fillRect(0, 0, borderW * 2, h);

    const rightGrad = ctx.createLinearGradient(w, 0, w - borderW * 2, 0);
    rightGrad.addColorStop(0, 'rgba(0, 10, 18, 0.95)');
    rightGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(w - borderW * 2, 0, borderW * 2, h);

    // Eerie ambient flickering torchlight glow on edges
    const flicker = Math.sin(timeMs * 0.006) * 0.08 + 0.18;
    const torchGradLeft = ctx.createRadialGradient(10, h * 0.35, 10, 10, h * 0.35, 140);
    torchGradLeft.addColorStop(0, `rgba(255, 140, 40, ${flicker})`);
    torchGradLeft.addColorStop(1, 'transparent');
    ctx.fillStyle = torchGradLeft;
    ctx.fillRect(0, h * 0.2, 160, 240);

    const torchGradRight = ctx.createRadialGradient(w - 10, h * 0.35, 10, w - 10, h * 0.35, 140);
    torchGradRight.addColorStop(0, `rgba(255, 140, 40, ${flicker})`);
    torchGradRight.addColorStop(1, 'transparent');
    ctx.fillStyle = torchGradRight;
    ctx.fillRect(w - 160, h * 0.2, 160, 240);

    // Subtle dark vignette on corners
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, Math.max(w, h) * 0.85);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(1, 6, 12, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 2. Splatter Decals on Wall
  // ---------------------------------------------------------------------------
  public renderSplatters(splatters: SplatterDecal[]) {
    const ctx = this.ctx;
    ctx.save();
    splatters.forEach((s) => {
      ctx.globalAlpha = s.alpha * 0.85;
      ctx.fillStyle = s.color;

      // Central splash pool
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Radiating droplets & splats
      s.drops.forEach((d) => {
        ctx.beginPath();
        ctx.arc(s.x + d.dx, s.y + d.dy, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 3. Flying Halloween Monster Fruits & Bombs
  // ---------------------------------------------------------------------------
  public renderFlyingObjects(objects: FlyingObject[], timeMs: number) {
    const ctx = this.ctx;

    objects.forEach((obj) => {
      if (obj.sliced || obj.missed) return;

      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(obj.rotation);

      if (obj.isBomb) {
        this.drawBomb(ctx, obj.radius, timeMs);
      } else {
        this.drawMonsterFruit(ctx, obj.kind, obj.radius, obj.config);
      }

      ctx.restore();
    });
  }

  /** Render 3D Cartoon Monster Fruit with Personality */
  private drawMonsterFruit(
    ctx: CanvasRenderingContext2D,
    kind: FruitKind,
    r: number,
    config?: { outerColor: string; eyeType: string }
  ) {
    // 1. Drop shadow beneath fruit
    ctx.beginPath();
    ctx.ellipse(r * 0.1, r * 0.8, r * 0.85, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    switch (kind) {
      case 'pumpkin':
        this.drawPumpkin(ctx, r);
        break;
      case 'monster_apple':
        this.drawMonsterApple(ctx, r);
        break;
      case 'slime_melon':
        this.drawSlimeMelon(ctx, r);
        break;
      case 'spooky_lemon':
        this.drawSpookyLemon(ctx, r);
        break;
      case 'ghost_berry':
        this.drawGhostBerry(ctx, r);
        break;
      case 'candy_corn':
        this.drawCandyCorn(ctx, r);
        break;
      default:
        this.drawPumpkin(ctx, r);
        break;
    }
  }

  /** PUMPKIN: Glossy orange segments, green stem, carved glowing eyes & smile */
  private drawPumpkin(ctx: CanvasRenderingContext2D, r: number) {
    // Stem
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.roundRect(-r * 0.15, -r * 1.15, r * 0.3, r * 0.35, 4);
    ctx.fill();

    // Base pumpkin ribs
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#FFA834');
    grad.addColorStop(0.6, '#FF6B00');
    grad.addColorStop(1, '#B33600');

    ctx.fillStyle = grad;
    // Outer lobes
    ctx.beginPath();
    ctx.ellipse(-r * 0.45, 0, r * 0.5, r * 0.85, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.45, 0, r * 0.5, r * 0.85, 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Center lobe
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.65, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.4, r * 0.25, r * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Carved glowing eyes (Yellow/Black)
    ctx.fillStyle = '#FFEB3B';
    // Left eye triangle
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.15);
    ctx.lineTo(-r * 0.2, -r * 0.35);
    ctx.lineTo(-r * 0.15, -r * 0.1);
    ctx.closePath();
    ctx.fill();

    // Right eye triangle
    ctx.beginPath();
    ctx.moveTo(r * 0.4, -r * 0.15);
    ctx.lineTo(r * 0.2, -r * 0.35);
    ctx.lineTo(r * 0.15, -r * 0.1);
    ctx.closePath();
    ctx.fill();

    // Carved sinister grin
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, r * 0.15);
    ctx.quadraticCurveTo(0, r * 0.6, r * 0.45, r * 0.15);
    ctx.lineTo(r * 0.3, r * 0.35);
    ctx.lineTo(r * 0.15, r * 0.25);
    ctx.lineTo(0, r * 0.4);
    ctx.lineTo(-r * 0.15, r * 0.25);
    ctx.lineTo(-r * 0.3, r * 0.35);
    ctx.closePath();
    ctx.fill();
  }

  /** MONSTER APPLE: Ruby red with green bat wings, cartoon teeth grin */
  private drawMonsterApple(ctx: CanvasRenderingContext2D, r: number) {
    // Little dark purple bat wings on sides
    ctx.fillStyle = '#4A154B';
    ctx.beginPath();
    // Left wing
    ctx.moveTo(-r * 0.8, -r * 0.1);
    ctx.quadraticCurveTo(-r * 1.35, -r * 0.6, -r * 1.45, -r * 0.1);
    ctx.quadraticCurveTo(-r * 1.15, 0, -r * 0.8, r * 0.2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(r * 0.8, -r * 0.1);
    ctx.quadraticCurveTo(r * 1.35, -r * 0.6, r * 1.45, -r * 0.1);
    ctx.quadraticCurveTo(r * 1.15, 0, r * 0.8, r * 0.2);
    ctx.fill();

    // Apple body
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#FF4B5C');
    grad.addColorStop(0.65, '#D61A3C');
    grad.addColorStop(1, '#780016');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Leaf & stem
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(r * 0.15, -r * 0.95, r * 0.22, r * 0.1, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.22, r * 0.12, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Cartoon monster face
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.25, -r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Black pupils looking mischievous
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-r * 0.22, -r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.arc(r * 0.28, -r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Mischievous mouth with two vampire fangs
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.28, 0, Math.PI);
    ctx.fillStyle = '#2B050B';
    ctx.fill();

    // White fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, r * 0.2);
    ctx.lineTo(-r * 0.1, r * 0.2);
    ctx.lineTo(-r * 0.14, r * 0.38);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(r * 0.1, r * 0.2);
    ctx.lineTo(r * 0.18, r * 0.2);
    ctx.lineTo(r * 0.14, r * 0.38);
    ctx.closePath();
    ctx.fill();
  }

  /** SLIME MELON: Vibrant lime green cyclops monster with cute smile */
  private drawSlimeMelon(ctx: CanvasRenderingContext2D, r: number) {
    const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#B4F835');
    grad.addColorStop(0.65, '#72C812');
    grad.addColorStop(1, '#346E04');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    ctx.fill();

    // Darker green watermelon stripes
    ctx.strokeStyle = '#2B5A03';
    ctx.lineWidth = r * 0.07;
    for (let angle = -0.7; angle <= 0.7; angle += 0.45) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.88, r * 0.88, angle, 0.4, Math.PI - 0.4);
      ctx.stroke();
    }

    // Big single cartoon cyclops eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -r * 0.12, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Lime/cyan iris
    ctx.fillStyle = '#00BCD4';
    ctx.beginPath();
    ctx.arc(0, -r * 0.12, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Dark pupil & gleam
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, -r * 0.12, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(r * 0.06, -r * 0.18, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Cute green monster smile
    ctx.strokeStyle = '#1B3B02';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r * 0.24, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  /** SPOOKY LEMON: Electric yellow with monster horns & fangs */
  private drawSpookyLemon(ctx: CanvasRenderingContext2D, r: number) {
    // Little purple horns
    ctx.fillStyle = '#7B1FA2';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.4);
    ctx.lineTo(-r * 0.65, -r * 0.95);
    ctx.lineTo(-r * 0.3, -r * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(r * 0.5, -r * 0.4);
    ctx.lineTo(r * 0.65, -r * 0.95);
    ctx.lineTo(r * 0.3, -r * 0.6);
    ctx.closePath();
    ctx.fill();

    // Lemon body
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#FFF568');
    grad.addColorStop(0.65, '#FBC02D');
    grad.addColorStop(1, '#C47C00');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.75, r * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute angry slanted eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(-r * 0.26, -r * 0.12, r * 0.1, r * 0.14, 0.3, 0, Math.PI * 2);
    ctx.ellipse(r * 0.26, -r * 0.12, r * 0.1, r * 0.14, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-r * 0.24, -r * 0.16, r * 0.04, 0, Math.PI * 2);
    ctx.arc(r * 0.24, -r * 0.16, r * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Fanged grin
    ctx.beginPath();
    ctx.arc(0, r * 0.22, r * 0.22, 0, Math.PI);
    ctx.fillStyle = '#3E2723';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, r * 0.22);
    ctx.lineTo(-r * 0.06, r * 0.34);
    ctx.lineTo(0, r * 0.22);
    ctx.closePath();
    ctx.fill();
  }

  /** GHOST BERRY: Deep purple with glowing cyan ghost eyes */
  private drawGhostBerry(ctx: CanvasRenderingContext2D, r: number) {
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#CE93D8');
    grad.addColorStop(0.6, '#8E24AA');
    grad.addColorStop(1, '#4A148C');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.fill();

    // Ghost eyes (Cyan glow)
    ctx.fillStyle = '#00E5FF';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.08, r * 0.14, 0, Math.PI * 2);
    ctx.arc(r * 0.25, -r * 0.08, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Small black pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-r * 0.22, -r * 0.08, r * 0.06, 0, Math.PI * 2);
    ctx.arc(r * 0.28, -r * 0.08, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Spooky 'O' mouth
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  /** CANDY CORN: Classic Halloween treat with cute spooky grin */
  private drawCandyCorn(ctx: CanvasRenderingContext2D, r: number) {
    ctx.save();
    // Triangular clip for stripes
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.95);
    ctx.lineTo(r * 0.8, r * 0.8);
    ctx.lineTo(-r * 0.8, r * 0.8);
    ctx.closePath();

    // 3 Layers: White tip, Orange middle, Yellow base
    ctx.fillStyle = '#FDD835'; // Yellow base
    ctx.fill();

    // Orange band
    ctx.fillStyle = '#FB8C00';
    ctx.beginPath();
    ctx.rect(-r * 0.8, -r * 0.3, r * 1.6, r * 0.6);
    ctx.fill();

    // White tip
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.95);
    ctx.lineTo(r * 0.35, -r * 0.3);
    ctx.lineTo(-r * 0.35, -r * 0.3);
    ctx.closePath();
    ctx.fill();

    // Face on orange band
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-r * 0.16, 0, r * 0.06, 0, Math.PI * 2);
    ctx.arc(r * 0.16, 0, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.1, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  /** BOMB: Heavy iron sphere with skull emblem & sparkling burning fuse */
  private drawBomb(ctx: CanvasRenderingContext2D, r: number, timeMs: number) {
    // 1. Bronze neck / cap
    ctx.fillStyle = '#A1887F';
    ctx.beginPath();
    ctx.rect(-r * 0.2, -r * 1.08, r * 0.4, r * 0.25);
    ctx.fill();

    // 2. Burning curved fuse rope
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.05);
    ctx.quadraticCurveTo(r * 0.45, -r * 1.35, r * 0.35, -r * 1.65);
    ctx.stroke();

    // 3. Sparkling fuse tip (Live yellow/orange/white flame particles)
    const sparkX = r * 0.35;
    const sparkY = -r * 1.65;
    const sparkFlicker = Math.sin(timeMs * 0.03) * 3;

    ctx.fillStyle = '#FFD54F';
    ctx.shadowColor = '#FF9800';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 7 + sparkFlicker, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Main heavy iron bomb body
    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#546E7A');
    grad.addColorStop(0.5, '#263238');
    grad.addColorStop(1, '#0D1317');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Rim light specular reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.25, r * 0.15, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Red warning skull / crossbones emblem
    ctx.fillStyle = '#FF1744';
    // Skull forehead
    ctx.beginPath();
    ctx.arc(0, -r * 0.08, r * 0.26, 0, Math.PI * 2);
    ctx.fill();
    // Jaw
    ctx.beginPath();
    ctx.rect(-r * 0.12, r * 0.08, r * 0.24, r * 0.16);
    ctx.fill();
    // Eye sockets (Iron body showing through)
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(-r * 0.1, -r * 0.08, r * 0.07, 0, Math.PI * 2);
    ctx.arc(r * 0.1, -r * 0.08, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------------------------------------------------------------------------
  // 4. Sliced Halves (Splitting apart in mid-air)
  // ---------------------------------------------------------------------------
  public renderSlicedHalves(halves: SlicedHalf[]) {
    const ctx = this.ctx;

    halves.forEach((h) => {
      ctx.save();
      ctx.globalAlpha = h.alpha;
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rotation);

      const r = h.radius;
      // Clip to half circle
      ctx.beginPath();
      if (h.isLeft) {
        ctx.arc(0, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
      } else {
        ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
      }
      ctx.closePath();
      ctx.clip();

      // Outer rind / peel
      ctx.fillStyle = h.config.outerColor;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      // Inner cut cross section (flesh & core)
      ctx.fillStyle = h.config.innerColor;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Core seeds or star pattern
      ctx.fillStyle = '#3E2723';
      ctx.beginPath();
      ctx.arc(h.isLeft ? -r * 0.15 : r * 0.15, -r * 0.1, r * 0.06, 0, Math.PI * 2);
      ctx.arc(h.isLeft ? -r * 0.15 : r * 0.15, r * 0.1, r * 0.06, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Slash Trail (Curved, glowing white blade streak)
  // ---------------------------------------------------------------------------
  public renderSlashTrail(points: SlashPoint[], now: number) {
    if (points.length < 2) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const age = now - p2.time;
      if (age > 280) continue;

      const progress = 1 - age / 280;
      const width = (i / points.length) * 16 * progress + 2;

      // Glowing outer cyan blade aura
      ctx.strokeStyle = `rgba(0, 229, 255, ${progress * 0.6})`;
      ctx.lineWidth = width * 1.8;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Bright white core blade
      ctx.strokeStyle = `rgba(255, 255, 255, ${progress * 0.95})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Glowing tip starburst at latest point
    const tip = points[points.length - 1];
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 6. Particles & Sparks
  // ---------------------------------------------------------------------------
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    ctx.save();
    particles.forEach((p) => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 7. Floating Scores & Combo Banners
  // ---------------------------------------------------------------------------
  public renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    texts.forEach((t) => {
      ctx.globalAlpha = t.alpha;
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      // Shadow / outline
      ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.lineWidth = 4;
      ctx.strokeText(t.text, 0, 0);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);

      ctx.restore();
    });
    ctx.restore();
  }
}
