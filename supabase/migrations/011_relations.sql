-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 011: relations (Trust Graph edges)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE relations (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_object_id    uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    target_object_id    uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    relation_type       text NOT NULL
                        CHECK (relation_type IN (
                            'uses', 'depends_on', 'connected_to',
                            'managed_by', 'owns', 'interacts_with'
                        )),
    description         text,
    created_by          uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT no_self_relation CHECK (source_object_id != target_object_id),
    UNIQUE (source_object_id, target_object_id, relation_type)
);

CREATE INDEX idx_relations_organization_id ON relations(organization_id);
CREATE INDEX idx_relations_source          ON relations(source_object_id);
CREATE INDEX idx_relations_target          ON relations(target_object_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "relations_select" ON relations FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "relations_insert" ON relations FOR INSERT
    WITH CHECK (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );

CREATE POLICY "relations_delete" ON relations FOR DELETE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );
