-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 012: trust_score_history
-- ─────────────────────────────────────────────────────────────────────────────
-- Только чтение для пользователей; INSERT только через систему (Edge Functions).
-- factors_snapshot хранит снапшот всех 6 факторов и их весов в момент изменения.

CREATE TABLE trust_score_history (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id       uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    old_score       integer CHECK (old_score BETWEEN 0 AND 100),
    new_score       integer NOT NULL CHECK (new_score BETWEEN 0 AND 100),
    factors_snapshot jsonb,
    reason          text,
    changed_by      text NOT NULL DEFAULT 'system',
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tsh_object_id       ON trust_score_history(object_id);
CREATE INDEX idx_tsh_organization_id ON trust_score_history(organization_id);
CREATE INDEX idx_tsh_created_at      ON trust_score_history(object_id, created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE trust_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tsh_select" ON trust_score_history FOR SELECT
    USING (organization_id = current_org_id());
-- INSERT только через Edge Functions с service_role (обходит RLS)
