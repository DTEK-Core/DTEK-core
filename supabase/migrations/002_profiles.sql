-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: profiles
-- ─────────────────────────────────────────────────────────────────────────────
-- organization_id добавляется без FK — цикл закроется в 004_profiles_org_fk.sql
-- после создания organizations.

CREATE TABLE profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid,
    full_name       text NOT NULL,
    email           text NOT NULL,
    role            text NOT NULL DEFAULT 'viewer'
                    CHECK (role IN ('owner', 'analyst', 'admin', 'viewer')),
    team            text,
    status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'invited', 'blocked')),
    avatar_url      text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_seen_at    timestamptz
);

CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_email           ON profiles(email);
CREATE INDEX idx_profiles_role            ON profiles(organization_id, role);

-- Auto-create profile row when Supabase Auth creates a new user.
-- SECURITY DEFINER runs as function owner → bypasses RLS on profiles.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Участники одной организации видят друг друга
CREATE POLICY "profiles_select" ON profiles FOR SELECT
    USING (organization_id = current_org_id());

-- Пользователь редактирует свой профиль; владелец — любой профиль в орг
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
    USING (id = auth.uid() OR current_user_role() = 'owner');
