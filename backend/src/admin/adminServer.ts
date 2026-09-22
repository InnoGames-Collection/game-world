import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from '../config/env.js';
import { query, pool } from '../config/database.js';
import { brevoEmailService } from './brevoService.js';
import { adminAuth, requireAdminSession, requireSuperAdmin } from './adminAuth.js';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  trustProxy: true,
});

async function main() {
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // HTML dashboard embeds scripts/styles
  });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Healthcheck
  fastify.get('/health', async () => ({
    status: 'healthy',
    service: 'goplay-admin-portal',
    port: env.ADMIN_PORT,
    timestamp: new Date().toISOString(),
  }));

  // ============================================================================
  // 1. Magic Link Authentication Endpoints
  // ============================================================================

  // Request Magic Login Link
  fastify.post('/api/admin/auth/request-link', async (request, reply) => {
    const { email } = (request.body || {}) as { email?: string };
    if (!email || !email.includes('@')) {
      return reply.status(400).send({ success: false, message: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is an authorized admin or auditor
    const userRes = await query(
      'SELECT id, email, name, role, is_active FROM admin_users WHERE email = $1',
      [cleanEmail]
    );

    if (userRes.rowCount === 0) {
      return reply.status(403).send({
        success: false,
        message: 'This email is not authorized for operations console access. Contact your administrator.',
      });
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      return reply.status(403).send({
        success: false,
        message: 'This account has been deactivated. Please contact security.',
      });
    }

    // Generate single-use token (15-minute validity)
    const { rawToken, tokenHash } = adminAuth.generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `INSERT INTO admin_magic_links (email, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [cleanEmail, tokenHash, expiresAt]
    );

    const magicLinkUrl = `${env.ADMIN_PORTAL_URL}/auth/verify?token=${rawToken}`;

    const sendResult = await brevoEmailService.sendMagicLink({
      toEmail: cleanEmail,
      toName: user.name,
      magicLinkUrl,
      role: user.role,
    });

    return reply.send(sendResult);
  });

  // Verify Magic Login Link (GET link from email)
  fastify.get('/auth/verify', async (request, reply) => {
    const { token } = (request.query || {}) as { token?: string };
    if (!token) {
      return reply.status(400).type('text/html').send(`
        <html><body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;padding:40px;text-align:center;">
          <h2>Invalid or Missing Token</h2>
          <p>Please request a new magic link from the sign in page.</p>
          <a href="/" style="color:#38bdf8;">Return to Login</a>
        </body></html>
      `);
    }

    const tokenHash = adminAuth.hashToken(token);

    // Look up token in database
    const linkRes = await query(
      `SELECT * FROM admin_magic_links
        WHERE token_hash = $1 AND used = FALSE AND expires_at > NOW()`,
      [tokenHash]
    );

    if (linkRes.rowCount === 0) {
      return reply.status(400).type('text/html').send(`
        <html><body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;padding:40px;text-align:center;">
          <h2>Expired or Already Used Link</h2>
          <p>This magic sign-in link is either invalid, already used, or expired (links are valid for 15 minutes).</p>
          <a href="/" style="display:inline-block;margin-top:16px;background:#10b981;color:#022c22;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Request New Magic Link</a>
        </body></html>
      `);
    }

    const link = linkRes.rows[0];

    // Mark link as consumed
    await query('UPDATE admin_magic_links SET used = TRUE WHERE id = $1', [link.id]);

    // Fetch user details
    const userRes = await query(
      'SELECT id, email, name, role, is_active FROM admin_users WHERE email = $1',
      [link.email]
    );

    if (userRes.rowCount === 0 || !userRes.rows[0].is_active) {
      return reply.status(403).send({ success: false, message: 'Account is inactive.' });
    }

    const user = userRes.rows[0];

    // Update last login
    await query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Sign session token
    const sessionToken = adminAuth.signAdminSession({
      adminId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Set cookie and redirect to root dashboard with token stored
    reply.header(
      'Set-Cookie',
      `goplay_admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${8 * 3600}`
    );

    return reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
      <head>
        <script>
          localStorage.setItem('goplay_admin_token', '${sessionToken}');
          localStorage.setItem('goplay_admin_role', '${user.role}');
          localStorage.setItem('goplay_admin_name', '${user.name}');
          window.location.href = '/';
        </script>
      </head>
      <body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;text-align:center;padding:50px;">
        <h2>Authenticating session...</h2>
        <p>Redirecting to GoPlay Operations Console...</p>
      </body>
      </html>
    `);
  });

  // Current Admin Session Info
  fastify.get('/api/admin/auth/me', { preHandler: [requireAdminSession] }, async (request, reply) => {
    return reply.send({ success: true, admin: request.adminUser });
  });

  // Logout
  fastify.post('/api/admin/auth/logout', async (request, reply) => {
    reply.header('Set-Cookie', 'goplay_admin_session=; Path=/; HttpOnly; Max-Age=0');
    return reply.send({ success: true, message: 'Logged out successfully' });
  });

  // ============================================================================
  // 2. Metrics & Telemetry (Read-only: admin & auditor)
  // ============================================================================
  fastify.get('/api/admin/metrics', { preHandler: [requireAdminSession] }, async (request, reply) => {
    const userCount = await query('SELECT COUNT(*) FROM profiles');
    const matchesCount = await query('SELECT COALESCE(SUM(matches_played), 0) as total FROM profiles');
    const ordersCount = await query(
      `SELECT COUNT(*) as total, COALESCE(SUM(amount_etb), 0) as vol FROM payment_orders WHERE status = 'SUCCESS'`
    );
    const tourneyCount = await query(`SELECT COUNT(*) FROM tournaments WHERE state = 'live'`);
    const claimRes = await query(
      `SELECT COUNT(*) as cnt, COALESCE(SUM(reward_etb), 0) as total_disbursed FROM reward_transactions WHERE status = 'DISBURSED'`
    );

    return reply.send({
      totalUsers: parseInt(userCount.rows[0].count, 10),
      totalMatchesPlayed: parseInt(matchesCount.rows[0].total, 10),
      totalPaymentVolumeETB: parseFloat(ordersCount.rows[0].vol),
      successfulOrders: parseInt(ordersCount.rows[0].total, 10),
      activeTournaments: parseInt(tourneyCount.rows[0].count, 10),
      disbursedPrizesETB: parseFloat(claimRes.rows[0].total_disbursed),
      disbursedPrizesCount: parseInt(claimRes.rows[0].cnt, 10),
    });
  });

  // ============================================================================
  // 3. Registered Players (Read: admin & auditor; Write: admin only)
  // ============================================================================
  fastify.get('/api/admin/users', { preHandler: [requireAdminSession] }, async (request, reply) => {
    const { search, limit = 50, offset = 0 } = request.query as any;
    let sql = `SELECT id, phone, phone_local, display_name, role, coins, xp, level, energy,
                      telebirr_linked, telebirr_balance, matches_played, created_at
                 FROM profiles`;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` WHERE phone ILIKE $1 OR display_name ILIKE $1`;
    }

    params.push(limit, offset);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query(sql, params);
    return reply.send(res.rows);
  });

  // Adjust User Economy (Admin only - Auditors blocked!)
  fastify.put('/api/admin/users/:id/adjust', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { coinDelta, energyDelta } = request.body as any;

    if (coinDelta) {
      await query('SELECT apply_coins($1, $2, $3, $4)', [id, coinDelta, 'Admin Manual Adjustment', 'ADMIN_ADJUST']);
    }
    if (energyDelta) {
      await query('SELECT apply_energy($1, $2, $3, $4)', [id, energyDelta, 'DAILY_REWARD', 'Admin Energy Grant']);
    }

    return reply.send({ success: true, message: 'User balance adjusted successfully' });
  });

  // ============================================================================
  // 4. Tournaments (Read: admin & auditor; Write/Settle: admin only)
  // ============================================================================
  fastify.get('/api/admin/tournaments', { preHandler: [requireAdminSession] }, async (request, reply) => {
    const res = await query('SELECT * FROM tournaments ORDER BY starts_at DESC');
    return reply.send(res.rows);
  });

  fastify.post('/api/admin/tournaments', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const b = request.body as any;
    await query(
      `INSERT INTO tournaments (
         id, game_id, title, title_am, cycle, type, entry_fee_coins, entry_fee_energy,
         prize_model, prize_pool_etb, prize_pool_coins, prize_tiers, banner_image,
         sponsor, entry_requirement, starts_at, ends_at, state
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        b.id,
        b.gameId,
        b.title,
        b.titleAm || b.title,
        b.cycle || 'weekly',
        b.type || 'paid',
        b.entryFeeCoins || 2,
        0,
        b.prizeModel || 'sponsored',
        b.prizePoolETB || 10000,
        b.prizePoolCoins || 50000,
        JSON.stringify(b.prizeTiers || []),
        b.bannerImage || '',
        b.sponsor || 'telebirr SuperApp',
        b.entryRequirement || '2 Coins Per Play',
        b.startsAt || new Date(),
        b.endsAt || new Date(Date.now() + 7 * 86400000),
        b.state || 'live',
      ]
    );
    return reply.send({ success: true, message: 'Tournament created' });
  });

  fastify.post('/api/admin/tournaments/:id/settle', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await query(`UPDATE tournaments SET state = 'settled' WHERE id = $1`, [id]);
    return reply.send({ success: true, message: `Tournament ${id} marked as settled` });
  });

  // ============================================================================
  // 5. Game Scoring Rules (Read: admin & auditor; Write: admin only)
  // ============================================================================
  fastify.get('/api/admin/game-rules', { preHandler: [requireAdminSession] }, async (request, reply) => {
    const res = await query('SELECT * FROM game_scoring_rules ORDER BY game_id ASC');
    return reply.send(res.rows);
  });

  fastify.put('/api/admin/game-rules/:gameId', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const { gameId } = request.params as { gameId: string };
    const b = request.body as any;
    await query(
      `UPDATE game_scoring_rules
          SET max_score = COALESCE($1, max_score),
              max_score_per_second = COALESCE($2, max_score_per_second)
        WHERE game_id = $3`,
      [b.maxScore, b.maxScorePerSecond, gameId]
    );
    return reply.send({ success: true, message: 'Scoring rules updated' });
  });

  // ============================================================================
  // 6. Audit Logs (Read: admin & telecom auditor)
  // ============================================================================
  fastify.get('/api/admin/logs/audit', { preHandler: [requireAdminSession] }, async (request, reply) => {
    const ledgers = await query('SELECT * FROM wallet_ledger ORDER BY created_at DESC LIMIT 30');
    const orders = await query('SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 30');
    const rewards = await query('SELECT * FROM reward_transactions ORDER BY created_at DESC LIMIT 30');

    return reply.send({
      recentLedger: ledgers.rows,
      recentOrders: orders.rows,
      recentRewards: rewards.rows,
    });
  });

  // ============================================================================
  // 7. Operations Console Single-Page Dashboard HTML (Strict RBAC, No Backdoor!)
  // ============================================================================
  fastify.get('/', async (request, reply) => {
    reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoPlay — Dedicated Operations & Audit Console</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
    .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body class="min-h-screen flex flex-col">

  <!-- LOGIN OVERLAY IF NOT AUTHENTICATED -->
  <div id="loginView" class="hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass max-w-md w-full p-8 rounded-3xl border border-slate-800 space-y-6 text-center">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-2xl font-black text-slate-950 shadow-xl shadow-emerald-500/20">
        G
      </div>
      <div>
        <h2 class="text-2xl font-black tracking-tight text-white">GoPlay Operations</h2>
        <p class="text-xs text-slate-400 mt-1">EthioTelecom & telebirr Enterprise Console</p>
      </div>

      <div id="loginNotice" class="text-xs px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300">
        Enter your authorized administrator or telecom auditor email to receive a secure sign-in magic link.
      </div>

      <form id="magicLinkForm" onsubmit="requestMagicLink(event)" class="space-y-4 text-left">
        <div>
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Corporate Email</label>
          <input type="email" id="emailInput" required placeholder="e.g. innospher@gmail.com" class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500">
        </div>
        <button type="submit" id="submitBtn" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide transition shadow-lg shadow-emerald-500/20">
          Send Magic Link via Email
        </button>
      </form>

      <div class="pt-4 border-t border-slate-800/80 text-xs text-slate-500">
        Role-based access: <span class="text-emerald-400">admin</span> (Full Ops) or <span class="text-amber-400">auditor</span> (Read-Only Telecom Audit)
      </div>
    </div>
  </div>

  <!-- AUTHENTICATED DASHBOARD -->
  <div id="dashboardView" class="flex-1 flex flex-col">
    <!-- Top Navigation -->
    <header class="glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-black text-xl text-slate-950 shadow-lg shadow-emerald-500/20">
          G
        </div>
        <div>
          <h1 class="text-base font-bold tracking-tight text-white flex items-center gap-2">
            GoPlay <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Tier-0 Operations</span>
          </h1>
          <p class="text-xs text-slate-400">telebirr SuperApp Dedicated Portal</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div id="authStatus" class="text-xs font-semibold"></div>
        <button onclick="logoutAdmin()" class="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
          <i class="fa fa-sign-out-alt mr-1"></i> Sign Out
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="metricsRow">
        <div class="glass p-5 rounded-2xl border border-slate-800 animate-pulse">Loading Metrics...</div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex gap-2 border-b border-slate-800 pb-2 text-sm font-semibold">
        <button onclick="switchTab('users')" id="tab-users" class="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold transition">Players</button>
        <button onclick="switchTab('tournaments')" id="tab-tournaments" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition">4 Tournament Games</button>
        <button onclick="switchTab('rules')" id="tab-rules" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition">Game Scoring Rules</button>
        <button onclick="switchTab('audit')" id="tab-audit" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition">Telecom & Financial Audit</button>
      </div>

      <!-- Tab 1: Players -->
      <div id="view-users" class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">Registered Players (telebirr MSISDN)</h2>
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
                <th class="p-4">Matches Played</th>
                <th class="p-4">Registered Date</th>
                <th class="p-4" id="actionHeader">Actions</th>
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
          <div>
            <h2 class="text-xl font-bold">4 Official Tournament Competitions</h2>
            <p class="text-xs text-slate-400">Crazy Color, Fruit Ninja, Helix Jump & Pop Piano (2 Coins Entry = 5 Plays per 10 ETB Pack)</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4" id="tournamentsGrid">
          <!-- Injected via JS -->
        </div>
      </div>

      <!-- Tab 3: Game Rules -->
      <div id="view-rules" class="space-y-4 hidden">
        <h2 class="text-xl font-bold">Anti-Cheat & Max Velocity Rules</h2>
        <div class="glass rounded-2xl overflow-hidden border border-slate-800">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-900/60 text-slate-400 text-xs border-b border-slate-800">
              <tr>
                <th class="p-4">Game ID</th>
                <th class="p-4">Max Allowed Score</th>
                <th class="p-4">Max Score / Sec (Velocity)</th>
                <th class="p-4">Min Duration (Sec)</th>
                <th class="p-4">Anti-Cheat Status</th>
              </tr>
            </thead>
            <tbody id="rulesTableBody" class="divide-y divide-slate-800 text-slate-300"></tbody>
          </table>
        </div>
      </div>

      <!-- Tab 4: Audit Logs -->
      <div id="view-audit" class="space-y-6 hidden">
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <i class="fa fa-shield-alt mr-2"></i><strong>Telecom Auditor Compliance Record:</strong> All TeleBirr payment orders, coins transactions, and prize disbursements are permanently recorded with immutable timestamps and provider references.
        </div>
        <div>
          <h3 class="text-lg font-bold mb-3">Recent telebirr Payment Orders</h3>
          <div class="glass rounded-2xl overflow-hidden border border-slate-800" id="ordersContainer"></div>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-3">Wallet Coins Ledger</h3>
          <div class="glass rounded-2xl overflow-hidden border border-slate-800" id="ledgerContainer"></div>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-3">Disbursed Prize Rewards</h3>
          <div class="glass rounded-2xl overflow-hidden border border-slate-800" id="rewardsContainer"></div>
        </div>
      </div>
    </main>
  </div>

  <script>
    let currentToken = localStorage.getItem('goplay_admin_token') || '';
    let currentRole = localStorage.getItem('goplay_admin_role') || 'auditor';
    let currentName = localStorage.getItem('goplay_admin_name') || 'Auditor';

    async function initAdmin() {
      if (!currentToken) {
        document.getElementById('loginView').classList.remove('hidden');
        return;
      }

      // Verify token is still valid with backend
      try {
        const res = await fetch('/api/admin/auth/me', {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        if (!res.ok) {
          logoutAdmin();
          return;
        }
        const data = await res.json();
        currentRole = data.admin.role;
        currentName = data.admin.name;
      } catch(e) {
        logoutAdmin();
        return;
      }

      document.getElementById('loginView').classList.add('hidden');
      updateAuthUI();
      loadMetrics();
      loadUsers();
      loadTournaments();
      loadRules();
      loadAudit();
    }

    function updateAuthUI() {
      const isAuditor = currentRole === 'auditor';
      const badge = isAuditor
        ? '<span class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">● Telecom Auditor (Read-Only)</span>'
        : '<span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● System Administrator</span>';

      document.getElementById('authStatus').innerHTML = \`
        <span class="text-slate-300 mr-2">\${currentName}</span> \${badge}
      \`;

      if (isAuditor) {
        const actionHeader = document.getElementById('actionHeader');
        if (actionHeader) actionHeader.classList.add('hidden');
      }
    }

    async function requestMagicLink(e) {
      e.preventDefault();
      const email = document.getElementById('emailInput').value.trim();
      const btn = document.getElementById('submitBtn');
      const notice = document.getElementById('loginNotice');

      btn.disabled = true;
      btn.innerText = 'Sending Link...';

      try {
        const res = await fetch('/api/admin/auth/request-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
          notice.className = 'text-xs px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300';
          notice.innerHTML = \`<i class="fa fa-check-circle mr-1"></i> \${data.message}\`;
          btn.innerText = 'Link Sent!';
        } else {
          notice.className = 'text-xs px-4 py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300';
          notice.innerHTML = \`<i class="fa fa-exclamation-circle mr-1"></i> \${data.message}\`;
          btn.disabled = false;
          btn.innerText = 'Try Again';
        }
      } catch (err) {
        btn.disabled = false;
        btn.innerText = 'Send Magic Link via Email';
      }
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
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Registered Players</div>
            <div class="text-2xl font-black text-white mt-1">\${m.totalUsers || 0}</div>
            <div class="text-xs text-emerald-400 mt-2"><i class="fa fa-users"></i> telebirr Authenticated</div>
          </div>
          <div class="glass p-5 rounded-2xl border border-slate-800">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Matches Played</div>
            <div class="text-2xl font-black text-amber-400 mt-1">\${(m.totalMatchesPlayed || 0).toLocaleString()}</div>
            <div class="text-xs text-slate-400 mt-2"><i class="fa fa-gamepad"></i> 22 Catalog Games</div>
          </div>
          <div class="glass p-5 rounded-2xl border border-slate-800">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">TeleBirr Volume</div>
            <div class="text-2xl font-black text-emerald-400 mt-1">\${(m.totalPaymentVolumeETB || 0).toLocaleString()} ETB</div>
            <div class="text-xs text-emerald-400 mt-2"><i class="fa fa-check-circle"></i> \${m.successfulOrders || 0} Successful Orders</div>
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
        const isAuditor = currentRole === 'auditor';

        tbody.innerHTML = users.map(u => \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="p-4 font-semibold text-white">\${u.display_name}</td>
            <td class="p-4 text-emerald-400 font-mono">\${u.phone_local || u.phone}</td>
            <td class="p-4 text-amber-400 font-bold">\${parseInt(u.coins).toLocaleString()}</td>
            <td class="p-4">Lvl \${u.level} <span class="text-xs text-slate-500">(\${parseInt(u.xp)} XP)</span></td>
            <td class="p-4 text-blue-400 font-bold">\${u.energy}/5</td>
            <td class="p-4 text-slate-300 font-mono">\${u.matches_played || 0}</td>
            <td class="p-4 text-xs text-slate-500">\${new Date(u.created_at).toLocaleDateString()}</td>
            \${isAuditor ? '' : \`
              <td class="p-4">
                <button onclick="grantCoins('\${u.id}')" class="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition">+Coins</button>
              </td>
            \`}
          </tr>
        \`).join('');
      } catch (e) {}
    }

    async function loadTournaments() {
      try {
        const res = await fetchApi('/api/admin/tournaments');
        const list = await res.json();
        const isAuditor = currentRole === 'auditor';

        document.getElementById('tournamentsGrid').innerHTML = list.map(t => \`
          <div class="glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">\${t.cycle}</span>
              <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">\${t.state}</span>
            </div>
            <h3 class="text-base font-bold text-white leading-snug">\${t.title}</h3>
            <div class="text-xs text-slate-400">Game: <span class="text-slate-200 font-mono font-bold">\${t.game_id}</span></div>
            <div class="text-xs text-amber-400"><i class="fa fa-coins"></i> Entry: \${t.entry_fee_coins} Coins per Play</div>
            <div class="text-sm font-bold text-emerald-400">\${parseInt(t.prize_pool_etb).toLocaleString()} ETB Prize Pool</div>
            <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span class="text-slate-400">\${t.participants_count || 0} contenders</span>
              \${!isAuditor && t.state === 'live' ? \`<button onclick="settleTourney('\${t.id}')" class="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold transition">Settle</button>\` : ''}
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
            <td class="p-4"><span class="text-xs text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Active Enforcement</span></td>
          </tr>
        \`).join('');
      } catch (e) {}
    }

    async function loadAudit() {
      try {
        const res = await fetchApi('/api/admin/logs/audit');
        const data = await res.json();

        document.getElementById('ordersContainer').innerHTML = \`
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr><th class="p-3">Order ID</th><th class="p-3">MSISDN</th><th class="p-3">Amount</th><th class="p-3">Item</th><th class="p-3">Status</th><th class="p-3">Date</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
              \${data.recentOrders.map(o => \`<tr>
                <td class="p-3 font-mono text-slate-400">\${o.id}</td>
                <td class="p-3 font-mono text-emerald-400">\${o.msisdn_masked || 'telebirr'}</td>
                <td class="p-3 font-bold text-white">\${parseFloat(o.amount_etb).toFixed(2)} ETB</td>
                <td class="p-3">\${o.item_title}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded \${o.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">\${o.status}</span></td>
                <td class="p-3 text-slate-500">\${new Date(o.created_at).toLocaleString()}</td>
              </tr>\`).join('')}
            </tbody>
          </table>
        \`;

        document.getElementById('ledgerContainer').innerHTML = \`
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr><th class="p-3">User</th><th class="p-3">Delta</th><th class="p-3">Reason</th><th class="p-3">Date</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
              \${data.recentLedger.slice(0, 10).map(l => \`<tr><td class="p-3 font-mono text-slate-400">\${l.user_id.slice(0, 8)}...</td><td class="p-3 font-bold \${l.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}">\${l.delta > 0 ? '+' : ''}\${l.delta}</td><td class="p-3">\${l.reason}</td><td class="p-3 text-slate-500">\${new Date(l.created_at).toLocaleString()}</td></tr>\`).join('')}
            </tbody>
          </table>
        \`;

        document.getElementById('rewardsContainer').innerHTML = \`
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr><th class="p-3">Winner MSISDN</th><th class="p-3">Tournament</th><th class="p-3">Score</th><th class="p-3">Reward ETB</th><th class="p-3">Status</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
              \${data.recentRewards.map(r => \`<tr>
                <td class="p-3 font-mono text-emerald-400">\${r.msisdn_masked}</td>
                <td class="p-3 font-semibold text-white">\${r.game_title}</td>
                <td class="p-3 font-bold text-amber-400">\${r.score}</td>
                <td class="p-3 font-bold text-purple-400">\${r.reward_etb} ETB</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">\${r.status}</span></td>
              </tr>\`).join('')}
            </tbody>
          </table>
        \`;
      } catch (e) {}
    }

    async function grantCoins(id) {
      if (currentRole === 'auditor') {
        alert('Action Denied: Auditor accounts have read-only inspection access.');
        return;
      }
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
      if (currentRole === 'auditor') {
        alert('Action Denied: Auditor accounts have read-only inspection access.');
        return;
      }
      if (!confirm('Are you sure you want to mark tournament ' + id + ' as settled?')) return;
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
      localStorage.removeItem('goplay_admin_role');
      localStorage.removeItem('goplay_admin_name');
      fetch('/api/admin/auth/logout', { method: 'POST' }).finally(() => {
        location.reload();
      });
    }

    initAdmin();
  </script>
</body>
</html>`);
  });

  // Graceful Shutdown
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
      fastify.log.info(`Received ${signal}, closing admin portal gracefully`);
      await fastify.close();
      await pool.end();
      process.exit(0);
    });
  });

  try {
    const address = await fastify.listen({ port: env.ADMIN_PORT, host: env.HOST });
    fastify.log.info(`🛡️ GoPlay Dedicated Admin Portal running at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
