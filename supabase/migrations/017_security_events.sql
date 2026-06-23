-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 017: security_events — журнал аудита безопасности
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE security_events (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,

    actor_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email     text,

    event_type      text NOT NULL,
    -- auth.login, auth.logout, auth.signup, auth.password_reset
    -- role.changed, user.blocked, user.removed
    -- invitation.sent, invitation.accepted, invitation.cancelled
    -- org.updated
    -- config.weights_changed
    -- object.created, object.deleted
    -- risk.created, risk.deleted

    target_type     text,
    target_id       text,

    metadata        jsonb,
    ip_address      text,

    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_events_org   ON security_events(organization_id, created_at DESC);
CREATE INDEX idx_security_events_actor ON security_events(actor_id, created_at DESC);
CREATE INDEX idx_security_events_type  ON security_events(event_type, created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Read: only own org's events
CREATE POLICY "sec_events_select" ON security_events FOR SELECT
    USING (organization_id = current_org_id());

-- Write: only via admin/service client (all user-client mutations denied)
CREATE POLICY "sec_events_insert_deny" ON security_events FOR INSERT
    WITH CHECK (false);

CREATE POLICY "sec_events_update_deny" ON security_events FOR UPDATE
    USING (false);

CREATE POLICY "sec_events_delete_deny" ON security_events FOR DELETE
    USING (false);
