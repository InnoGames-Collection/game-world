-- ============================================================================
-- 009_admin_users.sql — Dedicated Admin Portal Users & Magic Link Sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'auditor' CHECK (role IN ('admin', 'auditor')),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

CREATE TABLE IF NOT EXISTS admin_magic_links (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL,
    token_hash  VARCHAR(128) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_magic_links_token ON admin_magic_links(token_hash);

-- Seed initial admin & auditor users
INSERT INTO admin_users (email, name, role, is_active)
VALUES
    ('innospher@gmail.com', 'InnoSphere System Admin', 'admin', TRUE),
    ('admin@goplay.com', 'GoPlay Ops Admin', 'admin', TRUE),
    ('auditor@goplay.com', 'EthioTelecom Official Auditor', 'auditor', TRUE)
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role, is_active = TRUE;
