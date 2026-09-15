-- ============================================================================
-- 002_economy.sql — Ledger & Atomic Economic Stored Functions
-- ============================================================================
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    delta           BIGINT NOT NULL,
    reason          VARCHAR(100) NOT NULL,
    ref             VARCHAR(255) NOT NULL DEFAULT '',
    balance_after   BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_ledger(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS energy_transactions (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN (
        'DAILY_REGEN', 'PURCHASE_TELEBIRR', 'PURCHASE_AIRTIME',
        'GAME_CONSUMPTION', 'REWARDED_AD_BONUS', 'TOURNAMENT_ENTRY', 'DAILY_REWARD'
    )),
    amount          INT NOT NULL,
    status          VARCHAR(15) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED')),
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_energy_user ON energy_transactions(user_id, created_at DESC);

-- Atomic Coin Mutation with Ledger Entry
CREATE OR REPLACE FUNCTION apply_coins(
    p_user UUID, p_delta BIGINT, p_reason TEXT, p_ref TEXT DEFAULT ''
) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE new_bal BIGINT;
BEGIN
    UPDATE profiles
       SET coins = coins + p_delta,
           updated_at = NOW()
     WHERE id = p_user AND (coins + p_delta) >= 0
     RETURNING coins INTO new_bal;

    IF new_bal IS NULL THEN
        RAISE EXCEPTION 'insufficient_balance'
            USING ERRCODE = 'check_violation',
                  HINT = format('Cannot apply delta %s to user %s', p_delta, p_user);
    END IF;

    INSERT INTO wallet_ledger (user_id, delta, reason, ref, balance_after)
        VALUES (p_user, p_delta, p_reason, p_ref, new_bal);

    RETURN new_bal;
END;
$$;

-- Atomic XP Increment
CREATE OR REPLACE FUNCTION apply_xp(
    p_user UUID, p_delta BIGINT
) RETURNS TABLE(new_xp BIGINT, new_level INT) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profiles
       SET xp = xp + p_delta,
           updated_at = NOW()
     WHERE id = p_user
     RETURNING xp, (1 + (xp / 1000)::INT) INTO new_xp, new_level;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user_not_found' USING ERRCODE = 'no_data_found';
    END IF;

    RETURN NEXT;
END;
$$;

-- Atomic Energy Mutation
CREATE OR REPLACE FUNCTION apply_energy(
    p_user UUID, p_delta INT, p_type VARCHAR, p_details TEXT DEFAULT NULL
) RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    new_energy INT;
    v_max INT;
BEGIN
    SELECT max_energy INTO v_max FROM profiles WHERE id = p_user;

    UPDATE profiles
       SET energy = LEAST(GREATEST(energy + p_delta, 0), v_max),
           last_energy_refill_at = CASE WHEN p_delta > 0 THEN NOW() ELSE last_energy_refill_at END,
           updated_at = NOW()
     WHERE id = p_user
     RETURNING energy INTO new_energy;

    IF new_energy IS NULL THEN
        RAISE EXCEPTION 'user_not_found' USING ERRCODE = 'no_data_found';
    END IF;

    INSERT INTO energy_transactions (user_id, type, amount, details)
        VALUES (p_user, p_type, p_delta, p_details);

    RETURN new_energy;
END;
$$;
