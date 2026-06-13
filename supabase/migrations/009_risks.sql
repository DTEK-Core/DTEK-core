-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009: risks
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE risks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           text NOT NULL,
    description     text,
    category        text NOT NULL DEFAULT 'other'
                    CHECK (category IN (
                        'vulnerability', 'configuration', 'access',
                        'network', 'compliance', 'incident', 'monitoring',
                        'organizational', 'physical', 'human', 'other'
                    )),
    severity        text NOT NULL
                    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    probability     text CHECK (probability IN ('low', 'medium', 'high')),
    cvss_score      numeric(3,1) CHECK (cvss_score BETWEEN 0 AND 10),
    status          text NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'mitigated', 'accepted', 'closed')),
    impact          text,
    author_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
    owner_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
    sla_days        integer CHECK (sla_days > 0),
    due_date        timestamptz,
    resolved_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_risks_organization_id ON risks(organization_id);
CREATE INDEX idx_risks_severity         ON risks(organization_id, severity);
CREATE INDEX idx_risks_status           ON risks(organization_id, status);
CREATE INDEX idx_risks_category         ON risks(organization_id, category);
CREATE INDEX idx_risks_author_id        ON risks(author_id);
CREATE INDEX idx_risks_owner_id         ON risks(owner_id);
CREATE INDEX idx_risks_due_date         ON risks(due_date) WHERE due_date IS NOT NULL;

CREATE TRIGGER tr_risks_updated_at
    BEFORE UPDATE ON risks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risks_select" ON risks FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "risks_insert" ON risks FOR INSERT
    WITH CHECK (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );

CREATE POLICY "risks_update" ON risks FOR UPDATE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );

CREATE POLICY "risks_delete" ON risks FOR DELETE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );
