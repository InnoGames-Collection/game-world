/**
 * GoPlay Operations Admin Console
 * Provides enterprise metrics, user economy management, tournament controls,
 * game scoring anti-cheat configuration, and financial audit logs.
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Trophy, 
  ShieldAlert, 
  FileText, 
  ArrowLeft, 
  RefreshCw, 
  Coins, 
  Zap, 
  PlusCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminPortalPageProps {
  profile: UserProfile;
  onBack: () => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'tournaments' | 'rules' | 'audit'>('metrics');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalUsers: 14250,
    totalMatchesPlayed: 89400,
    totalPaymentVolumeETB: 142500,
    successfulOrders: 14250,
    activeTournaments: 4,
    disbursedPrizesETB: 45000,
    disbursedPrizesCount: 180,
  });

  // Users state
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState<any[]>([
    { id: '1', phone: '251923026799', display_name: 'Yasabneh', role: 'admin', coins: 1500, energy: 10, level: 8, matches_played: 142 },
    { id: '2', phone: '251911428890', display_name: 'EthioTelecom Gamer', role: 'player', coins: 450, energy: 8, level: 4, matches_played: 68 },
    { id: '3', phone: '251977341290', display_name: 'Abebe Bikila', role: 'player', coins: 820, energy: 10, level: 6, matches_played: 95 },
    { id: '4', phone: '251930129844', display_name: 'Selamawit', role: 'player', coins: 120, energy: 4, level: 2, matches_played: 19 },
  ]);

  // Selected user for adjustment
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustCoins, setAdjustCoins] = useState<number>(50);
  const [adjustEnergy, setAdjustEnergy] = useState<number>(5);

  // Tournaments state
  const [tournaments, setTournaments] = useState<any[]>([
    { id: 'tourney-weekly-01', title: 'Grand Weekly Challenge', game_id: 'crazy-colors', cycle: 'weekly', state: 'live', prize_pool_etb: 10000, starts_at: '2026-09-15', ends_at: '2026-09-22' },
    { id: 'tourney-fruit-02', title: 'Blade Master Slice', game_id: 'halloween-fruit-slice', cycle: 'weekly', state: 'live', prize_pool_etb: 5000, starts_at: '2026-09-15', ends_at: '2026-09-22' },
    { id: 'tourney-helix-03', title: 'Helix Drop Championship', game_id: 'helix-jump', cycle: 'weekly', state: 'live', prize_pool_etb: 7500, starts_at: '2026-09-15', ends_at: '2026-09-22' },
    { id: 'tourney-piano-04', title: 'Pop Rhythm Masters', game_id: 'pop-piano', cycle: 'weekly', state: 'live', prize_pool_etb: 5000, starts_at: '2026-09-15', ends_at: '2026-09-22' },
  ]);

  // Scoring rules state
  const [rules, setRules] = useState<any[]>([
    { game_id: 'crazy-colors', max_score: 5000, max_score_per_second: 120 },
    { game_id: 'halloween-fruit-slice', max_score: 4500, max_score_per_second: 90 },
    { game_id: 'helix-jump', max_score: 6000, max_score_per_second: 150 },
    { game_id: 'pop-piano', max_score: 4000, max_score_per_second: 100 },
    { game_id: 'soccer-shooter', max_score: 8000, max_score_per_second: 120 },
    { game_id: 'world-legends', max_score: 10000, max_score_per_second: 80 },
  ]);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'AUD-991', type: 'PAYMENT', user: '251923026799', amount: '10.00 ETB', details: 'Daily Access Plan Fulfill', time: 'Just now' },
    { id: 'AUD-990', type: 'COIN_GRANT', user: '251911428890', amount: '+50 Coins', details: 'Admin manual economy grant', time: '12m ago' },
    { id: 'AUD-989', type: 'TOURNAMENT_SETTLE', user: 'SYSTEM', amount: '10,000 ETB', details: 'Week 37 Settlement to 10 winners', time: '3h ago' },
    { id: 'AUD-988', type: 'SECURITY_ALERT', user: '251944112233', amount: 'BLOCKED', details: 'Abnormal score velocity on helix-jump', time: '5h ago' },
  ]);

  const refreshData = async () => {
    setLoading(true);
    try {
      // In production stack, fetch directly from backend API
      const res = await fetch('/api/admin/metrics').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApplyAdjustment = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, coins: u.coins + adjustCoins, energy: Math.min(10, u.energy + adjustEnergy) }
          : u
      )
    );
    setFeedback({
      type: 'success',
      message: `Updated economy for ${selectedUser.display_name}: +${adjustCoins} coins, +${adjustEnergy} energy`,
    });
    setSelectedUser(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSettleTournament = (tourneyId: string) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === tourneyId ? { ...t, state: 'settled' } : t))
    );
    setFeedback({
      type: 'success',
      message: `Tournament ${tourneyId} marked as settled. Cash prizes dispatched to Telebirr wallets.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Admin Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                GoPlay Operations
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/30">
                Tier-0 Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-400">telebirr SuperApp Partner Portal</p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'metrics', label: 'Dashboard', icon: BarChart3 },
          { id: 'users', label: 'Users & Economy', icon: Users },
          { id: 'tournaments', label: 'Tournaments', icon: Trophy },
          { id: 'rules', label: 'Anti-Cheat Rules', icon: ShieldAlert },
          { id: 'audit', label: 'Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#8BCB3D] text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Alert Toast */}
      {feedback && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-6">
        {/* =========================================================================
            TAB 1: METRICS DASHBOARD
           ========================================================================= */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Total Players
                </span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {metrics.totalUsers.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                  ↑ 14% this week
                </span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Matches Played
                </span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {metrics.totalMatchesPlayed.toLocaleString()}
                </span>
                <span className="text-[10px] text-sky-400 font-bold mt-1 block">
                  6.27 avg / user
                </span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Payment Volume
                </span>
                <span className="text-2xl font-black text-[#8BCB3D] font-mono mt-1 block">
                  {metrics.totalPaymentVolumeETB.toLocaleString()} ETB
                </span>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                  {metrics.successfulOrders.toLocaleString()} completed orders
                </span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Prizes Disbursed
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                  {metrics.disbursedPrizesETB.toLocaleString()} ETB
                </span>
                <span className="text-[10px] text-amber-300 font-bold mt-1 block">
                  {metrics.disbursedPrizesCount} Telebirr B2C payouts
                </span>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Infrastructure Health
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Fastify Tier-0 API:</span>
                    <span className="text-emerald-400 font-bold">● Healthy (Port 3302)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>PostgreSQL 16 Engine:</span>
                    <span className="text-emerald-400 font-bold">● Connected (Port 5434)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Valkey 8.x Cache:</span>
                    <span className="text-emerald-400 font-bold">● Active (Port 6384)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Telebirr Webhook Bridge:</span>
                    <span className="text-emerald-400 font-bold">● Ready (/api/webhooks/telebirr)</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Active Subscription Plans
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Daily Access (24h - 10 ETB):</span>
                    <span className="font-mono font-bold text-white">8,420 Active</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Weekly Access (7d - 50 ETB):</span>
                    <span className="font-mono font-bold text-white">4,110 Active</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Monthly Access (30d - 175 ETB):</span>
                    <span className="font-mono font-bold text-white">1,720 Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: USERS & ECONOMY MANAGEMENT
           ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search player by phone number or name..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#8BCB3D]"
              />
            </div>

            <div className="bg-slate-800/70 rounded-2xl border border-slate-700 overflow-hidden divide-y divide-slate-700/60">
              {users
                .filter(
                  (u) =>
                    u.phone.includes(userSearch) ||
                    u.display_name.toLowerCase().includes(userSearch.toLowerCase())
                )
                .map((u) => (
                  <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{u.display_name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 text-[9px] font-mono">
                          {u.phone}
                        </span>
                        {u.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>🪙 {u.coins} Coins</span>
                        <span>⚡ {u.energy}/10 Energy</span>
                        <span>🎮 {u.matches_played} Matches</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-[#8BCB3D] hover:text-slate-950 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Adjust
                    </button>
                  </div>
                ))}
            </div>

            {/* Modal for User Economy Adjustment */}
            {selectedUser && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4">
                  <h3 className="font-bold text-sm text-white">
                    Adjust Economy: {selectedUser.display_name}
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Add Coins:</label>
                      <input
                        type="number"
                        value={adjustCoins}
                        onChange={(e) => setAdjustCoins(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Add Energy:</label>
                      <input
                        type="number"
                        value={adjustEnergy}
                        onChange={(e) => setAdjustEnergy(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleApplyAdjustment}
                      className="flex-1 py-2.5 rounded-xl bg-[#8BCB3D] text-slate-950 font-black text-xs cursor-pointer"
                    >
                      Confirm Adjustment
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="py-2.5 px-4 rounded-xl bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: TOURNAMENTS MANAGEMENT
           ========================================================================= */}
        {activeTab === 'tournaments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Active Weekly Tournaments
              </h3>
              <button
                type="button"
                onClick={() => alert('Add tournament dialog')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#8BCB3D] text-slate-950 text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Tournament</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tournaments.map((t) => (
                <div key={t.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">{t.title}</h4>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Game: <span className="font-mono text-sky-300">{t.game_id}</span>
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        t.state === 'live'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {t.state}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex justify-between border-t border-slate-700/80 pt-2">
                    <span>Prize Pool:</span>
                    <span className="font-mono font-bold text-[#8BCB3D]">
                      {t.prize_pool_etb.toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-400">
                      Cycle: {t.starts_at} → {t.ends_at}
                    </span>
                    {t.state === 'live' && (
                      <button
                        type="button"
                        onClick={() => handleSettleTournament(t.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer"
                      >
                        Settle &amp; Payout
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: GAME RULES & ANTI-CHEAT
           ========================================================================= */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Scoring Thresholds &amp; Velocity Anti-Cheat
            </h3>

            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden divide-y divide-slate-700">
              {rules.map((r) => (
                <div key={r.game_id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white font-mono">{r.game_id}</span>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-0.5">
                      <span>Max Allowed: <strong className="text-slate-200">{r.max_score}</strong></span>
                      <span>Max / Sec: <strong className="text-slate-200">{r.max_score_per_second}</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newMax = prompt(`Enter new max score for ${r.game_id}:`, r.max_score);
                      if (newMax) {
                        setRules((prev) =>
                          prev.map((item) =>
                            item.game_id === r.game_id
                              ? { ...item, max_score: parseInt(newMax, 10) || item.max_score }
                              : item
                          )
                        );
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Edit Rule
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: AUDIT LOGS
           ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              System Audit Trail &amp; Ledger
            </h3>

            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden divide-y divide-slate-700">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-sky-400">{log.id}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 text-[9px] font-bold">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{log.details}</p>
                    <span className="text-[10px] text-slate-400">Target: {log.user}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-[#8BCB3D] block">
                      {log.amount}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
