-- ============================================================================
-- 003_demo_contenders.sql — Seeded Realistic Contender Baseline
-- ============================================================================

-- 10 Top Contenders (Masked MSISDNs matching Leaderboard)
INSERT INTO profiles (id, phone, display_name, avatar_id, coins, xp, energy, telebirr_linked, telebirr_balance) VALUES
    ('00000000-0000-0000-0000-000000000010', '+251911234567', 'Abebe B.', 'avatar_runner', 3500, 28000, 5, TRUE, 540.00),
    ('00000000-0000-0000-0000-000000000011', '+251912876543', 'Tirunesh D.', 'avatar_star', 2900, 24500, 4, TRUE, 320.00),
    ('00000000-0000-0000-0000-000000000012', '+251913456789', 'Kenenisa B.', 'avatar_flame', 2400, 21000, 5, TRUE, 150.00),
    ('00000000-0000-0000-0000-000000000013', '+251914333445', 'Derartu T.', 'avatar_shield', 1800, 18500, 3, TRUE, 85.00),
    ('00000000-0000-0000-0000-000000000014', '+251915999112', 'Haile G.', 'avatar_trophy', 1600, 15200, 5, TRUE, 420.00),
    ('00000000-0000-0000-0000-000000000015', '+251916888776', 'Meseret D.', 'avatar_runner', 1400, 13400, 4, FALSE, 0.00),
    ('00000000-0000-0000-0000-000000000016', '+251917222334', 'Sileshi S.', 'avatar_star', 1100, 11000, 5, TRUE, 90.00),
    ('00000000-0000-0000-0000-000000000017', '+251918555443', 'Gezahgne A.', 'avatar_flame', 950, 9500, 2, FALSE, 0.00),
    ('00000000-0000-0000-0000-000000000018', '+251919777889', 'Genzebe D.', 'avatar_shield', 800, 7200, 5, TRUE, 60.00),
    ('00000000-0000-0000-0000-000000000019', '+251920111223', 'Selemon B.', 'avatar_runner', 650, 5100, 4, FALSE, 0.00)
ON CONFLICT (phone) DO NOTHING;

-- Seed Scores for Crazy Color Tournament
INSERT INTO scores (user_id, tournament_id, best, plays, rp) VALUES
    ('00000000-0000-0000-0000-000000000010', 'tourney_weekly_crazy_color', 382, 42, 382.4),
    ('00000000-0000-0000-0000-000000000011', 'tourney_weekly_crazy_color', 364, 38, 364.1),
    ('00000000-0000-0000-0000-000000000012', 'tourney_weekly_crazy_color', 348, 35, 348.6),
    ('00000000-0000-0000-0000-000000000013', 'tourney_weekly_crazy_color', 321, 29, 321.0),
    ('00000000-0000-0000-0000-000000000014', 'tourney_weekly_crazy_color', 298, 25, 298.3),
    ('00000000-0000-0000-0000-000000000015', 'tourney_weekly_crazy_color', 265, 22, 265.7),
    ('00000000-0000-0000-0000-000000000016', 'tourney_weekly_crazy_color', 228, 19, 228.4),
    ('00000000-0000-0000-0000-000000000017', 'tourney_weekly_crazy_color', 189, 14, 189.1),
    ('00000000-0000-0000-0000-000000000018', 'tourney_weekly_crazy_color', 142, 11, 142.5),
    ('00000000-0000-0000-0000-000000000019', 'tourney_weekly_crazy_color', 96, 7, 96.0)
ON CONFLICT (user_id, tournament_id) DO UPDATE SET best = EXCLUDED.best, rp = EXCLUDED.rp;

-- Seed Daily Scores for Weekly & Monthly Average Computation
INSERT INTO daily_scores (user_id, game_id, score_date, best_score) VALUES
    ('00000000-0000-0000-0000-000000000010', 'crazy-colors', CURRENT_DATE, 395),
    ('00000000-0000-0000-0000-000000000010', 'fruit-slice', CURRENT_DATE - 1, 388),
    ('00000000-0000-0000-0000-000000000010', 'helix-jump', CURRENT_DATE - 2, 380),
    ('00000000-0000-0000-0000-000000000010', 'pop-piano', CURRENT_DATE - 3, 375),
    ('00000000-0000-0000-0000-000000000011', 'crazy-colors', CURRENT_DATE, 370),
    ('00000000-0000-0000-0000-000000000011', 'fruit-slice', CURRENT_DATE - 1, 365),
    ('00000000-0000-0000-0000-000000000012', 'helix-jump', CURRENT_DATE, 355),
    ('00000000-0000-0000-0000-000000000012', 'pop-piano', CURRENT_DATE - 1, 345)
ON CONFLICT (user_id, game_id, score_date) DO UPDATE SET best_score = EXCLUDED.best_score;

-- Seed Sample Historical Reward Transactions
INSERT INTO reward_transactions (
    id, idempotency_key, user_id, msisdn_masked, game_id, game_title, tournament_id,
    score, rank, reward, reward_etb, reward_coins, status, verification_source, audit_hash
) VALUES
(
    'tx_seed_001',
    'idemp_seed_crazy_color_01',
    '00000000-0000-0000-0000-000000000010',
    '+251 91 **** 567',
    'crazy-colors',
    'Crazy Color',
    'tourney_weekly_crazy_color',
    382,
    1,
    '12,500 ETB Cash Prize',
    12500,
    1000,
    'DISBURSED',
    'SERVER_AUTHORITATIVE',
    '0x3E8F9A1C'
),
(
    'tx_seed_002',
    'idemp_seed_fruit_ninja_02',
    '00000000-0000-0000-0000-000000000011',
    '+251 92 **** 432',
    'fruit-slice',
    'Fruit Ninja',
    'tourney_weekly_fruit_ninja',
    364,
    2,
    '6,000 ETB Cash Prize',
    6000,
    2000,
    'DISBURSED',
    'SERVER_AUTHORITATIVE',
    '0x7B2A44D1'
)
ON CONFLICT (idempotency_key) DO NOTHING;
