-- Restrict security audit reads to the roles approved by ADR-003.

DROP POLICY IF EXISTS "sec_events_select" ON security_events;

CREATE POLICY "sec_events_select" ON security_events FOR SELECT
    TO authenticated
    USING (
        organization_id = current_org_id()
        AND current_user_role() IN ('owner', 'admin')
    );
