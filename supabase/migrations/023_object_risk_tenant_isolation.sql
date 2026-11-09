-- Migration 023: object-risk tenant isolation
-- Security & Stabilization Gate — SEC-03

BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.object_risks AS link
        JOIN public.objects AS object ON object.id = link.object_id
        JOIN public.risks AS risk ON risk.id = link.risk_id
        WHERE object.organization_id IS DISTINCT FROM risk.organization_id
    ) THEN
        RAISE EXCEPTION USING
            ERRCODE = '23514',
            MESSAGE = 'object_risk_tenant_mismatch_existing';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_object_risk_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    object_organization_id uuid;
    risk_organization_id uuid;
BEGIN
    SELECT organization_id
    INTO object_organization_id
    FROM public.objects
    WHERE id = NEW.object_id;

    SELECT organization_id
    INTO risk_organization_id
    FROM public.risks
    WHERE id = NEW.risk_id;

    IF object_organization_id IS NULL
       OR risk_organization_id IS NULL
       OR object_organization_id IS DISTINCT FROM risk_organization_id THEN
        RAISE EXCEPTION USING
            ERRCODE = '23514',
            MESSAGE = 'object_risk_tenant_mismatch';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_object_risk_tenant_on_object_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id
       AND EXISTS (
           SELECT 1
           FROM public.object_risks AS link
           JOIN public.risks AS risk ON risk.id = link.risk_id
           WHERE link.object_id = NEW.id
             AND risk.organization_id IS DISTINCT FROM NEW.organization_id
       ) THEN
        RAISE EXCEPTION USING
            ERRCODE = '23514',
            MESSAGE = 'object_risk_tenant_mismatch';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_object_risk_tenant_on_risk_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id
       AND EXISTS (
           SELECT 1
           FROM public.object_risks AS link
           JOIN public.objects AS object ON object.id = link.object_id
           WHERE link.risk_id = NEW.id
             AND object.organization_id IS DISTINCT FROM NEW.organization_id
       ) THEN
        RAISE EXCEPTION USING
            ERRCODE = '23514',
            MESSAGE = 'object_risk_tenant_mismatch';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS object_risks_enforce_tenant ON public.object_risks;
CREATE TRIGGER object_risks_enforce_tenant
    BEFORE INSERT OR UPDATE OF object_id, risk_id ON public.object_risks
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_object_risk_tenant();

DROP TRIGGER IF EXISTS objects_guard_link_tenant ON public.objects;
CREATE TRIGGER objects_guard_link_tenant
    BEFORE UPDATE OF organization_id ON public.objects
    FOR EACH ROW
    EXECUTE FUNCTION public.guard_object_risk_tenant_on_object_update();

DROP TRIGGER IF EXISTS risks_guard_link_tenant ON public.risks;
CREATE TRIGGER risks_guard_link_tenant
    BEFORE UPDATE OF organization_id ON public.risks
    FOR EACH ROW
    EXECUTE FUNCTION public.guard_object_risk_tenant_on_risk_update();

REVOKE ALL ON FUNCTION public.enforce_object_risk_tenant()
FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_object_risk_tenant_on_object_update()
FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_object_risk_tenant_on_risk_update()
FROM PUBLIC, anon, authenticated, service_role;

DROP POLICY IF EXISTS "object_risks_select" ON public.object_risks;
CREATE POLICY "object_risks_select" ON public.object_risks FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = object_risks.object_id
              AND objects.organization_id = current_org_id()
        )
        AND EXISTS (
            SELECT 1
            FROM public.risks
            WHERE risks.id = object_risks.risk_id
              AND risks.organization_id = current_org_id()
        )
    );

DROP POLICY IF EXISTS "object_risks_insert" ON public.object_risks;
CREATE POLICY "object_risks_insert" ON public.object_risks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = object_risks.object_id
              AND objects.organization_id = current_org_id()
        )
        AND EXISTS (
            SELECT 1
            FROM public.risks
            WHERE risks.id = object_risks.risk_id
              AND risks.organization_id = current_org_id()
        )
        AND current_user_role() IN ('owner', 'analyst', 'admin')
    );

DROP POLICY IF EXISTS "object_risks_delete" ON public.object_risks;
CREATE POLICY "object_risks_delete" ON public.object_risks FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.objects
            WHERE objects.id = object_risks.object_id
              AND objects.organization_id = current_org_id()
        )
        AND EXISTS (
            SELECT 1
            FROM public.risks
            WHERE risks.id = object_risks.risk_id
              AND risks.organization_id = current_org_id()
        )
        AND current_user_role() IN ('owner', 'analyst')
    );

COMMIT;
