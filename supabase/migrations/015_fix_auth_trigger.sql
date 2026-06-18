-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 015: fix handle_new_user trigger
-- Проблема: SECURITY DEFINER без SET search_path → PostgreSQL 15 не находит
-- таблицу profiles при выполнении триггера → "Database error saving new user".
-- Решение: явный SET search_path = public + префикс public. в INSERT.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Та же проблема в helper-функциях (используются в RLS-политиках).
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth;
