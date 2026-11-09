-- Migration 025: Trust Graph relation tenant isolation
-- Security & Stabilization Gate — SEC-04

BEGIN;

LOCK TABLE public.relations, public.objects
IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.relations AS relation
        JOIN public.objects AS source_object
          ON source_object.id = relation.source_object_id
        JOIN public.objects AS target_object
          ON target_object.id = relation.target_object_id
        WHERE relation.organization_id IS DISTINCT FROM source_object.organization_id
           OR relation.organization_id IS DISTINCT FROM target_object.organization_id
    ) THEN
        RAISE EXCEPTION USING
            ERRCODE = '23514',
            MESSAGE = 'graph_relation_tenant_mismatch_existing';
    END IF;
END;
$$;

ALTER TABLE public.relations
    ADD CONSTRAINT relations_source_tenant_fkey
        FOREIGN KEY (source_object_id, organization_id)
        REFERENCES public.objects(id, organization_id)
        ON DELETE CASCADE,
    ADD CONSTRAINT relations_target_tenant_fkey
        FOREIGN KEY (target_object_id, organization_id)
        REFERENCES public.objects(id, organization_id)
        ON DELETE CASCADE;

DROP POLICY IF EXISTS "relations_select" ON public.relations;
CREATE POLICY "relations_select" ON public.relations FOR SELECT
    USING (
        organization_id = current_org_id()
        AND EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = relations.source_object_id
              AND objects.organization_id = current_org_id()
        )
        AND EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = relations.target_object_id
              AND objects.organization_id = current_org_id()
        )
    );

DROP POLICY IF EXISTS "relations_insert" ON public.relations;
CREATE POLICY "relations_insert" ON public.relations FOR INSERT
    WITH CHECK (
        organization_id = current_org_id()
        AND EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = relations.source_object_id
              AND objects.organization_id = current_org_id()
        )
        AND EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = relations.target_object_id
              AND objects.organization_id = current_org_id()
        )
        AND current_user_role() IN ('owner', 'analyst')
    );

DROP POLICY IF EXISTS "relations_delete" ON public.relations;
CREATE POLICY "relations_delete" ON public.relations FOR DELETE
    USING (
        organization_id = current_org_id()
        AND EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = relations.source_object_id
              AND objects.organization_id = current_org_id()
        )
        AND EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = relations.target_object_id
              AND objects.organization_id = current_org_id()
        )
        AND current_user_role() IN ('owner', 'analyst')
    );

COMMIT;
