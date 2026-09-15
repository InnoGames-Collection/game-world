/**
 * EMOJI SORTING BALL - Professional 3D Three.js Visual Engine
 * 
 * TOURNAMENT-GRADE FEATURES:
 * - Constant physical ball diameter - NEVER shrunk or compressed by stack count!
 * - Physical spacing preserving full spherical silhouette & glossy highlight of every emoji ball
 * - Mandatory Tube Palette with individual jewel-tone crystal glass shading (#FF6B6B, #22D3EE, #8B5CF6, etc.)
 * - Polished metallic rims with subtle selection illumination
 * - Tangible 3D emoji arcade balls with authentic specular highlights and clear forward orientation
 * - Sequential automatic group transfer animation: balls launch and settle one-by-one in an automatic chain!
 * - Responsive 1-row and 2-row layouts calibrated for portrait mobile screens
 */

import * as THREE from 'three';
import { getTubePaletteColor } from './tubePalette';
import { getEmojiTexture } from './emojis';

export interface TubeLayoutInfo {
  index: number;
  x: number;
  y: number;
  row: number;
}

interface SequentialMovingBall {
  mesh: THREE.Mesh;
  stepIndex: number;
  startTime: number;
  hasLaunched: boolean;
  hasSettled: boolean;
  startX: number;
  sourceRestY: number;
  sourceRimY: number;
  destX: number;
  destRimY: number;
  destFinalY: number;
  phase: 'WAITING' | 'LIFT' | 'ARC' | 'DROP' | 'BOUNCE' | 'DONE';
  progress: number;
}

interface ActiveSequentialAnimation {
  balls: SequentialMovingBall[];
  onBallLaunch: (stepIdx: number) => void;
  onBallSettle: (stepIdx: number) => void;
  onComplete: () => void;
}

export class EmojiSortingRenderer3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeFrameId: number | null = null;

  // Visual Groups
  private arenaFloorGroup: THREE.Group;
  private tubesGroup: THREE.Group;
  private ballsGroup: THREE.Group;
  private hitTargets: THREE.Mesh[] = [];

  // Layout parameters
  private currentTubes: string[][] = [];
  private tubePositions: TubeLayoutInfo[] = [];
  private tubeMeshes: THREE.Group[] = [];
  private tubeAuraMeshes: (THREE.Mesh | null)[] = [];
  private ballMeshes: Map<string, THREE.Mesh> = new Map();

  // Animation State
  private activeAnimation: ActiveSequentialAnimation | null = null;

  // Selected tube & group
  private selectedTubeIndex: number | null = null;
  private selectedGroupCount: number = 0;

  // Tube shake animation
  private shakingTubes: Map<number, { startTime: number; duration: number }> = new Map();

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // STRICT PHYSICAL CONSTANTS
  public static readonly BALL_RADIUS = 0.285; // Fixed diameter = 0.570 units
  public static readonly BALL_SPACING = 0.565; // Center-to-center spacing (~99% spherical visibility)
  public static readonly TUBE_RADIUS = 0.330; // Ball occupies ~86.4% of inner tube width
  public static readonly TUBE_HEIGHT = 2.15; // Generous vertical room for 4 full-sized balls
  public static readonly RIM_Y = 1.18; // Top rim height
  public static readonly BALL_BOTTOM_Y = -0.92; // Resting height of bottom ball (ball 0)

  // Environmental materials
  private innerWallMaterial: THREE.MeshBasicMaterial;
  private contactShadowMaterial: THREE.MeshBasicMaterial;
  private penumbraShadowMaterial: THREE.MeshBasicMaterial;
  private platformBaseMaterial: THREE.MeshStandardMaterial;
  private platformBevelMaterial: THREE.MeshStandardMaterial;
  private platformRingMaterial: THREE.MeshBasicMaterial;
  private platformAuraMaterial: THREE.MeshBasicMaterial;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const aspect = (container.clientWidth || 400) / (container.clientHeight || 600);
    this.camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 100);
    this.updateCameraForAspect(aspect, 4);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth || 400, container.clientHeight || 600);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.30;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting calibrated for bright playful puzzle atmosphere and vibrant emoji spheres
    this.setupLighting();

    // 5. Environmental base materials (Crisp, clean, bright pearl platform & soft shadows)
    this.innerWallMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.contactShadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });

    this.penumbraShadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    });

    this.platformBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.32,
      metalness: 0.08,
    });

    this.platformBevelMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.24,
      metalness: 0.12,
    });

    this.platformRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });

    this.platformAuraMaterial = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    });

    // 6. Setup Groups
    this.arenaFloorGroup = new THREE.Group();
    this.tubesGroup = new THREE.Group();
    this.ballsGroup = new THREE.Group();

    this.scene.add(this.arenaFloorGroup);
    this.scene.add(this.tubesGroup);
    this.scene.add(this.ballsGroup);

    // 7. Render Loop
    this.startRenderLoop();

    // 8. Resize Observer
    this.setupResizeHandling();
  }

  /**
   * Premium Studio Lighting System calibrated for bright light puzzle canvas
   */
  private setupLighting() {
    // Ambient light: bright clean studio fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    this.scene.add(ambientLight);

    // Key directional light: crisp top-left illumination
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
    keyLight.position.set(-2.5, 6.0, 5.0);
    this.scene.add(keyLight);

    // Fill directional light: warm pastel fill from lower-right
    const fillLight = new THREE.DirectionalLight(0xfdf2f8, 0.70);
    fillLight.position.set(3.5, 2.5, 3.5);
    this.scene.add(fillLight);

    // Rim back light: creates pristine edge definition on glass cylinders and emoji spheres
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.65);
    rimLight.position.set(0, 4.0, -4.0);
    this.scene.add(rimLight);

    // Center subtle highlight
    const pointLight = new THREE.PointLight(0xffffff, 0.35, 12);
    pointLight.position.set(0, 2.5, 2.5);
    this.scene.add(pointLight);
  }

  /**
   * Set or update complete level state
   */
  public setLevelState(
    tubes: string[][],
    selectedTubeIndex: number | null,
    selectedGroupCount: number = 1
  ) {
    this.currentTubes = tubes.map((t) => [...t]);
    this.selectedTubeIndex = selectedTubeIndex;
    this.selectedGroupCount = selectedGroupCount;

    this.calculateTubeLayout();
    this.rebuildArenaFloor();
    this.rebuildTubes();
    this.rebuildBalls();
  }

  /**
   * Calculate 1-row or 2-row layout depending on tube count and viewport
   */
  private calculateTubeLayout() {
    const totalTubes = this.currentTubes.length;
    this.tubePositions = [];

    const isMobile = this.container.clientWidth < 640;
    const isVeryNarrow = this.container.clientWidth < 380;

    if (totalTubes <= 6 && !isVeryNarrow) {
      // Single Row Layout
      const spacingX = isMobile ? 0.90 : 1.10;
      const startX = -((totalTubes - 1) * spacingX) / 2;
      const centerY = -0.10;

      for (let i = 0; i < totalTubes; i++) {
        this.tubePositions.push({
          index: i,
          x: startX + i * spacingX,
          y: centerY,
          row: 0,
        });
      }
    } else {
      // 2-Row Grid Layout (portrait mobile friendly)
      const topCount = Math.ceil(totalTubes / 2);
      const bottomCount = totalTubes - topCount;

      const spacingX = isMobile ? 0.92 : 1.12;
      const rowY = isMobile ? 1.48 : 1.62;

      // Top Row
      const topStartX = -((topCount - 1) * spacingX) / 2;
      for (let i = 0; i < topCount; i++) {
        this.tubePositions.push({
          index: i,
          x: topStartX + i * spacingX,
          y: rowY,
          row: 0,
        });
      }

      // Bottom Row
      const bottomStartX = -((bottomCount - 1) * spacingX) / 2;
      for (let i = 0; i < bottomCount; i++) {
        this.tubePositions.push({
          index: topCount + i,
          x: bottomStartX + i * spacingX,
          y: -rowY,
          row: 1,
        });
      }
    }
  }

  /**
   * Rebuild Arena Floor & Shadow Base
   */
  private rebuildArenaFloor() {
    while (this.arenaFloorGroup.children.length > 0) {
      const obj = this.arenaFloorGroup.children[0];
      this.arenaFloorGroup.remove(obj);
    }

    if (this.tubePositions.length === 0) return;

    // Determine bounding footprint
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this.tubePositions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });

    const tubeRadius = EmojiSortingRenderer3D.TUBE_RADIUS;
    const totalHalfWidth = (maxX - minX) / 2 + tubeRadius + 0.65;
    const totalHalfHeight = maxY + EmojiSortingRenderer3D.TUBE_HEIGHT / 2 + 0.95;

    const baseGeom = new THREE.CylinderGeometry(
      totalHalfWidth * 1.35,
      totalHalfWidth * 1.42,
      0.22,
      48
    );
    const baseMesh = new THREE.Mesh(baseGeom, this.platformBaseMaterial);
    baseMesh.position.set(0, minY + EmojiSortingRenderer3D.RIM_Y - EmojiSortingRenderer3D.TUBE_HEIGHT - 0.20, -0.15);
    this.arenaFloorGroup.add(baseMesh);

    const ringGeom = new THREE.RingGeometry(totalHalfWidth * 0.90, totalHalfWidth * 1.38, 48);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeom, this.platformRingMaterial);
    ringMesh.position.copy(baseMesh.position);
    ringMesh.position.y += 0.12;
    this.arenaFloorGroup.add(ringMesh);

    const auraGeom = new THREE.CircleGeometry(totalHalfWidth * 1.85, 48);
    auraGeom.rotateX(-Math.PI / 2);
    const auraMesh = new THREE.Mesh(auraGeom, this.platformAuraMaterial);
    auraMesh.position.copy(baseMesh.position);
    auraMesh.position.y += 0.05;
    this.arenaFloorGroup.add(auraMesh);
  }

  /**
   * Rebuild Tubes using the MANDATORY HEX TUBE PALETTE
   */
  private rebuildTubes() {
    while (this.tubesGroup.children.length > 0) {
      const obj = this.tubesGroup.children[0];
      this.tubesGroup.remove(obj);
    }

    this.hitTargets = [];
    this.tubeMeshes = [];
    this.tubeAuraMeshes = [];

    this.tubePositions.forEach((pos) => {
      this.buildTubeMesh(pos);
    });
  }

  /**
   * Build an individual 3D jewel-tone glass tube with metallic rim
   */
  private buildTubeMesh(pos: TubeLayoutInfo) {
    const tubeGroup = new THREE.Group();
    const isSelected = this.selectedTubeIndex === pos.index;

    // EXACT MANDATED PALETTE COLOR FOR THIS TUBE
    const palette = getTubePaletteColor(pos.index);

    // Subtle 3D lift when selected
    const liftY = isSelected ? 0.08 : 0;
    tubeGroup.position.set(pos.x, pos.y + liftY, 0);
    if (isSelected) {
      tubeGroup.scale.set(1.02, 1.02, 1.02);
    }

    // 1. Dual-Ring Metallic & Glass Top Rim (Brushed titanium tinted with tube's palette color)
    const rimMat = new THREE.MeshStandardMaterial({
      color: palette.threeColor,
      metalness: 0.85,
      roughness: 0.18,
    });

    const rimSelectedMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: palette.threeColor,
      emissiveIntensity: 0.48,
      metalness: 0.82,
      roughness: 0.12,
    });

    const outerRimGeom = new THREE.TorusGeometry(
      EmojiSortingRenderer3D.TUBE_RADIUS,
      0.038,
      16,
      48
    );
    outerRimGeom.rotateX(Math.PI / 2);
    const outerRimMesh = new THREE.Mesh(outerRimGeom, isSelected ? rimSelectedMat : rimMat);
    outerRimMesh.position.y = EmojiSortingRenderer3D.RIM_Y;
    tubeGroup.add(outerRimMesh);

    const innerRimGeom = new THREE.TorusGeometry(
      EmojiSortingRenderer3D.TUBE_RADIUS * 0.94,
      0.020,
      12,
      36
    );
    innerRimGeom.rotateX(Math.PI / 2);
    const innerRimMat = new THREE.MeshStandardMaterial({
      color: palette.threeColor,
      metalness: 0.70,
      roughness: 0.35,
    });
    const innerRimMesh = new THREE.Mesh(innerRimGeom, innerRimMat);
    innerRimMesh.position.y = EmojiSortingRenderer3D.RIM_Y + 0.010;
    tubeGroup.add(innerRimMesh);

    // 2. Translucent Crystal Glass Body Cylinder tinted with Tube Palette Color
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: palette.threeColor,
      transparent: true,
      opacity: 0.22,
      roughness: 0.04,
      metalness: 0.04,
      transmission: 0.94,
      ior: 1.48,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.88,
      depthWrite: false,
    });

    const glassSelectedMat = new THREE.MeshPhysicalMaterial({
      color: palette.threeColor,
      emissive: palette.threeColor,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.32,
      roughness: 0.03,
      metalness: 0.04,
      transmission: 0.92,
      ior: 1.48,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.92,
      depthWrite: false,
    });

    const cylGeom = new THREE.CylinderGeometry(
      EmojiSortingRenderer3D.TUBE_RADIUS,
      EmojiSortingRenderer3D.TUBE_RADIUS,
      EmojiSortingRenderer3D.TUBE_HEIGHT,
      40,
      1,
      true
    );
    const cylMesh = new THREE.Mesh(cylGeom, isSelected ? glassSelectedMat : glassMat);
    cylMesh.position.y = EmojiSortingRenderer3D.RIM_Y - EmojiSortingRenderer3D.TUBE_HEIGHT / 2;
    tubeGroup.add(cylMesh);

    // 3. Rounded 3D Glass Bottom Cap (Hemisphere)
    const capGeom = new THREE.SphereGeometry(
      EmojiSortingRenderer3D.TUBE_RADIUS,
      36,
      18,
      0,
      Math.PI * 2,
      Math.PI / 2,
      Math.PI / 2
    );
    const capMesh = new THREE.Mesh(capGeom, isSelected ? glassSelectedMat : glassMat);
    capMesh.position.y = EmojiSortingRenderer3D.RIM_Y - EmojiSortingRenderer3D.TUBE_HEIGHT;
    tubeGroup.add(capMesh);

    // 4. Layered Floor Contact Shadows & Palette Floor Aura
    const shadowY = EmojiSortingRenderer3D.RIM_Y - EmojiSortingRenderer3D.TUBE_HEIGHT - liftY - 0.04;

    // Contact shadow
    const contactGeom = new THREE.CircleGeometry(EmojiSortingRenderer3D.TUBE_RADIUS * 1.08, 32);
    contactGeom.rotateX(-Math.PI / 2);
    const contactMesh = new THREE.Mesh(contactGeom, this.contactShadowMaterial);
    contactMesh.position.y = shadowY;
    tubeGroup.add(contactMesh);

    // Soft outer penumbra shadow
    const penumbraGeom = new THREE.CircleGeometry(EmojiSortingRenderer3D.TUBE_RADIUS * 1.75, 32);
    penumbraGeom.rotateX(-Math.PI / 2);
    const penumbraMesh = new THREE.Mesh(penumbraGeom, this.penumbraShadowMaterial);
    penumbraMesh.position.y = shadowY - 0.005;
    tubeGroup.add(penumbraMesh);

    // Ambient Floor Aura matching tube palette color
    const auraGeom = new THREE.CircleGeometry(EmojiSortingRenderer3D.TUBE_RADIUS * 2.3, 32);
    auraGeom.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: palette.threeColor,
      transparent: true,
      opacity: isSelected ? 0.32 : 0.12,
      depthWrite: false,
    });
    const auraMesh = new THREE.Mesh(auraGeom, auraMat);
    auraMesh.position.y = shadowY - 0.01;
    tubeGroup.add(auraMesh);
    this.tubeAuraMeshes[pos.index] = auraMesh;

    // 6. Raycasting hit target cylinder
    const hitGeom = new THREE.CylinderGeometry(
      EmojiSortingRenderer3D.TUBE_RADIUS * 1.5,
      EmojiSortingRenderer3D.TUBE_RADIUS * 1.5,
      EmojiSortingRenderer3D.TUBE_HEIGHT + 0.9,
      16
    );
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeom, hitMat);
    hitMesh.position.y = EmojiSortingRenderer3D.RIM_Y - EmojiSortingRenderer3D.TUBE_HEIGHT / 2 + 0.2;
    hitMesh.userData = { tubeIndex: pos.index };
    tubeGroup.add(hitMesh);
    this.hitTargets.push(hitMesh);

    this.tubesGroup.add(tubeGroup);
    this.tubeMeshes[pos.index] = tubeGroup;
  }

  /**
   * Rebuild all 3D Emoji Balls across all tubes
   */
  private rebuildBalls() {
    while (this.ballsGroup.children.length > 0) {
      const obj = this.ballsGroup.children[0];
      this.ballsGroup.remove(obj);
    }
    this.ballMeshes.clear();

    this.tubePositions.forEach((pos) => {
      this.buildBallsForTube(pos);
    });
  }

  /**
   * Build 3D emoji balls inside the given tube
   */
  private buildBallsForTube(pos: TubeLayoutInfo) {
    const balls = this.currentTubes[pos.index] || [];
    const isThisTubeSelected = this.selectedTubeIndex === pos.index;
    const liftY = isThisTubeSelected ? 0.08 : 0;

    balls.forEach((emojiKey, ballIdx) => {
      const ballX = pos.x;
      const ballY =
        pos.y +
        liftY +
        EmojiSortingRenderer3D.BALL_BOTTOM_Y +
        ballIdx * EmojiSortingRenderer3D.BALL_SPACING;

      const ballMesh = this.createBallMesh(emojiKey);
      ballMesh.position.set(ballX, ballY, 0);

      this.ballsGroup.add(ballMesh);
      const key = `${pos.index}_${ballIdx}`;
      this.ballMeshes.set(key, ballMesh);
    });
  }

  /**
   * Create a single glossy 3D Emoji ball mesh
   * Uses CONSTANT BALL_RADIUS - NO SCALING!
   */
  public createBallMesh(emojiKey: string): THREE.Mesh {
    const geom = new THREE.SphereGeometry(EmojiSortingRenderer3D.BALL_RADIUS, 32, 32);
    // Orient UV coordinate center to face forward (+Z towards camera)
    geom.rotateY(-Math.PI / 2);

    const texture = getEmojiTexture(emojiKey);

    const mat = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.12,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.92,
    });

    return new THREE.Mesh(geom, mat);
  }

  /**
   * Sequential Automatic Group Move
   */
  public animateSequentialGroupMove(
    fromIndex: number,
    toIndex: number,
    emojiKey: string,
    count: number,
    destStartCount: number,
    onBallLaunch: (stepIdx: number) => void,
    onBallSettle: (stepIdx: number) => void,
    onComplete: () => void
  ) {
    const fromPos = this.tubePositions[fromIndex];
    const toPos = this.tubePositions[toIndex];
    if (!fromPos || !toPos || count <= 0) {
      onComplete();
      return;
    }

    const fromLiftY = this.selectedTubeIndex === fromIndex ? 0.08 : 0;
    const sourceBalls = this.currentTubes[fromIndex] || [];
    const sourceTotal = sourceBalls.length;

    // Remove static meshes being moved
    for (let i = 0; i < count; i++) {
      const restIdx = sourceTotal - 1 - i;
      const key = `${fromIndex}_${restIdx}`;
      const existingMesh = this.ballMeshes.get(key);
      if (existingMesh) {
        this.ballsGroup.remove(existingMesh);
        this.ballMeshes.delete(key);
      }
    }

    const now = performance.now();
    const movingBalls: SequentialMovingBall[] = [];

    for (let i = 0; i < count; i++) {
      const mesh = this.createBallMesh(emojiKey);
      const startDelayMs = i * 135;
      const sourceRestIdx = sourceTotal - 1 - i;
      const sourceRestY =
        fromPos.y +
        fromLiftY +
        EmojiSortingRenderer3D.BALL_BOTTOM_Y +
        sourceRestIdx * EmojiSortingRenderer3D.BALL_SPACING;

      mesh.position.set(fromPos.x, sourceRestY, 0);
      this.ballsGroup.add(mesh);

      const targetSlotIndex = destStartCount + i;
      const destFinalY =
        toPos.y +
        EmojiSortingRenderer3D.BALL_BOTTOM_Y +
        targetSlotIndex * EmojiSortingRenderer3D.BALL_SPACING;

      const sourceRimY = fromPos.y + EmojiSortingRenderer3D.RIM_Y + 0.30;
      const destRimY = toPos.y + EmojiSortingRenderer3D.RIM_Y + 0.30;

      movingBalls.push({
        mesh,
        stepIndex: i,
        startTime: now + startDelayMs,
        hasLaunched: false,
        hasSettled: false,
        startX: fromPos.x,
        sourceRestY,
        sourceRimY,
        destX: toPos.x,
        destRimY,
        destFinalY,
        phase: 'WAITING',
        progress: 0,
      });
    }

    this.activeAnimation = {
      balls: movingBalls,
      onBallLaunch,
      onBallSettle,
      onComplete,
    };
  }

  /**
   * Shake tube for invalid move or hint attention
   */
  public shakeTube(tubeIndex: number) {
    this.shakingTubes.set(tubeIndex, {
      startTime: performance.now(),
      duration: 320,
    });
  }

  /**
   * Raycasting: find tube at screen coordinates
   */
  public getTubeAtCoordinates(clientX: number, clientY: number): number | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.hitTargets, false);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object as THREE.Mesh;
      if (hitObj.userData && typeof hitObj.userData.tubeIndex === 'number') {
        return hitObj.userData.tubeIndex;
      }
    }
    return null;
  }

  /**
   * Render Loop
   */
  private startRenderLoop() {
    const animate = (time: number) => {
      this.animationFrameId = requestAnimationFrame(animate);

      // Handle Sequential Moving Balls
      if (this.activeAnimation) {
        this.updateSequentialAnimation(time);
      }

      // Handle Shaking Tubes
      this.updateShakingTubes(time);

      this.renderer.render(this.scene, this.camera);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Update active sequential ball trajectories
   */
  private updateSequentialAnimation(now: number) {
    if (!this.activeAnimation) return;

    const { balls, onBallLaunch, onBallSettle, onComplete } = this.activeAnimation;
    let allFinished = true;

    for (let k = 0; k < balls.length; k++) {
      const ball = balls[k];

      if (ball.phase === 'DONE') continue;

      if (now < ball.startTime) {
        allFinished = false;
        continue;
      }

      allFinished = false;

      // First time ball wakes up
      if (!ball.hasLaunched) {
        ball.hasLaunched = true;
        ball.phase = 'LIFT';
        onBallLaunch(ball.stepIndex);
      }

      const elapsed = now - ball.startTime;

      // Phase 1: LIFT (0 - 150ms)
      const liftDur = 150;
      if (elapsed < liftDur) {
        const p = elapsed / liftDur;
        const easeP = p * p * (3 - 2 * p); // smoothstep
        ball.mesh.position.x = ball.startX;
        ball.mesh.position.y = THREE.MathUtils.lerp(ball.sourceRestY, ball.sourceRimY, easeP);
        continue;
      }

      // Phase 2: ARC (150ms - 390ms, 240ms duration)
      const arcStart = liftDur;
      const arcDur = 240;
      if (elapsed < arcStart + arcDur) {
        const p = (elapsed - arcStart) / arcDur;
        const easeP = Math.sin((p * Math.PI) / 2); // Sine out

        // X moves linearly or smoothly across
        ball.mesh.position.x = THREE.MathUtils.lerp(ball.startX, ball.destX, p);

        // Y forms a parabolic arc over the arena
        const arcApexY = Math.max(ball.sourceRimY, ball.destRimY) + 0.45;
        const baselineY = THREE.MathUtils.lerp(ball.sourceRimY, ball.destRimY, p);
        const arcOffset = 4 * (arcApexY - baselineY) * p * (1 - p);
        ball.mesh.position.y = baselineY + arcOffset;
        continue;
      }

      // Phase 3: DROP (390ms - 520ms, 130ms duration)
      const dropStart = arcStart + arcDur;
      const dropDur = 130;
      if (elapsed < dropStart + dropDur) {
        const p = (elapsed - dropStart) / dropDur;
        const easeP = p * p; // Quad In gravity acceleration
        ball.mesh.position.x = ball.destX;
        ball.mesh.position.y = THREE.MathUtils.lerp(ball.destRimY, ball.destFinalY, easeP);
        continue;
      }

      // Phase 4: BOUNCE (520ms - 580ms, 60ms subtle settle)
      const bounceStart = dropStart + dropDur;
      const bounceDur = 60;
      if (elapsed < bounceStart + bounceDur) {
        const p = (elapsed - bounceStart) / bounceDur;
        const bounceHeight = 0.05 * Math.sin(p * Math.PI);
        ball.mesh.position.x = ball.destX;
        ball.mesh.position.y = ball.destFinalY + bounceHeight;

        if (!ball.hasSettled) {
          ball.hasSettled = true;
          onBallSettle(ball.stepIndex);
        }
        continue;
      }

      // Final: Finished
      ball.mesh.position.x = ball.destX;
      ball.mesh.position.y = ball.destFinalY;
      ball.phase = 'DONE';
      if (!ball.hasSettled) {
        ball.hasSettled = true;
        onBallSettle(ball.stepIndex);
      }
    }

    if (allFinished) {
      this.activeAnimation = null;
      onComplete();
    }
  }

  /**
   * Update tube shake offsets
   */
  private updateShakingTubes(now: number) {
    if (this.shakingTubes.size === 0) return;

    this.shakingTubes.forEach((val, tubeIndex) => {
      const elapsed = now - val.startTime;
      const mesh = this.tubeMeshes[tubeIndex];
      const pos = this.tubePositions[tubeIndex];

      if (!mesh || !pos) {
        this.shakingTubes.delete(tubeIndex);
        return;
      }

      if (elapsed >= val.duration) {
        mesh.position.x = pos.x;
        this.shakingTubes.delete(tubeIndex);
      } else {
        const decay = 1 - elapsed / val.duration;
        const freq = 36;
        const offset = Math.sin((elapsed / 1000) * freq * Math.PI * 2) * 0.08 * decay;
        mesh.position.x = pos.x + offset;
      }
    });
  }

  /**
   * Adjust camera parameters for aspect ratio and tube count
   */
  private updateCameraForAspect(aspect: number, tubeCount: number) {
    if (aspect < 0.65) {
      // Narrow portrait (mobile)
      this.camera.fov = 44;
      this.camera.position.set(0, 0.15, 7.6);
    } else if (aspect < 1.0) {
      // Standard portrait (tablet)
      this.camera.fov = 38;
      this.camera.position.set(0, 0.10, 7.0);
    } else {
      // Landscape (desktop)
      this.camera.fov = 32;
      this.camera.position.set(0, 0.05, 6.2);
    }
    this.camera.updateProjectionMatrix();
  }

  /**
   * Setup Resize handling
   */
  private setupResizeHandling() {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;

      if (this.resizeFrameId !== null) {
        cancelAnimationFrame(this.resizeFrameId);
      }

      this.resizeFrameId = requestAnimationFrame(() => {
        this.resizeFrameId = null;
        if (!this.container || !this.renderer || !this.camera) return;

        const aspect = width / height;
        this.camera.aspect = aspect;
        this.updateCameraForAspect(aspect, this.currentTubes.length);

        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        this.calculateTubeLayout();
        this.rebuildArenaFloor();
        this.rebuildTubes();
        this.rebuildBalls();
      });
    });

    this.resizeObserver.observe(this.container);
  }

  /**
   * Clean disposal
   */
  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeFrameId !== null) {
      cancelAnimationFrame(this.resizeFrameId);
      this.resizeFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }

    this.renderer.dispose();
  }
}
