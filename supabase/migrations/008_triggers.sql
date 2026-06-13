-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008: triggers
-- ─────────────────────────────────────────────────────────────────────────────
-- Все функции-обработчики объявлены в 001_helper_functions.sql.

-- ── Авто-создание trust_passport при INSERT в objects ────────────────────────
CREATE TRIGGER tr_create_passport
    AFTER INSERT ON objects
    FOR EACH ROW EXECUTE FUNCTION create_trust_passport();

-- ── updated_at — все таблицы с полем updated_at ──────────────────────────────
CREATE TRIGGER tr_objects_updated_at
    BEFORE UPDATE ON objects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tr_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tr_trust_passports_updated_at
    BEFORE UPDATE ON trust_passports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tr_trust_factor_config_updated_at
    BEFORE UPDATE ON trust_factor_config
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
