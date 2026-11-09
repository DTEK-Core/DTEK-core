-- Migration 026: atomic organization creation
-- Security & Stabilization Gate — STAB-01

BEGIN;

DROP POLICY IF EXISTS "orgs_insert" ON public.organizations;
REVOKE INSERT ON TABLE public.organizations FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_organization_atomic(
    p_name text,
    p_short_name text,
    p_industry text,
    p_size text,
    p_inn text,
    p_region text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_actor_email text;
    v_actor_status text;
    v_actor_organization_id uuid;
    v_organization_id uuid;
    v_name text := regexp_replace(
        COALESCE(p_name, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g'
    );
    v_short_name text := regexp_replace(
        COALESCE(p_short_name, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g'
    );
    v_industry text := NULLIF(regexp_replace(
        COALESCE(p_industry, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g'
    ), '');
    v_inn text := NULLIF(regexp_replace(
        COALESCE(p_inn, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g'
    ), '');
    v_region text := NULLIF(regexp_replace(
        COALESCE(p_region, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g'
    ), '');
BEGIN
    IF v_actor_id IS NULL THEN
        RAISE EXCEPTION USING
            ERRCODE = '42501',
            MESSAGE = 'organization_creation_denied';
    END IF;

    IF v_name = ''
       OR char_length(v_name) > 200
       OR v_short_name = ''
       OR char_length(v_short_name) > 100
       OR v_industry IS NOT NULL AND char_length(v_industry) > 100
       OR p_size IS NULL
       OR p_size NOT IN ('micro', 'small', 'medium', 'large', 'enterprise')
       OR v_inn IS NOT NULL AND (char_length(v_inn) > 12 OR v_inn !~ '^[0-9]+$')
       OR v_region IS NOT NULL AND char_length(v_region) > 200 THEN
        RAISE EXCEPTION USING
            ERRCODE = '22023',
            MESSAGE = 'invalid_organization_input';
    END IF;

    SELECT email, status, organization_id
    INTO v_actor_email, v_actor_status, v_actor_organization_id
    FROM public.profiles
    WHERE id = v_actor_id
    FOR UPDATE;

    IF NOT FOUND
       OR v_actor_status <> 'active'
       OR v_actor_organization_id IS NOT NULL THEN
        RAISE EXCEPTION USING
            ERRCODE = '42501',
            MESSAGE = 'organization_creation_denied';
    END IF;

    INSERT INTO public.organizations (
        name,
        short_name,
        industry,
        size,
        inn,
        region,
        owner_id
    ) VALUES (
        v_name,
        v_short_name,
        v_industry,
        p_size,
        v_inn,
        v_region,
        v_actor_id
    )
    RETURNING id INTO v_organization_id;

    UPDATE public.profiles
    SET organization_id = v_organization_id,
        role = 'owner'
    WHERE id = v_actor_id
      AND status = 'active'
      AND organization_id IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING
            ERRCODE = '40001',
            MESSAGE = 'organization_creation_conflict';
    END IF;

    INSERT INTO public.trust_factor_config (organization_id, updated_by)
    VALUES (v_organization_id, v_actor_id);

    INSERT INTO public.security_events (
        organization_id,
        actor_id,
        actor_email,
        event_type,
        target_type,
        target_id,
        metadata
    ) VALUES (
        v_organization_id,
        v_actor_id,
        v_actor_email,
        'org.created',
        'organization',
        v_organization_id::text,
        '{}'::jsonb
    );

    RETURN v_organization_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization_atomic(
    text, text, text, text, text, text
) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.create_organization_atomic(
    text, text, text, text, text, text
) TO authenticated;

COMMIT;
