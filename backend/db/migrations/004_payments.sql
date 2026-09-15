-- ============================================================================
-- 004_payments.sql — Telebirr Orders & Telecom Carrier Billing Ledger
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_orders (
    id              VARCHAR(100) PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    method          VARCHAR(20) NOT NULL CHECK (method IN ('TELEBIRR', 'ETHIO_AIRTIME', 'USSD_CARRIER')),
    amount_etb      NUMERIC(12,2) NOT NULL,
    item_type       VARCHAR(30) NOT NULL CHECK (item_type IN (
        'ENERGY_PACK', 'VIP_SUBSCRIPTION', 'TOURNAMENT_BUYIN', 'COIN_PACK'
    )),
    item_title      VARCHAR(200),
    coins           BIGINT NOT NULL DEFAULT 0,
    status          VARCHAR(15) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('IDLE', 'PROCESSING', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
    provider_ref    VARCHAR(255),
    error_code      VARCHAR(50),
    error_message   TEXT,
    msisdn_masked   VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON payment_orders(status);
