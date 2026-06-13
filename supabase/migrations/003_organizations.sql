-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: organizations
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE organizations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,
    short_name      text,
    description     text,
    industry        text,
    size            text CHECK (size IN ('micro', 'small', 'medium', 'large', 'enterprise')),
    employee_count  integer CHECK (employee_count > 0),
    inn             text,
    region          text,
    plan            text NOT NULL DEFAULT 'free'
                    CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    trust_score     integer NOT NULL DEFAULT 70
                    CHECK (trust_score BETWEEN 0 AND 100),
    trust_level     text NOT NULL DEFAULT 'medium'
                    CHECK (trust_level IN ('critical', 'low', 'medium', 'good', 'high')),
    owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_select" ON organizations FOR SELECT
    USING (id = current_org_id());

-- Любой аутентифицированный пользователь может создать организацию (онбординг)
CREATE POLICY "orgs_insert" ON organizations FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "orgs_update" ON organizations FOR UPDATE
    USING (id = current_org_id() AND current_user_role() = 'owner');

CREATE POLICY "orgs_delete" ON organizations FOR DELETE
    USING (id = current_org_id() AND current_user_role() = 'owner');
