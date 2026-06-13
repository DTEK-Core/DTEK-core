-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006: trust_passports
-- ─────────────────────────────────────────────────────────────────────────────
-- Паспорт создаётся автоматически триггером tr_create_passport (008_triggers.sql).
-- Пользователи имеют SELECT only; INSERT/UPDATE/DELETE — только через систему.

CREATE TABLE trust_passports (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id           uuid NOT NULL UNIQUE REFERENCES objects(id) ON DELETE CASCADE,
    organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Итоговая оценка
    trust_score         integer NOT NULL DEFAULT 70
                        CHECK (trust_score BETWEEN 0 AND 100),
    trust_level         text NOT NULL DEFAULT 'medium'
                        CHECK (trust_level IN ('critical', 'low', 'medium', 'good', 'high')),

    -- Факторные оценки (0–100 каждая)
    vuln_score          integer NOT NULL DEFAULT 70
                        CHECK (vuln_score BETWEEN 0 AND 100),
    config_score        integer NOT NULL DEFAULT 70
                        CHECK (config_score BETWEEN 0 AND 100),
    access_score        integer NOT NULL DEFAULT 70
                        CHECK (access_score BETWEEN 0 AND 100),
    network_score       integer NOT NULL DEFAULT 70
                        CHECK (network_score BETWEEN 0 AND 100),
    compliance_score    integer NOT NULL DEFAULT 70
                        CHECK (compliance_score BETWEEN 0 AND 100),
    incident_score      integer NOT NULL DEFAULT 70
                        CHECK (incident_score BETWEEN 0 AND 100),

    -- Агрегированные счётчики рисков
    risk_count          integer NOT NULL DEFAULT 0 CHECK (risk_count >= 0),
    open_risk_count     integer NOT NULL DEFAULT 0 CHECK (open_risk_count >= 0),
    critical_risk_count integer NOT NULL DEFAULT 0 CHECK (critical_risk_count >= 0),

    -- Связи в графе
    connection_count    integer NOT NULL DEFAULT 0 CHECK (connection_count >= 0),

    -- Полнота паспорта (0–100%)
    completeness_pct    integer NOT NULL DEFAULT 0
                        CHECK (completeness_pct BETWEEN 0 AND 100),

    calculated_at       timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_trust_passports_object_id       ON trust_passports(object_id);
CREATE INDEX idx_trust_passports_organization_id ON trust_passports(organization_id);
CREATE INDEX idx_trust_passports_trust_score     ON trust_passports(organization_id, trust_score);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE trust_passports ENABLE ROW LEVEL SECURITY;

-- Все участники организации могут читать паспорта
CREATE POLICY "passports_select" ON trust_passports FOR SELECT
    USING (organization_id = current_org_id());
-- INSERT / UPDATE / DELETE — только Edge Functions через service_role (обходит RLS)
