-- ============================================================================
-- 005_subscriptions.sql — Subscriptions & Partner MT Webhooks
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
    msisdn          VARCHAR(15) NOT NULL,
    service_id      INT NOT NULL,
    plan            VARCHAR(10) NOT NULL CHECK (plan IN ('daily', 'weekly', 'monthly')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    auto_renew      BOOLEAN NOT NULL DEFAULT TRUE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    cancelled_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (msisdn, service_id)
);

CREATE INDEX IF NOT EXISTS idx_subs_msisdn ON subscriptions(msisdn);
CREATE INDEX IF NOT EXISTS idx_subs_active ON subscriptions(is_active, expires_at);

CREATE TABLE IF NOT EXISTS portal_pending_entitlements (
    msisdn          VARCHAR(15) NOT NULL,
    service_id      INT NOT NULL,
    event           VARCHAR(20) NOT NULL,
    request_id      UUID NOT NULL,
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed         BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (msisdn, service_id)
);

CREATE TABLE IF NOT EXISTS portal_events (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event           VARCHAR(20) NOT NULL,
    request_id      UUID NOT NULL UNIQUE,
    service_id      INT NOT NULL,
    msisdn          VARCHAR(15) NOT NULL,
    event_time      TIMESTAMPTZ NOT NULL,
    raw_payload     JSONB,
    processed       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_events_msisdn ON portal_events(msisdn);
