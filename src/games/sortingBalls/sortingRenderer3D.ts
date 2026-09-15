/**
 * SORTING BALLS - Professional 3D Three.js Visual Engine
 * Tournament-Quality Upgrade:
 * - Fixed constant ball diameter - NEVER shrunk or compressed by stack count!
 * - Physical spacing preserving full spherical silhouette & glossy highlight of every ball
 * - Premium 3D flint glass puzzle tubes with metallic dual-ring rims, rounded 3D base, and floor contact shadows
 * - Clean subtle selection state: gentle lift, soft floor aura, polished rim glow (NO wireframe cage or stripes!)
 * - Sequential automatic group transfer animation: balls launch and settle one-by-one in an automatic chain!
 * - Responsive 1-row and 2-row layouts calibrated for portrait mobile screens
 */

import * as THREE from 'three';
import { BallColorKey } from './types';
import { BALL_COLORS } from './colors';

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

export class SortingRenderer3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Visual Groups
  private arenaFloorGroup: THREE.Group;
  private tubesGroup: THREE.Group;
  private ballsGroup: THREE.Group;
  private hitTargets: THREE.Mesh[] = [];

  // Layout parameters
  private currentTubes: BallColorKey[][] = [];
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

  // =========================================================================
  // STRICT PHYSICAL CONSTANTS - FIXED BALL DIAMETER (NEVER SHRUNK OR SQUASHED)
  // =========================================================================
  public static readonly BALL_RADIUS = 0.285; // Fixed diameter = 0.570 units
  public static readonly BALL_SPACING = 0.565; // Center-to-center spacing (tangent stacking, ~99% circular visibility)
  public static readonly TUBE_RADIUS = 0.330; // Ball occupies ~86.4% of inner tube width
  public static readonly TUBE_HEIGHT = 2.15; // Generous vertical room for 4 full-sized balls
  public static readonly RIM_Y = 1.18; // Top rim height
  public static readonly BALL_BOTTOM_Y = -0.92; // Resting height of bottom ball (ball 0)

  // Materials cache
  private rimOuterMaterial: THREE.MeshStandardMaterial;
  private rimSelectedMaterial: THREE.MeshStandardMaterial;
  private rimInnerMaterial: THREE.MeshStandardMaterial;
  private glassBodyMaterial: THREE.MeshPhysicalMaterial;
  private glassSelectedMaterial: THREE.MeshPhysicalMaterial;
  private innerWallMaterial: THREE.MeshBasicMaterial;
  private contactShadowMaterial: THREE.MeshBasicMaterial;
  private penumbraShadowMaterial: THREE.MeshBasicMaterial;
  private floorAuraMaterial: THREE.MeshBasicMaterial;
  private floorSelectedAuraMaterial: THREE.MeshBasicMaterial;
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
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 4. Premium Lighting for Glass & Glossy Spheres
    this.setupLighting();

    // 5. Materials
    // Standard polished brushed titanium/chrome rim
    this.rimOuterMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.90,
      roughness: 0.14,
    });

    // Subtle glowing rim when selected (controlled highlight, no blinding flash)
    this.rimSelectedMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.32,
      metalness: 0.88,
      roughness: 0.12,
    });

    this.rimInnerMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.70,
      roughness: 0.28,
    });

    // Translucent Deep Blue / Flint Glass Tube Body (frames ball with high optical clarity)
    this.glassBodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      roughness: 0.05,
      metalness: 0.10,
      transmission: 0.91,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.94,
      depthWrite: false,
    });

    // Selected Tube Body: Subtle luminous flint glass glow (NO wireframe cage or stripes!)
    this.glassSelectedMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      emissive: 0x0284c7,
      emissiveIntensity: 0.14,
      transparent: true,
      opacity: 0.38,
      roughness: 0.04,
      metalness: 0.10,
      transmission: 0.89,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.96,
      depthWrite: false,
    });

    // Deep Indigo-tinted back wall for internal optical depth & high ball contrast
    this.innerWallMaterial = new THREE.MeshBasicMaterial({
      color: 0x071536,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      depthWrite: false,
    });

    // Realistic floor contact shadows
    this.contactShadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });

    this.penumbraShadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x081333,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

    this.floorAuraMaterial = new THREE.MeshBasicMaterial({
      color: 0x1d4ed8,
      transparent: true,
      opacity: 0.10,
      depthWrite: false,
    });

    // Soft sapphire glow underneath selected tube (NO wireframe cage!)
    this.floorSelectedAuraMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
    });

    // Subtle 3D Environmental Platform Materials
    this.platformBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x09142b,
      roughness: 0.42,
      metalness: 0.75,
    });

    this.platformBevelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.85,
    });

    this.platformRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });

    this.platformAuraMaterial = new THREE.MeshBasicMaterial({
      color: 0x1d4ed8,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });

    // 6. Groups
    this.arenaFloorGroup = new THREE.Group();
    this.tubesGroup = new THREE.Group();
    this.ballsGroup = new THREE.Group();
    this.scene.add(this.arenaFloorGroup);
    this.scene.add(this.tubesGroup);
    this.scene.add(this.ballsGroup);

    // 7. Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    // 8. Start Loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private setupLighting() {
    // Ambient fill with subtle cool tint
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    this.scene.add(ambientLight);

    // Key studio light (crisp spherical highlights on balls)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(-3.2, 5.5, 4.8);
    this.scene.add(keyLight);

    // Fill rim light from right with violet/blue accent
    const rimLight = new THREE.DirectionalLight(0xa5b4fc, 0.75);
    rimLight.position.set(3.8, 2.5, 3.4);
    this.scene.add(rimLight);

    // Subtle bottom bounce light for rounded glass bottom cap
    const bounceLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    bounceLight.position.set(0, -4.0, 2.0);
    this.scene.add(bounceLight);
  }

  private updateCameraForAspect(aspect: number, numTubes: number = 4) {
    const vFovRad = (this.camera.fov * Math.PI) / 180;
    const tanHalfFov = Math.tan(vFovRad / 2);

    let maxX = 0;
    let maxY = 0;
    if (this.tubePositions && this.tubePositions.length > 0) {
      for (const pos of this.tubePositions) {
        if (Math.abs(pos.x) > maxX) maxX = Math.abs(pos.x);
        if (Math.abs(pos.y) > maxY) maxY = Math.abs(pos.y);
      }
    } else {
      const topCount = Math.ceil(numTubes / 2);
      maxX = (topCount * 1.1) / 2;
      maxY = numTubes > 4 ? 1.4 : 0;
    }

    const tubeRadius = SortingRenderer3D.TUBE_RADIUS; // 0.33
    // Generous side margin (0.40) so tubes are never sliced or cut off at phone borders
    const totalHalfWidth = maxX + tubeRadius + 0.40;
    // Generous vertical margin (0.95) for lifted balls and top/bottom HUD clearance
    const totalHalfHeight = maxY + SortingRenderer3D.TUBE_HEIGHT / 2 + 0.95;

    const safeAspect = Math.max(0.32, aspect);
    const requiredZ_X = totalHalfWidth / (tanHalfFov * safeAspect);
    const requiredZ_Y = totalHalfHeight / tanHalfFov;

    const targetZ = Math.max(requiredZ_X, requiredZ_Y, 6.8);
    this.camera.position.set(0, 0, targetZ);
  }

  private handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 600;
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.updateCameraForAspect(aspect, this.currentTubes.length);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Set up or rebuild the level's tubes and balls
   */
  public setLevelState(
    tubes: BallColorKey[][],
    selectedIndex: number | null = null,
    selectedGroupCount: number = 1
  ) {
    this.currentTubes = tubes.map((t) => [...t]);
    this.selectedTubeIndex = selectedIndex;
    this.selectedGroupCount = selectedGroupCount;

    // Clear old visual objects
    while (this.tubesGroup.children.length > 0) {
      this.tubesGroup.remove(this.tubesGroup.children[0]);
    }
    while (this.ballsGroup.children.length > 0) {
      this.ballsGroup.remove(this.ballsGroup.children[0]);
    }
    this.hitTargets = [];
    this.tubeMeshes = [];
    this.tubeAuraMeshes = [];
    this.ballMeshes.clear();

    // Compute layout positions for all tubes
    this.computeLayout(tubes.length);

    // Update camera distance after layout positions are computed
    const aspect = (this.container.clientWidth || 400) / (this.container.clientHeight || 600);
    this.updateCameraForAspect(aspect, tubes.length);
    this.camera.updateProjectionMatrix();

    // Build arena platform (clean continuous floor, no harsh divider line)
    this.buildArenaPlatform(tubes.length);

    // Build each tube and its balls
    this.tubePositions.forEach((pos) => {
      this.buildTubeMesh(pos);
      this.buildBallsForTube(pos);
    });
  }

  /**
   * Build 3D Environmental Arena Floor grounding the tubes.
   * REMOVED the hard horizontal platform disc and torus bevel ring that created
   * an artificial "cracked screen" divider line between rows.
   * Background remains completely seamless and continuous.
   */
  private buildArenaPlatform(numTubes: number) {
    while (this.arenaFloorGroup.children.length > 0) {
      this.arenaFloorGroup.remove(this.arenaFloorGroup.children[0]);
    }
    // Individual tubes cast their own realistic contact and penumbra shadows in buildTubeMesh
  }

  /**
   * Compute responsive tube layout (1 row for <=4 tubes, 2 balanced rows for >=5 tubes)
   */
  private computeLayout(numTubes: number) {
    this.tubePositions = [];

    if (numTubes <= 4) {
      // Single row centered at y = 0
      const spacingX = Math.min(1.15, 3.8 / (numTubes || 1));
      const startX = -((numTubes - 1) * spacingX) / 2;

      for (let i = 0; i < numTubes; i++) {
        this.tubePositions.push({
          index: i,
          x: startX + i * spacingX,
          y: 0,
          row: 0,
        });
      }
    } else {
      // Two rows for 5-11 tubes
      let topCount = Math.ceil(numTubes / 2);
      let bottomCount = Math.floor(numTubes / 2);

      if (numTubes === 5) {
        topCount = 3;
        bottomCount = 2;
      } else if (numTubes === 6) {
        topCount = 3;
        bottomCount = 3;
      } else if (numTubes === 7) {
        topCount = 4;
        bottomCount = 3;
      } else if (numTubes === 8) {
        topCount = 4;
        bottomCount = 4;
      } else if (numTubes === 9) {
        topCount = 5;
        bottomCount = 4;
      } else if (numTubes === 10) {
        topCount = 5;
        bottomCount = 5;
      } else if (numTubes === 11) {
        topCount = 6;
        bottomCount = 5;
      }

      // Vertical row separation (natural spacing without any hard divider line)
      const rowY = 1.38;
      const topSpacingX = Math.min(1.12, 4.4 / topCount);
      const bottomSpacingX = Math.min(1.12, 4.4 / bottomCount);

      const topStartX = -((topCount - 1) * topSpacingX) / 2;
      const bottomStartX = -((bottomCount - 1) * bottomSpacingX) / 2;

      // Top row
      for (let i = 0; i < topCount; i++) {
        this.tubePositions.push({
          index: i,
          x: topStartX + i * topSpacingX,
          y: rowY,
          row: 0,
        });
      }

      // Bottom row
      for (let i = 0; i < bottomCount; i++) {
        const idx = topCount + i;
        this.tubePositions.push({
          index: idx,
          x: bottomStartX + i * bottomSpacingX,
          y: -rowY,
          row: 1,
        });
      }
    }
  }

  /**
   * Build a realistic 3D glass tube with metallic rim, rounded glass base, and soft layered shadows
   */
  private buildTubeMesh(pos: TubeLayoutInfo) {
    const tubeGroup = new THREE.Group();
    const isSelected = this.selectedTubeIndex === pos.index;

    // Subtle 3D lift and scale when selected
    const liftY = isSelected ? 0.08 : 0;
    tubeGroup.position.set(pos.x, pos.y + liftY, 0);
    if (isSelected) {
      tubeGroup.scale.set(1.02, 1.02, 1.02);
    }

    // 1. Dual-Ring Metallic & Glass Top Rim
    const outerRimGeom = new THREE.TorusGeometry(
      SortingRenderer3D.TUBE_RADIUS,
      0.038,
      16,
      48
    );
    outerRimGeom.rotateX(Math.PI / 2);
    const outerRimMesh = new THREE.Mesh(
      outerRimGeom,
      isSelected ? this.rimSelectedMaterial : this.rimOuterMaterial
    );
    outerRimMesh.position.y = SortingRenderer3D.RIM_Y;
    tubeGroup.add(outerRimMesh);

    const innerRimGeom = new THREE.TorusGeometry(
      SortingRenderer3D.TUBE_RADIUS * 0.94,
      0.020,
      12,
      36
    );
    innerRimGeom.rotateX(Math.PI / 2);
    const innerRimMesh = new THREE.Mesh(innerRimGeom, this.rimInnerMaterial);
    innerRimMesh.position.y = SortingRenderer3D.RIM_Y + 0.010;
    tubeGroup.add(innerRimMesh);

    // 2. Transparent High-Refraction Glass Body Cylinder
    const glassMat = isSelected ? this.glassSelectedMaterial : this.glassBodyMaterial;
    const cylGeom = new THREE.CylinderGeometry(
      SortingRenderer3D.TUBE_RADIUS,
      SortingRenderer3D.TUBE_RADIUS,
      SortingRenderer3D.TUBE_HEIGHT,
      40,
      1,
      true
    );
    const cylMesh = new THREE.Mesh(cylGeom, glassMat);
    cylMesh.position.y = SortingRenderer3D.RIM_Y - SortingRenderer3D.TUBE_HEIGHT / 2;
    tubeGroup.add(cylMesh);

    // 3. Inner deep back wall for realistic optical refraction & ball contrast
    const innerGeom = new THREE.CylinderGeometry(
      SortingRenderer3D.TUBE_RADIUS * 0.97,
      SortingRenderer3D.TUBE_RADIUS * 0.97,
      SortingRenderer3D.TUBE_HEIGHT * 0.98,
      28,
      1,
      true
    );
    const innerMesh = new THREE.Mesh(innerGeom, this.innerWallMaterial);
    innerMesh.position.y = cylMesh.position.y;
    tubeGroup.add(innerMesh);

    // 4. Rounded 3D Glass Bottom Cap (Half Sphere)
    const capGeom = new THREE.SphereGeometry(
      SortingRenderer3D.TUBE_RADIUS,
      36,
      18,
      0,
      Math.PI * 2,
      Math.PI / 2,
      Math.PI / 2
    );
    const capMesh = new THREE.Mesh(capGeom, glassMat);
    capMesh.position.y = SortingRenderer3D.RIM_Y - SortingRenderer3D.TUBE_HEIGHT;
    tubeGroup.add(capMesh);

    // 5. Realistic Layered Floor Contact Shadows
    const shadowY = SortingRenderer3D.RIM_Y - SortingRenderer3D.TUBE_HEIGHT - liftY - 0.04;

    // Contact occlusion shadow (tight, dark)
    const contactGeom = new THREE.CircleGeometry(SortingRenderer3D.TUBE_RADIUS * 1.08, 32);
    contactGeom.rotateX(-Math.PI / 2);
    const contactMesh = new THREE.Mesh(contactGeom, this.contactShadowMaterial);
    contactMesh.position.y = shadowY;
    tubeGroup.add(contactMesh);

    // Soft outer penumbra shadow (blurred falloff)
    const penumbraGeom = new THREE.CircleGeometry(SortingRenderer3D.TUBE_RADIUS * 1.75, 32);
    penumbraGeom.rotateX(-Math.PI / 2);
    const penumbraMesh = new THREE.Mesh(penumbraGeom, this.penumbraShadowMaterial);
    penumbraMesh.position.y = shadowY - 0.005;
    tubeGroup.add(penumbraMesh);

    // Ambient arena floor aura
    const auraGeom = new THREE.CircleGeometry(SortingRenderer3D.TUBE_RADIUS * 2.3, 32);
    auraGeom.rotateX(-Math.PI / 2);
    const auraMesh = new THREE.Mesh(
      auraGeom,
      isSelected ? this.floorSelectedAuraMaterial : this.floorAuraMaterial
    );
    auraMesh.position.y = shadowY - 0.01;
    tubeGroup.add(auraMesh);
    this.tubeAuraMeshes[pos.index] = auraMesh;

    // 6. Invisible Hit Target Cylinder for comfortable touch/click raycasting
    const hitGeom = new THREE.CylinderGeometry(
      SortingRenderer3D.TUBE_RADIUS * 1.5,
      SortingRenderer3D.TUBE_RADIUS * 1.5,
      SortingRenderer3D.TUBE_HEIGHT + 0.9,
      16
    );
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeom, hitMat);
    hitMesh.position.y = SortingRenderer3D.RIM_Y - SortingRenderer3D.TUBE_HEIGHT / 2 + 0.2;
    hitMesh.userData = { tubeIndex: pos.index };
    tubeGroup.add(hitMesh);
    this.hitTargets.push(hitMesh);

    // Add to scene & tracking
    this.tubesGroup.add(tubeGroup);
    this.tubeMeshes[pos.index] = tubeGroup;
  }

  /**
   * Build 3D balls inside the given tube.
   * STRICT CONSTANT DIAMETER:
   * Every single ball uses the exact same BALL_RADIUS.
   * Balls are always solidly and safely seated inside the tube at resting state.
   */
  private buildBallsForTube(pos: TubeLayoutInfo) {
    const balls = this.currentTubes[pos.index] || [];
    const isThisTubeSelected = this.selectedTubeIndex === pos.index;
    const liftY = isThisTubeSelected ? 0.08 : 0;

    balls.forEach((colorKey, ballIdx) => {
      // Ball rests solidly inside tube at constant spherical diameter (never shrunk!)
      const ballX = pos.x;
      const ballY =
        pos.y +
        liftY +
        SortingRenderer3D.BALL_BOTTOM_Y +
        ballIdx * SortingRenderer3D.BALL_SPACING;

      const ballMesh = this.createBallMesh(colorKey);
      ballMesh.position.set(ballX, ballY, 0);

      this.ballsGroup.add(ballMesh);
      const key = `${pos.index}_${ballIdx}`;
      this.ballMeshes.set(key, ballMesh);
    });
  }

  /**
   * Create a single glossy 3D ball mesh with authentic spherical reflections
   * Uses CONSTANT BALL_RADIUS - NO SCALING!
   */
  public createBallMesh(colorKey: BallColorKey): THREE.Mesh {
    const colorDef = BALL_COLORS[colorKey] || BALL_COLORS.yellow;
    // Sphere geometry with authentic constant physical radius
    const geom = new THREE.SphereGeometry(SortingRenderer3D.BALL_RADIUS, 32, 32);

    const mat = new THREE.MeshPhysicalMaterial({
      color: colorDef.threeColor,
      roughness: 0.12,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.90,
    });

    return new THREE.Mesh(geom, mat);
  }

  /**
   * SEQUENTIAL AUTOMATIC GROUP MOVE (THE FOLLOW-THE-LEADER CHAIN):
   * When player taps destination ONCE:
   * Ball 1 lifts out through the rim, arcs across the arena, drops, and settles into slot 0.
   * ~135ms later, Ball 2 automatically lifts out, arcs, drops, and settles into slot 1.
   * ~135ms later, Ball 3 automatically lifts out, arcs, drops, and settles into slot 2.
   * Each ball is an individual physical object with its own audio cue!
   */
  public animateSequentialGroupMove(
    fromIndex: number,
    toIndex: number,
    colorKey: BallColorKey,
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

    // Remove the static ball meshes that are being moved from the source tube
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

    // The top ball moves first (i = 0), followed by the ball underneath it (i = 1), etc.
    for (let i = 0; i < count; i++) {
      const mesh = this.createBallMesh(colorKey);
      // Staggered launch delay: ~135ms between consecutive balls
      const startDelayMs = i * 135;
      const sourceRestIdx = sourceTotal - 1 - i;
      const sourceRestY =
        fromPos.y +
        fromLiftY +
        SortingRenderer3D.BALL_BOTTOM_Y +
        sourceRestIdx * SortingRenderer3D.BALL_SPACING;

      // Positioned exactly where it rested inside the source tube
      mesh.position.set(fromPos.x, sourceRestY, 0);
      this.ballsGroup.add(mesh);

      const targetSlotIndex = destStartCount + i;
      const destFinalY =
        toPos.y +
        SortingRenderer3D.BALL_BOTTOM_Y +
        targetSlotIndex * SortingRenderer3D.BALL_SPACING;

      const sourceRimY = fromPos.y + SortingRenderer3D.RIM_Y + 0.30;
      const destRimY = toPos.y + SortingRenderer3D.RIM_Y + 0.30;

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
      onComplete: () => {
        movingBalls.forEach((b) => {
          this.ballsGroup.remove(b.mesh);
        });
        this.activeAnimation = null;
        onComplete();
      },
    };
  }

  /**
   * Backwards-compatible group move delegation
   */
  public animateGroupMove(
    fromIndex: number,
    toIndex: number,
    colorKey: BallColorKey,
    count: number,
    destStartCount: number,
    onComplete: () => void
  ) {
    this.animateSequentialGroupMove(
      fromIndex,
      toIndex,
      colorKey,
      count,
      destStartCount,
      () => {},
      () => {},
      onComplete
    );
  }

  /**
   * Single-ball move delegation
   */
  public animateMove(
    fromIndex: number,
    toIndex: number,
    colorKey: BallColorKey,
    onComplete: () => void
  ) {
    const destBallCount = this.currentTubes[toIndex] ? this.currentTubes[toIndex].length : 0;
    this.animateSequentialGroupMove(
      fromIndex,
      toIndex,
      colorKey,
      1,
      destBallCount,
      () => {},
      () => {},
      onComplete
    );
  }

  /**
   * Shake destination tube when an invalid move is attempted
   */
  public shakeTube(tubeIndex: number) {
    this.shakingTubes.set(tubeIndex, {
      startTime: performance.now(),
      duration: 220,
    });
  }

  /**
   * Raycast from screen coordinates to find which tube was tapped
   */
  public getTubeAtCoordinates(clientX: number, clientY: number): number | null {
    if (!this.container || !this.camera) return null;
    const rect = this.container.getBoundingClientRect();

    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.hitTargets, false);

    if (intersects.length > 0) {
      const target = intersects[0].object;
      return target.userData.tubeIndex !== undefined ? target.userData.tubeIndex : null;
    }

    return null;
  }

  /**
   * Main Render and Animation Loop
   */
  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const now = performance.now();

    // 1. Handle Active Sequential Chain Animation
    if (this.activeAnimation) {
      const anim = this.activeAnimation;
      let allDone = true;

      anim.balls.forEach((ball) => {
        if (ball.phase === 'WAITING') {
          allDone = false;
          if (now >= ball.startTime) {
            ball.phase = 'LIFT';
            ball.progress = 0;
            ball.hasLaunched = true;
            anim.onBallLaunch(ball.stepIndex);
          }
        } else if (ball.phase === 'LIFT') {
          allDone = false;
          // Smooth vertical lift out of the source tube through the rim (~100ms)
          ball.progress += 0.14;
          if (ball.progress < 1) {
            const t = ball.progress;
            const smoothT = t * t * (3 - 2 * t);
            const currentY = ball.sourceRestY + (ball.sourceRimY - ball.sourceRestY) * smoothT;
            ball.mesh.position.set(ball.startX, currentY, 0);
          } else {
            ball.phase = 'ARC';
            ball.progress = 0;
            ball.mesh.position.set(ball.startX, ball.sourceRimY, 0);
          }
        } else if (ball.phase === 'ARC') {
          allDone = false;
          // Smooth parabolic arc across tubes (~190ms)
          ball.progress += 0.08;
          if (ball.progress < 1) {
            const t = ball.progress;
            const currentX = ball.startX + (ball.destX - ball.startX) * t;
            const arcLift = Math.sin(t * Math.PI) * 0.40;
            const currentY =
              ball.sourceRimY + (ball.destRimY - ball.sourceRimY) * t + arcLift;
            ball.mesh.position.set(currentX, currentY, 0);
          } else {
            ball.phase = 'DROP';
            ball.progress = 0;
            ball.mesh.position.set(ball.destX, ball.destRimY, 0);
          }
        } else if (ball.phase === 'DROP') {
          allDone = false;
          // Gravity acceleration drop into destination tube (~120ms)
          ball.progress += 0.12;
          if (ball.progress < 1) {
            const t = ball.progress * ball.progress; // Quadratic gravity
            const currentY = ball.destRimY + (ball.destFinalY - ball.destRimY) * t;
            ball.mesh.position.set(ball.destX, currentY, 0);
          } else {
            ball.phase = 'BOUNCE';
            ball.progress = 0;
            ball.hasSettled = true;
            anim.onBallSettle(ball.stepIndex);
          }
        } else if (ball.phase === 'BOUNCE') {
          allDone = false;
          // Subtle settling bounce as marble docks (~70ms)
          ball.progress += 0.18;
          if (ball.progress < 1) {
            const bounceOffset = Math.sin(ball.progress * Math.PI) * 0.035;
            ball.mesh.position.set(ball.destX, ball.destFinalY + bounceOffset, 0);
          } else {
            ball.phase = 'DONE';
            ball.mesh.position.set(ball.destX, ball.destFinalY, 0);
          }
        }
      });

      if (allDone) {
        anim.onComplete();
      }
    }

    // 2. Handle Tube Shakes on Invalid Moves
    this.shakingTubes.forEach((shake, tubeIndex) => {
      const elapsed = now - shake.startTime;
      const tubeGroup = this.tubeMeshes[tubeIndex];
      const pos = this.tubePositions[tubeIndex];

      if (tubeGroup && pos) {
        if (elapsed < shake.duration) {
          const progress = elapsed / shake.duration;
          const damping = 1 - progress;
          const offsetX = Math.sin(progress * Math.PI * 6) * 0.065 * damping;
          tubeGroup.position.x = pos.x + offsetX;
        } else {
          tubeGroup.position.x = pos.x;
          this.shakingTubes.delete(tubeIndex);
        }
      }
    });

    // 3. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Cleanup and dispose WebGL resources
   */
  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
