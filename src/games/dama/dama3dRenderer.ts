/**
 * DAMA - Three.js Realistic 3D Board & Piece Renderer
 * Matches reference traditional physical draughts / checkers presentation:
 * - STATIC old wooden table underneath the board, visible on all 4 sides (dark, aged, rustic, no animation)
 * - Realistic elevated 3D wooden board with beveled outer frame and inlaid squares
 * - Light squares: Natural light wood / pale warm wood (subdued, soft light-beige with visible grain)
 * - Dark squares: Warm medium-dark brown wood (visible grain, real wood look, not black/red)
 * - White pieces: Pure white / ivory with subtle glossy surface, beveled edges, and physical concentric ridges
 * - Black pieces: True black / dark charcoal with subtle glossy surface, beveled edges, and physical concentric ridges
 * - Kings: Authentic double-stacked pieces
 * - Professional, clearly visible destination move circles (slightly larger, elegant, matching reference)
 * - Atmospheric warm directional & ambient lighting (dark but clear)
 * - 3D perspective camera providing complete board visibility and tabletop framing
 */

import * as THREE from 'three';
import { BoardState, DamaMove, Piece } from './types';
import { BOARD_SIZE, isPlayableSquare } from './damaEngine';
import { damaAudio } from './damaAudio';

export interface RendererCallbacks {
  onPieceSelected: (piece: Piece) => void;
  onSquareClicked: (row: number, col: number) => void;
  onAnimationComplete: () => void;
}

export class Dama3DRenderer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isDestroyed: boolean = false;

  // Scene Groups
  private boardGroup: THREE.Group;
  private piecesGroup: THREE.Group;
  private highlightsGroup: THREE.Group;

  // Dedicated picking targets for 100% reliable raycasting
  private squareMeshList: THREE.Mesh[] = [];
  private highlightMeshList: THREE.Mesh[] = [];
  private pieceGroupMap: Map<string, THREE.Group> = new Map();
  private pieceDataMap: Map<string, Piece> = new Map();

  // Interaction State
  private selectedPieceId: string | null = null;
  private legalMoves: DamaMove[] = [];
  private callbacks: RendererCallbacks;
  public isAnimating: boolean = false;

  // Procedural Textures & Materials
  private woodTextures: {
    table: THREE.CanvasTexture;
    boardFrame: THREE.CanvasTexture;
    lightSquare: THREE.CanvasTexture;
    darkSquare: THREE.CanvasTexture;
    boardShadow: THREE.CanvasTexture;
  };

  // Reusable Piece Materials (Physical 3D PBR)
  private whitePieceMaterial: THREE.MeshStandardMaterial;
  private blackPieceMaterial: THREE.MeshStandardMaterial;

  private animationFrameId: number | null = null;
  private activeAnimations: (() => boolean)[] = [];
  private resizeObserver: ResizeObserver | null = null;

  // Height and sizing constants for physical 3D dimensions
  public static readonly TABLE_Y = 0.0;
  public static readonly BOARD_TOP_Y = 0.44; // Playing field surface
  public static readonly PIECE_RADIUS = 0.27;
  public static readonly PIECE_HEIGHT = 0.135;
  public static readonly SQUARE_SIZE = 0.72;

  constructor(container: HTMLElement, callbacks: RendererCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Renderer Setup
    this.scene = new THREE.Scene();
    // Deep dark warm timber tone matching the aged wooden table
    this.scene.background = new THREE.Color(0x150d07);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    this.camera = new THREE.PerspectiveCamera(41, width / height, 0.1, 100);
    this.adjustCameraForViewport(width, height);

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
    // Calibrated exposure for atmospheric, dark but clear look
    this.renderer.toneMappingExposure = 1.0;

    this.container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 2. Generate Canvas Wood Grain Textures
    this.woodTextures = this.generateWoodTextures();

    // 3. Piece Materials (Reference: True White / Ivory and True Black / Charcoal, subtle gloss)
    this.whitePieceMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeece6, // True ivory / white (no brown tint, subtle natural off-white)
      roughness: 0.22, // Subtle glossy surface
      metalness: 0.02,
    });

    this.blackPieceMaterial = new THREE.MeshStandardMaterial({
      color: 0x121212, // True black / dark charcoal (not tinted brown)
      roughness: 0.25, // Subtle glossy surface
      metalness: 0.02,
    });

    // 4. Setup Scene Groups
    this.boardGroup = new THREE.Group();
    this.piecesGroup = new THREE.Group();
    this.highlightsGroup = new THREE.Group();
    this.scene.add(this.boardGroup);
    this.scene.add(this.piecesGroup);
    this.scene.add(this.highlightsGroup);

    // 5. Build Board & Environment
    this.setupLighting();
    this.buildTableAndBoard();

    // 6. Setup Listeners
    this.setupEventListeners();

    // 7. Start Render Loop
    this.render = this.render.bind(this);
    this.render();
  }

  /**
   * Generates procedural canvas textures for natural wood grain, static dark table, and squares
   */
  private generateWoodTextures() {
    // 1. MATERIAL B: STATIC OLD WOODEN TABLE
    // Dark, aged, rustic hardwood table with visible natural grain and dark plank seams
    const createTableCanvas = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      // Deep dark warm rustic brown base
      ctx.fillStyle = '#23150c';
      ctx.fillRect(0, 0, 1024, 1024);

      // 8 vertical planks with natural aged tone variations
      const numPlanks = 8;
      const plankW = 1024 / numPlanks;
      const plankTones = [
        '#22140b',
        '#2b1b11',
        '#25160d',
        '#2e1d13',
        '#201209',
        '#27180e',
        '#24150c',
        '#2a1910',
      ];

      for (let p = 0; p < numPlanks; p++) {
        const x = p * plankW;
        ctx.fillStyle = plankTones[p % plankTones.length];
        ctx.fillRect(x, 0, plankW, 1024);

        // Natural fine wood fibers (subtle, dark, aged)
        for (let i = 0; i < 350; i++) {
          const fx = x + Math.random() * plankW;
          ctx.strokeStyle = Math.random() > 0.5 ? '#130a05' : '#382214';
          ctx.lineWidth = 0.5 + Math.random() * 1.4;
          ctx.globalAlpha = 0.07 + Math.random() * 0.09;

          ctx.beginPath();
          ctx.moveTo(fx, 0);
          let curX = fx;
          for (let y = 0; y <= 1024; y += 32) {
            curX += (Math.random() - 0.5) * 3.0;
            ctx.lineTo(curX, y);
          }
          ctx.stroke();
        }

        // Faint aged growth rings
        for (let r = 0; r < 5; r++) {
          ctx.strokeStyle = '#120904';
          ctx.lineWidth = 1.8 + Math.random() * 2.2;
          ctx.globalAlpha = 0.05;
          const cy = (p * 150 + r * 170) % 1024;
          ctx.beginPath();
          ctx.ellipse(x + plankW * 0.5, cy, plankW * 0.7, 150 + r * 25, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Occasional aged wood knot
        if (p % 3 === 1) {
          const knotY = (p * 270 + 120) % 900;
          const knotX = x + plankW * 0.5;

          ctx.strokeStyle = '#140a04';
          ctx.lineWidth = 2.0;
          ctx.globalAlpha = 0.10;
          ctx.beginPath();
          ctx.ellipse(knotX, knotY, 20, 35, 0.05, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#0f0803';
          ctx.globalAlpha = 0.28;
          ctx.beginPath();
          ctx.ellipse(knotX, knotY, 10, 18, 0.05, 0, Math.PI * 2);
          ctx.fill();
        }

        // Deep recessed seam joint between planks
        ctx.globalAlpha = 0.90;
        ctx.fillStyle = '#0a0502';
        ctx.fillRect(x + plankW - 2.5, 0, 2.5, 1024);

        // Subtle warm highlight bevel on opposite edge
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = '#4a2e1c';
        ctx.fillRect(x + 1, 0, 1.2, 1024);
      }

      ctx.globalAlpha = 1.0;
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // Repeat texture across the table plane
      texture.repeat.set(2.5, 2.5);
      return texture;
    };

    // Generic hardwood canvas generator
    const createWoodCanvas = (
      baseColor: string,
      grainColor: string,
      accentColor: string,
      turbulence: number
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 512, 512);

      // Fine grain fibers
      for (let i = 0; i < 600; i++) {
        const y = Math.random() * 512;
        ctx.strokeStyle = Math.random() > 0.5 ? grainColor : accentColor;
        ctx.lineWidth = 0.5 + Math.random() * 1.5;
        ctx.globalAlpha = 0.07 + Math.random() * 0.12;

        ctx.beginPath();
        ctx.moveTo(0, y);
        let curY = y;
        for (let x = 0; x <= 512; x += 28) {
          curY += (Math.random() - 0.5) * turbulence;
          ctx.lineTo(x, curY);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    // Ambient Occlusion Contact Shadow Map under board
    const createBoardShadowCanvas = (): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      const grad = ctx.createRadialGradient(256, 256, 170, 256, 256, 254);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
      grad.addColorStop(0.65, 'rgba(3, 2, 1, 0.55)');
      grad.addColorStop(1, 'rgba(5, 3, 2, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      return new THREE.CanvasTexture(canvas);
    };

    return {
      table: createTableCanvas(),
      // 1. BOARD FRAME: Dark antique walnut/mahogany border with satin finish
      boardFrame: createWoodCanvas('#26150c', '#150a05', '#382012', 4),
      // 2. LIGHT SQUARES: Natural light wood / pale warm wood (soft light-beige, subdued, visible grain)
      lightSquare: createWoodCanvas('#a8957c', '#938067', '#bcab93', 3.5),
      // 3. DARK SQUARES: Warm medium brown wood with visible natural grain (not black, not dark red)
      darkSquare: createWoodCanvas('#4f331d', '#3a2211', '#664429', 4),
      boardShadow: createBoardShadowCanvas(),
    };
  }

  /**
   * Sets up atmospheric studio lighting matching reference presentation (dark but clear)
   */
  private setupLighting() {
    // 1. Soft warm ambient light (subdued, atmospheric)
    const ambientLight = new THREE.AmbientLight(0xd5bfab, 0.48);
    this.scene.add(ambientLight);

    // 2. Main Key Directional Light (from top-left, casting crisp soft contact shadows)
    const keyLight = new THREE.DirectionalLight(0xffecd6, 1.15);
    keyLight.position.set(4.2, 9.5, 5.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 5.5;
    keyLight.shadow.camera.bottom = -5.5;
    keyLight.shadow.bias = -0.0003;
    this.scene.add(keyLight);

    // 3. Subtle soft fill light (prevents pure black shadows)
    const fillLight = new THREE.DirectionalLight(0x735a47, 0.32);
    fillLight.position.set(-5, 6, -3);
    this.scene.add(fillLight);

    // 4. Subtle back/rim light to define the silhouettes of the black pieces
    const rimLight = new THREE.DirectionalLight(0xe8d2b8, 0.28);
    rimLight.position.set(-2, 7, -6);
    this.scene.add(rimLight);
  }

  /**
   * Adjusts camera angle and FOV to ensure the complete board and tabletop are visible
   * Perspective angle ~52° shows full 8x8 grid, piece depth, and table all around
   */
  private adjustCameraForViewport(width: number, height: number) {
    const aspect = width / height;
    this.camera.aspect = aspect;

    if (aspect < 0.72) {
      // Mobile portrait: comfortable elevated angle (~53°), table visible around all 4 sides
      this.camera.fov = 48;
      this.camera.position.set(0, 11.2, 8.5);
    } else if (aspect < 1.05) {
      // Tablet / square viewport
      this.camera.fov = 43;
      this.camera.position.set(0, 10.0, 7.6);
    } else {
      // Desktop landscape: centered board with generous vintage wooden table on all sides
      this.camera.fov = 41;
      this.camera.position.set(0, 9.6, 7.2);
    }

    // Look at center of board with slight forward tilt
    this.camera.lookAt(0, Dama3DRenderer.BOARD_TOP_Y, 0.08);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Builds the static 3D wooden table and elevated physical 8x8 Draughts board
   */
  private buildTableAndBoard() {
    // 1. MATERIAL B: STATIC OLD WOODEN TABLETOP PLANE
    // Sits at Y = 0, completely static, extends around all 4 sides of the board
    const tableGeo = new THREE.PlaneGeometry(36, 36);
    const tableMat = new THREE.MeshStandardMaterial({
      map: this.woodTextures.table,
      roughness: 0.82, // Matte/semi-matte aged wood table
      metalness: 0.02,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.rotation.x = -Math.PI / 2;
    tableMesh.position.set(0, Dama3DRenderer.TABLE_Y, 0);
    tableMesh.receiveShadow = true;
    this.boardGroup.add(tableMesh);

    // 2. BOARD DROP SHADOW ONTO TABLE
    const shadowGeo = new THREE.PlaneGeometry(8.2, 8.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.woodTextures.boardShadow,
      transparent: true,
      opacity: 0.85,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = Dama3DRenderer.TABLE_Y + 0.003;
    this.boardGroup.add(shadowMesh);

    // 3. MATERIAL A: 3D PHYSICAL ELEVATED WOODEN DAMA BOARD
    const squareSize = Dama3DRenderer.SQUARE_SIZE; // 0.72
    const gridSpan = BOARD_SIZE * squareSize; // 5.76
    const frameBorder = 0.50;
    const boardTotalWidth = gridSpan + 2 * frameBorder; // 6.76

    const frameMat = new THREE.MeshStandardMaterial({
      map: this.woodTextures.boardFrame,
      roughness: 0.40,
      metalness: 0.03,
    });

    // A. Stepped Base Plinth (contacts the table)
    const basePlinthGeo = new THREE.BoxGeometry(boardTotalWidth + 0.1, 0.08, boardTotalWidth + 0.1);
    const basePlinthMesh = new THREE.Mesh(basePlinthGeo, frameMat);
    basePlinthMesh.position.y = 0.04;
    basePlinthMesh.castShadow = true;
    basePlinthMesh.receiveShadow = true;
    this.boardGroup.add(basePlinthMesh);

    // B. Main Solid Board Body
    const bodyHeight = 0.36;
    const bodyGeo = new THREE.BoxGeometry(boardTotalWidth, bodyHeight, boardTotalWidth);
    const bodyMesh = new THREE.Mesh(bodyGeo, frameMat);
    bodyMesh.position.y = 0.08 + bodyHeight / 2; // y = 0.26
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.boardGroup.add(bodyMesh);

    // C. Raised Outer Frame (4 perimeter border beams framing the recessed playing field)
    const frameHeight = 0.07;
    const frameY = Dama3DRenderer.BOARD_TOP_Y + frameHeight / 2; // y = 0.475

    // North & South Beams
    const horizBeamGeo = new THREE.BoxGeometry(boardTotalWidth, frameHeight, frameBorder);
    const northBeam = new THREE.Mesh(horizBeamGeo, frameMat);
    northBeam.position.set(0, frameY, -(gridSpan / 2 + frameBorder / 2));
    northBeam.castShadow = true;
    northBeam.receiveShadow = true;
    this.boardGroup.add(northBeam);

    const southBeam = new THREE.Mesh(horizBeamGeo, frameMat);
    southBeam.position.set(0, frameY, gridSpan / 2 + frameBorder / 2);
    southBeam.castShadow = true;
    southBeam.receiveShadow = true;
    this.boardGroup.add(southBeam);

    // East & West Beams
    const vertBeamGeo = new THREE.BoxGeometry(frameBorder, frameHeight, gridSpan);
    const westBeam = new THREE.Mesh(vertBeamGeo, frameMat);
    westBeam.position.set(-(gridSpan / 2 + frameBorder / 2), frameY, 0);
    westBeam.castShadow = true;
    westBeam.receiveShadow = true;
    this.boardGroup.add(westBeam);

    const eastBeam = new THREE.Mesh(vertBeamGeo, frameMat);
    eastBeam.position.set(gridSpan / 2 + frameBorder / 2, frameY, 0);
    eastBeam.castShadow = true;
    eastBeam.receiveShadow = true;
    this.boardGroup.add(eastBeam);

    // D. 64 Individual Inlaid Wooden Tiles (8x8 Grid)
    const startX = -((BOARD_SIZE - 1) * squareSize) / 2;
    const startZ = -((BOARD_SIZE - 1) * squareSize) / 2;

    this.squareMeshList = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const isPlayable = isPlayableSquare(r, c);
        // Individual tile with chamfered edge
        const squareGeo = new THREE.BoxGeometry(squareSize - 0.008, 0.035, squareSize - 0.008);

        const squareMat = new THREE.MeshStandardMaterial({
          map: isPlayable ? this.woodTextures.darkSquare : this.woodTextures.lightSquare,
          roughness: isPlayable ? 0.42 : 0.45,
          metalness: 0.02,
        });

        const squareMesh = new THREE.Mesh(squareGeo, squareMat);
        squareMesh.position.set(
          startX + c * squareSize,
          Dama3DRenderer.BOARD_TOP_Y + 0.017,
          startZ + r * squareSize
        );
        squareMesh.receiveShadow = true;
        squareMesh.userData = { row: r, col: c, isPlayable };

        this.boardGroup.add(squareMesh);
        this.squareMeshList.push(squareMesh);
      }
    }
  }

  /**
   * Helper: maps grid coordinate (r, c) to 3D world (X, Z) coordinates
   */
  public gridToWorld(r: number, c: number): { x: number; z: number } {
    const squareSize = Dama3DRenderer.SQUARE_SIZE;
    const startX = -((BOARD_SIZE - 1) * squareSize) / 2;
    const startZ = -((BOARD_SIZE - 1) * squareSize) / 2;
    return {
      x: startX + c * squareSize,
      z: startZ + r * squareSize,
    };
  }

  /**
   * Builds the physical 3D geometry of a traditional Dama piece
   * True 3D concentric ridges molded into the top face:
   * CENTER -> raised ring -> circular groove -> subtle inner ring -> center dome
   */
  private buildPieceSubmesh(material: THREE.MeshStandardMaterial): THREE.Group {
    const pieceMeshGroup = new THREE.Group();

    const radius = Dama3DRenderer.PIECE_RADIUS; // 0.27
    const height = Dama3DRenderer.PIECE_HEIGHT; // 0.135

    // 1. Base Cylinder
    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 40);
    const bodyMesh = new THREE.Mesh(bodyGeo, material);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.position.y = height / 2;
    pieceMeshGroup.add(bodyMesh);

    // 2. Beveled rounded outer rim (Torus)
    const rimGeo = new THREE.TorusGeometry(radius - 0.02, 0.018, 14, 40);
    const rimMesh = new THREE.Mesh(rimGeo, material);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = height;
    pieceMeshGroup.add(rimMesh);

    // 3. Physical concentric ridges integrated into top face (Reference traditional Dama detailing)
    // Outer raised circular ring
    const outerRingGeo = new THREE.TorusGeometry(radius * 0.65, 0.012, 12, 36);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, material);
    outerRingMesh.rotation.x = Math.PI / 2;
    outerRingMesh.position.y = height + 0.004;
    pieceMeshGroup.add(outerRingMesh);

    // Inner subtle ring
    const innerRingGeo = new THREE.TorusGeometry(radius * 0.35, 0.010, 10, 28);
    const innerRingMesh = new THREE.Mesh(innerRingGeo, material);
    innerRingMesh.rotation.x = Math.PI / 2;
    innerRingMesh.position.y = height + 0.005;
    pieceMeshGroup.add(innerRingMesh);

    // Center raised circular dome
    const centerPipGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.012, 18);
    const centerPipMesh = new THREE.Mesh(centerPipGeo, material);
    centerPipMesh.position.y = height + 0.006;
    pieceMeshGroup.add(centerPipMesh);

    return pieceMeshGroup;
  }

  /**
   * Creates a single 3D Dama piece (or double-stacked piece if King)
   */
  private createPieceMesh(piece: Piece): THREE.Group {
    const group = new THREE.Group();
    const isWhite = piece.color === 'white';
    const material = isWhite ? this.whitePieceMaterial : this.blackPieceMaterial;
    const height = Dama3DRenderer.PIECE_HEIGHT;

    // 1. Primary Bottom Piece Submesh
    const bottomPiece = this.buildPieceSubmesh(material);
    bottomPiece.position.y = Dama3DRenderer.BOARD_TOP_Y + 0.035;
    group.add(bottomPiece);

    // 2. If King: Authentic traditional double-stacking (second identical piece stacked on top)
    if (piece.isKing) {
      const topPiece = this.buildPieceSubmesh(material);
      topPiece.position.y = Dama3DRenderer.BOARD_TOP_Y + 0.035 + height;
      topPiece.name = 'kingTopPiece';
      group.add(topPiece);
    }

    // 3. Soft Ambient Contact Shadow on the board square
    const contactGeo = new THREE.CircleGeometry(Dama3DRenderer.PIECE_RADIUS * 1.15, 24);
    const contactMat = new THREE.MeshBasicMaterial({
      color: 0x050302,
      transparent: true,
      opacity: 0.60,
    });
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMesh.rotation.x = -Math.PI / 2;
    contactMesh.position.y = Dama3DRenderer.BOARD_TOP_Y + 0.036;
    group.add(contactMesh);

    const { x, z } = this.gridToWorld(piece.row, piece.col);
    group.position.set(x, 0, z);
    group.userData = { pieceId: piece.id, row: piece.row, col: piece.col, color: piece.color, isKing: piece.isKing };

    return group;
  }

  /**
   * Attaches second physical piece to stack as King (Traditional Checkers King)
   */
  private crownKing(group: THREE.Group, isWhite: boolean) {
    const material = isWhite ? this.whitePieceMaterial : this.blackPieceMaterial;
    const height = Dama3DRenderer.PIECE_HEIGHT;

    const topPiece = this.buildPieceSubmesh(material);
    topPiece.position.y = Dama3DRenderer.BOARD_TOP_Y + 0.035 + height;
    topPiece.name = 'kingTopPiece';
    group.add(topPiece);
  }

  /**
   * Synchronizes the 3D scene with the current logical BoardState
   */
  public syncBoardState(board: BoardState) {
    const currentPieceIds = new Set<string>();

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (piece) {
          currentPieceIds.add(piece.id);
          this.pieceDataMap.set(piece.id, piece);

          let pieceGroup = this.pieceGroupMap.get(piece.id);

          if (!pieceGroup) {
            // Create new piece
            pieceGroup = this.createPieceMesh(piece);
            this.piecesGroup.add(pieceGroup);
            this.pieceGroupMap.set(piece.id, pieceGroup);
          } else {
            // Update existing piece position and king status
            const { x, z } = this.gridToWorld(r, c);
            pieceGroup.position.set(x, 0, z);
            pieceGroup.userData.row = r;
            pieceGroup.userData.col = c;

            // If newly crowned King, stack second piece
            if (piece.isKing && !pieceGroup.userData.isKing) {
              pieceGroup.userData.isKing = true;
              this.crownKing(pieceGroup, piece.color === 'white');
            }
          }
        }
      }
    }

    // Remove pieces no longer on board
    for (const [id, group] of this.pieceGroupMap.entries()) {
      if (!currentPieceIds.has(id)) {
        this.piecesGroup.remove(group);
        this.pieceGroupMap.delete(id);
        this.pieceDataMap.delete(id);
      }
    }
  }

  /**
   * Highlights the currently selected piece and displays clean, professional move indicators
   * Visually consistent with traditional physical board (slightly larger, elegant circular marker)
   */
  public setSelectedPiece(piece: Piece | null, moves: DamaMove[]) {
    this.clearHighlights();
    this.selectedPieceId = piece ? piece.id : null;
    this.legalMoves = moves;

    if (!piece) return;

    // 1. Physically elevate selected piece slightly
    const pieceGroup = this.pieceGroupMap.get(piece.id);
    if (pieceGroup) {
      pieceGroup.position.y = 0.14;

      // Clean, elegant warm golden disc underneath the lifted piece
      const selRingGeo = new THREE.RingGeometry(
        Dama3DRenderer.PIECE_RADIUS * 0.88,
        Dama3DRenderer.PIECE_RADIUS * 1.08,
        32
      );
      const selRingMat = new THREE.MeshBasicMaterial({
        color: 0xc99c36,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ringMesh = new THREE.Mesh(selRingGeo, selRingMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(pieceGroup.position.x, Dama3DRenderer.BOARD_TOP_Y + 0.038, pieceGroup.position.z);
      ringMesh.name = 'selectionRing';
      this.highlightsGroup.add(ringMesh);

      // Soft contact shadow under the lifted piece
      const selShadowGeo = new THREE.CircleGeometry(Dama3DRenderer.PIECE_RADIUS * 0.95, 24);
      const selShadowMat = new THREE.MeshBasicMaterial({
        color: 0x070402,
        transparent: true,
        opacity: 0.45,
      });
      const shadowMesh = new THREE.Mesh(selShadowGeo, selShadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(pieceGroup.position.x, Dama3DRenderer.BOARD_TOP_Y + 0.037, pieceGroup.position.z);
      shadowMesh.name = 'selectionShadow';
      this.highlightsGroup.add(shadowMesh);
    }

    // 2. Clean, professional circular destination markers (matching reference traditional checkers)
    // Slightly larger (radius 0.20, diameter 0.40 in 0.72 square), immediately legible
    this.highlightMeshList = [];

    for (const move of moves) {
      const { x, z } = this.gridToWorld(move.toRow, move.toCol);
      const isCap = move.isCapture;

      // Elegant, semi-translucent circular destination disc
      const destDiscGeo = new THREE.CircleGeometry(0.20, 32);
      const destDiscMat = new THREE.MeshBasicMaterial({
        color: isCap ? 0xb83832 : 0xf2eee6,
        transparent: true,
        opacity: isCap ? 0.65 : 0.52,
      });
      const destDiscMesh = new THREE.Mesh(destDiscGeo, destDiscMat);
      destDiscMesh.rotation.x = -Math.PI / 2;
      destDiscMesh.position.set(x, Dama3DRenderer.BOARD_TOP_Y + 0.038, z);
      destDiscMesh.userData = { isDest: true, row: move.toRow, col: move.toCol };

      // Crisp outer boundary ring for high definition against wood
      const destRingGeo = new THREE.RingGeometry(0.192, 0.21, 32);
      const destRingMat = new THREE.MeshBasicMaterial({
        color: isCap ? 0xdf4a42 : 0xfffcf7,
        transparent: true,
        opacity: isCap ? 0.88 : 0.78,
        side: THREE.DoubleSide,
      });
      const destRingMesh = new THREE.Mesh(destRingGeo, destRingMat);
      destRingMesh.rotation.x = -Math.PI / 2;
      destRingMesh.position.set(x, Dama3DRenderer.BOARD_TOP_Y + 0.039, z);
      destRingMesh.userData = { isDest: true, row: move.toRow, col: move.toCol };

      // Subtle center dot pip
      const destPipGeo = new THREE.CircleGeometry(0.045, 16);
      const destPipMat = new THREE.MeshBasicMaterial({
        color: isCap ? 0xdf4a42 : 0xfffcf7,
        transparent: true,
        opacity: isCap ? 0.85 : 0.72,
      });
      const destPipMesh = new THREE.Mesh(destPipGeo, destPipMat);
      destPipMesh.rotation.x = -Math.PI / 2;
      destPipMesh.position.set(x, Dama3DRenderer.BOARD_TOP_Y + 0.040, z);
      destPipMesh.userData = { isDest: true, row: move.toRow, col: move.toCol };

      this.highlightsGroup.add(destDiscMesh);
      this.highlightsGroup.add(destRingMesh);
      this.highlightsGroup.add(destPipMesh);
      this.highlightMeshList.push(destDiscMesh);
      this.highlightMeshList.push(destRingMesh);
      this.highlightMeshList.push(destPipMesh);
    }
  }

  /**
   * Clears active selection and destination highlights
   */
  public clearHighlights() {
    if (this.selectedPieceId) {
      const pieceGroup = this.pieceGroupMap.get(this.selectedPieceId);
      if (pieceGroup) {
        pieceGroup.position.y = 0;
      }
    }

    this.selectedPieceId = null;
    this.legalMoves = [];
    this.highlightMeshList = [];

    while (this.highlightsGroup.children.length > 0) {
      const child = this.highlightsGroup.children[0];
      this.highlightsGroup.remove(child);
    }
  }

  /**
   * Animates a move smoothly across its path (including multi-captures and King promotion)
   */
  public animateMove(move: DamaMove, onDone: () => void) {
    this.isAnimating = true;
    this.clearHighlights();

    let completed = false;
    const safeDone = () => {
      if (completed) return;
      completed = true;
      clearTimeout(safetyTimer);
      this.isAnimating = false;
      onDone();
      this.callbacks.onAnimationComplete();
    };

    // Find the piece group to move
    let pieceGroup: THREE.Group | null = null;
    for (const group of this.pieceGroupMap.values()) {
      if (group.userData.row === move.fromRow && group.userData.col === move.fromCol) {
        pieceGroup = group;
        break;
      }
    }

    if (!pieceGroup) {
      safeDone();
      return;
    }

    // Sequentially animate each jump step in the move path
    const steps = move.path && move.path.length > 0 ? move.path : [
      { fromRow: move.fromRow, fromCol: move.fromCol, toRow: move.toRow, toCol: move.toCol }
    ];
    let currentStepIdx = 0;

    // Safety watchdog: ensure callback is always executed even if window tab loses focus
    const safetyDuration = Math.max(1200, steps.length * 480 + 800);
    const safetyTimer = setTimeout(() => {
      if (!completed) {
        console.warn('Dama animation safety watchdog triggered, finishing move cleanly');
        if (pieceGroup) {
          const finalWorld = this.gridToWorld(move.toRow, move.toCol);
          pieceGroup.position.set(finalWorld.x, 0, finalWorld.z);
          pieceGroup.userData.row = move.toRow;
          pieceGroup.userData.col = move.toCol;
        }
        safeDone();
      }
    }, safetyDuration);

    const runNextStep = () => {
      if (completed) return;

      if (currentStepIdx >= steps.length) {
        // All jump steps finished
        pieceGroup!.position.y = 0;

        if (move.promotesToKing) {
          damaAudio.playKingPromotion();
        }

        safeDone();
        return;
      }

      const step = steps[currentStepIdx];
      const startWorld = this.gridToWorld(step.fromRow, step.fromCol);
      const endWorld = this.gridToWorld(step.toRow, step.toCol);

      const duration = 280; // ms per jump arc
      const startTime = performance.now();

      // Find captured piece group if this step is a capture
      let capturedGroup: THREE.Group | null = null;
      if (step.capturedRow !== undefined && step.capturedCol !== undefined) {
        for (const g of this.pieceGroupMap.values()) {
          if (g.userData.row === step.capturedRow && g.userData.col === step.capturedCol) {
            capturedGroup = g;
            break;
          }
        }
      }

      const stepAnim = () => {
        if (completed) return true;

        const now = performance.now();
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Smooth cubic easing
        const ease = 1 - Math.pow(1 - progress, 3);

        // Horizontal position
        pieceGroup!.position.x = startWorld.x + (endWorld.x - startWorld.x) * ease;
        pieceGroup!.position.z = startWorld.z + (endWorld.z - startWorld.z) * ease;

        // Vertical parabolic jump arc
        const arcHeight = 0.38;
        pieceGroup!.position.y = Math.sin(progress * Math.PI) * arcHeight;

        // Animate captured piece sinking and fading on impact
        if (capturedGroup && progress > 0.35) {
          const capProgress = (progress - 0.35) / 0.65;
          capturedGroup.position.y = -capProgress * 0.28;
          capturedGroup.scale.setScalar(Math.max(0.01, 1 - capProgress * 0.85));
        }

        if (progress >= 1) {
          // Landed step
          pieceGroup!.position.x = endWorld.x;
          pieceGroup!.position.z = endWorld.z;
          pieceGroup!.position.y = 0;
          pieceGroup!.userData.row = step.toRow;
          pieceGroup!.userData.col = step.toCol;

          if (capturedGroup) {
            damaAudio.playPieceCapture();
            this.piecesGroup.remove(capturedGroup);
            if (capturedGroup.userData.pieceId) {
              this.pieceGroupMap.delete(capturedGroup.userData.pieceId);
              this.pieceDataMap.delete(capturedGroup.userData.pieceId);
            }
          } else {
            damaAudio.playPieceMove();
          }

          currentStepIdx++;
          setTimeout(runNextStep, 50);
          return true;
        }

        return false;
      };

      this.activeAnimations.push(stepAnim);
    };

    runNextStep();
  }

  /**
   * Sets up touch and mouse click event handlers with foolproof raycasting
   */
  private setupEventListeners() {
    const handlePointerDown = (clientX: number, clientY: number) => {
      if (this.isAnimating || this.isDestroyed) return;

      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 1. PRIORITY A: Check if clicked a destination highlight marker
      if (this.highlightMeshList.length > 0) {
        const highlightHits = this.raycaster.intersectObjects(this.highlightMeshList, false);
        if (highlightHits.length > 0) {
          const hitObj = highlightHits[0].object;
          if (hitObj.userData && hitObj.userData.isDest) {
            this.callbacks.onSquareClicked(hitObj.userData.row, hitObj.userData.col);
            return;
          }
        }
      }

      // 2. PRIORITY B: Check if clicked a piece directly
      const pieceGroups = Array.from(this.pieceGroupMap.values());
      const pieceHits = this.raycaster.intersectObjects(pieceGroups, true);

      if (pieceHits.length > 0) {
        let hitGroup: THREE.Object3D | null = pieceHits[0].object;
        while (hitGroup && hitGroup.parent && hitGroup.parent !== this.piecesGroup) {
          hitGroup = hitGroup.parent;
        }

        if (hitGroup && hitGroup.userData && hitGroup.userData.pieceId) {
          const pieceId = hitGroup.userData.pieceId;
          const piece = this.pieceDataMap.get(pieceId);
          if (piece) {
            // White pieces belong to the player
            if (piece.color === 'white') {
              this.callbacks.onPieceSelected(piece);
              return;
            } else if (piece.color === 'black' && this.selectedPieceId) {
              // Player tapped an opponent piece to capture it
              const matchingCapture = this.legalMoves.find((m) =>
                m.capturedPieces.some((c) => c.row === piece.row && c.col === piece.col)
              );
              if (matchingCapture) {
                this.callbacks.onSquareClicked(matchingCapture.toRow, matchingCapture.toCol);
                return;
              }
            }
          }
        }
      }

      // 3. PRIORITY C: Check if clicked a board square
      const squareHits = this.raycaster.intersectObjects(this.squareMeshList, false);
      if (squareHits.length > 0) {
        const hitSquare = squareHits[0].object;
        if (hitSquare.userData && hitSquare.userData.isPlayable) {
          const { row, col } = hitSquare.userData;

          // Check if there is a piece on this square
          let pieceOnSquare: Piece | null = null;
          for (const p of this.pieceDataMap.values()) {
            if (p.row === row && p.col === col) {
              pieceOnSquare = p;
              break;
            }
          }

          if (pieceOnSquare) {
            if (pieceOnSquare.color === 'white') {
              this.callbacks.onPieceSelected(pieceOnSquare);
            } else if (pieceOnSquare.color === 'black' && this.selectedPieceId) {
              const matchingCapture = this.legalMoves.find((m) =>
                m.capturedPieces.some((c) => c.row === row && c.col === col)
              );
              if (matchingCapture) {
                this.callbacks.onSquareClicked(matchingCapture.toRow, matchingCapture.toCol);
              }
            }
          } else {
            // Empty playable square clicked -> check if it's a destination
            this.callbacks.onSquareClicked(row, col);
          }
        }
      }
    };

    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e: PointerEvent) => {
      // Only primary mouse button or touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      handlePointerDown(e.clientX, e.clientY);
    });

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.container);
  }

  public handleResize() {
    if (this.isDestroyed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.renderer.setSize(width, height);
    this.adjustCameraForViewport(width, height);
  }

  /**
   * Main animation and render frame (completely static camera & table)
   */
  private render() {
    if (this.isDestroyed) return;

    // Run active jump/move animations
    if (this.activeAnimations.length > 0) {
      this.activeAnimations = this.activeAnimations.filter((anim) => !anim());
    }

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.render);
  }

  /**
   * Cleanly disposes of all WebGL resources, geometries, textures, and event listeners
   */
  public dispose() {
    this.isDestroyed = true;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Dispose textures
    Object.values(this.woodTextures).forEach((tex) => tex.dispose());

    // Dispose materials
    this.whitePieceMaterial.dispose();
    this.blackPieceMaterial.dispose();

    // Dispose geometries & materials
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
