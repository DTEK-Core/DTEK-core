-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005: objects
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE objects (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            text NOT NULL,
    type            text NOT NULL
                    CHECK (type IN (
                        'server', 'workstation', 'laptop', 'network',
                        'app', 'database', 'service',
                        'identity', 'ot', 'policy', 'other'
                    )),
    description     text,
    owner_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
    criticality     text NOT NULL DEFAULT 'medium'
                    CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
    status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'warning', 'risk', 'critical', 'archived')),
    ip_address      text,
    os_platform     text,
    segment         text,
    exposure        text CHECK (exposure IN ('internal', 'external', 'isolated')),
    trust_score     integer NOT NULL DEFAULT 70
                    CHECK (trust_score BETWEEN 0 AND 100),
    trust_level     text NOT NULL DEFAULT 'medium'
                    CHECK (trust_level IN ('critical', 'low', 'medium', 'good', 'high')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_objects_organization_id ON objects(organization_id);
CREATE INDEX idx_objects_type            ON objects(organization_id, type);
CREATE INDEX idx_objects_criticality     ON objects(organization_id, criticality);
CREATE INDEX idx_objects_trust_score     ON objects(organization_id, trust_score);
CREATE INDEX idx_objects_status          ON objects(organization_id, status);
CREATE INDEX idx_objects_owner_id        ON objects(owner_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "objects_select" ON objects FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "objects_insert" ON objects FOR INSERT
    WITH CHECK (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst', 'admin')
    );

CREATE POLICY "objects_update" ON objects FOR UPDATE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst', 'admin')
    );

CREATE POLICY "objects_delete" ON objects FOR DELETE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );
