-- ============================================================================
-- 006_entitlements.sql — Session Passes & Game Access Control
-- ============================================================================
CREATE TABLE IF NOT EXISTS game_entitlements (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id         VARCHAR(50) NOT NULL,
    access_type     VARCHAR(15) NOT NULL CHECK (access_type IN ('FREE', 'COIN', 'SUBSCRIPTION')),
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    transaction_ref VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user ON game_entitlements(user_id, game_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_active ON game_entitlements(user_id, game_id, expires_at);
