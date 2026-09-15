-- ============================================================================
-- 007_anti_cheat.sql — Anti-Replay Nonces & Game Velocity Rules
-- ============================================================================
CREATE TABLE IF NOT EXISTS used_nonces (
    jti         VARCHAR(64) PRIMARY KEY,
    user_id     UUID,
    game_id     VARCHAR(50),
    used_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nonces_age ON used_nonces(used_at);

CREATE TABLE IF NOT EXISTS game_scoring_rules (
    game_id             VARCHAR(50) PRIMARY KEY,
    max_score           INT NOT NULL DEFAULT 400,
    max_score_per_second NUMERIC(8,2) NOT NULL DEFAULT 1000,
    min_duration_sec    INT NOT NULL DEFAULT 5,
    max_duration_sec    INT NOT NULL DEFAULT 3600,
    coins_per_point     NUMERIC(6,4) NOT NULL DEFAULT 0.05,
    xp_per_point        NUMERIC(6,4) NOT NULL DEFAULT 0.10,
    min_coins_award     INT NOT NULL DEFAULT 5,
    min_xp_award        INT NOT NULL DEFAULT 10
);
