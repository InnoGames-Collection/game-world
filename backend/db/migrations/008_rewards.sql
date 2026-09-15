-- ============================================================================
-- 008_rewards.sql — Reward Claims & Weekly/Monthly Deterministic Aggregations
-- ============================================================================
CREATE TABLE IF NOT EXISTS reward_transactions (
    id              VARCHAR(100) PRIMARY KEY,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    user_id         UUID NOT NULL REFERENCES profiles(id),
    msisdn_masked   VARCHAR(20),
    game_id         VARCHAR(50),
    game_title      VARCHAR(100),
    tournament_id   VARCHAR(100),
    score           INT,
    rank            INT,
    reward          VARCHAR(200),
    reward_etb      NUMERIC(12,2) NOT NULL DEFAULT 0,
    reward_coins    BIGINT NOT NULL DEFAULT 0,
    status          VARCHAR(15) NOT NULL DEFAULT 'CONFIRMED'
                    CHECK (status IN ('PENDING', 'CONFIRMED', 'DISBURSED', 'FAILED', 'EXPIRED')),
    verification_source VARCHAR(30) NOT NULL DEFAULT 'SERVER_AUTHORITATIVE',
    audit_hash      VARCHAR(66),
    telebirr_ref    VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disbursed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON reward_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON reward_transactions(status);

-- Function: Compute Weekly Tournament Aggregate (7-day daily best average, capped 0-400)
CREATE OR REPLACE FUNCTION compute_weekly_leaderboard(
    p_game_ids TEXT[]
) RETURNS TABLE (
    user_id UUID,
    display_name VARCHAR,
    phone_masked TEXT,
    avatar_id VARCHAR,
    avg_score NUMERIC,
    days_played INT
) LANGUAGE sql STABLE AS $$
    SELECT
        ds.user_id,
        p.display_name,
        '0' || SUBSTRING(p.phone FROM 5 FOR 3) || '*****' || RIGHT(p.phone, 3),
        p.avatar_id,
        ROUND(SUM(ds.best_score)::NUMERIC / 7, 1),
        COUNT(DISTINCT ds.score_date)::INT
    FROM daily_scores ds
    JOIN profiles p ON p.id = ds.user_id
    WHERE ds.game_id = ANY(p_game_ids)
      AND ds.score_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY ds.user_id, p.display_name, p.phone, p.avatar_id
    ORDER BY SUM(ds.best_score) DESC, COUNT(DISTINCT ds.score_date) DESC
    LIMIT 100;
$$;

-- Function: Compute Monthly Tournament Aggregate (30-day daily best average, capped 0-400)
CREATE OR REPLACE FUNCTION compute_monthly_leaderboard(
    p_game_ids TEXT[]
) RETURNS TABLE (
    user_id UUID,
    display_name VARCHAR,
    phone_masked TEXT,
    avatar_id VARCHAR,
    avg_score NUMERIC,
    days_played INT
) LANGUAGE sql STABLE AS $$
    SELECT
        ds.user_id,
        p.display_name,
        '0' || SUBSTRING(p.phone FROM 5 FOR 3) || '*****' || RIGHT(p.phone, 3),
        p.avatar_id,
        ROUND(SUM(ds.best_score)::NUMERIC / 30, 1),
        COUNT(DISTINCT ds.score_date)::INT
    FROM daily_scores ds
    JOIN profiles p ON p.id = ds.user_id
    WHERE ds.game_id = ANY(p_game_ids)
      AND ds.score_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY ds.user_id, p.display_name, p.phone, p.avatar_id
    ORDER BY SUM(ds.best_score) DESC, COUNT(DISTINCT ds.score_date) DESC
    LIMIT 100;
$$;
