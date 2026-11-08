-- Migration 021: blocked user access revocation
-- Security & Stabilization Gate — SEC-02

BEGIN;

CREATE OR REPLACE FUNCTION public.current_user_is_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND status = 'active'
    );
$$;

CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT organization_id
    FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.get_current_access_context()
RETURNS TABLE (
    organization_id uuid,
    role text,
    status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT
        CASE WHEN p.status = 'active' THEN p.organization_id ELSE NULL END,
        CASE WHEN p.status = 'active' THEN p.role ELSE NULL END,
        p.status
    FROM public.profiles AS p
    WHERE p.id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_current_access_context() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_access_context() TO authenticated;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
    USING (
        current_user_is_active()
        AND (
            id = auth.uid()
            OR organization_id = current_org_id()
        )
    );

DROP POLICY IF EXISTS "orgs_insert" ON public.organizations;
CREATE POLICY "orgs_insert" ON public.organizations FOR INSERT
    WITH CHECK (
        current_user_is_active()
        AND owner_id = auth.uid()
    );

CREATE OR REPLACE FUNCTION public.revoke_sessions_for_blocked_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF NEW.status = 'blocked' AND OLD.status IS DISTINCT FROM NEW.status THEN
        DELETE FROM auth.sessions WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_revoke_sessions_on_block ON public.profiles;
CREATE TRIGGER profiles_revoke_sessions_on_block
    AFTER UPDATE OF status ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.revoke_sessions_for_blocked_profile();

REVOKE ALL ON FUNCTION public.revoke_sessions_for_blocked_profile() FROM PUBLIC, anon, authenticated;

COMMIT;
