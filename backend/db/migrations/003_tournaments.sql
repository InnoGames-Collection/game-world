-- ============================================================================
-- 003_tournaments.sql — Tournaments, Scores, and Realtime Leaderboards
-- ============================================================================
CREATE TABLE IF NOT EXISTS tournaments (
    id              VARCHAR(100) PRIMARY KEY,
    game_id         VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    title_am        VARCHAR(200),
    cycle           VARCHAR(10) NOT NULL CHECK (cycle IN ('daily', 'weekly', 'monthly')),
    type            VARCHAR(10) NOT NULL DEFAULT 'free' CHECK (type IN ('free', 'paid')),
    entry_fee_coins BIGINT NOT NULL DEFAULT 0,
    entry_fee_energy INT NOT NULL DEFAULT 1,
    prize_model     VARCHAR(15) NOT NULL DEFAULT 'sponsored' CHECK (prize_model IN ('sponsored', 'pool')),
    sponsored_prize BIGINT NOT NULL DEFAULT 0,
    prize_pool_etb  NUMERIC(12,2) NOT NULL DEFAULT 0,
    prize_pool_coins BIGINT NOT NULL DEFAULT 0,
    prize_tiers     JSONB NOT NULL DEFAULT '[{"rank":"1st Place","reward":"7,500 ETB Cash Prize","telebirrETB":7500}]',
    banner_image    TEXT,
    sponsor         VARCHAR(100) DEFAULT 'EthioTelecom',
    entry_requirement VARCHAR(200) DEFAULT 'Open to All Players',
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    state           VARCHAR(15) NOT NULL DEFAULT 'live'
                    CHECK (state IN ('upcoming','live','ended','settling','settled')),
    participants_count INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_state ON tournaments(state, starts_at);
CREATE INDEX IF NOT EXISTS idx_tournaments_game ON tournaments(game_id);

CREATE TABLE IF NOT EXISTS scores (
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tournament_id   VARCHAR(100) NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    best            BIGINT NOT NULL DEFAULT 0,
    plays           INT NOT NULL DEFAULT 0,
    rp              NUMERIC(12,4) NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, tournament_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_board ON scores(tournament_id, best DESC);
CREATE INDEX IF NOT EXISTS idx_scores_rp ON scores(tournament_id, rp DESC);

CREATE TABLE IF NOT EXISTS tournament_entries (
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tournament_id   VARCHAR(100) NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    fee_paid        BIGINT NOT NULL DEFAULT 0,
    attempts_left   INT NOT NULL DEFAULT 10,
    prize_won       BIGINT NOT NULL DEFAULT 0,
    entered_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, tournament_id)
);

CREATE OR REPLACE VIEW leaderboard AS
SELECT
    s.tournament_id,
    s.user_id,
    COALESCE(p.display_name, 'Player') AS display_name,
    '0' || SUBSTRING(p.phone FROM 5 FOR 3) || '*****' || RIGHT(p.phone, 3) AS phone_masked,
    p.avatar_id,
    s.best AS score,
    s.rp,
    RANK() OVER (
        PARTITION BY s.tournament_id
        ORDER BY s.rp DESC, s.best DESC, s.updated_at ASC
    ) AS rank
FROM scores s
LEFT JOIN profiles p ON p.id = s.user_id;
