/**
 * Games Content Page Component for TelePlus
 * 
 * Verbatim content from Document Section 1:
 * - 1.1 Candy Blast
 * - 1.2 Color Rush
 * - 1.3 World Legends
 * - 1.4 Pop Piano
 * - 1.5 Hill Climb
 * - 1.6 Pop Balloon
 * 
 * Includes Play buttons, complete How to Play steps, Skill Focus, and game-specific rules.
 */

import React, { useState } from 'react';
import { 
  Gamepad2, 
  ArrowLeft, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  Clock, 
  Sparkles,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { TELEPLUS_GAMES_CONTENT, GameContentDetails } from '../../data/teleplusContent';
import { GameDefinition, UserProfile } from '../../types';
import { OriginalGameArtwork } from '../../components/OriginalGameArtwork';

interface GamesContentPageProps {
  games?: GameDefinition[];
  profile?: UserProfile;
  onLaunchGame?: (game: GameDefinition) => void;
  onBack?: () => void;
  showHeader?: boolean;
}

export const GamesContentPage: React.FC<GamesContentPageProps> = ({
  games = [],
  profile,
  onLaunchGame,
  onBack,
  showHeader = true,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const toggleExpand = (gameId: string) => {
    setExpandedGameId((prev) => (prev === gameId ? null : gameId));
  };

  const filteredGames = TELEPLUS_GAMES_CONTENT.filter((g) => {
    if (filterPeriod === 'all') return true;
    return g.competitionCycle === filterPeriod;
  });

  const handlePlayClick = (contentGame: GameContentDetails) => {
    if (!onLaunchGame) return;
    // Match with real GameDefinition
    const matchedGame = games.find((g) => g.id === contentGame.id || g.title.toLowerCase().includes(contentGame.name.toLowerCase()));
    if (matchedGame) {
      onLaunchGame(matchedGame);
    } else if (games.length > 0) {
      onLaunchGame(games[0]);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="games-content-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#8BCB3D] shrink-0" />
              <h1 className="text-base font-black tracking-tight">Teleplus Games</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Competition Period Filter */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-4">
        <button
          onClick={() => setFilterPeriod('all')}
          className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            filterPeriod === 'all'
              ? 'bg-[#1688C9] text-white shadow-xs'
              : 'bg-transparent text-[#17202A] hover:text-[#1688C9]'
          }`}
        >
          All (6)
        </button>
        <button
          onClick={() => setFilterPeriod('weekly')}
          className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            filterPeriod === 'weekly'
              ? 'bg-[#8BCB3D] text-white shadow-xs'
              : 'bg-transparent text-[#17202A] hover:text-[#1688C9]'
          }`}
        >
          Weekly (3)
        </button>
        <button
          onClick={() => setFilterPeriod('monthly')}
          className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            filterPeriod === 'monthly'
              ? 'bg-[#8BCB3D] text-white shadow-xs'
              : 'bg-transparent text-[#17202A] hover:text-[#1688C9]'
          }`}
        >
          Monthly (3)
        </button>
      </div>

      {/* 3. 6 Games Cards with Full Detail */}
      <div className="space-y-4">
        {filteredGames.map((game, idx) => {
          const isExpanded = expandedGameId === game.id;
          const personalBest = profile?.highScores?.[game.id] || 0;

          return (
            <div
              key={game.id}
              id={`game-content-card-${game.id}`}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#1688C9]/50 shadow-xs overflow-hidden transition-all"
            >
              {/* Top Banner Row */}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-xs">
                    <OriginalGameArtwork gameId={game.id} className="w-full h-full" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-[#1688C9] border border-blue-100">
                        {game.competitionCycle} Tournament
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {game.genre}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-black text-[#17202A] leading-tight truncate">
                      {game.name}
                    </h2>

                    {profile && (
                      <div className="text-[11px] font-mono font-black text-[#1688C9]">
                        Best Score: {personalBest} PTS
                      </div>
                    )}
                  </div>
                </div>

                {onLaunchGame && (
                  <button
                    onClick={() => handlePlayClick(game)}
                    className="px-4 py-2 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb736] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>
                )}
              </div>

              {/* Overview & Quick Info */}
              <div className="px-4 pb-3 space-y-2.5">
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-[#17202A] block mb-1">Overview:</span>
                  {game.overview}
                </div>

                {/* Skill Focus Pills */}
                <div>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Skill Focus:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {game.skillFocus.map((sf, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-100"
                      >
                        {sf}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Accordion Toggle for How to Play & Detailed Rules */}
                <button
                  type="button"
                  onClick={() => toggleExpand(game.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-[#17202A] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide' : 'View'} How to Play & Game Rules</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#1688C9]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>

              {/* Expanded Detailed Rules & How to Play */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-3 animate-in fade-in">
                  {/* How to Play Steps */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-[#17202A] uppercase tracking-wider">
                      How to Play:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 pl-1 leading-relaxed">
                      {game.howToPlay.map((step, stepIdx) => (
                        <li key={stepIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Specific Game Notes */}
                  {game.gameDuration && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1688C9]" />
                        Game Duration: {game.gameDuration}
                      </div>
                      {game.gameDurationNotes && (
                        <ul className="list-disc list-inside text-[11px] text-blue-900 pl-1 space-y-0.5">
                          {game.gameDurationNotes.map((note, nIdx) => (
                            <li key={nIdx}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {game.visualRule && (
                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
                      <span className="font-bold">Visual Design: </span>
                      {game.visualRule}
                    </div>
                  )}

                  {game.difficultyProgression && (
                    <div className="space-y-1.5">
                      <h5 className="text-[11px] font-black text-[#17202A] uppercase">
                        Difficulty Progression:
                      </h5>
                      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white text-[11px]">
                        <div className="divide-y divide-slate-100">
                          {game.difficultyProgression.map((dp, dpIdx) => (
                            <div key={dpIdx} className="px-3 py-1.5 flex items-center justify-between">
                              <span className="font-bold text-slate-800">{dp.range}</span>
                              <span className="text-slate-600">{dp.activeBalloons} • {dp.speed}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {game.balloonColors && (
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-black text-[#17202A] uppercase">
                        Balloon Colors:
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {game.balloonColors.map((bc, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: bc.hex }}
                            />
                            <span>{bc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
