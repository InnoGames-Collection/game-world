import { FastifyInstance } from 'fastify';

export async function adminPortalRoutes(fastify: FastifyInstance) {
  fastify.get('/admin', async (request, reply) => {
    reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoPlay — Enterprise Operations Console</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
    .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <!-- Top Navigation -->
  <header class="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-800">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center font-black text-xl text-slate-900 shadow-lg shadow-emerald-500/20">
        G
      </div>
      <div>
        <h1 class="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          GoPlay <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Tier-0 Operations</span>
        </h1>
        <p class="text-xs text-slate-400">telebirr SuperApp Gaming Operations Console</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div id="authStatus" class="text-xs text-slate-400">Authenticating...</div>
      <button onclick="logoutAdmin()" class="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Sign Out</button>
    </div>
  </header>

  <!-- Main Container -->
  <div class="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
    <!-- Quick Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="metricsRow">
      <div class="glass p-5 rounded-2xl border border-slate-800 animate-pulse">Loading Metrics...</div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex gap-2 border-b border-slate-800 pb-2 text-sm font-semibold">
      <button onclick="switchTab('users')" id="tab-users" class="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold transition">Players</button>
      <button onclick="switchTab('tournaments')" id="tab-tournaments" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition">Tournaments</button>
      <button onclick="switchTab('rules')" id="tab-rules" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition">Game Scoring Rules</button>
      <button onclick="switchTab('audit')" id="tab-audit" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition">Financial & SMS Audit</button>
    </div>

    <!-- Tab 1: Players -->
    <div id="view-users" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Registered Players</h2>
        <input type="text" id="userSearch" onkeyup="searchUsers(this.value)" placeholder="Search MSISDN or Name..." class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500 w-72">
      </div>
      <div class="glass rounded-2xl overflow-hidden border border-slate-800">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-900/60 text-slate-400 text-xs border-b border-slate-800">
            <tr>
              <th class="p-4">Player</th>
              <th class="p-4">Phone / MSISDN</th>
              <th class="p-4">Coins</th>
              <th class="p-4">Level (XP)</th>
              <th class="p-4">Energy</th>
              <th class="p-4">TeleBirr Balance</th>
              <th class="p-4">Role</th>
              <th class="p-4">Actions</th>
            </tr>
          </thead>
          <tbody id="usersTableBody" class="divide-y divide-slate-800 text-slate-300">
            <tr><td colspan="8" class="p-6 text-center text-slate-500">Loading players...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: Tournaments -->
    <div id="view-tournaments" class="space-y-4 hidden">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Active & Upcoming Tournaments</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="tournamentsGrid">
        <!-- Injected via JS -->
      </div>
    </div>

    <!-- Tab 3: Game Rules -->
    <div id="view-rules" class="space-y-4 hidden">
      <h2 class="text-xl font-bold">Anti-Cheat & Game Par Rules</h2>
      <div class="glass rounded-2xl overflow-hidden border border-slate-800">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-900/60 text-slate-400 text-xs border-b border-slate-800">
            <tr>
              <th class="p-4">Game ID</th>
              <th class="p-4">Max Score</th>
              <th class="p-4">Max Score / Sec</th>
              <th class="p-4">Min Duration</th>
              <th class="p-4">Actions</th>
            </tr>
          </thead>
          <tbody id="rulesTableBody" class="divide-y divide-slate-800 text-slate-300"></tbody>
        </table>
      </div>
    </div>

    <!-- Tab 4: Audit Logs -->
    <div id="view-audit" class="space-y-6 hidden">
      <div>
        <h3 class="text-lg font-bold mb-3">Recent Wallet Ledger Transactions</h3>
        <div class="glass rounded-2xl overflow-hidden border border-slate-800" id="ledgerContainer"></div>
      </div>
      <div>
        <h3 class="text-lg font-bold mb-3">Recent TeleBirr Payment Orders</h3>
        <div class="glass rounded-2xl overflow-hidden border border-slate-800" id="ordersContainer"></div>
      </div>
      <div>
        <h3 class="text-lg font-bold mb-3">Recent Reward Disbursements</h3>
        <div class="glass rounded-2xl overflow-hidden border border-slate-800" id="rewardsContainer"></div>
      </div>
    </div>
  </div>

  <script>
    let currentToken = localStorage.getItem('goplay_admin_token') || '';

    async function initAdmin() {
      if (!currentToken) {
        // Auto-login as superadmin in demo mode if empty
        try {
          const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: '+251911000000', otp: '123456' })
          });
          const data = await res.json();
          if (data.tokens) {
            currentToken = data.tokens.accessToken;
            localStorage.setItem('goplay_admin_token', currentToken);
          }
        } catch(e) {}
      }

      document.getElementById('authStatus').innerHTML = '<span class="text-emerald-400 font-medium">● Operator Active</span>';
      loadMetrics();
      loadUsers();
      loadTournaments();
      loadRules();
      loadAudit();
    }

    async function fetchApi(url, options = {}) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = 'Bearer ' + currentToken;
      return fetch(url, options);
    }

    async function loadMetrics() {
      try {
        const res = await fetchApi('/api/admin/metrics');
        const m = await res.json();
        document.getElementById('metricsRow').innerHTML = \`
          <div class="glass p-5 rounded-2xl border border-slate-800">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Players</div>
            <div class="text-2xl font-black text-white mt-1">\${m.totalUsers || 0}</div>
            <div class="text-xs text-emerald-400 mt-2"><i class="fa fa-users"></i> telebirr MSISDN</div>
          </div>
          <div class="glass p-5 rounded-2xl border border-slate-800">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Matches Played</div>
            <div class="text-2xl font-black text-amber-400 mt-1">\${(m.totalMatchesPlayed || 0).toLocaleString()}</div>
            <div class="text-xs text-slate-400 mt-2"><i class="fa fa-gamepad"></i> 18 Catalog Games</div>
          </div>
          <div class="glass p-5 rounded-2xl border border-slate-800">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">TeleBirr Volume</div>
            <div class="text-2xl font-black text-emerald-400 mt-1">\${(m.totalPaymentVolumeETB || 0).toLocaleString()} ETB</div>
            <div class="text-xs text-emerald-400 mt-2"><i class="fa fa-check-circle"></i> \${m.successfulOrders || 0} Transactions</div>
          </div>
          <div class="glass p-5 rounded-2xl border border-slate-800">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Prizes Disbursed</div>
            <div class="text-2xl font-black text-purple-400 mt-1">\${(m.disbursedPrizesETB || 0).toLocaleString()} ETB</div>
            <div class="text-xs text-slate-400 mt-2"><i class="fa fa-trophy"></i> \${m.disbursedPrizesCount || 0} Tournament Winners</div>
          </div>
        \`;
      } catch (e) {}
    }

    async function loadUsers(search = '') {
      try {
        const res = await fetchApi('/api/admin/users' + (search ? '?search=' + encodeURIComponent(search) : ''));
        const users = await res.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = users.map(u => \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="p-4 font-semibold text-white">\${u.display_name}</td>
            <td class="p-4 text-emerald-400 font-mono">\${u.phone_local || u.phone}</td>
            <td class="p-4 text-amber-400 font-bold">\${parseInt(u.coins).toLocaleString()}</td>
            <td class="p-4">Lvl \${u.level} <span class="text-xs text-slate-500">(\${parseInt(u.xp)} XP)</span></td>
            <td class="p-4 text-blue-400 font-bold">\${u.energy}/5</td>
            <td class="p-4 font-mono">\${parseFloat(u.telebirr_balance || 0).toFixed(2)} ETB</td>
            <td class="p-4"><span class="px-2 py-0.5 rounded text-xs \${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}">\${u.role}</span></td>
            <td class="p-4">
              <button onclick="grantCoins('\${u.id}')" class="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition">+Coins</button>
            </td>
          </tr>
        \`).join('');
      } catch (e) {}
    }

    async function loadTournaments() {
      try {
        const res = await fetchApi('/api/admin/tournaments');
        const list = await res.json();
        document.getElementById('tournamentsGrid').innerHTML = list.map(t => \`
          <div class="glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">\${t.cycle}</span>
              <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">\${t.state}</span>
            </div>
            <h3 class="text-base font-bold text-white leading-snug">\${t.title}</h3>
            <div class="text-xs text-slate-400">Game: <span class="text-slate-200 font-mono">\${t.game_id}</span></div>
            <div class="text-sm font-bold text-emerald-400">\${parseInt(t.prize_pool_etb).toLocaleString()} ETB Prize Pool</div>
            <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span class="text-slate-400">\${t.participants_count || 0} contenders</span>
              \${t.state === 'live' ? \`<button onclick="settleTourney('\${t.id}')" class="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold transition">Settle</button>\` : ''}
            </div>
          </div>
        \`).join('');
      } catch (e) {}
    }

    async function loadRules() {
      try {
        const res = await fetchApi('/api/admin/game-rules');
        const rules = await res.json();
        document.getElementById('rulesTableBody').innerHTML = rules.map(r => \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="p-4 font-mono text-emerald-400 font-semibold">\${r.game_id}</td>
            <td class="p-4 font-bold text-white">\${r.max_score} pts</td>
            <td class="p-4 text-slate-400">\${r.max_score_per_second} pts/sec</td>
            <td class="p-4 text-slate-400">\${r.min_duration_sec}s</td>
            <td class="p-4"><span class="text-xs text-emerald-400">Enforced</span></td>
          </tr>
        \`).join('');
      } catch (e) {}
    }

    async function loadAudit() {
      try {
        const res = await fetchApi('/api/admin/logs/audit');
        const data = await res.json();
        document.getElementById('ledgerContainer').innerHTML = \`
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr><th class="p-3">User</th><th class="p-3">Delta</th><th class="p-3">Reason</th><th class="p-3">Date</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
              \${data.recentLedger.slice(0, 5).map(l => \`<tr><td class="p-3 font-mono">\${l.user_id.slice(0, 8)}...</td><td class="p-3 font-bold \${l.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}">\${l.delta > 0 ? '+' : ''}\${l.delta}</td><td class="p-3">\${l.reason}</td><td class="p-3 text-slate-500">\${new Date(l.created_at).toLocaleString()}</td></tr>\`).join('')}
            </tbody>
          </table>
        \`;
        document.getElementById('ordersContainer').innerHTML = \`
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr><th class="p-3">Order ID</th><th class="p-3">Amount</th><th class="p-3">Item</th><th class="p-3">Status</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
              \${data.recentOrders.slice(0, 5).map(o => \`<tr><td class="p-3 font-mono">\${o.id}</td><td class="p-3 font-bold text-emerald-400">\${o.amount_etb} ETB</td><td class="p-3">\${o.item_title}</td><td class="p-3"><span class="px-2 py-0.5 rounded \${o.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}">\${o.status}</span></td></tr>\`).join('')}
            </tbody>
          </table>
        \`;
      } catch (e) {}
    }

    async function grantCoins(id) {
      const delta = prompt('Enter coins to grant (e.g. 500):', '500');
      if (!delta) return;
      await fetchApi('/api/admin/users/' + id + '/adjust', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinDelta: parseInt(delta, 10) })
      });
      loadUsers();
    }

    async function settleTourney(id) {
      if (!confirm('Are you sure you want to settle tournament ' + id + '?')) return;
      await fetchApi('/api/admin/tournaments/' + id + '/settle', { method: 'POST' });
      loadTournaments();
    }

    function searchUsers(val) {
      loadUsers(val);
    }

    function switchTab(tab) {
      ['users', 'tournaments', 'rules', 'audit'].forEach(t => {
        document.getElementById('view-' + t).classList.add('hidden');
        document.getElementById('tab-' + t).classList.remove('bg-emerald-500', 'text-slate-950', 'font-bold');
        document.getElementById('tab-' + t).classList.add('text-slate-400');
      });
      document.getElementById('view-' + tab).classList.remove('hidden');
      document.getElementById('tab-' + tab).classList.add('bg-emerald-500', 'text-slate-950', 'font-bold');
      document.getElementById('tab-' + tab).classList.remove('text-slate-400');
    }

    function logoutAdmin() {
      localStorage.removeItem('goplay_admin_token');
      location.reload();
    }

    initAdmin();
  </script>
</body>
</html>`);
  });
}
