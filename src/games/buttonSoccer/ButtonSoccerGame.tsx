import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { 
  GameState, 
  MatchMode, 
  TurnState, 
  MatchPhase,
  MatchStats,
  Disc, 
  Ball, 
  PitchDimensions, 
  AimState, 
  Particle, 
  LevelSaveData, 
  TeamInfo 
} from './types';
import { TEAMS, TEAMS_LIST, drawFlagInsideCircle } from './teams';
import { BUTTON_SOCCER_LEVELS, getOpponentForLevel } from './levels';
import { ButtonSoccerPhysics } from './physics';
import { ButtonSoccerAI } from './ai';
import { ButtonSoccerRenderer, draw3DSoccerBall } from './renderer';
import { buttonSoccerAudio } from './audio';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Lock, 
  Star, 
  Trophy, 
  Home, 
  Check, 
  Info, 
  BookOpen, 
  Sliders, 
  ShieldAlert,
  ChevronRight,
  Flame,
  Shuffle
} from 'lucide-react';
import { GameLeaderboardModal } from '../../components/gameNavigation/GameLeaderboardModal';
import { getGameConfig } from '../../components/gameNavigation/gameConfigs';

// -----------------------------------------------------------------------------
// Deterministic Scoring Engine (Competitive Tournament Integrity)
// Distinguishes players by clean sheet, shot accuracy, turn efficiency & speed
// -----------------------------------------------------------------------------
export function computeDeterministicScore(
  userGoals: number,
  opponentGoals: number,
  userShots: number,
  userTurns: number,
  durationSec: number,
  levelNum: number,
  hasWon: boolean
): MatchStats {
  const cleanSheet = opponentGoals === 0;
  const baseGoals = userGoals * 1000;
  const cleanSheetBonus = hasWon ? (cleanSheet ? 800 : Math.max(0, 400 - opponentGoals * 150)) : 0;
  const accuracyBonus = userShots > 0 ? Math.round((userGoals / Math.max(userGoals, userShots)) * 600) : 0;
  const turnEfficiencyBonus = hasWon ? Math.max(0, 500 - (userTurns - userGoals) * 60) : 0;
  const speedBonus = hasWon ? Math.max(0, 500 - Math.floor(durationSec * 3)) : 0;
  const difficultyMultiplier = 1 + (levelNum - 1) * 0.05;

  let rawTotal = baseGoals + cleanSheetBonus + accuracyBonus + turnEfficiencyBonus + speedBonus;
  if (!hasWon) {
    rawTotal = Math.max(100, userGoals * 350 + Math.max(0, 200 - opponentGoals * 50));
  }
  const finalScore = Math.round(rawTotal * difficultyMultiplier);

  let stars = 1;
  if (hasWon) {
    if (opponentGoals === 0) stars = 3;
    else if (opponentGoals <= 1) stars = 2;
  } else {
    stars = 0;
  }

  return {
    userGoals,
    opponentGoals,
    userShots,
    userTurns,
    durationSec,
    finalScore,
    stars,
    cleanSheet,
    scoreBreakdown: {
      baseGoals,
      cleanSheetBonus,
      accuracyBonus,
      turnEfficiencyBonus,
      speedBonus,
      difficultyMultiplier: Number(difficultyMultiplier.toFixed(2)),
    },
  };
}

interface ButtonSoccerGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (finalScore: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY_LEVELS = 'button_soccer_levels_v2';
const STORAGE_KEY_BEST = 'button_soccer_best_score_v2';
const STORAGE_KEY_USER_TEAM = 'button_soccer_user_team_v2';
const STORAGE_KEY_SETTINGS = 'button_soccer_settings_v2';

// -----------------------------------------------------------------------------
// Interactive 3D Soccer Ball Canvas Preview Component
// -----------------------------------------------------------------------------
const BallPreview: React.FC<{ team: TeamInfo; size?: number; className?: string }> = ({
  team,
  size = 72,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const radius = (size - 12) * 0.46;
      draw3DSoccerBall(ctx, team, size * 0.5, size * 0.5, radius, angle);
      angle += 0.012;
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [team, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={`block pointer-events-none drop-shadow-md ${className}`}
    />
  );
};

export const ButtonSoccerGame: React.FC<ButtonSoccerGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ButtonSoccerRenderer | null>(null);
  const physicsRef = useRef<ButtonSoccerPhysics | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const selectedDiscIdRef = useRef<number | null>(null);
  const pointerTouchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // High-level Game State & Navigation
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [matchMode, setMatchMode] = useState<MatchMode>('CHAMPIONSHIP');
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(!isAudioEnabled);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Teams Configuration (Default to Ethiopia or saved preference)
  const [userTeamId, setUserTeamId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_TEAM);
      return saved && TEAMS[saved] ? saved : 'ethiopia';
    } catch {
      return 'ethiopia';
    }
  });

  const [opponentTeamId, setOpponentTeamId] = useState<string>(() => {
    return getOpponentForLevel(1, 'ethiopia');
  });

  // Match Scores & Clocks
  const [userScore, setUserScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const userScoreRef = useRef<number>(0);
  const opponentScoreRef = useRef<number>(0);
  const [targetGoals, setTargetGoals] = useState<number>(3);
  const [matchElapsedSec, setMatchElapsedSec] = useState<number>(0);

  // Authoritative Match State Machine
  // HUMAN_AIM -> PHYSICS_SETTLING -> COMPUTER_THINKING -> COMPUTER_AIM -> PHYSICS_SETTLING -> HUMAN_AIM
  const [matchPhase, setMatchPhaseState] = useState<MatchPhase>('HUMAN_AIM');
  const matchPhaseRef = useRef<MatchPhase>('HUMAN_AIM');
  const setMatchPhase = (phase: MatchPhase) => {
    matchPhaseRef.current = phase;
    setMatchPhaseState(phase);
    if (phase !== 'HUMAN_AIM') {
      selectedDiscIdRef.current = null;
      setSelectedDiscId(null);
      aimStateRef.current = {
        isAiming: false,
        discId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        angle: 0,
        power: 0,
      };
    }
  };

  const [goalCelebrationText, setGoalCelebrationText] = useState<string>('GOAL!');
  const [matchResultWinner, setMatchResultWinner] = useState<'user' | 'opponent' | 'draw'>('user');
  const [lastMatchStats, setLastMatchStats] = useState<MatchStats | null>(null);

  // Authoritative turn and statistics tracker (No countdown timer controlling match)
  const lastShooterRef = useRef<'user' | 'opponent'>('user');
  const physicsSettlingStartTimeRef = useRef<number>(0);
  const userShotsRef = useRef<number>(0);
  const userTurnsRef = useRef<number>(0);

  // Level Save Data (1-40)
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelSaveData>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEVELS);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initial: Record<number, LevelSaveData> = {};
    for (let i = 1; i <= 40; i++) {
      initial[i] = {
        unlocked: i === 1, // Level 1 is unlocked & starts very difficult
        completed: false,
        stars: 0,
        highScore: 0,
      };
    }
    return initial;
  });

  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BEST);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const saveLevelProgress = (prog: Record<number, LevelSaveData>, best: number) => {
    setLevelProgress(prog);
    setBestScore(best);
    try {
      localStorage.setItem(STORAGE_KEY_LEVELS, JSON.stringify(prog));
      localStorage.setItem(STORAGE_KEY_BEST, String(best));
    } catch {}
  };

  // Live Physics Entities
  const discsRef = useRef<Disc[]>([]);
  const ballRef = useRef<Ball>({
    x: 200,
    y: 350,
    vx: 0,
    vy: 0,
    radius: 12,
    mass: 1.0,
    friction: 0.983,
    restitution: 0.88,
    spin: 0,
    rollAngleX: 0,
    rollAngleY: 0,
    themeCountryId: userTeamId,
  });

  const pitchDimsRef = useRef<PitchDimensions>({
    pitchLeft: 30,
    pitchRight: 370,
    pitchTop: 50,
    pitchBottom: 650,
    width: 340,
    height: 600,
    centerX: 200,
    centerY: 350,
    goalWidth: 100,
    goalDepth: 35,
    topGoalY: 15,
    bottomGoalY: 685,
    centerCircleRadius: 48,
    penaltyAreaWidth: 170,
    penaltyAreaHeight: 85,
    goalAreaWidth: 100,
    goalAreaHeight: 35,
  });

  const particlesRef = useRef<Particle[]>([]);
  const aimStateRef = useRef<AimState>({
    isAiming: false,
    discId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    angle: 0,
    power: 0,
  });
  const aiAimStateRef = useRef<AimState>({
    isAiming: false,
    discId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    angle: 0,
    power: 0,
  });

  const [selectedDiscId, setSelectedDiscId] = useState<number | null>(null);
  const matchStartTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const aiShootTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial sound state
  useEffect(() => {
    buttonSoccerAudio.setEnabled(!isMuted);
  }, [isMuted]);

  // Synchronize Ball's Country Theme with chosen user team
  useEffect(() => {
    ballRef.current.themeCountryId = userTeamId;
  }, [userTeamId]);

  // Clean up RAF and destroy audio manager on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (aiShootTimeoutRef.current) clearTimeout(aiShootTimeoutRef.current);
      buttonSoccerAudio.destroy();
    };
  }, []);

  const userTeam = TEAMS[userTeamId] || TEAMS.ethiopia;
  const opponentTeam = TEAMS[opponentTeamId] || TEAMS.brazil;
  const currentLevelConfig = BUTTON_SOCCER_LEVELS.find((l) => l.levelNum === currentLevelNum) || BUTTON_SOCCER_LEVELS[0];

  // ---------------------------------------------------------------------------
  // Layout & Pitch Dimensions Calculation
  // ---------------------------------------------------------------------------
  const updatePitchDimensions = useCallback((canvasWidth: number, canvasHeight: number) => {
    const marginX = Math.max(16, canvasWidth * 0.05);
    const marginY = Math.max(28, canvasHeight * 0.05);

    const pitchLeft = marginX;
    const pitchRight = canvasWidth - marginX;
    const pitchTop = marginY;
    const pitchBottom = canvasHeight - marginY;
    const width = pitchRight - pitchLeft;
    const height = pitchBottom - pitchTop;
    const centerX = canvasWidth * 0.5;
    const centerY = (pitchTop + pitchBottom) * 0.5;

    const goalWidth = width * 0.32;
    const goalDepth = 32;

    const dims: PitchDimensions = {
      pitchLeft,
      pitchRight,
      pitchTop,
      pitchBottom,
      width,
      height,
      centerX,
      centerY,
      goalWidth,
      goalDepth,
      topGoalY: pitchTop - goalDepth,
      bottomGoalY: pitchBottom + goalDepth,
      centerCircleRadius: width * 0.16,
      penaltyAreaWidth: width * 0.54,
      penaltyAreaHeight: height * 0.16,
      goalAreaWidth: width * 0.32,
      goalAreaHeight: height * 0.065,
    };

    pitchDimsRef.current = dims;
    physicsRef.current?.updateDimensions(dims);
    rendererRef.current?.setSize(canvasWidth, canvasHeight);
  }, []);

  // ---------------------------------------------------------------------------
  // Formation Reset (Kickoff setup)
  // ---------------------------------------------------------------------------
  const resetFormations = useCallback((kickingOffTeam: 'user' | 'opponent' = 'user') => {
    const dims = pitchDimsRef.current;
    const { centerX, centerY, pitchTop, pitchBottom, width, height } = dims;
    const discRadius = Math.max(18, Math.min(24, width * 0.065));

    // Reset Ball to Center Spot with User's Chosen Country Theme!
    ballRef.current = {
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      radius: discRadius * 0.56,
      mass: 1.0,
      friction: 0.983,
      restitution: 0.88,
      spin: 0,
      rollAngleX: 0,
      rollAngleY: 0,
      themeCountryId: userTeamId,
    };

    // 5 Discs per team: 1 Goalkeeper, 2 Defenders, 2 Attackers
    const newDiscs: Disc[] = [
      // --- USER DISCS (Bottom half) ---
      // 1. Goalkeeper
      {
        id: 1,
        team: 'user',
        x: centerX,
        y: pitchBottom - height * 0.06,
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
        isGoalkeeper: true,
      },
      // 2. Left Defender
      {
        id: 2,
        team: 'user',
        x: centerX - width * 0.24,
        y: pitchBottom - height * 0.18,
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
      },
      // 3. Right Defender
      {
        id: 3,
        team: 'user',
        x: centerX + width * 0.24,
        y: pitchBottom - height * 0.18,
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
      },
      // 4. Left Attacker
      {
        id: 4,
        team: 'user',
        x: centerX - width * 0.16,
        y: centerY + height * 0.12,
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
      },
      // 5. Center/Right Attacker (Striker)
      {
        id: 5,
        team: 'user',
        x: centerX + width * 0.16,
        y: centerY + (kickingOffTeam === 'user' ? height * 0.07 : height * 0.14),
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
      },

      // --- OPPONENT DISCS (Top half) ---
      // 6. Goalkeeper
      {
        id: 6,
        team: 'opponent',
        x: centerX,
        y: pitchTop + height * 0.06,
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
        isGoalkeeper: true,
      },
      // 7. Left Defender
      {
        id: 7,
        team: 'opponent',
        x: centerX - width * 0.24,
        y: pitchTop + height * 0.18,
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
      },
      // 8. Right Defender
      {
        id: 8,
        team: 'opponent',
        x: centerX + width * 0.24,
        y: pitchTop + height * 0.18,
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
      },
      // 9. Left Attacker
      {
        id: 9,
        team: 'opponent',
        x: centerX - width * 0.16,
        y: centerY - height * 0.12,
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
      },
      // 10. Center/Right Attacker
      {
        id: 10,
        team: 'opponent',
        x: centerX + width * 0.16,
        y: centerY - (kickingOffTeam === 'opponent' ? height * 0.07 : height * 0.14),
        vx: 0,
        vy: 0,
        radius: discRadius,
        mass: 2.5,
        friction: 0.985,
        restitution: 0.85,
      },
    ];

    discsRef.current = newDiscs;
    setSelectedDiscId(null);
    aimStateRef.current = {
      isAiming: false,
      discId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      angle: 0,
      power: 0,
    };
    if (physicsRef.current) {
      physicsRef.current.hasScoredThisPlay = false;
    }
  }, [userTeamId]);

  // ---------------------------------------------------------------------------
  // Launch Match Setup Flow
  // ---------------------------------------------------------------------------
  const openMatchSetup = (mode: MatchMode = 'CHAMPIONSHIP', lvlNum: number = 1) => {
    setMatchMode(mode);
    setCurrentLevelNum(lvlNum);

    const lvlConfig = BUTTON_SOCCER_LEVELS.find((l) => l.levelNum === lvlNum) || BUTTON_SOCCER_LEVELS[0];
    setTargetGoals(lvlConfig.targetGoals);
    // Dynamically assign opponent from tournament rotation ensuring it never equals user's country
    const autoOpponent = getOpponentForLevel(lvlNum, userTeamId);
    setOpponentTeamId(autoOpponent);
    setGameState('MATCH_SETUP');
  };

  const kickoffMatch = () => {
    setGameState('PLAYING');
    matchStartTimeRef.current = Date.now();
    buttonSoccerAudio.playWhistle(false);

    // Canvas setup
    const canvas = canvasRef.current;
    const canvasContainer = canvasContainerRef.current || containerRef.current;
    if (!canvas || !canvasContainer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvasContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(rect.width || 360, 280);
    const height = Math.max(
      canvasContainer === containerRef.current ? rect.height - 64 : rect.height || 560,
      400
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    updatePitchDimensions(width, height);
    rendererRef.current = new ButtonSoccerRenderer(ctx);
    rendererRef.current.setSize(width, height);

    physicsRef.current = new ButtonSoccerPhysics(pitchDimsRef.current, {
      onKick: (power) => {
        buttonSoccerAudio.playKick(power);
        try {
          if (hapticsEnabled && power > 0.4) navigator.vibrate?.(25);
        } catch {}
      },
      onDiscClack: (intensity) => {
        buttonSoccerAudio.playDiscClack(intensity);
      },
      onWallBounce: (intensity) => {
        buttonSoccerAudio.playWallBounce(intensity);
      },
    });

    userScoreRef.current = 0;
    opponentScoreRef.current = 0;
    setUserScore(0);
    setOpponentScore(0);
    setMatchElapsedSec(0);
    userShotsRef.current = 0;
    userTurnsRef.current = 0;
    lastShooterRef.current = 'opponent'; // Human takes first kickoff
    selectedDiscIdRef.current = null;
    setSelectedDiscId(null);
    aimStateRef.current = {
      isAiming: false,
      discId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      angle: 0,
      power: 0,
    };
    setMatchPhase('HUMAN_AIM');

    resetFormations('user');
    startMainGameLoop();
  };

  // ---------------------------------------------------------------------------
  // Main Game Loop (Delta-Time Independent Physics & Rendering)
  // ---------------------------------------------------------------------------
  const startMainGameLoop = () => {
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(Math.max((now - lastTimeRef.current) / 1000, 0.001), 0.05);
      lastTimeRef.current = now;

      const physics = physicsRef.current;
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;

      if (physics && renderer && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 1. Step Physics Simulation
          const { goalScored } = physics.step(dt, discsRef.current, ballRef.current);

          // 2. Goal Detection
          if (goalScored) {
            handleGoalScored(goalScored);
          }

          // 3. Motion Settling Check when Physics is active
          // Pure physics-settling driven turn transitions - NO timers controlling match
          if (matchPhaseRef.current === 'PHYSICS_SETTLING' && !goalScored) {
            const isSettled = physics.isMotionSettled(discsRef.current, ballRef.current);
            const isSafetyTimeout = now - physicsSettlingStartTimeRef.current > 5500;
            if (isSettled || isSafetyTimeout) {
              // Bring residual motions to complete rest
              ballRef.current.vx = 0;
              ballRef.current.vy = 0;
              for (const d of discsRef.current) {
                d.vx = 0;
                d.vy = 0;
              }

              // Switch turn automatically based on who took the last shot
              handleTurnTransition();
            }
          }

          // 4. Render Scene
          renderer.renderPitch(pitchDimsRef.current, now);
          renderer.renderDiscs(
            discsRef.current,
            userTeam,
            opponentTeam,
            selectedDiscIdRef.current,
            now
          );
          // Real 3D Soccer Ball with User's Chosen Country Theme!
          renderer.renderBall(ballRef.current, userTeam, opponentTeam);

          // Render User Aiming (drag-back slingshot) or AI Aiming (trajectory arrow)
          if (aimStateRef.current.isAiming) {
            renderer.renderAiming(aimStateRef.current, discsRef.current, false);
          } else if (aiAimStateRef.current.isAiming) {
            renderer.renderAiming(aiAimStateRef.current, discsRef.current, true);
          }

          renderer.renderParticles(particlesRef.current);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(loop);
  };

  // ---------------------------------------------------------------------------
  // Automatic Alternating Turn Handoff (HUMAN <-> COMPUTER)
  // Driven strictly by physics settling - No next button or manual trigger needed
  // ---------------------------------------------------------------------------
  const handleTurnTransition = () => {
    const previousShooter = lastShooterRef.current;
    if (previousShooter === 'user') {
      // User just finished shot -> automatically transition to COMPUTER
      setMatchPhase('COMPUTER_THINKING');
      scheduleComputerTurn();
    } else {
      // Computer just finished shot -> automatically transition to HUMAN
      setMatchPhase('HUMAN_AIM');
      buttonSoccerAudio.playTurnChime(true);
    }
  };

  // ---------------------------------------------------------------------------
  // Computer AI Turn Execution
  // COMPUTER_THINKING -> COMPUTER_AIM (shows trajectory) -> COMPUTER_SHOT
  // ---------------------------------------------------------------------------
  const scheduleComputerTurn = () => {
    if (aiShootTimeoutRef.current) clearTimeout(aiShootTimeoutRef.current);

    // AI analyzes field for 380ms
    aiShootTimeoutRef.current = setTimeout(() => {
      const decision = ButtonSoccerAI.computeBestShot(
        discsRef.current,
        ballRef.current,
        pitchDimsRef.current,
        currentLevelConfig
      );

      if (decision) {
        const disc = discsRef.current.find((d) => d.id === decision.discId);
        if (disc) {
          // Highlight computer disc and display aiming trajectory
          setSelectedDiscId(decision.discId);
          aiAimStateRef.current = {
            isAiming: true,
            discId: decision.discId,
            startX: disc.x,
            startY: disc.y,
            currentX: 0,
            currentY: 0,
            angle: decision.aimAngle,
            power: decision.powerNormalized,
          };
          setMatchPhase('COMPUTER_AIM');

          // Hold aim arrow for 360ms then release kick
          aiShootTimeoutRef.current = setTimeout(() => {
            aiAimStateRef.current.isAiming = false;
            setSelectedDiscId(null);

            lastShooterRef.current = 'opponent';
            disc.vx = decision.shotVx;
            disc.vy = decision.shotVy;
            physicsSettlingStartTimeRef.current = performance.now();
            buttonSoccerAudio.playKick(decision.powerNormalized);
            setMatchPhase('PHYSICS_SETTLING');
          }, 360);
          return;
        }
      }

      // Fallback if no decision
      setMatchPhase('HUMAN_AIM');
    }, 380);
  };

  // ---------------------------------------------------------------------------
  // Goal Celebration & Reset Flow
  // ---------------------------------------------------------------------------
  const handleGoalScored = (scoringTeam: 'user' | 'opponent') => {
    setMatchPhase('GOAL_CELEBRATION');
    buttonSoccerAudio.playGoal();
    try {
      if (hapticsEnabled) navigator.vibrate?.([60, 60, 100]);
    } catch {}

    const isUserGoal = scoringTeam === 'user';
    if (isUserGoal) {
      userScoreRef.current += 1;
    } else {
      opponentScoreRef.current += 1;
    }
    const nextUserScore = userScoreRef.current;
    const nextOpponentScore = opponentScoreRef.current;

    setUserScore(nextUserScore);
    setOpponentScore(nextOpponentScore);
    setGoalCelebrationText(isUserGoal ? `${userTeam.name.toUpperCase()} GOAL!` : `${opponentTeam.name.toUpperCase()} GOAL!`);
    setGameState('GOAL_CELEBRATION');

    // Spawn celebratory confetti particles
    const centerX = pitchDimsRef.current.centerX;
    const centerY = isUserGoal ? pitchDimsRef.current.pitchTop + 30 : pitchDimsRef.current.pitchBottom - 30;
    const colors = isUserGoal 
      ? [userTeam.primaryColor, userTeam.secondaryColor, '#00E5FF', '#FFFFFF'] 
      : [opponentTeam.primaryColor, opponentTeam.secondaryColor, '#FF5252', '#FFFFFF'];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 60;
      particlesRef.current.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 1.2,
        size: Math.random() * 5 + 3,
      });
    }

    // Check Match Finish condition or reset kickoff
    setTimeout(() => {
      particlesRef.current = [];

      if (nextUserScore >= targetGoals || nextOpponentScore >= targetGoals) {
        finishMatch(nextUserScore, nextOpponentScore);
      } else {
        // Conceding team kicks off from center
        resetFormations(isUserGoal ? 'opponent' : 'user');
        setGameState('PLAYING');

        // If human conceded, human gets kickoff
        // If computer conceded, computer kicks off
        if (isUserGoal) {
          lastShooterRef.current = 'user';
          setMatchPhase('COMPUTER_THINKING');
          scheduleComputerTurn();
        } else {
          lastShooterRef.current = 'opponent';
          setMatchPhase('HUMAN_AIM');
          buttonSoccerAudio.playTurnChime(true);
        }
      }
    }, 1800);
  };

  // ---------------------------------------------------------------------------
  // Match Finished (Victory / Defeat) with Deterministic Scoring
  // ---------------------------------------------------------------------------
  const finishMatch = (finalUser: number, finalOpp: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (aiShootTimeoutRef.current) clearTimeout(aiShootTimeoutRef.current);

    const duration = Math.max(1, Math.floor((Date.now() - matchStartTimeRef.current) / 1000));
    const hasWon = finalUser > finalOpp;
    const isDraw = finalUser === finalOpp;

    setMatchResultWinner(hasWon ? 'user' : isDraw ? 'draw' : 'opponent');

    const stats = computeDeterministicScore(
      finalUser,
      finalOpp,
      userShotsRef.current,
      userTurnsRef.current,
      duration,
      currentLevelNum,
      hasWon
    );
    setLastMatchStats(stats);

    if (hasWon) {
      buttonSoccerAudio.playVictory();
      onGameOver(stats.finalScore, duration);

      if (matchMode === 'CHAMPIONSHIP') {
        const updated = { ...levelProgress };
        const currentRec = updated[currentLevelNum] || { unlocked: true, completed: false, stars: 0, highScore: 0 };
        updated[currentLevelNum] = {
          unlocked: true,
          completed: true,
          stars: Math.max(currentRec.stars, stats.stars),
          highScore: Math.max(currentRec.highScore, stats.finalScore),
        };

        if (currentLevelNum < 40) {
          updated[currentLevelNum + 1] = {
            ...updated[currentLevelNum + 1],
            unlocked: true,
          };
        }

        const newBest = Math.max(bestScore, stats.finalScore);
        saveLevelProgress(updated, newBest);
      }
    } else {
      buttonSoccerAudio.playDefeat();
      onGameOver(stats.finalScore, duration);
    }

    setGameState('MATCH_OVER');
  };

  // ---------------------------------------------------------------------------
  // Elapsed Match Time (Only for score speed bonus and tournament display)
  // No timer countdown forcibly ending user turns
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setMatchElapsedSec((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // ---------------------------------------------------------------------------
  // Canvas Resize Observer (Ensures canvas buffer exactly matches CSS viewport)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const pixelW = Math.round(width * dpr);
        const pixelH = Math.round(height * dpr);

        if (canvas.width !== pixelW || canvas.height !== pixelH) {
          canvas.width = pixelW;
          canvas.height = pixelH;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          const oldW = pitchDimsRef.current.width;
          const oldH = pitchDimsRef.current.height;

          updatePitchDimensions(width, height);
          rendererRef.current?.setSize(width, height);

          // Proportional scaling for discs & ball if container resizes during match
          if (oldW > 0 && oldH > 0 && (Math.abs(oldW - width) > 4 || Math.abs(oldH - height) > 4)) {
            const sx = width / oldW;
            const sy = height / oldH;
            for (const d of discsRef.current) {
              d.x *= sx;
              d.y *= sy;
            }
            ballRef.current.x *= sx;
            ballRef.current.y *= sy;
          }
        }
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [updatePitchDimensions]);

  // ---------------------------------------------------------------------------
  // Touch / Pointer Input Handling on Canvas
  // ALL 5 HUMAN PLAYERS ARE INDIVIDUALLY SELECTABLE AND CONTROLLABLE
  // ---------------------------------------------------------------------------
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const logicalW = canvas.width / dpr;
    const logicalH = canvas.height / dpr;
    const scaleX = rect.width > 0 ? logicalW / rect.width : 1;
    const scaleY = rect.height > 0 ? logicalH / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only accept input during human aiming phase
    if (gameState !== 'PLAYING' || matchPhaseRef.current !== 'HUMAN_AIM') return;
    e.preventDefault();

    const { x, y } = getCanvasCoords(e);
    pointerTouchStartRef.current = { x, y, time: performance.now() };

    // Get all 5 human players (strictly team === 'user')
    const userDiscs = discsRef.current.filter((d) => d.team === 'user');

    // 1. Check if user tapped directly on or near ANY of the 5 human player buttons
    let tappedPlayer: Disc | null = null;
    let minTappedDist = Infinity;

    for (const d of userDiscs) {
      const dist = Math.hypot(d.x - x, d.y - y);
      // Generous hit target: disc radius + 18px (at least 38px radius / 76px touch diameter)
      const hitRadius = Math.max(d.radius + 18, 38);
      if (dist <= hitRadius && dist < minTappedDist) {
        minTappedDist = dist;
        tappedPlayer = d;
      }
    }

    let activePlayer: Disc | null = null;

    if (tappedPlayer) {
      // User tapped or switched to this human player (e.g. Player 1, 2, 3, 4, or 5)
      activePlayer = tappedPlayer;
      selectedDiscIdRef.current = tappedPlayer.id;
      setSelectedDiscId(tappedPlayer.id);
      buttonSoccerAudio.playSelect();
      try {
        if (hapticsEnabled) navigator.vibrate?.(15);
      } catch {}
    } else if (selectedDiscIdRef.current !== null) {
      // A human player is already selected, and user touched empty field to drag/aim
      activePlayer = userDiscs.find((d) => d.id === selectedDiscIdRef.current) || null;
    } else {
      // No player was selected yet and user touched pitch -> select closest human player
      let closestDisc: Disc | null = null;
      let closestDist = Infinity;
      for (const d of userDiscs) {
        const dist = Math.hypot(d.x - x, d.y - y);
        if (dist < closestDist) {
          closestDist = dist;
          closestDisc = d;
        }
      }
      if (closestDisc) {
        activePlayer = closestDisc;
        selectedDiscIdRef.current = closestDisc.id;
        setSelectedDiscId(closestDisc.id);
        buttonSoccerAudio.playSelect();
      }
    }

    if (activePlayer) {
      try {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {}

      // Aiming originates from the ACTIVE selected human player!
      aimStateRef.current = {
        isAiming: true,
        discId: activePlayer.id,
        startX: activePlayer.x,
        startY: activePlayer.y,
        currentX: activePlayer.x,
        currentY: activePlayer.y,
        angle: 0,
        power: 0,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!aimStateRef.current.isAiming || aimStateRef.current.discId === null) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);

    const touchStart = pointerTouchStartRef.current;
    // Calculate drag displacement from initial touch position
    const dragDeltaX = touchStart ? x - touchStart.x : x - aimStateRef.current.startX;
    const dragDeltaY = touchStart ? y - touchStart.y : y - aimStateRef.current.startY;
    const dragDist = Math.hypot(dragDeltaX, dragDeltaY);

    // Max drag power distance ~ 125px
    const maxDrag = 125;
    const power = Math.min(1.0, Math.max(0, dragDist / maxDrag));

    // Slingshot forward angle is opposite of drag
    const aimAngle = Math.atan2(-dragDeltaY, -dragDeltaX);

    // Aim line pulls back from the selected disc's actual position
    aimStateRef.current.currentX = aimStateRef.current.startX + dragDeltaX;
    aimStateRef.current.currentY = aimStateRef.current.startY + dragDeltaY;
    aimStateRef.current.power = power;
    aimStateRef.current.angle = aimAngle;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    const touchStart = pointerTouchStartRef.current;
    pointerTouchStartRef.current = null;

    if (!aimStateRef.current.isAiming || aimStateRef.current.discId === null) {
      return;
    }
    e.preventDefault();

    const { x, y } = getCanvasCoords(e);
    const discId = aimStateRef.current.discId;

    // Measure total drag displacement by the user's finger
    const totalDragDist = touchStart ? Math.hypot(x - touchStart.x, y - touchStart.y) : 0;
    const power = aimStateRef.current.power;

    // Minimum drag threshold: 16px displacement AND power > 0.08
    // If user dragged less than 16px, this was a TAP / SELECTION event, NOT a shot!
    if (totalDragDist >= 16 && power >= 0.08) {
      const disc = discsRef.current.find((d) => d.id === discId);
      if (disc) {
        const dragDx = touchStart ? x - touchStart.x : x - disc.x;
        const dragDy = touchStart ? y - touchStart.y : y - disc.y;
        const dist = Math.hypot(dragDx, dragDy);

        const dirX = -dragDx / dist;
        const dirY = -dragDy / dist;

        const maxSpeed = 740;
        const launchSpeed = power * maxSpeed;

        disc.vx = dirX * launchSpeed;
        disc.vy = dirY * launchSpeed;

        lastShooterRef.current = 'user';
        userShotsRef.current += 1;
        userTurnsRef.current += 1;
        physicsSettlingStartTimeRef.current = performance.now();

        buttonSoccerAudio.playKick(power);
        try {
          if (hapticsEnabled) navigator.vibrate?.(20);
        } catch {}

        // Release shot: clear active selection & aiming
        selectedDiscIdRef.current = null;
        setSelectedDiscId(null);
        aimStateRef.current = {
          isAiming: false,
          discId: null,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          angle: 0,
          power: 0,
        };

        // Transition to PHYSICS_SETTLING -> Input locked until discs settle
        setMatchPhase('PHYSICS_SETTLING');
        return;
      }
    }

    // TAP / SWITCH PLAYER EVENT:
    // The user tapped a player to select it or switch to it!
    // KEEP selectedDiscIdRef.current and setSelectedDiscId active!
    // Only stop the drag visualization line:
    aimStateRef.current = {
      isAiming: false,
      discId: discId,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      angle: 0,
      power: 0,
    };
  };

  // ---------------------------------------------------------------------------
  // Top HUD Action Handlers
  // ---------------------------------------------------------------------------
  const handlePause = () => {
    buttonSoccerAudio.playClick();
    setGameState('PAUSED');
  };

  const handleResume = () => {
    buttonSoccerAudio.playClick();
    setGameState('PLAYING');
    lastTimeRef.current = performance.now();
  };

  const handleRestart = () => {
    buttonSoccerAudio.playClick();
    userScoreRef.current = 0;
    opponentScoreRef.current = 0;
    setUserScore(0);
    setOpponentScore(0);
    setMatchElapsedSec(0);
    userShotsRef.current = 0;
    userTurnsRef.current = 0;
    lastShooterRef.current = 'opponent';
    selectedDiscIdRef.current = null;
    setSelectedDiscId(null);
    aimStateRef.current = {
      isAiming: false,
      discId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      angle: 0,
      power: 0,
    };
    setMatchPhase('HUMAN_AIM');
    resetFormations('user');
    setGameState('PLAYING');
    lastTimeRef.current = performance.now();
  };

  const handleBackToSelect = () => {
    buttonSoccerAudio.playClick();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setGameState('MENU');
  };

  const handleToggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    buttonSoccerAudio.setEnabled(!nextState);
  };

  const formatMatchTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ===========================================================================
  // RENDER VIEWPORT
  // ===========================================================================
  return (
    <div
      id="button-soccer-viewport"
      ref={containerRef}
      className="relative w-full h-full max-w-lg md:max-w-xl mx-auto flex flex-col justify-between overflow-hidden bg-[#071018] text-white select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* =====================================================================
          1. MAIN PRE-GAME MENU
         ===================================================================== */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-[#0B1E30] via-[#071522] to-[#040C14] text-center select-none animate-in fade-in duration-200">
          {/* Top Bar with Sound, Settings & Back to Portal */}
          <div className="w-full flex items-center justify-between pt-1">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                buttonSoccerAudio.destroy();
                onExit();
              }}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/15"
              aria-label="Back to portal"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  buttonSoccerAudio.playClick();
                  setGameState('SETTINGS');
                }}
                className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/15"
                aria-label="Settings"
              >
                <Sliders className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={handleToggleSound}
                className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/15"
                aria-label="Toggle Sound"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-[#8BCB3D]" />}
              </button>
            </div>
          </div>

          {/* Central Showcase: 3D Soccer Ball & Country Flag Badge */}
          <div className="flex flex-col items-center justify-center my-auto space-y-3">
            {/* Interactive 3D Soccer Ball Preview for the Selected Country */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#00E5FF]/20 blur-2xl animate-pulse" />
              <BallPreview team={userTeam} size={110} />
            </div>

            {/* Title from Video: BUTTON SOCCER / 2026 WORLD TOUR */}
            <div className="space-y-0.5">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-lg italic uppercase leading-none">
                BUTTON SOCCER
              </h1>
              <h2 className="text-xs sm:text-sm font-extrabold tracking-widest text-amber-400 uppercase drop-shadow flex items-center justify-center gap-1">
                <span>🏆 2026 WORLD TOUR</span>
              </h2>
            </div>

            {/* Selected Country Pill Button (Controls ball asset) */}
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('COUNTRY_SELECT');
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 flex items-center gap-3 transition-all cursor-pointer shadow-lg mt-2"
            >
              <span className="text-2xl">{userTeam.flagEmoji}</span>
              <div className="text-left leading-tight">
                <p className="text-[10px] uppercase font-bold text-slate-300">Your Country • Tap to Change</p>
                <p className="text-sm font-black text-white">{userTeam.name} ({userTeam.code})</p>
              </div>
            </button>
          </div>

          {/* Clean Main Menu Action Buttons */}
          <div className="w-full max-w-xs space-y-2.5 pb-2 flex flex-col items-center">
            {/* PLAY / MATCH SETUP */}
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                openMatchSetup('CHAMPIONSHIP', currentLevelNum);
              }}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#FFD54F] via-[#FFCA28] to-[#FFA000] hover:brightness-110 active:scale-95 text-[#0F1E2E] font-black text-base tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-300"
            >
              <Play className="w-4 h-4 fill-current text-[#0F1E2E]" />
              <span>PLAY MATCH</span>
            </button>

            {/* LEVELS (1-40) */}
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('LEVEL_SELECT');
              }}
              className="w-full h-11 rounded-2xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 active:scale-95 text-white font-black text-sm tracking-wider flex items-center justify-center gap-2 border border-[#00E5FF]/40 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#00E5FF]" />
              <span>40 LEVELS (LEVEL 1: HARD)</span>
            </button>

            {/* LEADERBOARD */}
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('LEADERBOARD');
              }}
              className="w-full h-11 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-black text-sm tracking-wider flex items-center justify-center gap-2 border border-amber-400/40 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>LEADERBOARD</span>
            </button>

            {/* Secondary Navigation Row: HOW TO PLAY & GAME RULES */}
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  buttonSoccerAudio.playClick();
                  setGameState('HOW_TO_PLAY');
                }}
                className="h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>HOW TO PLAY</span>
              </button>

              <button
                onClick={() => {
                  buttonSoccerAudio.playClick();
                  setGameState('GAME_RULES');
                }}
                className="h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                <span>GAME RULES</span>
              </button>
            </div>

            {/* ABOUT */}
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('ABOUT');
              }}
              className="text-xs text-slate-400 hover:text-white pt-1 transition-colors flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span>About Button Soccer</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. COUNTRY SELECTION SCREEN
          (Selected Country controls user soccer ball asset!)
         ===================================================================== */}
      {gameState === 'COUNTRY_SELECT' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#071522] text-white p-4 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <h2 className="text-base font-black tracking-tight uppercase text-white">Select Your Country</h2>
              <p className="text-[10px] text-amber-400 font-bold">Country controls your 3D football</p>
            </div>

            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/20">
            {TEAMS_LIST.map((team) => {
              const isSelected = team.id === userTeamId;
              return (
                <button
                  key={team.id}
                  onClick={() => {
                    buttonSoccerAudio.playClick();
                    setUserTeamId(team.id);
                    ballRef.current.themeCountryId = team.id;
                    try {
                      localStorage.setItem(STORAGE_KEY_USER_TEAM, team.id);
                    } catch {}
                    if (opponentTeamId === team.id) {
                      const nextOpponent = getOpponentForLevel(currentLevelNum, team.id);
                      setOpponentTeamId(nextOpponent);
                    }
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00E5FF]/25 to-[#0091EA]/35 border-[#00E5FF] shadow-md shadow-[#00E5FF]/20 cursor-pointer'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 cursor-pointer active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team.flagEmoji}</span>
                    <div className="text-left">
                      <p className="text-sm font-black text-white">{team.name}</p>
                      <p className="text-[11px] text-slate-300 font-bold">{team.code} • National Football</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <BallPreview team={team} size={42} />
                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#00E5FF] text-[#071522] text-[10px] font-black uppercase flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Selected
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">Select</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFA000] hover:brightness-110 active:scale-95 text-[#0F1E2E] font-black text-sm tracking-wider uppercase flex items-center justify-center transition-all cursor-pointer border border-amber-300"
            >
              <span>CONTINUE WITH {userTeam.name.toUpperCase()}</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. MATCH SETUP SCREEN
         ===================================================================== */}
      {gameState === 'MATCH_SETUP' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#071522] text-white p-5 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-base font-black tracking-tight uppercase text-white">Match Setup</h2>

            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col justify-center items-center my-auto space-y-5">
            {/* Match Header Badge */}
            <div className="space-y-1 text-center">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                {currentLevelConfig.title}
              </span>
              <p className="text-xs text-slate-300 font-bold mt-1">
                FIRST TO {targetGoals} GOALS • TOURNAMENT MATCH
              </p>
            </div>

            {/* VS Card (User Team vs Computer Team) */}
            <div className="w-full max-w-sm rounded-3xl bg-[#0F2236] border border-white/20 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                {/* User Country */}
                <div className="flex flex-col items-center text-center space-y-2 flex-1">
                  <span className="text-4xl">{userTeam.flagEmoji}</span>
                  <BallPreview team={userTeam} size={54} />
                  <div>
                    <p className="text-sm font-black text-white">{userTeam.name}</p>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">YOU (P1)</span>
                  </div>
                </div>

                <div className="px-2">
                  <span className="text-2xl font-black text-amber-400 italic">VS</span>
                </div>

                {/* Computer Country */}
                <div className="flex flex-col items-center text-center space-y-2 flex-1">
                  <span className="text-4xl">{opponentTeam.flagEmoji}</span>
                  <BallPreview team={opponentTeam} size={54} />
                  <div>
                    <p className="text-sm font-black text-white">{opponentTeam.name}</p>
                    <span className="text-[10px] text-red-400 font-bold uppercase">COMPUTER</span>
                  </div>
                </div>
              </div>

              {/* Difficulty Bar */}
              <div className="mt-4 pt-4 border-t border-white/10 text-center space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>AI DIFFICULTY</span>
                  <span className="text-amber-400 font-black">
                    {Math.round(currentLevelConfig.aiDifficulty * 100)}% (VERY HARD)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                    style={{ width: `${currentLevelConfig.aiDifficulty * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions: Change Country, Change Rival, Change Level */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  buttonSoccerAudio.playClick();
                  setGameState('COUNTRY_SELECT');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Change Country
              </button>

              <button
                onClick={() => {
                  buttonSoccerAudio.playClick();
                  const rivals = TEAMS_LIST.filter((t) => t.id !== userTeamId);
                  const currIdx = rivals.findIndex((t) => t.id === opponentTeamId);
                  const nextIdx = (currIdx + 1) % rivals.length;
                  setOpponentTeamId(rivals[nextIdx].id);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-amber-300 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Shuffle className="w-3 h-3" />
                <span>Change Rival</span>
              </button>

              <button
                onClick={() => {
                  buttonSoccerAudio.playClick();
                  setGameState('LEVEL_SELECT');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Change Level
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                kickoffMatch();
              }}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFA000] hover:brightness-110 active:scale-95 text-[#0F1E2E] font-black text-base tracking-wider uppercase shadow-lg shadow-amber-500/30 transition-all cursor-pointer border border-amber-300 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START MATCH</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. HOW TO PLAY SCREEN (Real comprehensive instructions)
         ===================================================================== */}
      {gameState === 'HOW_TO_PLAY' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#071522] text-white p-5 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-base font-black tracking-tight uppercase text-white">How To Play</h2>

            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-left scrollbar-thin scrollbar-thumb-white/20 text-sm">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">Alternating Turn Football</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                You play against the computer in an authentic alternating-turn button soccer match. The match alternates continuously: <strong className="text-white">YOU → COMPUTER → YOU → COMPUTER</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Your Turn (Aiming & Shooting)</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                1. Touch any of your 5 discs (or tap near the ball to automatically select the nearest disc).<br />
                2. <strong className="text-white">Drag backward</strong> like a slingshot to set your shot angle and power.<br />
                3. The trajectory arrow shows your target line. Release your finger to shoot!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">Computer Turn</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                After your shot completely settles, the computer automatically analyzes the pitch, targets your goal corners, and shoots. No manual buttons required!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">Ball Physics & Collisions</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                The 3D soccer ball responds realistically to shot power, wall cushions, and disc-to-disc clacks. Strike the ball behind its center to propel it forward into the net.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider">Match Objective & Goals</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                Score 3 goals before the computer does (or 5 goals in the Championship Final), or have the lead when the 2:00 match clock expires!
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <span>BACK TO MENU</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. GAME RULES SCREEN
         ===================================================================== */}
      {gameState === 'GAME_RULES' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#071522] text-white p-5 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-base font-black tracking-tight uppercase text-white">Game Rules</h2>

            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-left scrollbar-thin scrollbar-thumb-white/20 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-amber-300 uppercase mb-1">1. Match Format</h3>
              <p className="text-slate-300">Each match is 1v1 (User vs Computer). 5 player discs per team: 1 Goalkeeper, 2 Defenders, 2 Attackers.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-amber-300 uppercase mb-1">2. Shot Clock (10 Seconds)</h3>
              <p className="text-slate-300">Players have 10 seconds per turn. If time expires, the turn automatically transfers to the opponent.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-amber-300 uppercase mb-1">3. Goals & Kickoff</h3>
              <p className="text-slate-300">A goal is scored when the entire ball crosses the goal line. After each goal, formations reset and the conceding team kicks off from the center circle.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-amber-300 uppercase mb-1">4. Victory Condition</h3>
              <p className="text-slate-300">First team to reach target goals (default 3) wins. If the 2:00 match timer reaches 0:00, the team with the highest score wins.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-amber-300 uppercase mb-1">5. Championship Star Rating</h3>
              <p className="text-slate-300">★★★ = Win with a clean sheet (0 goals conceded)<br />★★☆ = Win with at most 1 goal conceded<br />★☆☆ = Match victory</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <span>BACK TO MENU</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. SETTINGS SCREEN
         ===================================================================== */}
      {gameState === 'SETTINGS' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#071522] text-white p-5 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-base font-black tracking-tight uppercase text-white">Settings</h2>

            <div className="w-10" />
          </div>

          <div className="flex-1 py-4 space-y-4 text-left">
            {/* Sound Toggle */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Sound Effects (SFX)</p>
                <p className="text-xs text-slate-400">Sporty kicks, whistles, and goal horns</p>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-13 h-7 rounded-full p-0.5 transition-colors cursor-pointer ${!isMuted ? 'bg-[#00E5FF]' : 'bg-slate-700'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${!isMuted ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Haptics Toggle */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Vibration / Haptics</p>
                <p className="text-xs text-slate-400">Tactile kick and collision feedback</p>
              </div>
              <button
                onClick={() => setHapticsEnabled(!hapticsEnabled)}
                className={`w-13 h-7 rounded-full p-0.5 transition-colors cursor-pointer ${hapticsEnabled ? 'bg-[#00E5FF]' : 'bg-slate-700'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${hapticsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Reset Progress */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between mt-6">
              <div>
                <p className="text-sm font-bold text-red-400">Reset Level Progress</p>
                <p className="text-xs text-slate-400">Clear unlocked levels back to Level 1</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Reset all championship level progress?')) {
                    const initial: Record<number, LevelSaveData> = {};
                    for (let i = 1; i <= 40; i++) {
                      initial[i] = { unlocked: i === 1, completed: false, stars: 0, highScore: 0 };
                    }
                    saveLevelProgress(initial, 0);
                    buttonSoccerAudio.playClick();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold cursor-pointer transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <span>BACK TO MENU</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          7. ABOUT SCREEN
         ===================================================================== */}
      {gameState === 'ABOUT' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#071522] text-white p-5 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-base font-black tracking-tight uppercase text-white">About Game</h2>

            <div className="w-10" />
          </div>

          <div className="flex-1 py-4 space-y-4 text-center my-auto">
            <BallPreview team={userTeam} size={72} className="mx-auto" />
            <div>
              <h3 className="text-xl font-black italic uppercase">Button Soccer 2026</h3>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mt-0.5">World Tour Edition</p>
            </div>

            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Engineered with sub-stepping rigid body impulse physics, photorealistic 3D spherical soccer balls, 12 national football teams, and 40 championship levels scaling from Very Difficult up to Master.
            </p>

            <div className="text-[11px] text-slate-500 font-semibold space-y-0.5">
              <p>Procedural Web Audio Engine (Zero Background Loop Leak)</p>
              <p>Version 2.4.0 • 2026</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <span>BACK TO MENU</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          8. LEVEL SELECT SCREEN (40 Levels, Level 1 Unlocked & Very Difficult)
         ===================================================================== */}
      {gameState === 'LEVEL_SELECT' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#071522] text-white p-4 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                buttonSoccerAudio.playClick();
                setGameState('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <h2 className="text-base font-black tracking-tight uppercase text-white">Championship 40 Levels</h2>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Level 1 is Very Difficult
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 text-xs font-bold text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>{bestScore}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-3 pr-1 scrollbar-thin scrollbar-thumb-white/20">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {BUTTON_SOCCER_LEVELS.map((lvl) => {
                const rec = levelProgress[lvl.levelNum] || { unlocked: lvl.levelNum === 1, completed: false, stars: 0, highScore: 0 };
                const isUnlocked = rec.unlocked;
                const isCurrent = lvl.levelNum === currentLevelNum;

                return (
                  <button
                    key={lvl.levelNum}
                    disabled={!isUnlocked}
                    onClick={() => {
                      buttonSoccerAudio.playClick();
                      openMatchSetup('CHAMPIONSHIP', lvl.levelNum);
                    }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all border ${
                      !isUnlocked
                        ? 'bg-slate-900/60 border-white/5 opacity-50 cursor-not-allowed'
                        : isCurrent
                        ? 'bg-gradient-to-b from-[#FFD54F] to-[#FFA000] border-amber-300 text-slate-900 shadow-md shadow-amber-500/30 cursor-pointer active:scale-95'
                        : rec.completed
                        ? 'bg-gradient-to-b from-[#1D7A3F]/50 to-[#14522B]/70 border-[#238947] text-white cursor-pointer active:scale-95'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {!isUnlocked ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                      <>
                        <span className={`text-base font-black leading-none ${isCurrent ? 'text-slate-900' : 'text-white'}`}>
                          {lvl.levelNum}
                        </span>
                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${
                                s <= rec.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          8b. LEADERBOARD SCREEN
         ===================================================================== */}
      {gameState === 'LEADERBOARD' && (
        <div className="absolute inset-0 z-40 bg-[#071522] flex flex-col items-center justify-center p-4">
          <GameLeaderboardModal
            gameConfig={getGameConfig('button-soccer')}
            profile={profile}
            onClose={() => setGameState('MENU')}
          />
        </div>
      )}

      {/* =====================================================================
          9. TOP GAMEPLAY HUD (Back, Score, Pause, Sound)
         ===================================================================== */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GOAL_CELEBRATION') && (
        <header className="relative z-20 w-full px-3.5 pt-3 pb-1 flex flex-col gap-1.5 bg-gradient-to-b from-[#071018]/95 via-[#071018]/70 to-transparent">
          <div className="flex items-center justify-between gap-2">
            {/* [ BACK ] & [ PAUSE ] Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleBackToSelect}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
                aria-label="Back to menu"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={handlePause}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
                aria-label="Pause match"
              >
                <Pause className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Central Score Card: [ ETH 0 - 0 BRA ] */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 shadow-md">
                {/* Team 1 Flag */}
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{userTeam.flagEmoji}</span>
                  <span className="text-xs font-black tracking-wider text-white">{userTeam.code}</span>
                </div>

                {/* Score */}
                <span className="text-lg font-black text-white tracking-widest px-1">
                  {userScore} - {opponentScore}
                </span>

                {/* Team 2 Flag */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wider text-white">{opponentTeam.code}</span>
                  <span className="text-base leading-none">{opponentTeam.flagEmoji}</span>
                </div>
              </div>

              {/* Match Subtitle: FIRST TO 3 • 00:45 */}
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider mt-0.5">
                FIRST TO {targetGoals} • {formatMatchTime(matchElapsedSec)}
              </span>
            </div>

            {/* Right: Stage indicator + Sound Toggle */}
            <div className="flex items-center gap-1.5">
              <div className="px-2.5 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/35 flex flex-col items-center justify-center text-white">
                <span className="text-[10px] font-black leading-none text-[#00E5FF]">LVL {currentLevelNum}</span>
                <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-wider">
                  {matchPhase === 'HUMAN_AIM' ? 'YOU' : matchPhase === 'PHYSICS_SETTLING' ? 'ACTION' : 'CPU'}
                </span>
              </div>

              <button
                onClick={handleToggleSound}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
                aria-label="Toggle Sound"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#8BCB3D]" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* =====================================================================
          10. MAIN INTERACTIVE CANVAS VIEWPORT
          (User drag-to-aim shooting, automatic alternating turns, no Next button)
         ===================================================================== */}
      <div ref={canvasContainerRef} className="relative flex-1 w-full h-full overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block touch-none select-none cursor-crosshair"
          style={{ touchAction: 'none' }}
        />

        {/* Dynamic Turn Banner overlay on Pitch */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
            {matchPhase === 'HUMAN_AIM' && (
              <span className="text-xs font-black text-white/95 bg-black/60 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-white/20 backdrop-blur-sm shadow-xl">
                YOUR TURN
              </span>
            )}
            {matchPhase === 'COMPUTER_THINKING' && (
              <span className="text-xs font-black text-amber-300 bg-black/60 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-amber-400/30 backdrop-blur-sm animate-pulse shadow-xl">
                COMPUTER THINKING...
              </span>
            )}
            {matchPhase === 'COMPUTER_AIM' && (
              <span className="text-xs font-black text-red-400 bg-black/60 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-red-500/30 backdrop-blur-sm shadow-xl">
                COMPUTER AIMING...
              </span>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          11. GOAL CELEBRATION MODAL
         ===================================================================== */}
      {gameState === 'GOAL_CELEBRATION' && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none animate-in zoom-in-75 duration-300">
          <div className="space-y-3">
            <span className="text-6xl animate-bounce inline-block">⚽</span>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#FF9100] to-[#00E5FF] uppercase italic tracking-tight drop-shadow-2xl">
              {goalCelebrationText}
            </h2>
            <p className="text-2xl font-black text-white">
              {userScore} - {opponentScore}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================================
          12. PAUSE MODAL
         ===================================================================== */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-xs rounded-3xl bg-[#0F2236] border-2 border-white/20 p-5 text-center space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              MATCH PAUSED
            </h2>

            <div className="space-y-2.5">
              <button
                onClick={handleResume}
                className="w-full h-11 rounded-2xl bg-[#00E5FF] hover:bg-[#00b0ff] active:scale-95 text-[#0F1E2E] font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME MATCH</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART MATCH</span>
              </button>

              <button
                onClick={() => {
                  buttonSoccerAudio.playClick();
                  setGameState('HOW_TO_PLAY');
                }}
                className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>HOW TO PLAY</span>
              </button>

              <button
                onClick={handleBackToSelect}
                className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>MAIN MENU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          13. MATCH RESULT SCREEN (VICTORY / DEFEAT)
         ===================================================================== */}
      {gameState === 'MATCH_OVER' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-in zoom-in-90 duration-300">
          <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#0F2236] to-[#08131F] border-2 border-white/20 shadow-2xl p-6 text-center space-y-5">
            <div>
              <span className="text-5xl">{matchResultWinner === 'user' ? '🏆' : '⚽'}</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-2">
                {matchResultWinner === 'user' ? 'MATCH WON!' : matchResultWinner === 'draw' ? 'MATCH DRAW' : 'MATCH LOST'}
              </h2>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mt-0.5">
                {matchMode === 'CHAMPIONSHIP' ? `LEVEL ${currentLevelNum} COMPLETED` : 'MATCH FINISHED'}
              </p>
            </div>

            {/* Stars Award (for Championship victory) */}
            {matchResultWinner === 'user' && matchMode === 'CHAMPIONSHIP' && (
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-8 h-8 drop-shadow-lg ${
                      s <= (levelProgress[currentLevelNum]?.stars || 1)
                        ? 'fill-amber-400 text-amber-400 animate-bounce'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Final Score & Tournament Stats Card */}
            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>{userTeam.name}</span>
                <span>{opponentTeam.name}</span>
              </div>
              <div className="text-3xl font-black text-white">
                {userScore} - {opponentScore}
              </div>

              {lastMatchStats && (
                <div className="pt-2 border-t border-white/10 space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-xs font-black text-amber-300">
                    <span>TOURNAMENT SCORE</span>
                    <span>{lastMatchStats.finalScore.toLocaleString()} PTS</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 font-medium">
                    <span>Shots: {lastMatchStats.userShots}</span>
                    <span>Duration: {formatMatchTime(lastMatchStats.durationSec)}</span>
                    {lastMatchStats.cleanSheet && (
                      <span className="text-emerald-400 font-bold col-span-2">🛡️ Clean Sheet Defense Bonus</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {matchResultWinner === 'user' && matchMode === 'CHAMPIONSHIP' && currentLevelNum < 40 && (
                <button
                  onClick={() => {
                    buttonSoccerAudio.playClick();
                    openMatchSetup('CHAMPIONSHIP', currentLevelNum + 1);
                  }}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFA000] hover:brightness-110 active:scale-95 text-[#0F1E2E] font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer border border-amber-300"
                >
                  <span>NEXT LEVEL</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {matchResultWinner === 'user' && currentLevelNum === 40 && (
                <div className="p-3 bg-amber-400/15 rounded-xl border border-amber-400/30 text-amber-300 text-xs font-bold">
                  🏆 WORLD CHAMPIONSHIP WON! CONQUERED ALL 40 STAGES!
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>REPLAY</span>
                </button>

                <button
                  onClick={handleBackToSelect}
                  className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>MENU</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
