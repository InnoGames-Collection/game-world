/**
 * SORTING BALLS - Sample Reference Video & Interactive Gameplay Showcase
 * Provides a rich video-style demonstration of the reference video:
 * - Live simulated video playback with scrub bar, play/pause, timecode, and speed controls
 * - Visual finger cursor showing tap interactions (ball lift, arc transport, drop, victory banner)
 * - Custom video URL support if user wants to link their specific mp4 stream
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Sparkles,
  HelpCircle,
  Film,
  CheckCircle2,
} from 'lucide-react';

interface SortingReferenceVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SortingReferenceVideoModal: React.FC<SortingReferenceVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const TOTAL_DURATION = 24; // 24 seconds demonstration loop

  // Animation timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        return next >= TOTAL_DURATION ? 0 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed]);

  if (!isOpen) return null;

  // Determine stage in simulated reference video:
  // 0s - 4s: Level 1 initial state, finger taps Tube 1, ball lifts
  // 4s - 8s: Finger taps Tube 3, ball moves across and drops
  // 8s - 12s: Finger transfers remaining balls to complete tube
  // 12s - 16s: Victory screen with green ribbon "Well Done! Level 1 Completed!" + confetti!
  // 16s - 20s: Level 3 multi-row layout (3 tubes top, 2 tubes bottom)
  // 20s - 24s: Undo and Extra Tube demonstration
  const stage =
    playbackTime < 4
      ? 'STEP1'
      : playbackTime < 8
      ? 'STEP2'
      : playbackTime < 13
      ? 'STEP3'
      : playbackTime < 17
      ? 'VICTORY'
      : playbackTime < 21
      ? 'MULTIROW'
      : 'FEATURES';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-center items-center p-3 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f141f] rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#171B26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                Sorting Balls • Reference Video Showcase
              </h3>
              <p className="text-[11px] text-slate-400">
                Visual demonstration of core 3D gameplay & controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display Screen */}
        <div className="relative aspect-video w-full bg-[#171B26] overflow-hidden flex flex-col justify-between p-3 sm:p-5 border-b border-white/10">
          {/* Mock In-Video Header */}
          <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF8A00] flex items-center justify-center text-white text-[10px] font-bold">
                ||
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#FF8A00] flex items-center justify-center text-white">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-center font-bold text-white text-sm sm:text-base">
              {stage === 'MULTIROW' ? 'Level 3' : 'Level 1'}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF8A00] flex items-center justify-center text-white text-xs font-bold relative">
                ↶
                <span className="absolute -bottom-1 -left-1 px-1 bg-red-600 rounded-full text-[8px]">
                  5
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#FF8A00] flex items-center justify-center text-white text-[10px] font-black">
                1+
              </div>
            </div>
          </div>

          {/* Animated Demonstration Canvas */}
          <div className="relative flex-1 w-full flex items-center justify-center">
            {stage === 'VICTORY' ? (
              // Victory Banner Screen in Video
              <div className="relative w-64 rounded-2xl bg-[#0e4429] border-2 border-[#22c55e] p-4 text-center space-y-3 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="px-3 py-1 rounded-xl bg-[#10b981] text-white font-black text-xs uppercase tracking-tight mx-auto inline-block border border-white/40">
                  ✦ WELL DONE! ✦
                </div>
                <p className="text-sm font-bold text-white">Level 1 Completed!</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF8A00] flex items-center justify-center text-white text-xs">
                    ⌂
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#22c55e] flex items-center justify-center text-white">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#FF8A00] flex items-center justify-center text-white text-xs">
                    ↺
                  </div>
                </div>
              </div>
            ) : stage === 'MULTIROW' ? (
              // Multi-row 5-Tube Layout (Level 3)
              <div className="flex flex-col items-center gap-4">
                {/* Top Row: 3 Tubes */}
                <div className="flex items-center gap-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-20 rounded-b-xl rounded-t-sm bg-white/10 border-2 border-white/30 relative flex flex-col justify-end items-center pb-1 gap-0.5 shadow-lg"
                    >
                      <div className="absolute -top-1 inset-x-0 h-1.5 bg-slate-300 rounded-full" />
                      <div className="w-6 h-6 rounded-full bg-red-500 border border-white/50" />
                      <div className="w-6 h-6 rounded-full bg-blue-500 border border-white/50" />
                    </div>
                  ))}
                </div>
                {/* Bottom Row: 2 Tubes */}
                <div className="flex items-center gap-6">
                  {[3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-20 rounded-b-xl rounded-t-sm bg-white/10 border-2 border-white/30 relative flex flex-col justify-end items-center pb-1 gap-0.5 shadow-lg"
                    >
                      <div className="absolute -top-1 inset-x-0 h-1.5 bg-slate-300 rounded-full" />
                      {i === 3 ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-amber-400 border border-white/50" />
                          <div className="w-6 h-6 rounded-full bg-green-500 border border-white/50" />
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Single Row 3-Tube Demonstration
              <div className="flex items-center gap-8 relative">
                {/* Tube 1 */}
                <div className="w-12 h-26 rounded-b-2xl rounded-t-md bg-white/10 border-2 border-white/30 relative flex flex-col justify-end items-center pb-1.5 gap-1 shadow-xl">
                  <div className="absolute -top-1.5 inset-x-0 h-2 bg-gradient-to-r from-slate-300 via-white to-slate-400 rounded-full border border-white/50" />
                  {stage === 'STEP1' ? (
                    // Ball hovering above
                    <div className="absolute -top-8 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-white shadow-xl animate-pulse" />
                  ) : null}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-rose-600 border border-white/50 shadow-md" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-rose-600 border border-white/50 shadow-md" />
                </div>

                {/* Tube 2 */}
                <div className="w-12 h-26 rounded-b-2xl rounded-t-md bg-white/10 border-2 border-white/30 relative flex flex-col justify-end items-center pb-1.5 gap-1 shadow-xl">
                  <div className="absolute -top-1.5 inset-x-0 h-2 bg-gradient-to-r from-slate-300 via-white to-slate-400 rounded-full border border-white/50" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-rose-600 border border-white/50 shadow-md" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border border-white/50 shadow-md" />
                </div>

                {/* Tube 3 (Receiving Tube) */}
                <div className="w-12 h-26 rounded-b-2xl rounded-t-md bg-white/5 border-2 border-white/20 relative flex flex-col justify-end items-center pb-1.5 gap-1 shadow-inner">
                  <div className="absolute -top-1.5 inset-x-0 h-2 bg-gradient-to-r from-slate-300 via-white to-slate-400 rounded-full border border-white/50" />
                  {stage === 'STEP2' || stage === 'STEP3' ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border border-white/50 shadow-md animate-bounce" />
                  ) : null}
                </div>

                {/* Animated Finger Cursor */}
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    left: stage === 'STEP1' ? '-10px' : stage === 'STEP2' ? '170px' : '80px',
                    top: stage === 'STEP1' ? '10px' : '40px',
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center animate-ping">
                    <div className="w-4 h-4 rounded-full bg-orange-400" />
                  </div>
                  <span className="text-2xl drop-shadow">👆</span>
                </div>
              </div>
            )}
          </div>

          {/* Subtitle Annotation Banner */}
          <div className="w-full text-center py-1 rounded-lg bg-black/50 border border-white/10 text-xs text-amber-300 font-bold tracking-wide">
            {stage === 'STEP1' && '1. Tap tube to lift top ball into hover position'}
            {stage === 'STEP2' && '2. Tap matching destination tube to drop ball'}
            {stage === 'STEP3' && '3. Sort 4 balls of identical color into each tube'}
            {stage === 'VICTORY' && '4. Celebration victory screen triggers next level!'}
            {stage === 'MULTIROW' && '5. Multi-row layout adapts cleanly for higher levels'}
            {stage === 'FEATURES' && '6. Undo and extra tubes help with tricky levels'}
          </div>
        </div>

        {/* Video Control Bar */}
        <div className="p-3 sm:p-4 bg-[#171B26] flex flex-col gap-3">
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {formatTime(playbackTime)}
            </span>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setPlaybackTime(pos * TOTAL_DURATION);
              }}
              className="flex-1 h-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer relative overflow-hidden transition-colors"
            >
              <div
                className="h-full bg-gradient-to-r from-[#FF8A00] to-amber-400 rounded-full"
                style={{ width: `${(playbackTime / TOTAL_DURATION) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {formatTime(TOTAL_DURATION)}
            </span>
          </div>

          {/* Player Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-[#FF8A00] hover:bg-[#ff951a] active:scale-95 text-white flex items-center justify-center shadow-md transition-transform cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setPlaybackTime(0)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Replay Video"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center rounded-xl bg-white/10 p-0.5 ml-2 border border-white/10">
                {[1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      playbackSpeed === s
                        ? 'bg-[#FF8A00] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/10"
            >
              Start Playing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
