-- Migration 020: profile privilege boundaries
-- Security & Stabilization Gate — SEC-01

BEGIN;

-- Direct profile updates cannot safely restrict privileged columns. All writes
-- now go through narrow SECURITY DEFINER functions with explicit checks.
DROP POLICY IF EXISTS "profiles_update" ON profiles;
REVOKE UPDATE ON TABLE profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION update_own_profile(
    p_full_name text,
    p_team text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_full_name text := btrim(COALESCE(p_full_name, ''));
    v_team text := NULLIF(btrim(COALESCE(p_team, '')), '');
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_update_denied';
    END IF;

    IF v_full_name = '' OR char_length(v_full_name) > 100 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_profile_name';
    END IF;

    IF v_team IS NOT NULL AND char_length(v_team) > 200 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_profile_team';
    END IF;

    UPDATE profiles
    SET full_name = v_full_name,
        team = v_team
    WHERE id = auth.uid()
      AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_update_denied';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION change_organization_member_role(
    p_target_user_id uuid,
    p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_actor_org_id uuid;
    v_actor_role text;
    v_actor_status text;
    v_actor_email text;
    v_target_org_id uuid;
    v_target_role text;
BEGIN
    IF p_role NOT IN ('analyst', 'admin', 'viewer') THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_member_role';
    END IF;

    SELECT organization_id, role, status, email
    INTO v_actor_org_id, v_actor_role, v_actor_status, v_actor_email
    FROM profiles
    WHERE id = v_actor_id;

    IF v_actor_id IS NULL
       OR v_actor_org_id IS NULL
       OR v_actor_status <> 'active'
       OR v_actor_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    IF p_target_user_id = v_actor_id THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    SELECT organization_id, role
    INTO v_target_org_id, v_target_role
    FROM profiles
    WHERE id = p_target_user_id
    FOR UPDATE;

    IF NOT FOUND
       OR v_target_org_id IS DISTINCT FROM v_actor_org_id
       OR v_target_role = 'owner' THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    UPDATE profiles
    SET role = p_role
    WHERE id = p_target_user_id;

    INSERT INTO security_events (
        organization_id,
        actor_id,
        actor_email,
        event_type,
        target_type,
        target_id,
        metadata
    ) VALUES (
        v_actor_org_id,
        v_actor_id,
        v_actor_email,
        'role.changed',
        'user',
        p_target_user_id::text,
        jsonb_build_object('fromRole', v_target_role, 'toRole', p_role)
    );
END;
$$;

CREATE OR REPLACE FUNCTION set_organization_member_status(
    p_target_user_id uuid,
    p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_actor_org_id uuid;
    v_actor_role text;
    v_actor_status text;
    v_actor_email text;
    v_target_org_id uuid;
    v_target_role text;
    v_target_email text;
BEGIN
    IF p_status NOT IN ('active', 'blocked') THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_member_status';
    END IF;

    SELECT organization_id, role, status, email
    INTO v_actor_org_id, v_actor_role, v_actor_status, v_actor_email
    FROM profiles
    WHERE id = v_actor_id;

    IF v_actor_id IS NULL
       OR v_actor_org_id IS NULL
       OR v_actor_status <> 'active'
       OR v_actor_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    IF p_target_user_id = v_actor_id THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    SELECT organization_id, role, email
    INTO v_target_org_id, v_target_role, v_target_email
    FROM profiles
    WHERE id = p_target_user_id
    FOR UPDATE;

    IF NOT FOUND
       OR v_target_org_id IS DISTINCT FROM v_actor_org_id
       OR v_target_role = 'owner' THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    UPDATE profiles
    SET status = p_status
    WHERE id = p_target_user_id;

    INSERT INTO security_events (
        organization_id,
        actor_id,
        actor_email,
        event_type,
        target_type,
        target_id,
        metadata
    ) VALUES (
        v_actor_org_id,
        v_actor_id,
        v_actor_email,
        CASE WHEN p_status = 'blocked' THEN 'user.blocked' ELSE 'user.unblocked' END,
        'user',
        p_target_user_id::text,
        jsonb_build_object('targetEmail', v_target_email)
    );
END;
$$;

CREATE OR REPLACE FUNCTION remove_organization_member(
    p_target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_actor_org_id uuid;
    v_actor_role text;
    v_actor_status text;
    v_actor_email text;
    v_target_org_id uuid;
    v_target_role text;
    v_target_email text;
BEGIN
    SELECT organization_id, role, status, email
    INTO v_actor_org_id, v_actor_role, v_actor_status, v_actor_email
    FROM profiles
    WHERE id = v_actor_id;

    IF v_actor_id IS NULL
       OR v_actor_org_id IS NULL
       OR v_actor_status <> 'active'
       OR v_actor_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    IF p_target_user_id = v_actor_id THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    SELECT organization_id, role, email
    INTO v_target_org_id, v_target_role, v_target_email
    FROM profiles
    WHERE id = p_target_user_id
    FOR UPDATE;

    IF NOT FOUND
       OR v_target_org_id IS DISTINCT FROM v_actor_org_id
       OR v_target_role = 'owner' THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile_management_denied';
    END IF;

    UPDATE profiles
    SET organization_id = NULL,
        role = 'viewer',
        status = 'active'
    WHERE id = p_target_user_id;

    INSERT INTO security_events (
        organization_id,
        actor_id,
        actor_email,
        event_type,
        target_type,
        target_id,
        metadata
    ) VALUES (
        v_actor_org_id,
        v_actor_id,
        v_actor_email,
        'user.removed',
        'user',
        p_target_user_id::text,
        jsonb_build_object('targetEmail', v_target_email, 'previousRole', v_target_role)
    );
END;
$$;

REVOKE ALL ON FUNCTION update_own_profile(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION change_organization_member_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION set_organization_member_status(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION remove_organization_member(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION update_own_profile(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION change_organization_member_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION set_organization_member_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_organization_member(uuid) TO authenticated;

COMMIT;
