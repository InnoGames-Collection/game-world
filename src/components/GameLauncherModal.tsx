/**
 * TelePlay Ethiopia - Game Launcher & Session Bridge Modal
 * Clean, professional EthioTelecom mobile gaming container.
 * No Energy. No VIP. No advertising. No sponsor rewards.
 */

import React, { useState } from 'react';
import { GameDefinition, UserProfile, GameSessionResult } from '../types';
import { CandyBlastGame } from '../games/candyBlast/CandyBlastGame';
import { ColorRushGame } from '../games/colorRush/ColorRushGame';
import { WorldLegendsGame } from '../games/worldLegends/WorldLegendsGame';
import { PopPianoGame } from '../games/popPiano/PopPianoGame';
import { EmojiFunGame } from '../games/emojiFun/EmojiFunGame';
import { EmojiIqGame } from '../games/emojiIq/EmojiIqGame';
import { HillRiderGame } from '../games/hillRider/HillRiderGame';
import { PopBalloonGame } from '../games/popBalloon/PopBalloonGame';
import { MemoryMatchGame } from '../games/memoryMatch/MemoryMatchGame';
import { DamaGame } from '../games/dama/DamaGame';
import { SoccerPingPongGame } from '../games/soccerPingPong/SoccerPingPongGame';
import { SortingBallsGame } from '../games/sortingBalls/SortingBallsGame';
import { EmojiSortingBallGame } from '../games/emojiSortingBall/EmojiSortingBallGame';
import { BubbleShooterGame } from '../games/bubbleShooter/BubbleShooterGame';
import { SoccerShooterGame } from '../games/soccerShooter';
import { MotoRaceGame } from '../games/motoRace';
import { FruitSliceGame } from '../games/fruitSlice';
import { HalloweenFruitSliceGame } from '../games/halloweenFruitSlice';
import { ButtonSoccerGame } from '../games/buttonSoccer';
import { RoyalWaterSortGame } from '../games/royalWaterSort';
import { KnifeMadnessGame } from '../games/knifeMadness';
import { JuicyMatchGame } from '../games/juicyMatch';
import { SolitaireGame } from '../games/solitaire';
import { PuzzleBlockGame } from '../games/puzzleBlock';
import { CrazyColorsGame } from '../games/crazyColors';
import { HelixJumpGame } from '../games/helixJump';
import { InteractiveGameRunner } from '../games/interactiveSimulator';
import { 
  X, 
  RotateCcw, 
  Trophy, 
  Award, 
  Sparkles, 
  ArrowLeft, 
  Coins 
} from 'lucide-react';

interface GameLauncherModalProps {
  game: GameDefinition;
  profile: UserProfile;
  lastResult: GameSessionResult | null;
  onClose: () => void;
  onGameOver: (score: number, durationSeconds: number) => void;
  onPlayAgain: () => void;
  onRequestSessionStart?: () => boolean;
  onRequireCoins?: () => void;
  onWatchAdForDouble?: () => void;
  isAudioEnabled?: boolean;
}

export const GameLauncherModal: React.FC<GameLauncherModalProps> = ({
  game,
  profile,
  lastResult,
  onClose,
  onGameOver,
  onPlayAgain,
  onRequestSessionStart,
  onRequireCoins,
  isAudioEnabled = true,
}) => {
  // Candy Blast handles its own complete standalone mobile game hub and HUD
  if (game.id === 'candy-blast') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-center items-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
        <CandyBlastGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // World Legends handles its own compact in-game HUD and standalone experience
  if (game.id === 'world-legends') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-center items-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
        <WorldLegendsGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Memory Match features its own dedicated 8-layer cinematic arena and luxury gaming HUD
  if (game.id === 'memory-match') {
    return (
      <div className="fixed inset-0 z-50 bg-[#040D18] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200">
        <MemoryMatchGame
          game={game}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Soccer Ping Pong features full 3D stadiums, 20 levels, and dedicated mobile sports UI
  if (game.id === 'soccer-ping-pong') {
    return (
      <div className="fixed inset-0 z-50 bg-[#07131F] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
        <SoccerPingPongGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Sorting Balls features dedicated white app header, dark navy #171B26 arena, 3D glass tubes & balls, 40 levels
  if (game.id === 'sorting-balls') {
    return (
      <div className="fixed inset-0 z-50 bg-[#171B26] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
        <SortingBallsGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Emoji Sorting Ball features stylized 3D vinyl emoji spheres, mandatory 8-tube palette, 40 tournament levels
  if (game.id === 'emoji-sorting-ball') {
    return (
      <div className="fixed inset-0 z-50 bg-[#060411] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
        <EmojiSortingBallGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Bubble Shooter features dark navy arena, glossy 3D bubbles, precision bank-shot laser guide, 40 tournament levels
  if (game.id === 'bubble-shooter') {
    return (
      <div className="fixed inset-0 z-50 bg-[#071626] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <BubbleShooterGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Soccer Shooter features realistic 3D soccer ball hex grid, stadium acoustics, 40 championship levels
  if (game.id === 'soccer-shooter') {
    return (
      <div className="fixed inset-0 z-50 bg-[#061325] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <SoccerShooterGame
          game={game}
          profile={profile}
          onGameOver={(score) => onGameOver(score, 60)}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Moto Race features 3D First-Person Motorcycle highway traffic racing, 40 progressive levels, custom HUD
  if (game.id === 'moto-race') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <MotoRaceGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Fruit Slice features 3D fruit splitting, Katana blade trail, juice splatters, bombs, 40 progressive levels
  if (game.id === 'fruit-slice') {
    return (
      <div className="fixed inset-0 z-50 bg-[#170e07] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <FruitSliceGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          onRequestSessionStart={onRequestSessionStart}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Halloween Fruit Slice features 40 very difficult progressive levels, haunted atmosphere, monster fruits, and bomb dodging
  if (game.id === 'halloween-fruit-slice') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020C14] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <HalloweenFruitSliceGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Button Soccer features 2026 World Tour table soccer, 40 championship levels, 3D discs, drag-back aiming, 2-player mode
  if (game.id === 'button-soccer') {
    return (
      <div className="fixed inset-0 z-50 bg-[#071018] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <ButtonSoccerGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Dama features 40-level tournament structure, main menu, level selection, 3D draughts board
  if (game.id === 'dama') {
    return (
      <div className="fixed inset-0 z-50 bg-[#07131F] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <DamaGame
          game={game}
          profile={profile}
          onGameOver={(res) => {
            if (typeof res === 'number') {
              onGameOver(res, 60);
            } else if (res && typeof res === 'object') {
              onGameOver(res.score, res.durationSeconds || 60);
            }
          }}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Royal Water Sort features 3D glass bottles, liquid pouring physics, 40 championship levels, boosters
  if (game.id === 'royal-water-sort') {
    return (
      <div className="fixed inset-0 z-50 bg-[#07133A] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <RoyalWaterSortGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Knife Madness features 3D rotating targets, precision knife throwing, apple slicing, 40 progressive stages
  if (game.id === 'knife-madness') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020813] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <KnifeMadnessGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Juicy Match features 3D glossy fruits, tropical beach progression map, boosters, and authentic Match-3 mechanics
  if (game.id === 'juicy-match') {
    return (
      <div className="fixed inset-0 z-50 bg-[#38bdf8] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <JuicyMatchGame
          onBackToHub={onClose}
          onLevelComplete={(score, duration) => onGameOver(score, duration || 60)}
        />
      </div>
    );
  }

  // Daily Solitaire features 40 progressive levels, Draw 1/3, opening screen, top HUD, procedural Web Audio
  if (game.id === 'solitaire') {
    return (
      <div className="fixed inset-0 z-50 bg-[#004d2a] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <SolitaireGame
          onExit={onClose}
        />
      </div>
    );
  }

  // Puzzle Block features 10x10 wooden board, 40 levels, 3-piece tray, touch offset, procedural Web Audio
  if (game.id === 'puzzle-block') {
    return (
      <div className="fixed inset-0 z-50 bg-[#3a140f] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <PuzzleBlockGame
          onExit={onClose}
        />
      </div>
    );
  }

  // Crazy Colors features 40 progressive levels, bounce physics, neon geometry, procedural Web Audio
  if (game.id === 'crazy-colors') {
    return (
      <div className="fixed inset-0 z-50 bg-[#2B2B2B] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <CrazyColorsGame
          onGameOver={onGameOver}
          onRequestSessionStart={onRequestSessionStart}
          onExit={onClose}
        />
      </div>
    );
  }

  // Helix Jump features 3D cylinder tower, rotating beveled sectors, 40 progressive levels, real arcade physics
  if (game.id === 'helix-jump') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0284c7] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <HelixJumpGame
          onGameOver={onGameOver}
          onRequestSessionStart={onRequestSessionStart}
          onExit={onClose}
        />
      </div>
    );
  }

  // Pop Piano features 40 progressive tournament levels, pre-game menu, deterministic scoring, acoustic piano audio
  if (game.id === 'pop-piano') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B132B] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <PopPianoGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onRequestSessionStart={onRequestSessionStart}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Memory Match features 40 progressive levels, dedicated pre-game menu, zero-scroll layout, authoritative tournament scoring
  if (game.id === 'memory-match') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020A14] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <MemoryMatchGame
          game={game}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // EMOJI FUN features 40 tournament levels, variable skill scoring, lives, hints, store, and leaderboard
  if (game.id === 'emoji-fun' || game.id === 'math-emoji') {
    return (
      <div className="fixed inset-0 z-50 bg-[#fce4ec] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-sans touch-none overscroll-none select-none">
        <EmojiFunGame onExit={onClose} />
      </div>
    );
  }

  // EMOJI IQ features 40 tournament equation stages, math calculations, PEMDAS, lives, hints, store, and leaderboard
  if (game.id === 'emoji-iq') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F7F5FF] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-sans touch-none overscroll-none select-none">
        <EmojiIqGame
          onClose={onClose}
          onGameCompleted={(score) => {
            onGameOver(score, 60);
          }}
        />
      </div>
    );
  }

  // COLOR RUSH features 40 progressive tournament levels, pre-game menu, cumulative scoring, and real leaderboard
  if (game.id === 'color-rush') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <ColorRushGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // POP BALLOON features 40 progressive tournament levels, pre-game tournament menu, masked MSISDN leaderboard, cumulative tournament scoring
  if (game.id === 'pop-balloon') {
    return (
      <div className="fixed inset-0 z-50 bg-[#070D1E] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <PopBalloonGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Hill Climb features 40 progressive levels, pre-game menu, level select, leaderboard, settings
  if (game.id === 'hill-rider') {
    return (
      <div className="fixed inset-0 z-50 bg-[#07131F] flex flex-col justify-start items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <HillRiderGame
          game={game}
          profile={profile}
          onGameOver={onGameOver}
          onExit={onClose}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Game Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1688C9] text-white border-b border-blue-600">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-white leading-tight">{game.title}</span>
          <span className="text-[10px] text-[#8BCB3D] font-bold tracking-wide">{game.titleAmharic}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-white/15 text-white text-xs font-mono font-bold flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>{profile.coins} Coins</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Stage / Session Container */}
      <div className={`flex-1 w-full mx-auto p-2 sm:p-4 flex flex-col justify-center items-center ${game.id === 'memory-match' ? 'max-w-2xl' : 'max-w-xl'}`}>
        {/* For Candy Blast, Color Rush, World Legends, Pop Piano, and Hill Climb 3D, let their in-game state manager render their rich HUD and final screen */}
        {game.id === 'candy-blast' ? (
          <div className="w-full">
            <CandyBlastGame
              game={game}
              onGameOver={onGameOver}
              onExit={onClose}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        ) : game.id === 'color-rush' ? (
          <div className="w-full">
            <ColorRushGame
              game={game}
              onGameOver={onGameOver}
              onExit={onClose}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        ) : game.id === 'world-legends' ? (
          <div className="w-full">
            <WorldLegendsGame
              game={game}
              onGameOver={onGameOver}
              onExit={onClose}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        ) : game.id === 'pop-piano' ? (
          <div className="w-full">
            <PopPianoGame
              game={game}
              onGameOver={onGameOver}
              onExit={onClose}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        ) : game.id === 'hill-rider' ? (
          <div className="w-full">
            <HillRiderGame
              game={game}
              onGameOver={onGameOver}
              onExit={onClose}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        ) : game.id === 'archery-strike' ? (
          <div className="w-full">
            <PopBalloonGame
              game={game}
              onGameOver={onGameOver}
              onExit={onClose}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        ) : !lastResult ? (
          /* ACTIVE PLAYING VIEW FOR OTHER GAMES */
          <div className="w-full">
            <InteractiveGameRunner
              game={game}
              onGameOver={onGameOver}
              isAudioEnabled={isAudioEnabled}
            />
          </div>
        ) : (
          /* CLEAN RESULT SCREEN (No Ads, No VIP, No Energy) */
          <div className="w-full max-w-md bg-[#05234A] text-white rounded-3xl p-6 border-2 border-[#0B3B70] shadow-2xl text-center animate-in zoom-in-95">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#78BE20]/20 border border-[#78BE20]/50 text-[#78BE20] text-xs font-black uppercase tracking-wider mb-3">
              <Award className="w-4 h-4" />
              <span>Match Completed</span>
            </div>

            {lastResult.isNewHighScore && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>NEW PERSONAL BEST!</span>
              </div>
            )}

            {/* Final Score Counter */}
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight mb-1">
              {lastResult.score.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 uppercase tracking-widest font-semibold mb-6">
              FINAL SCORE
            </div>

            {/* Results Matrix */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">TOURNAMENT POINTS</div>
                <div className="text-base font-bold text-[#78BE20] font-mono">
                  +{lastResult.score} PTS
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">GOLD BONUS (POINTS)</div>
                <div className="text-base font-bold text-amber-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>+{lastResult.goldEarned ?? Math.floor(lastResult.score / 2)} GOLD</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: PLAY AGAIN & EXIT */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={onPlayAgain}
                className="w-full py-3.5 rounded-xl bg-[#78BE20] hover:bg-[#68a81b] text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {['crazy-colors', 'fruit-slice', 'helix-jump', 'pop-piano'].includes(game.id)
                    ? 'PLAY AGAIN (2 COINS)'
                    : 'PLAY AGAIN'}
                </span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                EXIT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="px-4 py-2 bg-[#1688C9] text-center text-xs text-white/90 border-t border-blue-600">
        GoPlay • Official Mobile Gaming Portal
      </div>
    </div>
  );
};
