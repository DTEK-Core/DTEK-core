-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: close profiles ↔ organizations FK cycle
-- ─────────────────────────────────────────────────────────────────────────────
-- profiles.organization_id → organizations.id
-- Выполняется после создания organizations (003), закрывая циклическую зависимость.

ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE SET NULL;
