-- Migration 022: blocked profile reactivation guard
-- Security & Stabilization Gate — SEC-02 review hardening

BEGIN;

CREATE OR REPLACE FUNCTION public.guard_blocked_profile_reactivation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF OLD.status = 'blocked'
       AND NEW.status = 'active'
       AND current_user NOT IN ('postgres', 'supabase_admin') THEN
        RAISE EXCEPTION USING
            ERRCODE = '42501',
            MESSAGE = 'profile_reactivation_denied';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_blocked_reactivation ON public.profiles;
CREATE TRIGGER profiles_guard_blocked_reactivation
    BEFORE UPDATE OF status ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.guard_blocked_profile_reactivation();

REVOKE ALL ON FUNCTION public.guard_blocked_profile_reactivation()
FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
