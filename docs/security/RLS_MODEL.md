# RLS_MODEL.md — DTEK Core

`Версия: 1.3`
`Дата: 09.11.2026`
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

Созданы migration 001 и усилены migration 021:

```sql
-- Возвращает organization_id из profiles для текущего auth.uid()
CREATE FUNCTION current_org_id() RETURNS uuid AS $$
  SELECT organization_id FROM profiles
  WHERE id = auth.uid() AND status = 'active';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Возвращает роль текущего пользователя
CREATE FUNCTION current_user_role() RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid() AND status = 'active';
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## RLS-политики по таблицам

### `profiles`

```sql
-- Только active пользователь видит себя и участников своей организации
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    current_user_is_active()
    AND (id = auth.uid() OR organization_id = current_org_id())
  );

-- Direct UPDATE для authenticated/anon запрещён.
-- Display fields и membership изменяются только через narrow RPC migration 020.
```

Migration 020 удаляет `profiles_update`, отзывает table-level `UPDATE` у
`authenticated`/`anon` и разрешает только:

- `update_own_profile(full_name, team)` для active self-profile;
- `change_organization_member_role(...)` для active owner/admin;
- `set_organization_member_status(...)` для active owner/admin;
- `remove_organization_member(...)` для active owner/admin.

Membership RPC проверяют caller tenant, role/status, target tenant, запрет self
и owner target/assignment. Privileged transition и audit insert атомарны.

Migration 021 добавляет единый active-membership invariant. Для blocked profile
`current_org_id()` и `current_user_role()` возвращают `NULL`, profile SELECT и
organization INSERT отклоняются, а остальные tenant policies автоматически
перестают предоставлять данные. `get_current_access_context()` возвращает
blocked пользователю только status без tenant ID и role; это необходимо для
раннего middleware guard. Переход в `blocked` атомарно удаляет `auth.sessions`.
Migration 022 запрещает переход `blocked → active` через обычный service-role
UPDATE. Reactivation разрешена только доверенному membership RPC; это закрывает
обход через старое pending invitation, а superuser остаётся аварийным
операционным recovery path.

### `organizations`

```sql
-- Пользователь видит только свою организацию
CREATE POLICY "org_isolation" ON organizations
  FOR SELECT USING (id = current_org_id());

-- Только owner может обновлять
CREATE POLICY "owner_update" ON organizations
  FOR UPDATE USING (id = current_org_id() AND current_user_role() = 'owner');
```

После migration 026 прямой `INSERT organizations` для `anon` и
`authenticated` запрещён. Первый tenant создаётся только через
`create_organization_atomic(...)`: функция использует `auth.uid()`, блокирует
active profile без текущей организации и в одной транзакции создаёт
organization, owner membership, default Trust Score config и безопасный audit
event. `anon` и `service_role` не имеют права `EXECUTE` этой RPC.

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

### `object_risks`

Migrations 023–024 закрывают исходную одностороннюю проверку junction table. Каждая
связь обязана соединять Object и Risk одной организации. `SELECT`, `INSERT` и
`DELETE` policies проверяют обе стороны через active-aware `current_org_id()`,
а роли записи сохраняют существующий RBAC.

`object_risks.organization_id` заполняется DB trigger и связан составными
foreign keys с `(objects.id, objects.organization_id)` и
`(risks.id, risks.organization_id)`. Поэтому конкурентная вставка связи и смена
tenant у родительской записи сериализуются PostgreSQL и не могут нарушить
invariant. Guard работает и для service-role/direct SQL, который обходит RLS.

```text
Object.organization_id == Risk.organization_id == current active tenant
```

Server Actions продолжают проверять tenant для безопасной пользовательской
ошибки, но не считаются единственной security boundary.

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

Migration 025 связывает `relations.organization_id` с обоими endpoint через
composite foreign keys к `(objects.id, objects.organization_id)`. DB constraint
действует для authenticated API, service role и direct SQL, а PostgreSQL FK
locking не позволяет конкурентной смене tenant нарушить invariant.

```sql
-- SELECT: все участники организации
CREATE POLICY "org_isolation" ON relations
  FOR SELECT USING (
    organization_id = current_org_id()
    AND source endpoint принадлежит current_org_id()
    AND target endpoint принадлежит current_org_id()
  );

-- INSERT/DELETE: owner, analyst
CREATE POLICY "write_allowed" ON relations
  FOR INSERT/DELETE USING/WITH CHECK (
    organization_id = current_org_id()
    AND оба endpoint принадлежат current_org_id()
    AND current_user_role() IN ('owner', 'analyst')
  );
```

Запрет self-relation и уникальность
`(source_object_id, target_object_id, relation_type)` сохраняются.

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
| `020_profile_privilege_boundaries.sql` | Запрет direct profile UPDATE, self/member RPC и атомарный audit |

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
