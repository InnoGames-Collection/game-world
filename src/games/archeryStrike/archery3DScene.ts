/**
 * Archery Strike 3D - High-Performance WebGL/Three.js First-Person Archery Engine
 * 
 * Features:
 * - First-Person Human-Eye Level Perspective with Camera-Rigged Recurve Bow & Archer Hand
 * - Dynamic 3D Bow Limbs Flexing, Animated Draw String & Nocked Arrow
 * - Real 3D Archery Range: Grassy turf, distance lane markers, trees, distant mountain silhouettes, sky dome & lighting
 * - Physical 3D Targets with Depth, Multi-Layer Tournament Ring Faceplates, Wooden A-Frame Stands & Wobble Physics
 * - Target Manager supporting 1, 2, 3+ simultaneous targets, elevated ridges, and moving target tracks
 * - Ballistic Projectile Engine: Launch velocity, gravity drop arc, crosswind deflection, velocity vector alignment
 * - Physical Arrow Embedding on Target Faceplate (persists across multiple shots)
 */

import * as THREE from 'three';
import { TargetConfig, StageDefinition, RingType } from './types';

export interface HitResult {
  hit: boolean;
  targetId?: string;
  ring: RingType;
  points: number;
  distanceFromCenter: number; // in meters
  hitNormalizedX: number; // -1 to 1
  hitNormalizedY: number; // -1 to 1
  worldHitPos: THREE.Vector3;
}

export class Archery3DScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private isDisposed: boolean = false;

  // Environment & Lighting
  private dirLight: THREE.DirectionalLight | null = null;
  private groundMesh: THREE.Mesh | null = null;
  private mountainGroup: THREE.Group = new THREE.Group();
  private sceneryGroup: THREE.Group = new THREE.Group();
  private windPennant: THREE.Mesh | null = null;
  private windParticles: THREE.Points | null = null;
  private windParticlePositions: Float32Array | null = null;

  // Impact Particle Effects
  private particleGroup: THREE.Group = new THREE.Group();
  private activeImpactParticles: Array<{
    mesh: THREE.Points;
    velocities: THREE.Vector3[];
    life: number;
    maxLife: number;
  }> = [];

  // First-Person Bow & Archer Rig
  private bowRig: THREE.Group = new THREE.Group();
  private upperLimb: THREE.Mesh | null = null;
  private lowerLimb: THREE.Mesh | null = null;
  private bowGrip: THREE.Mesh | null = null;
  private bowStringLine: THREE.Line | null = null;
  private stringPositions: Float32Array | null = null;
  private nockedArrow: THREE.Group = new THREE.Group();
  private archerHand: THREE.Group = new THREE.Group();
  private bowSightPin: THREE.Mesh | null = null;
  private stabilizerRod: THREE.Group = new THREE.Group();

  // Aiming State
  private aimYaw: number = 0; // horizontal angle (-0.4 to 0.4 rad)
  private aimPitch: number = 0; // vertical angle (-0.3 to 0.5 rad)
  private currentDrawPower: number = 0; // 0 to 1
  private isAimingActive: boolean = false;

  // Targets
  private targetGroup: THREE.Group = new THREE.Group();
  private activeTargets: Map<string, {
    config: TargetConfig;
    mesh: THREE.Group;
    targetBoard: THREE.Mesh;
    standGroup: THREE.Group;
    wobbleAmount: number;
    wobbleVelocity: number;
    embeddedArrows: THREE.Group[];
  }> = new Map();

  // In-Flight Arrow Ballistics
  private activeArrow: {
    group: THREE.Group;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    trailPoints: THREE.Vector3[];
    trailLine: THREE.Line | null;
    isFlying: boolean;
    flightTime: number;
    targetZ: number;
    windVector: THREE.Vector3;
    onHitCallback?: (res: HitResult) => void;
  } | null = null;

  // Camera Shake & Recoil
  private cameraRecoilY: number = 0;
  private cameraRecoilVelocity: number = 0;

  // Current Active Stage
  private currentStage: StageDefinition | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene & Camera (Human eye level ~1.55m)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x071B2D); // EthioFantasy Deep Navy Atmosphere
    this.scene.fog = new THREE.FogExp2(0x071B2D, 0.008);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(52, width / height, 0.08, 350);
    this.camera.position.set(0, 1.55, 0); // Player eye level
    this.camera.rotation.order = 'YXZ';

    // 2. High-Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    container.appendChild(this.renderer.domElement);

    // 3. Build World
    this.setupLighting();
    this.buildArcheryRangeEnvironment();
    this.buildWindParticles();
    this.buildFirstPersonBowRig();

    this.scene.add(this.targetGroup);
    this.scene.add(this.mountainGroup);
    this.scene.add(this.sceneryGroup);
    this.scene.add(this.particleGroup);

    // Attach Bow Rig to Camera so it moves with view
    this.camera.add(this.bowRig);
    this.scene.add(this.camera);

    // 4. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();

    // Handle Window Resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  // =========================================================================
  // 1. LIGHTING & ENVIRONMENT
  // =========================================================================

  private setupLighting() {
    // Ambient Light with subtle warm tint
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    this.scene.add(ambientLight);

    // Hemisphere Light for natural sky-to-ground bounce
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x166534, 0.65);
    this.scene.add(hemiLight);

    // Directional Sun Light casting crisp soft shadows
    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    this.dirLight.position.set(25, 45, -20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    this.dirLight.shadow.camera.left = -30;
    this.dirLight.shadow.camera.right = 30;
    this.dirLight.shadow.camera.top = 30;
    this.dirLight.shadow.camera.bottom = -10;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);
  }

  private buildArcheryRangeEnvironment() {
    // 1. Ground Turf (Layered tournament green pitch)
    const groundGeo = new THREE.PlaneGeometry(160, 200, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a5c32,
      roughness: 0.85,
      metalness: 0.05,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.set(0, 0, 70);
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // 2. Central Shooting Lane Carpet (Rich Pitch Green #0A7C45 with white boundary markers)
    const laneGeo = new THREE.PlaneGeometry(12, 180);
    const laneMat = new THREE.MeshStandardMaterial({
      color: 0x0a7c45,
      roughness: 0.8,
    });
    const laneMesh = new THREE.Mesh(laneGeo, laneMat);
    laneMesh.rotation.x = -Math.PI / 2;
    laneMesh.position.set(0, 0.01, 75);
    laneMesh.receiveShadow = true;
    this.scene.add(laneMesh);

    // Distance Yardage Ground Stripes (30m, 40m, 50m, 60m, 70m)
    const distances = [30, 40, 50, 60, 70];
    distances.forEach((dist) => {
      // White boundary ground stripe
      const stripeGeo = new THREE.PlaneGeometry(10, 0.35);
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
      });
      const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
      stripeMesh.rotation.x = -Math.PI / 2;
      stripeMesh.position.set(0, 0.02, dist);
      this.scene.add(stripeMesh);

      // Distance indicator posts on lane shoulders
      [-5.5, 5.5].forEach((sideX) => {
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
        const postMesh = new THREE.Mesh(postGeo, postMat);
        postMesh.position.set(sideX, 0.6, dist);
        postMesh.castShadow = true;
        this.sceneryGroup.add(postMesh);

        // Distance Signboard Plate
        const signGeo = new THREE.BoxGeometry(0.8, 0.4, 0.05);
        const signMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.4 }); // Gold EthioFantasy accent
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(sideX, 1.1, dist);
        this.sceneryGroup.add(signMesh);
      });
    });

    // 3. Background Mountain Silhouettes & Distant Ridges
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 0.9 - Math.PI * 0.45;
      const dist = 110 + (i % 3) * 15;
      const height = 22 + Math.sin(i * 1.5) * 12 + (i % 2) * 8;
      const width = 35 + (i % 4) * 10;

      const coneGeo = new THREE.ConeGeometry(width, height, 5);
      const coneMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x051d38 : 0x082b52,
        roughness: 0.95,
        flatShading: true,
      });
      const mountain = new THREE.Mesh(coneGeo, coneMat);
      mountain.position.set(
        Math.sin(angle) * dist,
        height * 0.45 - 2,
        Math.cos(angle) * dist + 40
      );
      this.mountainGroup.add(mountain);
    }

    // 4. Stylized 3D Flanking Pine Trees along range borders
    for (let z = 15; z <= 100; z += 12) {
      [-8.5 - Math.random() * 6, 8.5 + Math.random() * 6].forEach((x) => {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 2.5, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.25;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage Cones (Layered)
        for (let l = 0; l < 3; l++) {
          const coneGeo = new THREE.ConeGeometry(2.2 - l * 0.5, 2.2, 6);
          const coneMat = new THREE.MeshStandardMaterial({
            color: l === 0 ? 0x064e3b : l === 1 ? 0x047857 : 0x059669,
            roughness: 0.85,
            flatShading: true,
          });
          const foliage = new THREE.Mesh(coneGeo, coneMat);
          foliage.position.y = 2.4 + l * 1.3;
          foliage.castShadow = true;
          treeGroup.add(foliage);
        }

        treeGroup.position.set(x, 0, z);
        this.sceneryGroup.add(treeGroup);
      });
    }

    // 5. Dynamic Wind Indicator Pole & Pennant Flag at 25m mark
    const flagStaffGeo = new THREE.CylinderGeometry(0.04, 0.05, 4.2, 8);
    const flagStaffMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
    const flagStaff = new THREE.Mesh(flagStaffGeo, flagStaffMat);
    flagStaff.position.set(-4.2, 2.1, 25);
    flagStaff.castShadow = true;
    this.sceneryGroup.add(flagStaff);

    // Pennant cloth
    const pennantGeo = new THREE.ConeGeometry(0.28, 1.4, 3);
    const pennantMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f, // Gold tournament ribbon
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    this.windPennant = new THREE.Mesh(pennantGeo, pennantMat);
    this.windPennant.position.set(-4.2, 4.0, 25);
    this.windPennant.rotation.z = -Math.PI / 2;
    this.sceneryGroup.add(this.windPennant);
  }

  private buildWindParticles() {
    const particleCount = 120;
    const geo = new THREE.BufferGeometry();
    this.windParticlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      this.windParticlePositions[i * 3] = (Math.random() - 0.5) * 24;
      this.windParticlePositions[i * 3 + 1] = 0.5 + Math.random() * 5.0;
      this.windParticlePositions[i * 3 + 2] = 5 + Math.random() * 75;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.windParticlePositions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xa7f3d0,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
    });
    this.windParticles = new THREE.Points(geo, mat);
    this.scene.add(this.windParticles);
  }

  // =========================================================================
  // 2. FIRST-PERSON 3D RECURVE BOW & ARCHER RIG
  // =========================================================================

  private buildFirstPersonBowRig() {
    this.bowRig.position.set(0.18, -0.22, -0.62); // Position in lower 20-30% of viewport
    this.bowRig.rotation.set(0.04, -0.05, 0.06);

    // 1. Bow Riser (Center Grip section)
    const riserGeo = new THREE.BoxGeometry(0.045, 0.22, 0.06);
    const riserMat = new THREE.MeshStandardMaterial({
      color: 0x071b2d, // Deep Navy Riser
      roughness: 0.35,
      metalness: 0.65,
    });
    this.bowGrip = new THREE.Mesh(riserGeo, riserMat);
    this.bowGrip.position.set(0, 0, 0);
    this.bowRig.add(this.bowGrip);

    // Gold Accent Grip Trim (#FFD54F)
    const gripWrapGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.12, 12);
    const gripWrapMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      roughness: 0.5,
      metalness: 0.4,
    });
    const gripWrap = new THREE.Mesh(gripWrapGeo, gripWrapMat);
    this.bowGrip.add(gripWrap);

    // 2. Front Stabilizer Rod & Counterweight
    const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.38, 8);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.x = Math.PI / 2;
    rod.position.set(0, 0, 0.2);
    this.stabilizerRod.add(rod);

    const weightGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 12);
    const weightMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.9, roughness: 0.2 });
    const weight = new THREE.Mesh(weightGeo, weightMat);
    weight.rotation.x = Math.PI / 2;
    weight.position.set(0, 0, 0.38);
    this.stabilizerRod.add(weight);

    this.bowRig.add(this.stabilizerRod);

    // 3. Precision Aiming Sight Block & Fiber-Optic Pin
    const sightBarGeo = new THREE.BoxGeometry(0.01, 0.08, 0.015);
    const sightBarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const sightBar = new THREE.Mesh(sightBarGeo, sightBarMat);
    sightBar.position.set(-0.035, 0.08, 0.06);
    this.bowRig.add(sightBar);

    const pinGeo = new THREE.SphereGeometry(0.006, 8, 8);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 }); // Luminous green sight pin
    this.bowSightPin = new THREE.Mesh(pinGeo, pinMat);
    this.bowSightPin.position.set(-0.035, 0.08, 0.075);
    this.bowRig.add(this.bowSightPin);

    // 4. Upper Curved Limb (Curved Recurve Geometry)
    const upperCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(-0.01, 0.28, 0.04),
      new THREE.Vector3(-0.02, 0.48, -0.04),
      new THREE.Vector3(-0.01, 0.58, -0.12),
    ]);
    const upperLimbGeo = new THREE.TubeGeometry(upperCurve, 16, 0.018, 8, false);
    const limbMat = new THREE.MeshStandardMaterial({
      color: 0x00c853, // Accent Green Limb body
      roughness: 0.3,
      metalness: 0.5,
    });
    this.upperLimb = new THREE.Mesh(upperLimbGeo, limbMat);
    this.bowRig.add(this.upperLimb);

    // 5. Lower Curved Limb
    const lowerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.1, 0),
      new THREE.Vector3(-0.01, -0.28, 0.04),
      new THREE.Vector3(-0.02, -0.48, -0.04),
      new THREE.Vector3(-0.01, -0.58, -0.12),
    ]);
    const lowerLimbGeo = new THREE.TubeGeometry(lowerCurve, 16, 0.018, 8, false);
    this.lowerLimb = new THREE.Mesh(lowerLimbGeo, limbMat);
    this.bowRig.add(this.lowerLimb);

    // Gold Limb Tip Nocks
    [-0.58, 0.58].forEach((tipY) => {
      const tipGeo = new THREE.ConeGeometry(0.022, 0.06, 8);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.8, roughness: 0.2 });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.set(-0.01, tipY, -0.12);
      tipMesh.rotation.x = tipY > 0 ? -Math.PI * 0.6 : Math.PI * 0.6;
      this.bowRig.add(tipMesh);
    });

    // 6. Dynamic Bowstring (3-Point Line: Top Tip -> Center Nock Point -> Bottom Tip)
    this.stringPositions = new Float32Array([
      -0.01, 0.58, -0.12,  // Top tip
      -0.01, 0.0, -0.05,   // Center nock point (moves backward during draw)
      -0.01, -0.58, -0.12, // Bottom tip
    ]);
    const stringGeo = new THREE.BufferGeometry();
    stringGeo.setAttribute('position', new THREE.BufferAttribute(this.stringPositions, 3));
    const stringMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    this.bowStringLine = new THREE.Line(stringGeo, stringMat);
    this.bowRig.add(this.bowStringLine);

    // 7. Nocked Arrow
    this.buildNockedArrowMesh();
    this.bowRig.add(this.nockedArrow);

    // 8. Archer Hand & Forearm with Leather Bracer
    this.buildArcherHandMesh();
    this.bowRig.add(this.archerHand);
  }

  private buildNockedArrowMesh() {
    // Arrow Shaft (Wood/carbon cylinder)
    const shaftGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.78, 8);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, 0, 0.32);
    this.nockedArrow.add(shaft);

    // Metallic Arrowhead Broadhead
    const tipGeo = new THREE.ConeGeometry(0.018, 0.07, 6);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.rotation.x = -Math.PI / 2;
    tip.position.set(0, 0, 0.73);
    this.nockedArrow.add(tip);

    // Red & Gold Fletching Feathers (3 vanes at 120°)
    for (let f = 0; f < 3; f++) {
      const fletchGeo = new THREE.BoxGeometry(0.002, 0.024, 0.1);
      const fletchMat = new THREE.MeshStandardMaterial({
        color: f === 0 ? 0xffd54f : 0xdc2626,
        roughness: 0.6,
      });
      const fletch = new THREE.Mesh(fletchGeo, fletchMat);
      fletch.position.set(0, 0, -0.04);
      fletch.rotation.z = (f * Math.PI * 2) / 3;
      this.nockedArrow.add(fletch);
    }

    this.nockedArrow.position.set(-0.01, 0.02, -0.05);
  }

  private buildArcherHandMesh() {
    // Archer's Left Forearm & Hand holding the riser
    const forearmGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.42, 10);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }); // Natural skin tone
    const forearm = new THREE.Mesh(forearmGeo, skinMat);
    forearm.position.set(-0.06, -0.22, 0.12);
    forearm.rotation.set(0.4, 0.2, -0.3);
    this.archerHand.add(forearm);

    // Archery Bracer (Armguard) with gold trim
    const bracerGeo = new THREE.CylinderGeometry(0.048, 0.057, 0.26, 10, 1, true, 0, Math.PI * 1.4);
    const bracerMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
    const bracer = new THREE.Mesh(bracerGeo, bracerMat);
    bracer.position.set(-0.06, -0.2, 0.12);
    bracer.rotation.set(0.4, 0.2, -0.3);
    this.archerHand.add(bracer);

    // Archer Finger Wraps / Archery Glove
    const gloveGeo = new THREE.BoxGeometry(0.07, 0.09, 0.08);
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const glove = new THREE.Mesh(gloveGeo, gloveMat);
    glove.position.set(-0.01, -0.02, 0.01);
    this.archerHand.add(glove);
  }

  // =========================================================================
  // 3. TARGET CREATION & MANAGEMENT
  // =========================================================================

  public setStage(stage: StageDefinition) {
    this.currentStage = stage;

    // Clear existing target meshes
    this.activeTargets.forEach((t) => {
      this.targetGroup.remove(t.mesh);
    });
    this.activeTargets.clear();

    // Spawn targets for current stage
    stage.targets.forEach((config) => {
      const targetMeshGroup = this.create3DTarget(config, stage.targetScale);
      this.targetGroup.add(targetMeshGroup.group);

      this.activeTargets.set(config.id, {
        config,
        mesh: targetMeshGroup.group,
        targetBoard: targetMeshGroup.board,
        standGroup: targetMeshGroup.stand,
        wobbleAmount: 0,
        wobbleVelocity: 0,
        embeddedArrows: [],
      });
    });

    // Reset Bow state
    this.currentDrawPower = 0;
    this.isAimingActive = false;
    this.updateBowDraw(0);
  }

  private create3DTarget(config: TargetConfig, scaleFactor: number = 1.0) {
    const group = new THREE.Group();
    const radius = config.radius * scaleFactor;

    // 1. Target Faceplate Cylinder (with actual physical depth ~0.14m)
    const boardGeo = new THREE.CylinderGeometry(radius, radius, 0.14, 32);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.05,
    });
    const targetBoard = new THREE.Mesh(boardGeo, boardMat);
    targetBoard.rotation.x = Math.PI / 2;
    targetBoard.castShadow = true;
    targetBoard.receiveShadow = true;
    group.add(targetBoard);

    // Outer Straw/Foam Rim Layer (Dark frame)
    const rimGeo = new THREE.TorusGeometry(radius + 0.02, 0.035, 12, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    group.add(rimMesh);

    // 2. Concentric Scoring Rings (Physical Discs attached to front face)
    const rings = [
      { r: radius * 1.00, color: 0xf8fafc }, // White Outer Ring (2/1 pts)
      { r: radius * 0.80, color: 0x1e293b }, // Black Ring (4/3 pts)
      { r: radius * 0.60, color: 0x0284c7 }, // Blue Ring (6/5 pts)
      { r: radius * 0.40, color: 0xdc2626 }, // Red Ring (8/7 pts)
      { r: radius * 0.20, color: 0xffd54f }, // Gold Bullseye Center (10/9 pts)
    ];

    rings.forEach((ring, idx) => {
      const ringGeo = new THREE.CircleGeometry(ring.r, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: ring.color,
        roughness: 0.5,
        metalness: ring.color === 0xffd54f ? 0.3 : 0.05,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.z = 0.072 + idx * 0.001; // Slightly layered to prevent z-fighting
      group.add(ringMesh);
    });

    // Center Crosshairs Pin
    const pinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.rotation.x = Math.PI / 2;
    pinMesh.position.z = 0.085;
    group.add(pinMesh);

    // 3. Heavy Wooden A-Frame Stand
    const stand = new THREE.Group();
    const legLength = config.y + radius + 0.6;

    // Left & Right Front Legs
    [-radius * 0.7, radius * 0.7].forEach((legX) => {
      const legGeo = new THREE.CylinderGeometry(0.045, 0.055, legLength, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(legX, -legLength * 0.38, 0.05);
      leg.rotation.z = legX < 0 ? -0.15 : 0.15;
      leg.rotation.x = 0.08;
      leg.castShadow = true;
      stand.add(leg);
    });

    // Rear Support Strut Leg
    const rearLegGeo = new THREE.CylinderGeometry(0.04, 0.05, legLength * 1.05, 8);
    const rearLegMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const rearLeg = new THREE.Mesh(rearLegGeo, rearLegMat);
    rearLeg.position.set(0, -legLength * 0.38, -0.45);
    rearLeg.rotation.x = -0.32;
    rearLeg.castShadow = true;
    stand.add(rearLeg);

    group.add(stand);

    // Set initial position
    group.position.set(config.x, config.y, config.z);

    return { group, board: targetBoard, stand };
  }

  // =========================================================================
  // 4. AIMING & BOW TENSION DRAW MECHANICS
  // =========================================================================

  public setAim(yaw: number, pitch: number, power: number) {
    this.aimYaw = Math.max(-0.45, Math.min(0.45, yaw));
    this.aimPitch = Math.max(-0.25, Math.min(0.45, pitch));
    this.currentDrawPower = Math.max(0, Math.min(1.0, power));
    this.isAimingActive = power > 0.02;

    // Apply smooth camera and bow orientation
    this.camera.rotation.y = -this.aimYaw;
    this.camera.rotation.x = this.aimPitch;

    this.updateBowDraw(this.currentDrawPower);
  }

  private updateBowDraw(power: number) {
    if (!this.stringPositions || !this.bowStringLine) return;

    // String center moves backward up to 0.38m with draw power
    const drawPullZ = -0.05 - power * 0.38;
    this.stringPositions[3] = -0.01;
    this.stringPositions[4] = 0.0;
    this.stringPositions[5] = drawPullZ;

    this.bowStringLine.geometry.attributes.position.needsUpdate = true;

    // Nocked arrow moves back with string
    this.nockedArrow.position.z = drawPullZ;

    // Bow limbs flex slightly under tension
    if (this.upperLimb && this.lowerLimb) {
      this.upperLimb.rotation.x = power * 0.08;
      this.lowerLimb.rotation.x = -power * 0.08;
    }

    // Subtle bow tremor during full draw
    if (power > 0.8) {
      const jitter = (Math.random() - 0.5) * 0.002 * power;
      this.bowRig.position.x = 0.18 + jitter;
      this.bowRig.position.y = -0.22 + jitter;
    } else {
      this.bowRig.position.set(0.18, -0.22, -0.62);
    }
  }

  // =========================================================================
  // 5. BALLISTIC ARROW LAUNCH & TRAJECTORY SIMULATION
  // =========================================================================

  public launchArrow(onHit: (res: HitResult) => void): boolean {
    if (this.currentDrawPower < 0.15 || this.activeArrow) return false;

    // Hide nocked arrow on bow during flight
    this.nockedArrow.visible = false;

    // Calculate Arrow Launch World Position & Velocity Vector
    const launchPos = new THREE.Vector3();
    this.nockedArrow.getWorldPosition(launchPos);

    // Initial arrow speed: ~56 m/s scaled by draw power
    const launchSpeed = 40 + this.currentDrawPower * 22;

    // Direction vector from camera orientation with ballistic elevation
    const launchDir = new THREE.Vector3(0, 0, 1);
    launchDir.applyEuler(new THREE.Euler(this.aimPitch + 0.015, -this.aimYaw, 0, 'YXZ'));
    launchDir.normalize();

    const velocity = launchDir.multiplyScalar(launchSpeed);

    // Wind Vector (m/s)
    let windVec = new THREE.Vector3(0, 0, 0);
    if (this.currentStage) {
      const windRad = (this.currentStage.wind.directionDegrees * Math.PI) / 180;
      // Crosswind component affects X and Y
      windVec.x = Math.sin(windRad) * this.currentStage.wind.speed * 0.14;
      windVec.y = Math.cos(windRad) * this.currentStage.wind.speed * 0.04;
    }

    // Create 3D In-Flight Arrow Group
    const arrowGroup = this.createArrowMesh();
    arrowGroup.position.copy(launchPos);
    this.scene.add(arrowGroup);

    // Target Z distance threshold for impact checking
    const targetZ = this.currentStage ? this.currentStage.targetDistance : 40;

    // Create subtle glowing trail line for flight visibility
    const trailGeo = new THREE.BufferGeometry().setFromPoints([launchPos.clone(), launchPos.clone()]);
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xffd54f,
      transparent: true,
      opacity: 0.7,
      linewidth: 2,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    this.scene.add(trailLine);

    this.activeArrow = {
      group: arrowGroup,
      pos: launchPos.clone(),
      vel: velocity,
      trailPoints: [launchPos.clone()],
      trailLine,
      isFlying: true,
      flightTime: 0,
      targetZ,
      windVector: windVec,
      onHitCallback: onHit,
    };

    // Camera shot recoil
    this.cameraRecoilVelocity = -0.015;

    // Release bowstring tension snap
    this.updateBowDraw(0);

    return true;
  }

  private createArrowMesh(): THREE.Group {
    const group = new THREE.Group();

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.78, 8);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2;
    group.add(shaft);

    // Arrowhead Broadhead
    const tipGeo = new THREE.ConeGeometry(0.018, 0.07, 6);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.rotation.x = -Math.PI / 2;
    tip.position.z = 0.41;
    group.add(tip);

    // Fletching Feathers
    for (let f = 0; f < 3; f++) {
      const fletchGeo = new THREE.BoxGeometry(0.002, 0.024, 0.1);
      const fletchMat = new THREE.MeshStandardMaterial({
        color: f === 0 ? 0xffd54f : 0xdc2626,
        roughness: 0.6,
      });
      const fletch = new THREE.Mesh(fletchGeo, fletchMat);
      fletch.position.set(0, 0, -0.35);
      fletch.rotation.z = (f * Math.PI * 2) / 3;
      group.add(fletch);
    }

    return group;
  }

  // =========================================================================
  // 6. ANIMATION & TICK LOOP (PHYSICS & MOVING TARGETS)
  // =========================================================================

  private animate() {
    if (this.isDisposed) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    const dt = 0.016; // Standard 60fps delta time
    const timeNow = performance.now() * 0.001;

    // 1. Camera Recoil Spring Return
    if (Math.abs(this.cameraRecoilY) > 0.0001 || Math.abs(this.cameraRecoilVelocity) > 0.0001) {
      this.cameraRecoilVelocity += -this.cameraRecoilY * 25.0 * dt;
      this.cameraRecoilVelocity *= 0.88;
      this.cameraRecoilY += this.cameraRecoilVelocity * dt;
      this.camera.rotation.x = this.aimPitch + this.cameraRecoilY;
    }

    // 2. Wind Pennant & Wind Particles Animation
    if (this.windPennant && this.currentStage) {
      const windSpeed = this.currentStage.wind.speed;
      const windDeg = this.currentStage.wind.directionDegrees;
      const windRad = (windDeg * Math.PI) / 180;
      this.windPennant.rotation.y = windRad + Math.sin(timeNow * (4 + windSpeed * 2)) * 0.12;
      this.windPennant.rotation.z = -Math.PI / 2 + Math.sin(timeNow * (6 + windSpeed * 3)) * 0.08;
    }

    // Update drifting wind particles
    if (this.windParticles && this.windParticlePositions && this.currentStage) {
      const windRad = (this.currentStage.wind.directionDegrees * Math.PI) / 180;
      const driftX = Math.sin(windRad) * this.currentStage.wind.speed * 0.8 * dt;
      const count = this.windParticlePositions.length / 3;

      for (let i = 0; i < count; i++) {
        this.windParticlePositions[i * 3] += driftX;
        this.windParticlePositions[i * 3 + 1] += Math.sin(timeNow + i) * 0.004;

        // Wrap around boundaries
        if (this.windParticlePositions[i * 3] > 14) this.windParticlePositions[i * 3] = -14;
        if (this.windParticlePositions[i * 3] < -14) this.windParticlePositions[i * 3] = 14;
      }
      this.windParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Update Impact Particles
    for (let i = this.activeImpactParticles.length - 1; i >= 0; i--) {
      const pData = this.activeImpactParticles[i];
      pData.life += dt;
      const progress = pData.life / pData.maxLife;

      if (progress >= 1.0) {
        this.particleGroup.remove(pData.mesh);
        pData.mesh.geometry.dispose();
        (pData.mesh.material as THREE.Material).dispose();
        this.activeImpactParticles.splice(i, 1);
      } else {
        const positions = pData.mesh.geometry.attributes.position.array as Float32Array;
        for (let j = 0; j < pData.velocities.length; j++) {
          pData.velocities[j].y -= 9.8 * dt; // Particle gravity
          positions[j * 3] += pData.velocities[j].x * dt;
          positions[j * 3 + 1] += pData.velocities[j].y * dt;
          positions[j * 3 + 2] += pData.velocities[j].z * dt;
        }
        pData.mesh.geometry.attributes.position.needsUpdate = true;
        (pData.mesh.material as THREE.PointsMaterial).opacity = 1.0 - progress;
      }
    }

    // 4. Update Moving Targets & Wobble Physics
    this.activeTargets.forEach((targetData) => {
      const cfg = targetData.config;

      // Handle Horizontal/Vertical Target Movement
      if (cfg.isMoving && cfg.moveRange && cfg.moveSpeed) {
        const offset = Math.sin(timeNow * cfg.moveSpeed + (cfg.initialPhase || 0)) * cfg.moveRange;
        if (cfg.moveAxis === 'y') {
          targetData.mesh.position.y = cfg.y + offset;
        } else {
          targetData.mesh.position.x = cfg.x + offset;
        }
      }

      // Handle Target Wobble on Arrow Impact
      if (targetData.wobbleAmount > 0.001) {
        targetData.wobbleVelocity += -targetData.wobbleAmount * 28.0 * dt;
        targetData.wobbleVelocity *= 0.91; // Damping
        targetData.wobbleAmount += targetData.wobbleVelocity * dt;

        targetData.targetBoard.rotation.x = Math.PI / 2 + targetData.wobbleAmount;
      }
    });

    // 5. Update Ballistic In-Flight Arrow
    if (this.activeArrow && this.activeArrow.isFlying) {
      const arrow = this.activeArrow;
      arrow.flightTime += dt;

      // Gravity: -9.8 m/s²
      arrow.vel.y -= 9.8 * dt;

      // Wind Deflection Force
      arrow.vel.x += arrow.windVector.x * dt;
      arrow.vel.y += arrow.windVector.y * dt;

      // Update Position
      arrow.pos.x += arrow.vel.x * dt;
      arrow.pos.y += arrow.vel.y * dt;
      arrow.pos.z += arrow.vel.z * dt;

      arrow.group.position.copy(arrow.pos);

      // Rotate arrow to align with velocity vector + spin along shaft axis
      const lookTarget = arrow.pos.clone().add(arrow.vel);
      arrow.group.lookAt(lookTarget);
      arrow.group.rotation.z += 0.35; // Aerodynamic vane spin

      // Update trajectory trail
      arrow.trailPoints.push(arrow.pos.clone());
      if (arrow.trailPoints.length > 25) {
        arrow.trailPoints.shift();
      }
      if (arrow.trailLine) {
        arrow.trailLine.geometry.setFromPoints(arrow.trailPoints);
      }

      // Check Target Collision
      let hitRegistered = false;
      this.activeTargets.forEach((targetData, targetId) => {
        if (hitRegistered) return;

        const targetPos = targetData.mesh.position;
        const targetRadius = targetData.config.radius * (this.currentStage?.targetScale || 1.0);

        // Check if arrow tip has crossed the target Z plane
        if (arrow.pos.z >= targetPos.z - 0.2 && arrow.pos.z <= targetPos.z + 0.9) {
          // Calculate delta in target faceplate plane (X, Y)
          const dx = arrow.pos.x - targetPos.x;
          const dy = arrow.pos.y - targetPos.y;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);

          if (distFromCenter <= targetRadius) {
            // HIT TARGET!
            hitRegistered = true;
            this.handleTargetHit(targetId, dx, dy, distFromCenter, targetRadius, targetData);
          }
        }
      });

      // Ground / Miss Collision Check
      if (!hitRegistered && (arrow.pos.y <= 0.05 || arrow.pos.z > 85)) {
        this.handleMiss();
      }
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  // =========================================================================
  // 7. HIT RESOLUTION & PHYSICAL ARROW EMBEDDING
  // =========================================================================

  private spawnImpactParticles(worldPos: THREE.Vector3, isBullseye: boolean) {
    const count = isBullseye ? 36 : 18;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = worldPos.x;
      positions[i * 3 + 1] = worldPos.y;
      positions[i * 3 + 2] = worldPos.z;

      const speed = isBullseye ? 2.5 + Math.random() * 3.5 : 1.2 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;
      const upSpeed = 1.0 + Math.random() * 2.5;

      velocities.push(
        new THREE.Vector3(
          Math.cos(angle) * speed,
          upSpeed,
          (Math.random() - 0.5) * speed
        )
      );
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: isBullseye ? 0xffd54f : 0xd97706, // Gold sparkle for bullseye, wood amber for standard
      size: isBullseye ? 0.12 : 0.08,
      transparent: true,
      opacity: 1.0,
    });

    const mesh = new THREE.Points(geo, mat);
    this.particleGroup.add(mesh);

    this.activeImpactParticles.push({
      mesh,
      velocities,
      life: 0,
      maxLife: isBullseye ? 0.75 : 0.5,
    });
  }

  private handleTargetHit(
    targetId: string,
    dx: number,
    dy: number,
    distFromCenter: number,
    targetRadius: number,
    targetData: {
      mesh: THREE.Group;
      wobbleAmount: number;
      wobbleVelocity: number;
      embeddedArrows: THREE.Group[];
    }
  ) {
    if (!this.activeArrow) return;

    // Evaluate Ring Scoring
    const ringFraction = distFromCenter / targetRadius;
    let ring: RingType = 'MISS';
    let points = 0;

    if (ringFraction <= 0.20) {
      ring = 'BULLSEYE';
      points = 100;
    } else if (ringFraction <= 0.40) {
      ring = 'GOLD';
      points = 80;
    } else if (ringFraction <= 0.60) {
      ring = 'RED';
      points = 60;
    } else if (ringFraction <= 0.80) {
      ring = 'BLUE';
      points = 40;
    } else if (ringFraction <= 1.00) {
      ring = 'WHITE';
      points = 20;
    } else {
      ring = 'MISS';
      points = 0;
    }

    // Spawn 3D Impact Splinter/Sparkle particles
    const worldImpactPos = new THREE.Vector3(targetData.mesh.position.x + dx, targetData.mesh.position.y + dy, targetData.mesh.position.z);
    this.spawnImpactParticles(worldImpactPos, ring === 'BULLSEYE');

    // Embed Arrow Mesh physically onto Target Faceplate
    const embeddedArrow = this.createArrowMesh();
    embeddedArrow.position.set(dx, dy, 0.08); // Attached to target board front
    embeddedArrow.rotation.set(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      0
    );
    targetData.mesh.add(embeddedArrow);
    targetData.embeddedArrows.push(embeddedArrow);

    // Trigger Target Spring Wobble
    targetData.wobbleAmount = ring === 'BULLSEYE' ? 0.24 : 0.16;
    targetData.wobbleVelocity = -0.6;

    // Remove flying arrow and trail from scene
    if (this.activeArrow.trailLine) {
      this.scene.remove(this.activeArrow.trailLine);
      this.activeArrow.trailLine.geometry.dispose();
    }
    this.scene.remove(this.activeArrow.group);

    const callback = this.activeArrow.onHitCallback;
    this.activeArrow = null;

    // Restore nocked arrow on bow for next shot
    this.nockedArrow.visible = true;

    if (callback) {
      callback({
        hit: true,
        targetId,
        ring,
        points,
        distanceFromCenter: distFromCenter,
        hitNormalizedX: dx / targetRadius,
        hitNormalizedY: dy / targetRadius,
        worldHitPos: new THREE.Vector3(dx, dy, targetData.mesh.position.z),
      });
    }
  }

  private handleMiss() {
    if (!this.activeArrow) return;

    const callback = this.activeArrow.onHitCallback;
    if (this.activeArrow.trailLine) {
      this.scene.remove(this.activeArrow.trailLine);
      this.activeArrow.trailLine.geometry.dispose();
    }
    this.scene.remove(this.activeArrow.group);
    this.activeArrow = null;

    // Restore nocked arrow for next shot
    this.nockedArrow.visible = true;

    if (callback) {
      callback({
        hit: false,
        ring: 'MISS',
        points: 0,
        distanceFromCenter: 999,
        hitNormalizedX: 0,
        hitNormalizedY: 0,
        worldHitPos: new THREE.Vector3(0, 0, 0),
      });
    }
  }

  public clearAllEmbeddedArrows() {
    this.activeTargets.forEach((targetData) => {
      targetData.embeddedArrows.forEach((arrow) => {
        targetData.mesh.remove(arrow);
      });
      targetData.embeddedArrows = [];
    });
  }

  // =========================================================================
  // 8. RESIZE & DISPOSAL
  // =========================================================================

  private handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);

    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
