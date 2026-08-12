# RLS_MODEL.md — DTEK Core

`Версия: 1.1`
`Дата: 12.08.2026`
`Статус: Актуальный`

---

## Row Level Security в DTEK Core

PostgreSQL Row Level Security (RLS) обеспечивает изоляцию данных между организациями на уровне базы данных. Даже если клиент напрямую обращается к Supabase API с `anon key`, он увидит только данные своей организации.

---

## Принципы

1. **RLS включён на каждой таблице** — `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
2. **Все запросы фильтруются по `organization_id`** через вспомогательные функции
3. **Service Role обходит RLS** — используется только в Server Actions для системных операций
4. **Анонимный ключ** всегда подчиняется RLS

---

## Вспомогательные функции

Определены в `supabase/migrations/001_helper_functions.sql`:

```sql
-- Возвращает organization_id из profiles для текущего auth.uid()
CREATE FUNCTION current_org_id() RETURNS uuid AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Возвращает роль текущего пользователя
CREATE FUNCTION current_user_role() RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## RLS-политики по таблицам

### `profiles`

```sql
-- Пользователь видит только участников своей организации
CREATE POLICY "org_isolation" ON profiles
  FOR SELECT USING (organization_id = current_org_id());

-- Пользователь обновляет только свой профиль
CREATE POLICY "self_update" ON profiles
  FOR UPDATE USING (id = auth.uid());
```

### `organizations`

```sql
-- Пользователь видит только свою организацию
CREATE POLICY "org_isolation" ON organizations
  FOR SELECT USING (id = current_org_id());

-- Только owner может обновлять
CREATE POLICY "owner_update" ON organizations
  FOR UPDATE USING (id = current_org_id() AND current_user_role() = 'owner');
```

### `objects`

```sql
-- SELECT: только объекты своей организации
CREATE POLICY "org_isolation" ON objects
  FOR SELECT USING (organization_id = current_org_id());

-- INSERT: owner, analyst, admin
CREATE POLICY "insert_allowed" ON objects
  FOR INSERT WITH CHECK (
    organization_id = current_org_id()
    AND current_user_role() IN ('owner', 'analyst', 'admin')
  );

-- UPDATE: owner, analyst, admin
CREATE POLICY "update_allowed" ON objects
  FOR UPDATE USING (
    organization_id = current_org_id()
    AND current_user_role() IN ('owner', 'analyst', 'admin')
  );
```

### `trust_passports`

```sql
-- SELECT: все участники организации
CREATE POLICY "org_isolation" ON trust_passports
  FOR SELECT USING (
    object_id IN (SELECT id FROM objects WHERE organization_id = current_org_id())
  );
```

### `risks`

```sql
-- SELECT: все участники организации
CREATE POLICY "org_isolation" ON risks
  FOR SELECT USING (organization_id = current_org_id());

-- INSERT/UPDATE/DELETE: owner, analyst
CREATE POLICY "write_allowed" ON risks
  FOR ALL USING (
    organization_id = current_org_id()
    AND current_user_role() IN ('owner', 'analyst')
  );
```

### `risk_comments` И `risk_activity`

Migration 018 добавляет две tenant-scoped immutable таблицы. Все участники
текущей организации читают comments/timeline через RLS, а прямые user-client
INSERT/UPDATE/DELETE запрещены. Запись выполняют только авторизованные Server
Actions после проверки роли owner/analyst и принадлежности риска tenant.

```sql
CREATE POLICY "risk_comments_select" ON risk_comments FOR SELECT
  USING (organization_id = current_org_id());
CREATE POLICY "risk_comments_insert_deny" ON risk_comments FOR INSERT
  WITH CHECK (false);
CREATE POLICY "risk_comments_update_deny" ON risk_comments FOR UPDATE
  USING (false);
CREATE POLICY "risk_comments_delete_deny" ON risk_comments FOR DELETE
  USING (false);

CREATE POLICY "risk_activity_select" ON risk_activity FOR SELECT
  USING (organization_id = current_org_id());
CREATE POLICY "risk_activity_insert_deny" ON risk_activity FOR INSERT
  WITH CHECK (false);
CREATE POLICY "risk_activity_update_deny" ON risk_activity FOR UPDATE
  USING (false);
CREATE POLICY "risk_activity_delete_deny" ON risk_activity FOR DELETE
  USING (false);
```

### `relations`

```sql
-- SELECT: все участники организации
CREATE POLICY "org_isolation" ON relations
  FOR SELECT USING (organization_id = current_org_id());

-- INSERT/DELETE: owner, analyst
CREATE POLICY "write_allowed" ON relations
  FOR ALL USING (
    organization_id = current_org_id()
    AND current_user_role() IN ('owner', 'analyst')
  );
```

### `trust_factor_config`

```sql
-- SELECT: все участники организации
CREATE POLICY "org_isolation" ON trust_factor_config
  FOR SELECT USING (organization_id = current_org_id());

-- UPDATE: owner, analyst
CREATE POLICY "write_allowed" ON trust_factor_config
  FOR UPDATE USING (
    organization_id = current_org_id()
    AND current_user_role() IN ('owner', 'analyst')
  );
```

### `trust_score_history`

```sql
-- SELECT: все участники организации
CREATE POLICY "org_isolation" ON trust_score_history
  FOR SELECT USING (organization_id = current_org_id());

-- INSERT: только Service Role (системный)
-- Прямая запись пользователями запрещена
```

### `security_events`

```sql
-- SELECT: owner и admin
CREATE POLICY "sec_events_select" ON security_events FOR SELECT
  TO authenticated
  USING (
    organization_id = current_org_id()
    AND current_user_role() IN ('owner', 'admin')
  );

-- INSERT: только Service Role (системный)
```

### `invitations`

```sql
-- SELECT: все участники организации
CREATE POLICY "org_isolation" ON invitations
  FOR SELECT USING (organization_id = current_org_id());

-- INSERT: owner, admin
CREATE POLICY "invite_allowed" ON invitations
  FOR INSERT WITH CHECK (
    organization_id = current_org_id()
    AND current_user_role() IN ('owner', 'admin')
  );
```

---

## Применённые миграции

| Миграция | Содержание |
|---|---|
| `001_helper_functions.sql` | Функции `current_org_id()`, `current_user_role()` |
| `002_profiles.sql` – `014_notify_trigger.sql` | Базовые таблицы + RLS |
| `016_rls_hardening.sql` | Дополнительное ужесточение RLS (Sprint 06) |
| `017_security_events.sql` | Таблица `security_events` + RLS |
| `018_risk_workflow.sql` | Immutable `risk_comments`, `risk_activity` + tenant RLS |
| `019_security_events_privileged_read.sql` | Audit Log SELECT ограничен owner/admin на уровне RLS |

---

## Service Role: безопасное использование

`SUPABASE_SERVICE_ROLE_KEY` обходит RLS. Правила:

1. **Никогда не передавать на клиент** — только Server Actions и Server Components
2. **Никогда не коммитить** — хранится только в `.env.local` (в .gitignore)
3. **Используется только для системных операций**: аудит-логирование, пересчёт Trust Score, системные события

```typescript
// lib/supabase/admin.ts — только для серверного использования
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ТОЛЬКО server-side
  );
}
```
