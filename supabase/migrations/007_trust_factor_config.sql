-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: trust_factor_config
-- ─────────────────────────────────────────────────────────────────────────────
-- Один ряд на организацию. Создаётся при онбординге (через service_role).
-- Constraint weights_sum_100 гарантирует: сумма 6 весов = 100 всегда.

CREATE TABLE trust_factor_config (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

    -- Веса факторов Trust Score (сумма = 100, см. constraint ниже)
    vuln_weight         integer NOT NULL DEFAULT 22 CHECK (vuln_weight BETWEEN 0 AND 100),
    config_weight       integer NOT NULL DEFAULT 18 CHECK (config_weight BETWEEN 0 AND 100),
    access_weight       integer NOT NULL DEFAULT 18 CHECK (access_weight BETWEEN 0 AND 100),
    network_weight      integer NOT NULL DEFAULT 14 CHECK (network_weight BETWEEN 0 AND 100),
    compliance_weight   integer NOT NULL DEFAULT 16 CHECK (compliance_weight BETWEEN 0 AND 100),
    incident_weight     integer NOT NULL DEFAULT 12 CHECK (incident_weight BETWEEN 0 AND 100),

    updated_at          timestamptz NOT NULL DEFAULT now(),
    updated_by          uuid REFERENCES profiles(id) ON DELETE SET NULL,

    CONSTRAINT weights_sum_100 CHECK (
        vuln_weight + config_weight + access_weight +
        network_weight + compliance_weight + incident_weight = 100
    )
);

CREATE INDEX idx_trust_factor_config_org ON trust_factor_config(organization_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE trust_factor_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tfc_select" ON trust_factor_config FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "tfc_update" ON trust_factor_config FOR UPDATE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );
