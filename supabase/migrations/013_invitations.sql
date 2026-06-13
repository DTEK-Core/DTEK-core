-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 013: invitations
-- ─────────────────────────────────────────────────────────────────────────────
-- Роль owner через приглашение недоступна — назначается только при создании орг.
-- Токен: случайный hex 32 байта, действует 7 дней.

CREATE TABLE invitations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           text NOT NULL,
    role            text NOT NULL
                    CHECK (role IN ('analyst', 'admin', 'viewer')),
    token           text NOT NULL UNIQUE DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
    invited_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
    status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at      timestamptz NOT NULL DEFAULT now() + interval '7 days',
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX idx_invitations_email           ON invitations(email);
CREATE INDEX idx_invitations_token           ON invitations(token);
CREATE INDEX idx_invitations_status          ON invitations(status) WHERE status = 'pending';

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_select" ON invitations FOR SELECT
    USING (organization_id = current_org_id());

-- Только owner может приглашать участников
CREATE POLICY "invitations_insert" ON invitations FOR INSERT
    WITH CHECK (
        organization_id = current_org_id() AND
        current_user_role() = 'owner'
    );
