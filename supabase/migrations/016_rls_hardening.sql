-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 016: RLS Hardening — explicit DENY policies
-- DTEK Core — Digital Trust Management Platform
-- Sprint 06 — S06-T001
-- ─────────────────────────────────────────────────────────────────────────────
-- Principle: every table has explicit policies for every operation.
-- Operations not listed below are blocked by default (RLS deny-by-default).
-- "false" USING/WITH CHECK blocks the operation via user client.
-- Admin/service_role client bypasses ALL RLS — these policies don't affect it.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. profiles: fix SELECT to allow pre-onboarding users to see own profile ─
-- Old policy: organization_id = current_org_id()
-- Problem: users without org (just registered, not yet onboarded) get NULL
--          from current_org_id(), so the WHERE clause fails → user can't read
--          their own profile via user client at all.
-- Fix: add id = auth.uid() as fallback so any user can always see own row.
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
    USING (
        id = auth.uid()
        OR organization_id = current_org_id()
    );

-- profiles: no INSERT policy — row is created by handle_new_user() SECURITY DEFINER trigger.
-- profiles: UPDATE is handled by existing "profiles_update" policy.
-- profiles: DELETE blocked explicitly — deletion cascades from auth.users only.
CREATE POLICY "profiles_delete_deny" ON profiles FOR DELETE
    USING (false);

-- ── 2. trust_factor_config: block user-client INSERT and DELETE ──────────────
-- Config row is created via admin client during onboarding (createOrganization).
-- There is a UNIQUE constraint on organization_id, but explicit denial is cleaner.
CREATE POLICY "tfc_insert_deny" ON trust_factor_config FOR INSERT
    WITH CHECK (false);

CREATE POLICY "tfc_delete_deny" ON trust_factor_config FOR DELETE
    USING (false);

-- ── 3. trust_passports: block all mutations via user client ──────────────────
-- Rows are created by create_trust_passport() SECURITY DEFINER trigger.
-- Updates and deletes are performed exclusively by the Trust Score Engine
-- via admin client. User client must never mutate trust_passports.
CREATE POLICY "passports_insert_deny" ON trust_passports FOR INSERT
    WITH CHECK (false);

CREATE POLICY "passports_update_deny" ON trust_passports FOR UPDATE
    USING (false);

CREATE POLICY "passports_delete_deny" ON trust_passports FOR DELETE
    USING (false);

-- ── 4. trust_score_history: block all mutations via user client ──────────────
-- Written exclusively by the Trust Score Engine via admin client.
-- Records are immutable; deletion cascades from objects (object_id FK).
CREATE POLICY "tsh_insert_deny" ON trust_score_history FOR INSERT
    WITH CHECK (false);

CREATE POLICY "tsh_update_deny" ON trust_score_history FOR UPDATE
    USING (false);

CREATE POLICY "tsh_delete_deny" ON trust_score_history FOR DELETE
    USING (false);

-- ── 5. invitations: block UPDATE and DELETE via user client ──────────────────
-- sendInvitation uses user client with INSERT (allowed by "invitations_insert").
-- revokeInvitation and acceptInvitation use service client → bypass RLS.
-- Direct UPDATE/DELETE via user client must be blocked.
CREATE POLICY "invitations_update_deny" ON invitations FOR UPDATE
    USING (false);

CREATE POLICY "invitations_delete_deny" ON invitations FOR DELETE
    USING (false);

-- ── 6. object_risks: block UPDATE via user client ────────────────────────────
-- object_risks is a join table; rows are inserted and deleted, never updated.
-- INSERT and DELETE have existing policies; UPDATE is not a valid operation.
CREATE POLICY "object_risks_update_deny" ON object_risks FOR UPDATE
    USING (false);

-- ── 7. relations: block UPDATE via user client ───────────────────────────────
-- Relations are created and deleted, never updated.
-- INSERT and DELETE have existing policies with role checks.
CREATE POLICY "relations_update_deny" ON relations FOR UPDATE
    USING (false);
