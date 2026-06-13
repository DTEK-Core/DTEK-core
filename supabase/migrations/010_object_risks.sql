-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 010: object_risks (junction: objects ↔ risks)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE object_risks (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id   uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    risk_id     uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    linked_at   timestamptz NOT NULL DEFAULT now(),
    linked_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE (object_id, risk_id)
);

CREATE INDEX idx_object_risks_object_id ON object_risks(object_id);
CREATE INDEX idx_object_risks_risk_id   ON object_risks(risk_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- object_risks не имеет organization_id напрямую — проверяем через objects
ALTER TABLE object_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "object_risks_select" ON object_risks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM objects
            WHERE objects.id = object_risks.object_id
              AND objects.organization_id = current_org_id()
        )
    );

CREATE POLICY "object_risks_insert" ON object_risks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM objects
            WHERE objects.id = object_risks.object_id
              AND objects.organization_id = current_org_id()
        ) AND
        current_user_role() IN ('owner', 'analyst', 'admin')
    );

CREATE POLICY "object_risks_delete" ON object_risks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM objects
            WHERE objects.id = object_risks.object_id
              AND objects.organization_id = current_org_id()
        ) AND
        current_user_role() IN ('owner', 'analyst')
    );
