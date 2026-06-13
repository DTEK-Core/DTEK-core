-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: Helper Functions & Triggers
-- DTEK Core — Digital Trust Management Platform
-- ─────────────────────────────────────────────────────────────────────────────

-- Skip body validation so SQL functions can reference tables created later
SET check_function_bodies = OFF;

-- ── 1. RLS helper: org ID of current user ────────────────────────────────────
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS uuid AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── 2. RLS helper: role of current user ──────────────────────────────────────
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text AS $$
    SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── 3. Generic updated_at stamp trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 4. Auto-create trust_passport when object is inserted ────────────────────
CREATE OR REPLACE FUNCTION create_trust_passport()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trust_passports (object_id, organization_id)
    VALUES (NEW.id, NEW.organization_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 5. Notify Edge Function to recalculate Trust Score ───────────────────────
-- Fires on changes to objects, risks, or relations; calculation runs in EF.
CREATE OR REPLACE FUNCTION notify_trust_recalc()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('trust_recalc', json_build_object(
        'object_id', COALESCE(NEW.id, OLD.id),
        'reason', TG_TABLE_NAME || '_' || TG_OP
    )::text);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
