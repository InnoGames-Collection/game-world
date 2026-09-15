-- ============================================================================
-- 001_initial_schema.sql — Core Player Profiles & Preferences
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(15) NOT NULL UNIQUE,          -- E.164: +251911234567
    phone_local     VARCHAR(10) GENERATED ALWAYS AS (
                      '0' || SUBSTRING(phone FROM 5)
                    ) STORED,                              -- Local: 0911234567
    display_name    VARCHAR(50) NOT NULL DEFAULT 'Player',
    avatar_id       VARCHAR(30) NOT NULL DEFAULT 'avatar_runner',
    coins           BIGINT NOT NULL DEFAULT 50 CHECK (coins >= 0),
    xp              BIGINT NOT NULL DEFAULT 0 CHECK (xp >= 0),
    level           INT GENERATED ALWAYS AS (1 + (xp / 1000)::INT) STORED,
    energy          INT NOT NULL DEFAULT 5 CHECK (energy >= 0),
    max_energy      INT NOT NULL DEFAULT 5,
    last_energy_refill_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    telebirr_linked BOOLEAN NOT NULL DEFAULT FALSE,
    telebirr_id     VARCHAR(64),
    telebirr_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    matches_played  INT NOT NULL DEFAULT 0,
    trophies_count  INT NOT NULL DEFAULT 0,
    role            VARCHAR(10) NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
    has_received_initial_coins BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_local ON profiles(phone_local);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id         UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    language        VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'am', 'om', 'ti')),
    audio           BOOLEAN NOT NULL DEFAULT TRUE,
    haptics         BOOLEAN NOT NULL DEFAULT TRUE,
    notifications   BOOLEAN NOT NULL DEFAULT TRUE,
    low_data        BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_streaks (
    user_id         UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak  INT NOT NULL DEFAULT 1,
    last_claimed    DATE DEFAULT CURRENT_DATE,
    longest_streak  INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS high_scores (
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id         VARCHAR(50) NOT NULL,
    best_score      INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_high_scores_game ON high_scores(game_id, best_score DESC);

CREATE TABLE IF NOT EXISTS daily_scores (
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id         VARCHAR(50) NOT NULL,
    score_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    best_score      INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, game_id, score_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_scores(score_date, game_id, best_score DESC);

CREATE TABLE IF NOT EXISTS recent_games (
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id         VARCHAR(50) NOT NULL,
    played_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, game_id)
);
