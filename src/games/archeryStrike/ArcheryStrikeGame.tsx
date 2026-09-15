/**
 * ARCHERY STRIKE 3D - Commercial Grade Ballistic Archery Tournament
 * 
 * Features:
 * - Real First-Person 3D WebGL Engine with Camera-Rigged Recurve Bow & Archer Hand
 * - Dynamic 3D Bow Limbs Tension, Animated Draw String & Nocked Arrow
 * - Real 3D Archery Range: Grassy turf, distance lane markers, trees, mountain horizon, sky dome & lighting
 * - Physical 3D Targets with Depth, Multi-Layer Tournament Ring Faceplates, Wooden A-Frame Stands & Wobble Physics
 * - Target Manager supporting 1, 2, 3+ simultaneous targets, elevated ridges, and moving target tracks
 * - 10 Progressive Tournament Stages (distances from 30m to 72m, moving targets, varying winds)
 * - 3D Ballistic Trajectory: Launch velocity, gravity drop arc, crosswind deflection, velocity vector alignment
 * - Arrow physically embeds into 3D target faceplate and remains visible across multiple shots
 * - Skill-based Scoring Engine with Absolute Hard Maximum of 400 PTS (Math.min(400, score))
 * - Zero-Latency Web Audio Synthesizer: Bow draw, tension strain, release twang, flight whoosh, wooden thud, golden fanfare
 * - Professional EthioFantasy HUD: Deep Navy (#071B2D), Pitch Green (#0A7C45), Gold (#FFD54F), White (#FFFFFF)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition } from '../../types';
import { RingType, ShotResult, WindCondition, StageDefinition } from './types';
import { ARCHERY_STAGES } from './stages';
import { Archery3DScene, HitResult } from './archery3DScene';
import { ArcheryAudio } from './audio';
import {
  Target,
  Wind,
  Award,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Crosshair,
  Sparkles,
  Pause,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type ArcheryGameState = 'menu' | 'aiming' | 'flying' | 'impact' | 'stage_transition' | 'paused' | 'results';

interface ArcheryStrikeGameProps {
  game: GameDefinition;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY = 'teleplay_archery_3d_best';

export const ArcheryStrikeGame: React.FC<ArcheryStrikeGameProps> = ({
  game,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // Navigation & Game Status
  const [status, setStatus] = useState<ArcheryGameState>('menu');
  const [muted, setMuted] = useState(!isAudioEnabled);

  // Tournament Stages & Session State
  const [stageIndex, setStageIndex] = useState(0); // 0 to 9 (10 stages)
  const currentStage: StageDefinition = ARCHERY_STAGES[stageIndex] || ARCHERY_STAGES[0];

  const [currentArrow, setCurrentArrow] = useState(1); // 1 to 10
  const [totalScore, setTotalScore] = useState(0); // Strictly capped at 400
  const [bullseyeCount, setBullseyeCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [shotHistory, setShotHistory] = useState<ShotResult[]>([]);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Math.min(400, parseInt(saved, 10)) : 0;
    } catch {
      return 0;
    }
  });

  // Aiming UI State
  const [isAiming, setIsAiming] = useState(false);
  const [drawPower, setDrawPower] = useState(0); // 0 to 1
  const [aimYaw, setAimYaw] = useState(0);
  const [aimPitch, setAimPitch] = useState(0);

  // Recent Impact Feedback Popup
  const [lastPopup, setLastPopup] = useState<{
    text: string;
    points: number;
    ring: RingType;
  } | null>(null);

  // Stage Transition Banner State
  const [transitionData, setTransitionData] = useState<{
    stageNum: number;
    title: string;
    description: string;
    distance: number;
  } | null>(null);

  // 3D Scene Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scene3DRef = useRef<Archery3DScene | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const startTimeRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  // Synchronize Audio Mute State
  useEffect(() => {
    ArcheryAudio.setMuted(muted);
  }, [muted]);

  // Initialize 3D WebGL Scene on Mount
  useEffect(() => {
    if (!containerRef.current) return;

    if (!scene3DRef.current) {
      const scene = new Archery3DScene(containerRef.current);
      scene3DRef.current = scene;
      scene.setStage(currentStage);
    }

    return () => {
      if (scene3DRef.current) {
        scene3DRef.current.dispose();
        scene3DRef.current = null;
      }
    };
  }, []);

  // Sync Stage updates with 3D Scene
  useEffect(() => {
    if (scene3DRef.current && currentStage) {
      scene3DRef.current.setStage(currentStage);
    }
  }, [stageIndex]);

  /**
   * Conclude Tournament Match (Strictly capped at 400 PTS)
   */
  const finishGame = useCallback(
    (finalScore: number, bullseyes: number) => {
      const cappedFinalScore = Math.min(400, Math.max(0, finalScore));
      setStatus('results');

      if (cappedFinalScore > bestScore) {
        setBestScore(cappedFinalScore);
        try {
          localStorage.setItem(STORAGE_KEY, cappedFinalScore.toString());
        } catch {}
      }

      const durationSeconds = Math.max(
        1,
        Math.round((performance.now() - startTimeRef.current) / 1000)
      );
      onGameOver(cappedFinalScore, durationSeconds);
    },
    [bestScore, onGameOver]
  );

  /**
   * Start New 10-Stage Tournament Session
   */
  const handleStartTournament = () => {
    setStageIndex(0);
    setCurrentArrow(1);
    setTotalScore(0);
    setBullseyeCount(0);
    setStreakCount(0);
    setShotHistory([]);
    setLastPopup(null);
    setDrawPower(0);
    setAimYaw(0);
    setAimPitch(0);
    isDraggingRef.current = false;

    startTimeRef.current = performance.now();
    ArcheryAudio.init();

    if (scene3DRef.current) {
      scene3DRef.current.clearAllEmbeddedArrows();
      scene3DRef.current.setStage(ARCHERY_STAGES[0]);
      scene3DRef.current.setAim(0, 0, 0);
    }

    // Show Stage 1 Banner then enter aiming
    setTransitionData({
      stageNum: 1,
      title: ARCHERY_STAGES[0].title,
      description: ARCHERY_STAGES[0].description,
      distance: ARCHERY_STAGES[0].targetDistance,
    });
    setStatus('stage_transition');

    setTimeout(() => {
      setTransitionData(null);
      setStatus('aiming');
    }, 1200);
  };

  /**
   * Pointer/Touch Event Handlers for First-Person Aiming & Draw
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (status !== 'aiming') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    touchStartRef.current = { x, y, yaw: aimYaw, pitch: aimPitch };
    isDraggingRef.current = true;
    setIsAiming(true);
    ArcheryAudio.init();
    ArcheryAudio.playBowPull(0.4);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !touchStartRef.current || status !== 'aiming') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - touchStartRef.current.x;
    const dy = y - touchStartRef.current.y;

    // Calibrated aim sensitivity
    const sensitivity = 0.0018;
    const nextYaw = touchStartRef.current.yaw - dx * sensitivity;
    const nextPitch = touchStartRef.current.pitch + dy * sensitivity;

    // Pull power based on downward drag distance
    const pullDist = Math.max(0, dy);
    const power = Math.min(1.0, Math.max(0.1, pullDist / 95));

    setAimYaw(nextYaw);
    setAimPitch(nextPitch);
    setDrawPower(power);

    if (scene3DRef.current) {
      scene3DRef.current.setAim(nextYaw, nextPitch, power);
    }

    // Audio strain feedback as power climbs
    if (Math.random() < 0.12) {
      ArcheryAudio.playBowPull(power);
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || status !== 'aiming') return;
    isDraggingRef.current = false;
    setIsAiming(false);
    touchStartRef.current = null;

    if (drawPower >= 0.22) {
      // Release bowstring to launch arrow!
      launchArrow();
    } else {
      // Cancel draw
      setDrawPower(0);
      if (scene3DRef.current) {
        scene3DRef.current.setAim(aimYaw, aimPitch, 0);
      }
    }
  };

  /**
   * Launch Arrow Ballistic Trajectory
   */
  const launchArrow = () => {
    if (!scene3DRef.current) return;

    setStatus('flying');
    ArcheryAudio.playBowRelease();
    ArcheryAudio.playFlightWhoosh(600 + currentStage.targetDistance * 8);

    const launched = scene3DRef.current.launchArrow((res: HitResult) => {
      handleShotResolution(res);
    });

    if (!launched) {
      setStatus('aiming');
    }
  };

  /**
   * Handle Ballistic Arrow Hit/Miss Resolution
   * Computes exact score (capped at 400 PTS total tournament maximum)
   */
  const handleShotResolution = (result: HitResult) => {
    setStatus('impact');

    const ring = result.ring;
    const isBull = ring === 'BULLSEYE';
    const isHit = result.hit && ring !== 'MISS';

    // Audio Impact Feedback
    if (isHit) {
      ArcheryAudio.playTargetHit(ring);
    } else {
      ArcheryAudio.playMissThud();
    }

    // Dynamic Streak Management
    const nextStreak = isHit ? streakCount + 1 : 0;
    setStreakCount(nextStreak);

    // =========================================================================
    // SCORING ENGINE: ABSOLUTE TOURNAMENT MAXIMUM = 400 PTS
    // Max points per arrow = ~40 PTS across 10 tournament shots = 400 Max Total
    // =========================================================================
    let shotPoints = 0;
    if (ring === 'BULLSEYE') {
      // 36 - 40 points based on distance & streak
      const distBonus = Math.min(4, Math.round((currentStage.targetDistance - 30) * 0.08));
      const streakBonus = Math.min(2, Math.floor(nextStreak / 2));
      shotPoints = Math.min(40, 35 + distBonus + streakBonus);
    } else if (ring === 'GOLD') {
      const distBonus = Math.min(3, Math.round((currentStage.targetDistance - 30) * 0.06));
      shotPoints = Math.min(34, 28 + distBonus);
    } else if (ring === 'RED') {
      shotPoints = Math.min(26, 20 + Math.round((currentStage.targetDistance - 30) * 0.05));
    } else if (ring === 'BLUE') {
      shotPoints = 14;
    } else if (ring === 'WHITE') {
      shotPoints = 8;
    } else {
      shotPoints = 0; // MISS = 0 PTS
    }

    // Strictly enforce 400 maximum total score
    const nextTotalScore = Math.min(400, totalScore + shotPoints);
    const nextBullseyes = bullseyeCount + (isBull ? 1 : 0);

    setTotalScore(nextTotalScore);
    setBullseyeCount(nextBullseyes);

    // Record Shot History Record
    const shotRecord: ShotResult = {
      arrowNumber: currentArrow,
      stageNumber: currentStage.stageNumber,
      distanceMeters: currentStage.targetDistance,
      windSpeed: currentStage.wind.speed,
      windAngle: currentStage.wind.directionDegrees,
      ring,
      baseScore: shotPoints,
      distanceBonus: currentStage.targetDistance,
      streakMultiplier: nextStreak > 1 ? 1.05 : 1.0,
      totalShotScore: shotPoints,
      hitX: result.hitNormalizedX,
      hitY: result.hitNormalizedY,
      impactDistance: result.distanceFromCenter,
      timestamp: Date.now(),
      targetId: result.targetId || 'target-0',
    };

    setShotHistory((prev) => [...prev, shotRecord]);

    // Popup Feedback Badge
    setLastPopup({
      text:
        ring === 'BULLSEYE'
          ? '★ BULLSEYE! ★'
          : ring === 'MISS'
          ? 'MISS'
          : `${ring} RING`,
      points: shotPoints,
      ring,
    });

    // Advance Stage or Complete Match after short impact display
    setTimeout(() => {
      if (currentArrow >= 10 || stageIndex >= ARCHERY_STAGES.length - 1) {
        // Tournament Finished
        ArcheryAudio.playStageWin();
        finishGame(nextTotalScore, nextBullseyes);
      } else {
        // Progress to Next Stage
        const nextStageIdx = stageIndex + 1;
        const nextArrowNum = currentArrow + 1;
        const nextStageDef = ARCHERY_STAGES[nextStageIdx] || ARCHERY_STAGES[ARCHERY_STAGES.length - 1];

        setStageIndex(nextStageIdx);
        setCurrentArrow(nextArrowNum);
        setDrawPower(0);
        setLastPopup(null);

        // Show Next Stage Transition Banner
        setTransitionData({
          stageNum: nextStageDef.stageNumber,
          title: nextStageDef.title,
          description: nextStageDef.description,
          distance: nextStageDef.targetDistance,
        });
        setStatus('stage_transition');

        setTimeout(() => {
          setTransitionData(null);
          setStatus('aiming');
        }, 1100);
      }
    }, 1300);
  };

  const accuracy =
    shotHistory.length > 0
      ? Math.round(
          (shotHistory.reduce((acc, s) => acc + (s.ring !== 'MISS' ? 1 : 0), 0) /
            shotHistory.length) *
            100
        )
      : 100;

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center select-none bg-[#071B2D] rounded-3xl overflow-hidden border-2 border-[#0B3B70] shadow-2xl min-h-[640px] text-white font-sans">
      
      {/* =========================================================================
          1. TOP HUD (Score / 400, Stage, Distance, Wind, Accuracy, Controls)
         ========================================================================= */}
      <div className="w-full bg-gradient-to-r from-[#071B2D] via-[#0B3B70] to-[#071B2D] px-4 py-2.5 border-b border-[#0B3B70]/80 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0A7C45] to-[#00C853] flex items-center justify-center text-white font-black shadow-[0_0_12px_rgba(0,200,83,0.4)]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-black text-sm tracking-wide flex items-center gap-1.5">
              <span>Archery Strike 3D</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#FFD54F]/20 text-[#FFD54F] font-mono font-bold border border-[#FFD54F]/40">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-semibold flex items-center gap-1">
              <span>Stage {currentStage.stageNumber} of 10</span>
              <span>•</span>
              <span className="text-[#00C853] font-bold">Arrow {Math.min(10, currentArrow)}/10</span>
            </div>
          </div>
        </div>

        {/* Action Controls (Mute, Pause, Exit) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMuted(!muted)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {status === 'aiming' && (
            <button
              onClick={() => {
                setStatus('paused');
              }}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Pause Match"
              aria-label="Pause Game"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onExit}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
            title="Exit Game"
            aria-label="Exit Game"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. LIVE TOURNAMENT STATS RIBBON (Score Capped at 400, Wind, Distance)
         ========================================================================= */}
      {(status === 'aiming' || status === 'flying' || status === 'impact' || status === 'stage_transition') && (
        <div className="w-full bg-[#071B2D]/95 border-b border-[#0B3B70]/70 px-3.5 py-1.5 flex flex-col gap-1.5 z-20 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
            
            {/* Live Score / 400 */}
            <div className="bg-[#051421] rounded-xl py-1 px-1.5 border border-[#FFD54F]/30 shadow-inner">
              <div className="text-[8.5px] text-slate-400 uppercase font-semibold">Tournament Score</div>
              <div className="text-[#FFD54F] font-black font-mono text-sm leading-tight flex items-baseline justify-center gap-0.5">
                <span>{totalScore}</span>
                <span className="text-[9px] text-slate-400 font-normal">/ 400</span>
              </div>
            </div>

            {/* Target Distance */}
            <div className="bg-[#051421] rounded-xl py-1 px-1.5 border border-[#00C853]/30 shadow-inner">
              <div className="text-[8.5px] text-slate-400 uppercase font-semibold">Distance</div>
              <div className="text-[#00C853] font-black font-mono text-sm leading-tight">
                {currentStage.targetDistance}m
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-[#051421] rounded-xl py-1 px-1.5 border border-cyan-500/30 shadow-inner">
              <div className="text-[8.5px] text-slate-400 uppercase font-semibold">Accuracy</div>
              <div className="text-cyan-400 font-black font-mono text-sm leading-tight">
                {accuracy}%
              </div>
            </div>

            {/* Dynamic Crosswind Speed & Direction */}
            <div className="bg-[#051421] rounded-xl py-1 px-1.5 border border-amber-500/30 shadow-inner flex flex-col items-center">
              <div className="text-[8.5px] text-amber-400 uppercase font-semibold flex items-center gap-0.5">
                <Wind className="w-2.5 h-2.5" />
                <span>Wind</span>
              </div>
              <div className="text-amber-300 font-black font-mono text-xs leading-tight flex items-center gap-1">
                <span>{currentStage.wind.speed.toFixed(1)}m/s</span>
                <span
                  className="inline-block font-bold text-amber-400 text-[10px] transition-transform"
                  style={{ transform: `rotate(${currentStage.wind.directionDegrees}deg)` }}
                >
                  ↑
                </span>
              </div>
            </div>
          </div>

          {/* 10-Arrow Tournament Progress Meter */}
          <div className="w-full flex items-center justify-between px-1 pt-0.5">
            {Array.from({ length: 10 }).map((_, idx) => {
              const shot = shotHistory[idx];
              const isCurrent = idx === currentArrow - 1;
              const isPast = idx < currentArrow - 1;

              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7.5px] font-black font-mono transition-all ${
                    isPast
                      ? shot?.ring === 'BULLSEYE'
                        ? 'bg-[#FFD54F] text-slate-950 shadow-[0_0_8px_#FFD54F]'
                        : shot?.ring !== 'MISS'
                        ? 'bg-[#00C853] text-slate-950 shadow-[0_0_6px_#00C853]'
                        : 'bg-rose-500 text-white'
                      : isCurrent
                      ? 'bg-cyan-400 text-slate-950 scale-125 ring-2 ring-white shadow-[0_0_8px_#22d3ee]'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                  title={`Shot ${idx + 1}`}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          3. REAL 3D FIRST-PERSON WEBGL CANVAS VIEWPORT
         ========================================================================= */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full flex-1 flex flex-col justify-between overflow-hidden touch-none select-none min-h-[440px] cursor-crosshair"
      >
        {/* Draw Tension Sight Reticle overlay during active aiming */}
        {status === 'aiming' && drawPower > 0.05 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Circular Sight Housing */}
            <div
              className="relative rounded-full border-2 border-[#00C853]/60 flex items-center justify-center transition-transform"
              style={{
                width: `${Math.max(38, 70 - drawPower * 26)}px`,
                height: `${Math.max(38, 70 - drawPower * 26)}px`,
                boxShadow: `0 0 ${12 + drawPower * 14}px rgba(0, 200, 83, ${0.4 + drawPower * 0.4})`,
              }}
            >
              {/* Precision Crosshair Lines */}
              <div className="absolute w-full h-[1.5px] bg-[#00C853]/70" />
              <div className="absolute h-full w-[1.5px] bg-[#00C853]/70" />
              <div className="w-2 h-2 rounded-full bg-[#FFD54F] shadow-[0_0_6px_#FFD54F]" />
            </div>

            {/* Draw Power Bar Indicator */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div className="text-[10px] font-mono font-black text-[#00C853] uppercase tracking-wider">
                Draw Power {Math.round(drawPower * 100)}%
              </div>
              <div className="w-32 h-2 bg-slate-900/80 rounded-full overflow-hidden border border-[#00C853]/40">
                <div
                  className="h-full bg-gradient-to-r from-[#00C853] via-[#FFD54F] to-amber-500 transition-all"
                  style={{ width: `${drawPower * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Aiming Drag Instruction Hint (Fades out when aiming) */}
        {status === 'aiming' && !isAiming && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-[#071B2D]/90 border border-[#00C853]/60 text-white text-xs font-bold pointer-events-none flex items-center gap-2 shadow-2xl animate-bounce">
            <Crosshair className="w-4 h-4 text-[#00C853]" />
            <span>Drag screen down to pull bow & aim • Release to shoot</span>
          </div>
        )}

        {/* Real-time Hit Impact Floating Feedback Banner */}
        {lastPopup && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none animate-in zoom-in-75 duration-200 z-30">
            <div
              className={`px-5 py-2 rounded-2xl font-black font-mono text-base sm:text-lg tracking-wider border-2 shadow-2xl flex items-center gap-1.5 ${
                lastPopup.ring === 'BULLSEYE'
                  ? 'bg-[#FFD54F] text-slate-950 border-white shadow-[0_0_30px_#FFD54F]'
                  : lastPopup.ring !== 'MISS'
                  ? 'bg-[#00C853] text-slate-950 border-white shadow-[0_0_24px_#00C853]'
                  : 'bg-rose-600 text-white border-rose-300 shadow-[0_0_20px_#f43f5e]'
              }`}
            >
              {lastPopup.ring === 'BULLSEYE' && <Sparkles className="w-5 h-5 fill-current" />}
              <span>{lastPopup.text}</span>
            </div>
            {lastPopup.points > 0 && (
              <span className="text-base font-black text-[#FFD54F] font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mt-1.5">
                +{lastPopup.points} PTS
              </span>
            )}
          </div>
        )}

        {/* Stage Transition Announcement Banner */}
        {status === 'stage_transition' && transitionData && (
          <div className="absolute inset-0 z-30 bg-[#071B2D]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="px-3.5 py-1 rounded-full bg-[#00C853]/20 border border-[#00C853]/50 text-[#00C853] text-xs font-black uppercase tracking-wider mb-2">
              Stage {transitionData.stageNum} of 10
            </div>
            <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
              {transitionData.title}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mb-3">
              {transitionData.description}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono text-[#FFD54F]">
              <Target className="w-3.5 h-3.5" />
              <span>Target Distance: {transitionData.distance}m</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. MENU SCREEN (Tournament Overview & High Score)
         ========================================================================= */}
      {status === 'menu' && (
        <div className="absolute inset-0 z-40 bg-gradient-to-b from-[#071B2D] via-[#0B3B70] to-[#04101c] flex flex-col items-center justify-between p-6 text-center animate-in fade-in overflow-y-auto">
          <div>
            <div className="relative mb-3 mt-3 inline-block">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#0B3B70] via-[#0A7C45] to-[#00C853] p-1 shadow-[0_0_30px_rgba(0,200,83,0.5)]">
                <div className="w-full h-full bg-[#071B2D] rounded-[22px] flex items-center justify-center">
                  <Target className="w-10 h-10 text-[#00C853]" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
              ARCHERY STRIKE 3D
            </h2>
            <p className="text-xs text-slate-300 max-w-xs mb-5">
              10-Stage Precision Archery Championship. Master ballistic trajectory, crosswinds, and kinetic targets.
            </p>
          </div>

          {/* Record Stats Matrix */}
          <div className="w-full max-w-xs grid grid-cols-2 gap-2.5 mb-6 text-left">
            <div className="bg-[#051421]/90 rounded-2xl p-3.5 border border-[#FFD54F]/30 shadow-inner">
              <div className="text-[9.5px] text-slate-400 uppercase font-semibold">Tournament Record</div>
              <div className="text-[#FFD54F] font-black font-mono text-xl">{bestScore} / 400</div>
            </div>

            <div className="bg-[#051421]/90 rounded-2xl p-3.5 border border-[#00C853]/30 shadow-inner">
              <div className="text-[9.5px] text-slate-400 uppercase font-semibold">Stages Format</div>
              <div className="text-white font-black font-mono text-sm">10 Stages • 400 Max</div>
            </div>
          </div>

          {/* Start Tournament CTA */}
          <div className="w-full max-w-xs space-y-2.5">
            <button
              onClick={handleStartTournament}
              className="w-full py-4 rounded-2xl bg-[#00C853] hover:bg-[#00b047] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,200,83,0.45)] transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START 10-STAGE MATCH</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. PAUSE OVERLAY
         ========================================================================= */}
      {status === 'paused' && (
        <div className="absolute inset-0 z-50 bg-[#071B2D]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-[#0B3B70] border-2 border-[#00C853] flex items-center justify-center text-[#00C853] mb-4 shadow-xl">
            <Pause className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-1">Match Paused</h3>
          <p className="text-xs text-slate-300 mb-6">
            Stage {currentStage.stageNumber}/10 • Score: {totalScore} / 400
          </p>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={() => setStatus('aiming')}
              className="w-full py-3.5 rounded-2xl bg-[#00C853] hover:bg-[#00b047] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Match</span>
            </button>

            <button
              onClick={handleStartTournament}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Match</span>
            </button>

            <button
              onClick={onExit}
              className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Exit to Games Hub
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. TOURNAMENT RESULTS BREAKDOWN (STRICTLY CAPPED AT 400 PTS)
         ========================================================================= */}
      {status === 'results' && (
        <div className="absolute inset-0 z-50 bg-gradient-to-b from-[#071B2D] via-[#0B3B70] to-[#04101c] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 overflow-y-auto">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#00C853]/20 border border-[#00C853]/50 text-[#00C853] text-xs font-black uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>10-Stage Tournament Complete</span>
          </div>

          {totalScore >= bestScore && totalScore > 0 && (
            <div className="mb-2 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW PERSONAL HIGH SCORE!</span>
            </div>
          )}

          {/* Final Tournament Score (Capped strictly at 400) */}
          <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight mb-1 flex items-baseline justify-center gap-1">
            <span className="text-[#FFD54F] drop-shadow-[0_0_20px_rgba(255,213,79,0.5)]">
              {Math.min(400, totalScore)}
            </span>
            <span className="text-xl text-slate-400 font-normal">/ 400 PTS</span>
          </div>
          <div className="text-xs text-slate-300 uppercase tracking-widest font-semibold mb-5">
            Final Certified Tournament Result
          </div>

          {/* Performance Breakdown Matrix */}
          <div className="w-full max-w-xs grid grid-cols-2 gap-2.5 mb-6 text-left">
            <div className="bg-[#051421]/90 rounded-2xl p-3 border border-slate-800 shadow-inner">
              <div className="text-[9.5px] text-slate-400 uppercase font-semibold">Accuracy</div>
              <div className="text-cyan-400 font-black font-mono text-base">{accuracy}%</div>
            </div>

            <div className="bg-[#051421]/90 rounded-2xl p-3 border border-slate-800 shadow-inner">
              <div className="text-[9.5px] text-slate-400 uppercase font-semibold">Bullseyes</div>
              <div className="text-[#FFD54F] font-black font-mono text-base">{bullseyeCount} / 10</div>
            </div>

            <div className="bg-[#051421]/90 rounded-2xl p-3 border border-slate-800 shadow-inner">
              <div className="text-[9.5px] text-slate-400 uppercase font-semibold">High Score</div>
              <div className="text-[#00C853] font-black font-mono text-base">{bestScore} pts</div>
            </div>

            <div className="bg-[#051421]/90 rounded-2xl p-3 border border-slate-800 shadow-inner">
              <div className="text-[9.5px] text-slate-400 uppercase font-semibold">Tournament Rank</div>
              <div className="text-amber-300 font-black font-mono text-xs">
                {totalScore >= 380
                  ? 'Grand Master Bowman'
                  : totalScore >= 320
                  ? 'Master Marksman'
                  : totalScore >= 240
                  ? 'Senior Archer'
                  : totalScore >= 150
                  ? 'Bowman Specialist'
                  : 'Novice Archer'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-xs space-y-2.5">
            <button
              onClick={handleStartTournament}
              className="w-full py-3.5 rounded-2xl bg-[#00C853] hover:bg-[#00b047] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>

            <button
              onClick={onExit}
              className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Back to Games Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
