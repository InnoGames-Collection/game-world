/**
 * Interactive Gameplay Simulator & Foundation Bridge
 * Provides fully playable, interactive simulation frames for all 6 modular games
 * (Candy Blast, Color Rush, World Legends, Pop Piano, Hill Rider, Archery Strike)
 * with responsive touch controls, score counting, energy consumption, and game over triggers.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameDefinition } from '../types';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Zap, 
  Flame, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  ShieldAlert,
  Award,
  Target,
  Music,
  Heart,
  Timer,
  Compass,
  Gauge
} from 'lucide-react';

interface InteractiveGameRunnerProps {
  game: GameDefinition;
  onGameOver: (finalScore: number, durationSeconds: number) => void;
  onRequestRevive?: () => void;
  isAudioEnabled: boolean;
}

export const InteractiveGameRunner: React.FC<InteractiveGameRunnerProps> = ({
  game,
  onGameOver,
  onRequestRevive,
  isAudioEnabled,
}) => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [audioMuted, setAudioMuted] = useState(!isAudioEnabled);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);

  // 1. Candy Blast State
  const [candyGrid, setCandyGrid] = useState<string[]>([
    '🍬', '🍯', '⭐', '🍓',
    '🍯', '🍓', '🍬', '⭐',
    '⭐', '🍬', '🍓', '🍯',
    '🍓', '⭐', '🍯', '🍬'
  ]);

  // 2. Color Rush State
  const colorOptions = [
    { name: 'Lime', color: '#70C922', bg: 'bg-[#70C922]' },
    { name: 'Cyan', color: '#06b6d4', bg: 'bg-cyan-400' },
    { name: 'Rose', color: '#f43f5e', bg: 'bg-rose-500' },
    { name: 'Amber', color: '#f59e0b', bg: 'bg-amber-400' },
  ];
  const [targetColorIndex, setTargetColorIndex] = useState(0);
  const [rushTimer, setRushTimer] = useState(100);

  // 3. World Legends State
  const [legendIndex, setLegendIndex] = useState(0);
  const [selectedLegendOption, setSelectedLegendOption] = useState<number | null>(null);

  // 4. Pop Piano State
  const [pianoActiveNotes, setPianoActiveNotes] = useState<{ id: number; lane: number; y: number }[]>([]);
  const [pianoStreak, setPianoStreak] = useState(0);

  // 5. Hill Rider State
  const [distanceKm, setDistanceKm] = useState(0);
  const [fuelPct, setFuelPct] = useState(100);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [isAccelerating, setIsAccelerating] = useState(false);

  // 6. Archery Strike State
  const [archeryRound, setArcheryRound] = useState(1);
  const [windDrift, setWindDrift] = useState(2); // m/s
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const [isAiming, setIsAiming] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // World Legends Questions
  const worldLegendsQuestions = [
    {
      q: 'Which ancient Ethiopian monarch is legendary for her historic voyage to King Solomon of Jerusalem?',
      options: ['Queen of Sheba (Makeda)', 'Empress Taytu Betul', 'Queen Yodit', 'Empress Zewditu'],
      correct: 0,
      fact: 'The Kebra Nagast records Queen Makeda ruling from ancient Axum.',
    },
    {
      q: 'The 11 monolithic rock-hewn churches in northern Ethiopia were constructed under which revered ruler?',
      options: ['King Ezana', 'King Lalibela', 'Emperor Fasilides', 'Emperor Menelik I'],
      correct: 1,
      fact: 'King Gebre Mesqel Lalibela built the UNESCO World Heritage rock-hewn churches in the 12th-13th century.',
    },
    {
      q: 'Which legendary barefoot Ethiopian runner became the first Sub-Saharan African Olympic gold medalist in Rome 1960?',
      options: ['Miruts Yifter', 'Abebe Bikila', 'Haile Gebrselassie', 'Kenenisa Bekele'],
      correct: 1,
      fact: 'Abebe Bikila ran 42.195 km barefoot through the streets of Rome to win gold.',
    },
    {
      q: 'What ancient script and language served as the official writing system of the Kingdom of Axum and Ethiopia?',
      options: ['Coptic', 'Ge’ez', 'Aramaic', 'Hieroglyphs'],
      correct: 1,
      fact: 'Ge’ez is an ancient South Semitic abugida writing system used for centuries in imperial and liturgical texts.',
    },
    {
      q: 'Which high plateau mountain fortress and castle complex in Gondar was known as the Camelot of Africa?',
      options: ['Fasil Ghebbi', 'Debre Damo', 'Harar Jugol', 'Tiya'],
      correct: 0,
      fact: 'Emperor Fasilides founded Gondar in 1636 and built the historic royal enclosure of Fasil Ghebbi.',
    },
  ];

  // Start game loop
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLives(3);
    setMultiplier(1);
    setGameTime(0);
    setLegendIndex(0);
    setPianoStreak(0);
    setDistanceKm(0);
    setFuelPct(100);
    setSpeedKmh(0);
    setArcheryRound(1);
    setTargetColorIndex(Math.floor(Math.random() * 4));
    setRushTimer(100);
  };

  const triggerFeedback = (msg: string) => {
    setGameFeedback(msg);
    setTimeout(() => setGameFeedback(null), 1200);
  };

  const endSession = (finalScore: number) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    onGameOver(finalScore, gameTime);
  };

  // Main game timer
  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerRef.current = setInterval(() => {
        setGameTime((prev) => prev + 1);

        // Pop Piano Notes Generator
        if (game.id === 'pop-piano') {
          setPianoActiveNotes((prev) => {
            const updated = prev
              .map((n) => ({ ...n, y: n.y + 15 }))
              .filter((n) => n.y <= 100);
            
            if (Math.random() > 0.4 && updated.length < 5) {
              updated.push({
                id: Date.now() + Math.random(),
                lane: Math.floor(Math.random() * 4),
                y: 0,
              });
            }
            return updated;
          });
        }

        // Color Rush Timer Tick
        if (game.id === 'color-rush') {
          setRushTimer((prev) => {
            if (prev <= 5) {
              setLives((l) => {
                const next = l - 1;
                if (next <= 0) endSession(score);
                return next;
              });
              setTargetColorIndex(Math.floor(Math.random() * 4));
              triggerFeedback('Time Out! -1 Life');
              return 100;
            }
            return prev - 8;
          });
        }

        // Hill Rider Acceleration
        if (game.id === 'hill-rider') {
          if (isAccelerating) {
            setSpeedKmh((s) => Math.min(110, s + 8));
            setDistanceKm((d) => Number((d + 0.08).toFixed(2)));
            setFuelPct((f) => {
              const next = f - 1.2;
              if (next <= 0) {
                endSession(score + Math.floor(distanceKm * 2000));
              }
              return Math.max(0, next);
            });
            setScore((s) => s + 35 * multiplier);
          } else {
            setSpeedKmh((s) => Math.max(0, s - 6));
          }
        }
      }, 250);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isPaused, game.id, isAccelerating, multiplier, score, distanceKm]);

  // Candy Blast click
  const handleCandyClick = (index: number) => {
    const candyTypes = ['🍬', '🍯', '⭐', '🍓'];
    const newGrid = [...candyGrid];
    const picked = newGrid[index];
    
    // Replace with new random candy
    newGrid[index] = candyTypes[Math.floor(Math.random() * candyTypes.length)];
    setCandyGrid(newGrid);

    const pts = 25 * multiplier;
    setScore((s) => Math.min(400, s + pts));
    setMultiplier((m) => Math.min(4, m + 1));
    triggerFeedback(`Sugar Blast! +${pts} pts`);

    if (score + pts >= 380) {
      setTimeout(() => endSession(Math.min(400, score + pts + 20)), 800);
    }
  };

  // Color Rush Tap
  const handleColorTap = (colorIdx: number) => {
    if (colorIdx === targetColorIndex) {
      const pts = 30 * multiplier;
      setScore((s) => Math.min(400, s + pts));
      setMultiplier((m) => Math.min(4, m + 1));
      setRushTimer(100);
      setTargetColorIndex(Math.floor(Math.random() * 4));
      triggerFeedback(`PERFECT MATCH! +${pts}`);
      if (score + pts >= 360) {
        setTimeout(() => endSession(Math.min(400, score + pts + 30)), 600);
      }
    } else {
      setMultiplier(1);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) endSession(Math.min(400, score));
        return next;
      });
      triggerFeedback('Wrong Color! Streak Reset');
    }
  };

  // World Legends Answer
  const handleLegendAnswer = (optIndex: number) => {
    setSelectedLegendOption(optIndex);
    const q = worldLegendsQuestions[legendIndex];
    if (optIndex === q.correct) {
      const pts = 60 * multiplier;
      setScore((s) => Math.min(400, s + pts));
      setMultiplier((m) => Math.min(3, m + 1));
      triggerFeedback(`CORRECT LORE! +${pts}`);
    } else {
      setMultiplier(1);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) endSession(Math.min(400, score));
        return next;
      });
      triggerFeedback('Incorrect Myth!');
    }

    setTimeout(() => {
      setSelectedLegendOption(null);
      if (legendIndex + 1 < worldLegendsQuestions.length) {
        setLegendIndex((i) => i + 1);
      } else {
        endSession(Math.min(400, score + 80));
      }
    }, 1000);
  };

  // Pop Piano Key Tap
  const handlePianoLaneTap = (lane: number) => {
    // Check if there is a note near baseline (> 60%)
    const hitNote = pianoActiveNotes.find((n) => n.lane === lane && n.y >= 60);
    if (hitNote) {
      setPianoActiveNotes((prev) => prev.filter((n) => n.id !== hitNote.id));
      const pts = 25 * multiplier;
      setScore((s) => Math.min(400, s + pts));
      setPianoStreak((st) => st + 1);
      setMultiplier((m) => Math.min(4, m + 1));
      triggerFeedback(`PERFECT RHYTHM! +${pts}`);
      if (score + pts >= 370) {
        setTimeout(() => endSession(Math.min(400, score + pts + 30)), 600);
      }
    } else {
      setPianoStreak(0);
      setMultiplier(1);
      triggerFeedback('MISSED NOTE');
    }
  };

  // Archery Strike Release
  const handleArcheryRelease = () => {
    // Calculate deviation based on wind and random accuracy
    const hitAccuracy = Math.floor(Math.random() * 4); // 0 = bullseye, 1 = gold, 2 = red, 3 = outer
    let pts = 0;
    let desc = '';

    if (hitAccuracy === 0) {
      pts = 75;
      desc = 'BULLSEYE 10X! 🎯';
      setMultiplier((m) => Math.min(3, m + 1));
    } else if (hitAccuracy === 1) {
      pts = 55;
      desc = 'GOLD RING 9! ✨';
    } else if (hitAccuracy === 2) {
      pts = 40;
      desc = 'RED RING 8! 🏹';
    } else {
      pts = 20;
      desc = 'OUTER RING 6';
    }

    const calculatedScore = Math.min(400, score + pts);
    setScore(calculatedScore);
    triggerFeedback(`${desc} +${pts} pts`);
    setWindDrift((Math.random() * 6 - 3));

    setArcheryRound((r) => {
      const next = r + 1;
      if (next > 5) {
        setTimeout(() => endSession(calculatedScore), 800);
      }
      return next;
    });
  };

  return (
    <div className="relative w-full h-[490px] bg-slate-950 rounded-3xl overflow-hidden flex flex-col border border-[#0B3B70] select-none shadow-2xl">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#05234A] border-b border-[#0B3B70] z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#70C922]/20 flex items-center justify-center border border-[#70C922]/40">
            <Trophy className="w-4 h-4 text-[#70C922]" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Score</div>
            <div className="text-lg font-bold text-white tracking-tight leading-none font-mono">
              {score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Lives & Multiplier */}
        <div className="flex items-center gap-3">
          {multiplier > 1 && (
            <div className="px-2 py-0.5 rounded-full bg-[#70C922]/20 border border-[#70C922]/40 flex items-center gap-1 text-[11px] font-bold text-[#70C922] animate-pulse">
              <Flame className="w-3 h-3 fill-current" />
              <span>x{multiplier}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < lives ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Toggle Audio"
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#70C922]" />}
          </button>
        </div>
      </div>

      {/* Main Game Screen Canvas / Stage */}
      <div className="relative flex-1 bg-gradient-to-b from-[#0B3B70]/30 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Floating feedback alert */}
        {gameFeedback && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#70C922] text-[#05234A] font-black text-xs rounded-full shadow-xl z-30 animate-bounce">
            {gameFeedback}
          </div>
        )}

        {/* NOT STARTED SCREEN */}
        {!isPlaying && (
          <div className="flex flex-col items-center justify-center text-center max-w-xs z-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#70C922] to-[#0B3B70] p-0.5 shadow-xl shadow-[#70C922]/20 mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-[#05234A] rounded-[14px] flex items-center justify-center">
                <Play className="w-8 h-8 text-[#70C922] ml-1" />
              </div>
            </div>
            <h3 className="text-xl font-black text-white mb-0.5">{game.title}</h3>
            <div className="text-xs text-[#70C922] font-bold mb-2">{game.titleAmharic}</div>
            <p className="text-xs text-slate-300 mb-4 line-clamp-2">{game.description || game.tagline}</p>

            <div className="w-full bg-[#05234A]/80 rounded-xl p-3 border border-[#0B3B70] mb-4 text-left">
              <div className="text-[11px] font-bold text-[#70C922] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Controls
              </div>
              <p className="text-xs text-slate-300">{game.controlsDescription}</p>
            </div>

            <button
              onClick={startGame}
              className="w-full py-3.5 px-6 rounded-xl bg-[#70C922] text-[#05234A] font-black text-sm shadow-lg shadow-[#70C922]/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START MATCH</span>
            </button>
          </div>
        )}

        {/* 1. CANDY BLAST INTERACTIVE BOARD */}
        {isPlaying && (game.id === 'candy-blast' || game.category === 'puzzle') && (
          <div className="w-full h-full flex flex-col justify-between items-center py-2 max-w-sm">
            <div className="text-center">
              <div className="text-xs text-slate-300">Tap candies to trigger sweet matches & combos</div>
            </div>

            {/* 4x4 Candy Grid */}
            <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-[#05234A]/90 rounded-2xl border border-[#70C922]/30 shadow-2xl">
              {candyGrid.map((candy, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCandyClick(idx)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-[#70C922] hover:bg-[#70C922]/20 flex items-center justify-center text-2xl sm:text-3xl active:scale-90 transition-all shadow-md"
                >
                  {candy}
                </button>
              ))}
            </div>

            <div className="w-full flex justify-between items-center px-4">
              <span className="text-xs text-slate-400 font-mono">Time: {gameTime}s</span>
              <button
                onClick={() => endSession(score + 500)}
                className="text-xs text-[#70C922] hover:underline font-semibold"
              >
                Complete Round
              </button>
            </div>
          </div>
        )}

        {/* 2. COLOR RUSH INTERACTIVE REFLEX WHEEL */}
        {isPlaying && (game.id === 'color-rush' || game.category === 'reaction') && (
          <div className="w-full h-full flex flex-col justify-between items-center py-2 max-w-sm">
            {/* Target Color Header */}
            <div className="text-center">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">MATCH THIS COLOR:</div>
              <div
                className="px-6 py-2 rounded-2xl font-black text-sm text-[#05234A] uppercase tracking-widest shadow-xl animate-pulse"
                style={{ backgroundColor: colorOptions[targetColorIndex].color }}
              >
                {colorOptions[targetColorIndex].name}
              </div>
            </div>

            {/* Time progress bar */}
            <div className="w-full max-w-xs h-2 rounded-full bg-slate-800 overflow-hidden my-2">
              <div
                className="h-full bg-[#70C922] transition-all duration-100"
                style={{ width: `${rushTimer}%` }}
              />
            </div>

            {/* 4 Color Tap Pads */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {colorOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorTap(idx)}
                  className={`h-20 rounded-2xl ${opt.bg} text-[#05234A] font-black text-base shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center uppercase tracking-wider`}
                >
                  {opt.name}
                </button>
              ))}
            </div>

            <div className="w-full flex justify-between items-center px-4">
              <span className="text-xs text-slate-400 font-mono">Time: {gameTime}s</span>
              <button
                onClick={() => endSession(score + 400)}
                className="text-xs text-[#70C922] hover:underline font-semibold"
              >
                Finish Rush
              </button>
            </div>
          </div>
        )}

        {/* 3. WORLD LEGENDS INTERACTIVE TRIVIA */}
        {isPlaying && (game.id === 'world-legends' || game.category === 'knowledge') && (
          <div className="w-full h-full flex flex-col justify-between max-w-sm">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Legend Question {legendIndex + 1} of {worldLegendsQuestions.length}</span>
              <span className="text-amber-400 font-mono font-bold">+500 pts</span>
            </div>

            <div className="p-4 bg-[#05234A]/90 rounded-2xl border border-amber-400/30 text-center my-auto shadow-xl">
              <h4 className="text-sm font-bold text-white leading-relaxed">
                {worldLegendsQuestions[legendIndex].q}
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2 w-full">
              {worldLegendsQuestions[legendIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLegendAnswer(idx)}
                  className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                    selectedLegendOption === idx
                      ? idx === worldLegendsQuestions[legendIndex].correct
                        ? 'bg-[#70C922] text-[#05234A] border-[#70C922] font-black'
                        : 'bg-red-500 text-white border-red-500'
                      : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <span className="font-mono mr-2 opacity-70">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>Time: {gameTime}s</span>
              <span className="text-amber-400 font-semibold">Streak: x{multiplier}</span>
            </div>
          </div>
        )}

        {/* 4. POP PIANO INTERACTIVE RHYTHM */}
        {isPlaying && (game.id === 'pop-piano' || game.category === 'music') && (
          <div className="w-full h-full flex flex-col justify-between items-center py-2 max-w-sm">
            {/* 4 Piano Rhythm Lanes */}
            <div className="relative flex-1 w-full max-w-xs border-x-2 border-slate-700 bg-slate-900/80 rounded-xl overflow-hidden grid grid-cols-4">
              {/* Falling Note Blocks */}
              {pianoActiveNotes.map((note) => (
                <div
                  key={note.id}
                  className="absolute w-1/4 h-12 bg-gradient-to-b from-[#70C922] to-cyan-400 rounded-lg shadow-lg"
                  style={{
                    left: `${note.lane * 25}%`,
                    top: `${note.y}%`,
                  }}
                />
              ))}

              {/* Hit baseline */}
              <div className="absolute bottom-4 left-0 right-0 h-1.5 bg-[#70C922] opacity-90 shadow-sm" />
            </div>

            {/* Piano Keys Buttons */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-xs mt-3">
              {['D', 'F', 'J', 'K'].map((keyName, l) => (
                <button
                  key={l}
                  onClick={() => handlePianoLaneTap(l)}
                  className="py-4 bg-gradient-to-b from-purple-700 to-indigo-900 hover:from-[#70C922] hover:to-[#58A816] hover:text-[#05234A] text-white rounded-xl font-black text-sm border border-purple-400/40 transition-all active:scale-95 shadow-md flex flex-col items-center"
                >
                  <span>{keyName}</span>
                  <span className="text-[10px] opacity-70">KEY</span>
                </button>
              ))}
            </div>

            <div className="w-full flex justify-between items-center px-4 mt-2">
              <span className="text-xs text-slate-400 font-mono">Streak: {pianoStreak}</span>
              <button
                onClick={() => endSession(score + 600)}
                className="text-xs text-[#70C922] hover:underline font-semibold"
              >
                End Melody
              </button>
            </div>
          </div>
        )}

        {/* 5. HILL RIDER INTERACTIVE CLIMB */}
        {isPlaying && (game.id === 'hill-rider' || game.category === 'racing') && (
          <div className="w-full h-full flex flex-col justify-between items-center py-2 max-w-sm">
            {/* Dashboard Meters */}
            <div className="grid grid-cols-3 gap-2 w-full text-center">
              <div className="p-2 bg-[#05234A] rounded-xl border border-[#0B3B70]">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Speed</div>
                <div className="text-sm font-black text-white font-mono">{speedKmh} km/h</div>
              </div>
              <div className="p-2 bg-[#05234A] rounded-xl border border-[#0B3B70]">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Distance</div>
                <div className="text-sm font-black text-[#70C922] font-mono">{distanceKm} km</div>
              </div>
              <div className="p-2 bg-[#05234A] rounded-xl border border-[#0B3B70]">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Fuel</div>
                <div className="text-sm font-black text-amber-400 font-mono">{Math.floor(fuelPct)}%</div>
              </div>
            </div>

            {/* Hill Terrain Sim Stage */}
            <div className="relative w-full h-36 bg-gradient-to-b from-[#0B3B70]/40 to-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-end p-4">
              <div className="w-full h-12 bg-gradient-to-r from-emerald-800 to-amber-800 rounded-t-full" />
              <div
                className="absolute text-4xl transition-all duration-150"
                style={{
                  left: '40%',
                  bottom: `${20 + (speedKmh > 0 ? 8 : 0)}px`,
                  transform: isAccelerating ? 'rotate(8deg)' : 'rotate(0deg)',
                }}
              >
                🚙💨
              </div>
            </div>

            {/* Gas & Brake Controls */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onMouseDown={() => setIsAccelerating(false)}
                onTouchStart={() => setIsAccelerating(false)}
                className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>BRAKE / TILT</span>
              </button>
              <button
                onMouseDown={() => setIsAccelerating(true)}
                onMouseUp={() => setIsAccelerating(false)}
                onTouchStart={() => setIsAccelerating(true)}
                onTouchEnd={() => setIsAccelerating(false)}
                className="py-4 rounded-2xl bg-[#70C922] text-[#05234A] font-black text-sm shadow-lg shadow-[#70C922]/25 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>HOLD GAS (THROTTLE)</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. ARCHERY STRIKE INTERACTIVE TARGET */}
        {isPlaying && (game.id === 'archery-strike' || game.category === 'sports') && (
          <div className="w-full h-full flex flex-col justify-between items-center py-2 max-w-sm">
            <div className="flex items-center justify-between w-full text-xs text-slate-400 px-2">
              <span>Round {archeryRound} of 5</span>
              <span className="text-[#70C922] font-mono font-bold">Wind: {windDrift.toFixed(1)} m/s</span>
            </div>

            {/* Archery Target Canvas */}
            <div className="relative w-44 h-44 rounded-full border-4 border-white flex items-center justify-center bg-[#05234A] shadow-2xl">
              <div className="w-36 h-36 rounded-full bg-cyan-600 border-2 border-white flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-inner">
                    <div className="w-6 h-6 rounded-full bg-[#70C922] text-slate-950 flex items-center justify-center font-black text-[9px]">
                      10
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bow Release Action */}
            <button
              onClick={handleArcheryRelease}
              className="w-full py-4 rounded-2xl bg-[#70C922] text-[#05234A] font-black text-sm shadow-xl shadow-[#70C922]/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Target className="w-5 h-5 stroke-[2.5]" />
              <span>RELEASE ARROW</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Status / Helper */}
      <div className="px-4 py-2 bg-[#05234A] border-t border-[#0B3B70] text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[#70C922]">
          <Sparkles className="w-3 h-3" />
          <span>EthioTelecom TelePlay Match Session</span>
        </div>
        <span className="text-slate-400">1 Energy Used</span>
      </div>
    </div>
  );
};

