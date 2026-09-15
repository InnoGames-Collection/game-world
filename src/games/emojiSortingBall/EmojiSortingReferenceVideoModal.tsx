import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { MANDATORY_TUBE_PALETTE } from './tubePalette';

interface EmojiSortingReferenceVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmojiSortingReferenceVideoModal: React.FC<EmojiSortingReferenceVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const TOTAL_DURATION = 20;

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

  const formatSecs = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec - s) * 10);
    return `00:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
      style={{
        background: `
          radial-gradient(circle at 18% 12%, #FFE8E8 0%, transparent 48%),
          radial-gradient(circle at 82% 16%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 45%, #F7EFFF 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 85% 88%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      <div className="w-full max-w-xl mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shadow-xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                GAMEPLAY SHOWCASE
              </h2>
              <p className="text-xs text-slate-500">
                Emoji Sorting Ball Mechanics Demonstration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100 shadow-xs"
            aria-label="Close Showcase"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Simulation Box */}
        <div className="relative aspect-video w-full rounded-2xl bg-white/90 border border-purple-200 overflow-hidden shadow-lg flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-700 font-bold border border-violet-200">
              LIVE DEMO
            </span>
            <span>{formatSecs(playbackTime)} / 00:20.0</span>
          </div>

          {/* Interactive animated preview representation */}
          <div className="flex items-center justify-center gap-4 py-6">
            <div className="w-14 h-36 rounded-2xl border-2 border-violet-300 bg-violet-50/50 flex flex-col-reverse items-center p-1 gap-1.5 shadow-xs">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-xl shadow-md">😀</div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-xl shadow-md">😀</div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center text-xl shadow-md">🥳</div>
            </div>

            <div className="text-2xl animate-bounce text-violet-600">➔</div>

            <div className="w-14 h-36 rounded-2xl border-2 border-cyan-300 bg-cyan-50/50 flex flex-col-reverse items-center p-1 gap-1.5 shadow-xs">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center text-xl shadow-md">🥳</div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center text-xl shadow-md">🥳</div>
            </div>

            <div className="w-14 h-36 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 flex flex-col-reverse items-center p-1 gap-1.5 shadow-xs">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-md">🦁</div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-md">🦁</div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-md">🦁</div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-md">🦁</div>
            </div>
          </div>

          {/* Timeline and control strip */}
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-100"
                style={{ width: `${(playbackTime / TOTAL_DURATION) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="text-[11px] text-slate-500">
                Tap tubes to lift and transfer matching emojis!
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-3.5 rounded-xl bg-white/90 border border-purple-100 shadow-xs text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Key Technique</span>
          </div>
          <p className="text-slate-600">
            Contiguous matching emojis lift together automatically when you tap a tube. Transfer them to another tube with matching emojis on top or into an empty tube.
          </p>
        </div>
      </div>
    </div>
  );
};
