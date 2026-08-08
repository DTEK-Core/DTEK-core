-- Migration 018: Pilot Risk Workflow comments and activity.

CREATE TABLE risk_comments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    risk_id         uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    author_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
    body            text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_comments_org_created ON risk_comments(organization_id, created_at DESC);
CREATE INDEX idx_risk_comments_risk_created ON risk_comments(risk_id, created_at ASC);

ALTER TABLE risk_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_comments_select" ON risk_comments FOR SELECT
    USING (organization_id = current_org_id());
CREATE POLICY "risk_comments_insert_deny" ON risk_comments FOR INSERT WITH CHECK (false);
CREATE POLICY "risk_comments_update_deny" ON risk_comments FOR UPDATE USING (false);
CREATE POLICY "risk_comments_delete_deny" ON risk_comments FOR DELETE USING (false);

CREATE TABLE risk_activity (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    risk_id         uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    actor_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
    event_type      text NOT NULL CHECK (event_type IN (
                        'owner_assigned', 'due_date_changed',
                        'status_changed', 'comment_added'
                    )),
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_activity_org_created ON risk_activity(organization_id, created_at DESC);
CREATE INDEX idx_risk_activity_risk_created ON risk_activity(risk_id, created_at ASC);

ALTER TABLE risk_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_activity_select" ON risk_activity FOR SELECT
    USING (organization_id = current_org_id());
CREATE POLICY "risk_activity_insert_deny" ON risk_activity FOR INSERT WITH CHECK (false);
CREATE POLICY "risk_activity_update_deny" ON risk_activity FOR UPDATE USING (false);
CREATE POLICY "risk_activity_delete_deny" ON risk_activity FOR DELETE USING (false);
