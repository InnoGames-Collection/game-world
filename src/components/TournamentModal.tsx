/**
 * Tournament Details & Registration Modal
 */

import React from 'react';
import { Tournament, GameDefinition } from '../types';
import { 
  X, 
  Trophy, 
  Users, 
  Gift, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { formatCurrencyETB } from '../utils/formatters';

interface TournamentModalProps {
  tournament: Tournament;
  game?: GameDefinition;
  onClose: () => void;
  onEnterTournament: (game: GameDefinition, tourneyId: string) => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  tournament,
  game,
  onClose,
  onEnterTournament,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative my-6 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/80 text-slate-700 hover:bg-white border border-slate-200 z-10 shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tournament Hero Banner */}
        <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-slate-100 border border-slate-200">
          <img
            src={tournament.bannerImage}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-[#78BE20] text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 fill-current" /> Active Cup
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-[11px] text-slate-200 font-medium">Sponsor: {tournament.sponsor}</div>
            <h3 className="text-lg font-black text-white leading-tight">
              {tournament.title}
            </h3>
          </div>
        </div>

        {/* Prize Pool Highlight Block */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Total Prize Pool
              </div>
              <div className="text-xl font-black text-slate-900 font-mono leading-none">
                {formatCurrencyETB(tournament.prizePoolETB)}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Participants</div>
            <div className="text-sm font-bold text-[#0057A8] font-mono flex items-center gap-1 justify-end">
              <Users className="w-3.5 h-3.5" />
              <span>{tournament.participantsCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Prize Breakdown Ladder */}
        <div className="mb-5">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-[#0057A8]" /> Prize Ladder
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {tournament.prizes.map((p, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-[#0057A8]">{p.rank}</span>
                <span className="text-slate-800 font-medium text-right text-[11px]">{p.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enter Tournament Button */}
        {game ? (
          <button
            onClick={() => {
              onClose();
              onEnterTournament(game, tournament.id);
            }}
            className="w-full py-3.5 rounded-xl bg-[#78BE20] hover:bg-[#68a81b] text-white font-black text-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <span>ENTER CUP ({tournament.entryFeeEnergy * 10 || 10} COINS)</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs"
          >
            Close
          </button>
        )}

        <div className="mt-3 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Scores are recorded on the official EthioTelecom Championship Leaderboard.</span>
        </div>
      </div>
    </div>
  );
};

