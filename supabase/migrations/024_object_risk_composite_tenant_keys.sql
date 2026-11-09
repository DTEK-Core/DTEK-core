-- Migration 024: object-risk composite tenant keys
-- Security & Stabilization Gate — SEC-03 review hardening

BEGIN;

LOCK TABLE public.object_risks, public.objects, public.risks
IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE public.object_risks
    ADD COLUMN organization_id uuid;

UPDATE public.object_risks AS link
SET organization_id = object.organization_id
FROM public.objects AS object
WHERE object.id = link.object_id;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.object_risks AS link
        JOIN public.objects AS object ON object.id = link.object_id
        JOIN public.risks AS risk ON risk.id = link.risk_id
        WHERE link.organization_id IS DISTINCT FROM object.organization_id
           OR link.organization_id IS DISTINCT FROM risk.organization_id
    ) THEN
        RAISE EXCEPTION USING
            ERRCODE = '23514',
            MESSAGE = 'object_risk_tenant_mismatch_existing';
    END IF;
END;
$$;

ALTER TABLE public.object_risks
    ALTER COLUMN organization_id SET NOT NULL,
    ADD CONSTRAINT object_risks_organization_id_fkey
        FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
        ON DELETE CASCADE;

ALTER TABLE public.objects
    ADD CONSTRAINT objects_id_organization_id_key
        UNIQUE (id, organization_id);

ALTER TABLE public.risks
    ADD CONSTRAINT risks_id_organization_id_key
        UNIQUE (id, organization_id);

ALTER TABLE public.object_risks
    ADD CONSTRAINT object_risks_object_tenant_fkey
        FOREIGN KEY (object_id, organization_id)
        REFERENCES public.objects(id, organization_id)
        ON DELETE CASCADE,
    ADD CONSTRAINT object_risks_risk_tenant_fkey
        FOREIGN KEY (risk_id, organization_id)
        REFERENCES public.risks(id, organization_id)
        ON DELETE CASCADE;

CREATE INDEX idx_object_risks_organization_id
    ON public.object_risks(organization_id);

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

    NEW.organization_id := object_organization_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS object_risks_enforce_tenant ON public.object_risks;
CREATE TRIGGER object_risks_enforce_tenant
    BEFORE INSERT OR UPDATE OF object_id, risk_id, organization_id
    ON public.object_risks
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_object_risk_tenant();

DROP TRIGGER IF EXISTS objects_guard_link_tenant ON public.objects;
DROP TRIGGER IF EXISTS risks_guard_link_tenant ON public.risks;
DROP FUNCTION IF EXISTS public.guard_object_risk_tenant_on_object_update();
DROP FUNCTION IF EXISTS public.guard_object_risk_tenant_on_risk_update();

COMMIT;
