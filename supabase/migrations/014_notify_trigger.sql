-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 014: notify_trust_recalc triggers (stub for Epic 8)
-- ─────────────────────────────────────────────────────────────────────────────
-- Функция notify_trust_recalc() объявлена в 001_helper_functions.sql.
-- Здесь подключаем её к таблицам, изменения в которых влияют на Trust Score.
-- Edge Function-подписчик будет реализован в Sprint 08 (Epic 8).

-- При изменении объекта (данные напрямую влияют на completeness и базовый score)
CREATE TRIGGER tr_objects_notify_recalc
    AFTER INSERT OR UPDATE ON objects
    FOR EACH ROW EXECUTE FUNCTION notify_trust_recalc();

-- При любом изменении риска (добавление/изменение/удаление меняет factor scores)
CREATE TRIGGER tr_risks_notify_recalc
    AFTER INSERT OR UPDATE OR DELETE ON risks
    FOR EACH ROW EXECUTE FUNCTION notify_trust_recalc();

-- При изменении связей (влияет на connection_count в trust_passports)
CREATE TRIGGER tr_relations_notify_recalc
    AFTER INSERT OR DELETE ON relations
    FOR EACH ROW EXECUTE FUNCTION notify_trust_recalc();
