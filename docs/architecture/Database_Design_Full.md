# Database Design Full

`Проект: DTEK Core`
`Версия: 1.1`
`Дата: 12.08.2026`
`Статус: Актуальный`
`Заменяет: Database_Design.md (устарел)`
`СУБД: PostgreSQL 15 (Supabase)`
`Решение: ADR-005`

---

## 1. Принципы проектирования

- **Мультитенантность через RLS.** Каждая строка привязана к организации. Row Level Security гарантирует изоляцию данных между организациями.
- **UUID как первичные ключи.** Все идентификаторы — `uuid`, генерируются на сервере (`gen_random_uuid()`).
- **Временные метки в UTC.** Все поля дат — `timestamptz`.
- **Мягкое удаление не применяется в MVP.** Объекты архивируются через поле `status`, но не через `deleted_at`.
- **Перечисляемые значения — через CHECK.** Используются проверки `CHECK (value IN (...))` вместо PostgreSQL ENUM для упрощения миграций.
- **Cascade delete — осторожно.** Применяется только там, где дочерние записи теряют смысл без родительской.

---

## 2. Схема связей (ERD — описание)

```
auth.users (Supabase)
    └── profiles (1:1)
            └── organizations (N:1, через organization_id)

organizations (1:N)
    ├── profiles
    ├── objects
    ├── risks
    ├── relations
    ├── invitations
    └── trust_factor_config (1:1)

objects (1:N)
    ├── trust_passports (1:1)
    ├── trust_score_history
    └── object_risks (N:N через risks)

risks (N:N)
    └── object_risks
```

---

## 3. Таблицы

### 3.1 `profiles`

Профили пользователей системы. Расширяет встроенную таблицу `auth.users` Supabase.

```sql
CREATE TABLE profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
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
```

**Индексы:**
```sql
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(organization_id, role);
```

**Примечания:**
- `id` совпадает с `auth.users.id` — одна аутентификационная запись, один профиль.
- `organization_id` может быть NULL сразу после регистрации (до создания/присоединения к организации).
- `email` дублируется из `auth.users` для удобства запросов без JOIN.

---

### 3.2 `organizations`

Организации — основные тенанты системы.

```sql
CREATE TABLE organizations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,
    short_name      text,
    description     text,
    industry        text,
    size            text CHECK (size IN ('micro', 'small', 'medium', 'large', 'enterprise')),
    employee_count  integer CHECK (employee_count > 0),
    inn             text,
    region          text,
    plan            text NOT NULL DEFAULT 'free'
                    CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    trust_score     integer NOT NULL DEFAULT 70
                    CHECK (trust_score BETWEEN 0 AND 100),
    trust_level     text NOT NULL DEFAULT 'medium'
                    CHECK (trust_level IN ('critical', 'low', 'medium', 'good', 'high')),
    owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
```

**Индексы:**
```sql
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
```

**Примечания:**
- `trust_score` и `trust_level` — агрегированные показатели, пересчитываются при изменении объектов.
- `owner_id` указывает на пользователя с ролью `owner` в этой организации.
- `size` отражает размер организации: micro (<10), small (10–50), medium (50–250), large (250–1000), enterprise (1000+).

---

### 3.3 `objects`

Цифровые объекты организации — узлы графа доверия.

```sql
CREATE TABLE objects (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            text NOT NULL,
    type            text NOT NULL
                    CHECK (type IN (
                        'server', 'workstation', 'laptop', 'network',
                        'app', 'database', 'service',
                        'identity', 'ot', 'policy', 'other'
                    )),
    description     text,
    owner_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
    criticality     text NOT NULL DEFAULT 'medium'
                    CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
    status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'warning', 'risk', 'critical', 'archived')),
    ip_address      text,
    os_platform     text,
    segment         text,
    exposure        text CHECK (exposure IN ('internal', 'external', 'isolated')),
    trust_score     integer NOT NULL DEFAULT 70
                    CHECK (trust_score BETWEEN 0 AND 100),
    trust_level     text NOT NULL DEFAULT 'medium'
                    CHECK (trust_level IN ('critical', 'low', 'medium', 'good', 'high')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
```

**Индексы:**
```sql
CREATE INDEX idx_objects_organization_id ON objects(organization_id);
CREATE INDEX idx_objects_type ON objects(organization_id, type);
CREATE INDEX idx_objects_criticality ON objects(organization_id, criticality);
CREATE INDEX idx_objects_trust_score ON objects(organization_id, trust_score);
CREATE INDEX idx_objects_status ON objects(organization_id, status);
CREATE INDEX idx_objects_owner_id ON objects(owner_id);
```

**Типы объектов:**

| Ключ | Отображение | Категория |
|---|---|---|
| `server` | Сервер | Инфраструктура |
| `workstation` | Рабочая станция | Инфраструктура |
| `laptop` | Ноутбук | Инфраструктура |
| `network` | Сетевое устройство | Инфраструктура |
| `app` | Приложение | ПО и сервисы |
| `database` | База данных | ПО и сервисы |
| `service` | Облачный сервис | ПО и сервисы |
| `identity` | Учётная запись | Идентичности |
| `ot` | АСУ ТП / IoT | Технологический |
| `policy` | Политика / Документ | Управление |
| `other` | Прочее | — |

---

### 3.4 `trust_passports`

Цифровые паспорта доверия объектов. Связь один-к-одному с `objects`.

```sql
CREATE TABLE trust_passports (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id           uuid NOT NULL UNIQUE REFERENCES objects(id) ON DELETE CASCADE,
    organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Итоговая оценка
    trust_score         integer NOT NULL DEFAULT 70
                        CHECK (trust_score BETWEEN 0 AND 100),
    trust_level         text NOT NULL DEFAULT 'medium'
                        CHECK (trust_level IN ('critical', 'low', 'medium', 'good', 'high')),

    -- Факторные оценки (0–100 каждая)
    vuln_score          integer NOT NULL DEFAULT 70
                        CHECK (vuln_score BETWEEN 0 AND 100),
    config_score        integer NOT NULL DEFAULT 70
                        CHECK (config_score BETWEEN 0 AND 100),
    access_score        integer NOT NULL DEFAULT 70
                        CHECK (access_score BETWEEN 0 AND 100),
    network_score       integer NOT NULL DEFAULT 70
                        CHECK (network_score BETWEEN 0 AND 100),
    compliance_score    integer NOT NULL DEFAULT 70
                        CHECK (compliance_score BETWEEN 0 AND 100),
    incident_score      integer NOT NULL DEFAULT 70
                        CHECK (incident_score BETWEEN 0 AND 100),

    -- Агрегированные счётчики рисков
    risk_count          integer NOT NULL DEFAULT 0 CHECK (risk_count >= 0),
    open_risk_count     integer NOT NULL DEFAULT 0 CHECK (open_risk_count >= 0),
    critical_risk_count integer NOT NULL DEFAULT 0 CHECK (critical_risk_count >= 0),

    -- Связи в графе
    connection_count    integer NOT NULL DEFAULT 0 CHECK (connection_count >= 0),

    -- Полнота паспорта (0–100%)
    completeness_pct    integer NOT NULL DEFAULT 0
                        CHECK (completeness_pct BETWEEN 0 AND 100),

    -- Метаданные
    calculated_at       timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);
```

**Индексы:**
```sql
CREATE INDEX idx_trust_passports_object_id ON trust_passports(object_id);
CREATE INDEX idx_trust_passports_organization_id ON trust_passports(organization_id);
CREATE INDEX idx_trust_passports_trust_score ON trust_passports(organization_id, trust_score);
```

**Примечания:**
- Паспорт создаётся автоматически при создании объекта (через trigger или Edge Function).
- Паспорт обновляется только системой, пользователи не имеют прямого доступа на запись.
- `completeness_pct` рассчитывается по формуле из `Trust_Score_Model_v2.md`.

---

### 3.5 `risks`

Реестр рисков организации.

```sql
CREATE TABLE risks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           text NOT NULL,
    description     text,
    category        text NOT NULL DEFAULT 'other'
                    CHECK (category IN (
                        'vulnerability', 'configuration', 'access',
                        'network', 'compliance', 'incident', 'monitoring',
                        'organizational', 'physical', 'human', 'other'
                    )),
    severity        text NOT NULL
                    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    probability     text CHECK (probability IN ('low', 'medium', 'high')),
    cvss_score      numeric(3,1) CHECK (cvss_score BETWEEN 0 AND 10),
    status          text NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'mitigated', 'accepted', 'closed')),
    impact          text,
    author_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
    owner_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
    sla_days        integer CHECK (sla_days > 0),
    due_date        timestamptz,
    resolved_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
```

**Индексы:**
```sql
CREATE INDEX idx_risks_organization_id ON risks(organization_id);
CREATE INDEX idx_risks_severity ON risks(organization_id, severity);
CREATE INDEX idx_risks_status ON risks(organization_id, status);
CREATE INDEX idx_risks_category ON risks(organization_id, category);
CREATE INDEX idx_risks_author_id ON risks(author_id);
CREATE INDEX idx_risks_owner_id ON risks(owner_id);
CREATE INDEX idx_risks_due_date ON risks(due_date) WHERE due_date IS NOT NULL;
```

**Категории рисков и соответствие факторам Trust Score:**

| Категория | Ключ | Влияет на фактор |
|---|---|---|
| Уязвимость | `vulnerability` | `vuln` |
| Конфигурация | `configuration` | `config` |
| Доступы | `access` | `access` |
| Сетевая изоляция | `network` | `network` |
| Соответствие | `compliance` | `compliance` |
| Инцидент | `incident` | `incident` |
| Мониторинг | `monitoring` | `incident` |
| Организационный | `organizational` | все ÷ 6 |
| Физический | `physical` | все ÷ 6 |
| Человеческий фактор | `human` | все ÷ 6 |
| Прочее | `other` | все ÷ 6 |

---

### 3.6 `object_risks`

Связь объектов и рисков (многие-ко-многим). Один риск может относиться к нескольким объектам.

```sql
CREATE TABLE object_risks (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id   uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    risk_id     uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    linked_at   timestamptz NOT NULL DEFAULT now(),
    linked_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE (object_id, risk_id)
);
```

**Индексы:**
```sql
CREATE INDEX idx_object_risks_object_id ON object_risks(object_id);
CREATE INDEX idx_object_risks_risk_id ON object_risks(risk_id);
```

### 3.6.1 `risk_comments`

Immutable-комментарии Pilot Risk Workflow. `organization_id` обеспечивает
tenant isolation, `author_id` может стать `NULL` после удаления профиля, а body
ограничен 1–2000 символами после trim.

```sql
CREATE TABLE risk_comments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    risk_id         uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    author_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
    body            text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
    created_at      timestamptz NOT NULL DEFAULT now()
);
```

### 3.6.2 `risk_activity`

Immutable workflow timeline. Metadata хранит только безопасный before/after
display context и не содержит tenant/profile UUID или comment body.

```sql
CREATE TABLE risk_activity (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    risk_id         uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    actor_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
    event_type      text NOT NULL CHECK (event_type IN (
                        'owner_assigned', 'due_date_changed',
                        'status_changed', 'comment_added'
                    )),
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb
                    CHECK (jsonb_typeof(metadata) = 'object'),
    created_at      timestamptz NOT NULL DEFAULT now()
);
```

---

### 3.7 `relations`

Рёбра графа доверия — связи между объектами.

```sql
CREATE TABLE relations (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_object_id    uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    target_object_id    uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    relation_type       text NOT NULL
                        CHECK (relation_type IN (
                            'uses', 'depends_on', 'connected_to',
                            'managed_by', 'owns', 'interacts_with'
                        )),
    description         text,
    created_by          uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT no_self_relation CHECK (source_object_id != target_object_id),
    UNIQUE (source_object_id, target_object_id, relation_type)
);
```

**Индексы:**
```sql
CREATE INDEX idx_relations_organization_id ON relations(organization_id);
CREATE INDEX idx_relations_source ON relations(source_object_id);
CREATE INDEX idx_relations_target ON relations(target_object_id);
```

**Типы связей:**

| Ключ | Отображение (рус.) | Пример |
|---|---|---|
| `uses` | Использует | Сотрудник → Ноутбук |
| `depends_on` | Зависит от | Приложение → База данных |
| `connected_to` | Подключён к | Ноутбук → VPN |
| `managed_by` | Управляется | Сервер → Администратор |
| `owns` | Владеет | Организация → Сервер |
| `interacts_with` | Взаимодействует | Приложение → API |

---

### 3.8 `trust_score_history`

История изменений Trust Score для каждого объекта.

```sql
CREATE TABLE trust_score_history (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id       uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    old_score       integer CHECK (old_score BETWEEN 0 AND 100),
    new_score       integer NOT NULL CHECK (new_score BETWEEN 0 AND 100),
    -- Снапшот факторных оценок на момент изменения (JSON)
    factors_snapshot jsonb,
    reason          text,
    changed_by      text NOT NULL DEFAULT 'system',
    created_at      timestamptz NOT NULL DEFAULT now()
);
```

**Индексы:**
```sql
CREATE INDEX idx_trust_score_history_object_id ON trust_score_history(object_id);
CREATE INDEX idx_trust_score_history_organization_id ON trust_score_history(organization_id);
CREATE INDEX idx_trust_score_history_created_at ON trust_score_history(object_id, created_at DESC);
```

**Формат `factors_snapshot` (JSON):**
```json
{
    "vuln": 45,
    "config": 70,
    "access": 70,
    "network": 70,
    "compliance": 80,
    "incident": 70,
    "weights": {
        "vuln": 22,
        "config": 18,
        "access": 18,
        "network": 14,
        "compliance": 16,
        "incident": 12
    }
}
```

---

### 3.9 `trust_factor_config`

Настройки весов факторов Trust Score на уровне организации.

```sql
CREATE TABLE trust_factor_config (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    vuln_weight         integer NOT NULL DEFAULT 22 CHECK (vuln_weight BETWEEN 0 AND 100),
    config_weight       integer NOT NULL DEFAULT 18 CHECK (config_weight BETWEEN 0 AND 100),
    access_weight       integer NOT NULL DEFAULT 18 CHECK (access_weight BETWEEN 0 AND 100),
    network_weight      integer NOT NULL DEFAULT 14 CHECK (network_weight BETWEEN 0 AND 100),
    compliance_weight   integer NOT NULL DEFAULT 16 CHECK (compliance_weight BETWEEN 0 AND 100),
    incident_weight     integer NOT NULL DEFAULT 12 CHECK (incident_weight BETWEEN 0 AND 100),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    updated_by          uuid REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT weights_sum_100 CHECK (
        vuln_weight + config_weight + access_weight +
        network_weight + compliance_weight + incident_weight = 100
    )
);
```

**Индексы:**
```sql
CREATE INDEX idx_trust_factor_config_org ON trust_factor_config(organization_id);
```

**Примечания:**
- Запись создаётся автоматически при создании организации с весами по умолчанию.
- Constraint `weights_sum_100` гарантирует корректность весов на уровне БД.
- Изменение весов запускает пересчёт Trust Score всех объектов организации.

---

### 3.10 `invitations`

Приглашения пользователей в организацию.

```sql
CREATE TABLE invitations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           text NOT NULL,
    role            text NOT NULL
                    CHECK (role IN ('analyst', 'admin', 'viewer')),
    token           text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    invited_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
    status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at      timestamptz NOT NULL DEFAULT now() + interval '7 days',
    created_at      timestamptz NOT NULL DEFAULT now()
);
```

**Индексы:**
```sql
CREATE INDEX idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status) WHERE status = 'pending';
```

**Примечания:**
- Роль `owner` не может быть указана при приглашении — владелец назначается только при создании организации.
- Приглашение действительно 7 дней, после чего автоматически переходит в статус `expired`.
- Токен используется в ссылке приглашения: `/invite/<token>`.

---

## 4. Row Level Security (RLS)

Все таблицы защищены RLS. Пользователь видит только данные своей организации.

### 4.1 Вспомогательные функции

```sql
-- Возвращает organization_id текущего пользователя
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS uuid AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Возвращает роль текущего пользователя в его организации
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text AS $$
    SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### 4.2 Политики по таблицам

**`profiles`**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Просмотр: участники той же организации
CREATE POLICY "profiles_select" ON profiles FOR SELECT
    USING (organization_id = current_org_id());

-- Обновление: свой профиль или владелец организации
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
    USING (id = auth.uid() OR current_user_role() = 'owner');
```

**`organizations`**
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_select" ON organizations FOR SELECT
    USING (id = current_org_id());

CREATE POLICY "orgs_insert" ON organizations FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "orgs_update" ON organizations FOR UPDATE
    USING (id = current_org_id() AND current_user_role() = 'owner');

CREATE POLICY "orgs_delete" ON organizations FOR DELETE
    USING (id = current_org_id() AND current_user_role() = 'owner');
```

**`objects`**
```sql
ALTER TABLE objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "objects_select" ON objects FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "objects_insert" ON objects FOR INSERT
    WITH CHECK (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst', 'admin')
    );

CREATE POLICY "objects_update" ON objects FOR UPDATE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst', 'admin')
    );

CREATE POLICY "objects_delete" ON objects FOR DELETE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );
```

**`risks`**
```sql
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risks_select" ON risks FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "risks_insert" ON risks FOR INSERT
    WITH CHECK (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );

CREATE POLICY "risks_update" ON risks FOR UPDATE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );

CREATE POLICY "risks_delete" ON risks FOR DELETE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );
```

**`risk_comments`, `risk_activity`**
```sql
ALTER TABLE risk_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_activity ENABLE ROW LEVEL SECURITY;

-- Все роли читают только данные своей организации.
CREATE POLICY "risk_comments_select" ON risk_comments FOR SELECT
    USING (organization_id = current_org_id());
CREATE POLICY "risk_activity_select" ON risk_activity FOR SELECT
    USING (organization_id = current_org_id());

-- Все прямые user-client mutations запрещены; запись выполняют Server Actions.
CREATE POLICY "risk_comments_insert_deny" ON risk_comments FOR INSERT WITH CHECK (false);
CREATE POLICY "risk_comments_update_deny" ON risk_comments FOR UPDATE USING (false);
CREATE POLICY "risk_comments_delete_deny" ON risk_comments FOR DELETE USING (false);
CREATE POLICY "risk_activity_insert_deny" ON risk_activity FOR INSERT WITH CHECK (false);
CREATE POLICY "risk_activity_update_deny" ON risk_activity FOR UPDATE USING (false);
CREATE POLICY "risk_activity_delete_deny" ON risk_activity FOR DELETE USING (false);
```

**`security_events`**
```sql
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sec_events_select" ON security_events FOR SELECT
    TO authenticated
    USING (
        organization_id = current_org_id()
        AND current_user_role() IN ('owner', 'admin')
    );

-- Все mutations выполняются только server-side service client.
```

**`trust_passports`**
```sql
ALTER TABLE trust_passports ENABLE ROW LEVEL SECURITY;

-- Просмотр: все участники организации
CREATE POLICY "passports_select" ON trust_passports FOR SELECT
    USING (organization_id = current_org_id());

-- Запись: только через системные функции (Edge Functions)
-- Прямые INSERT/UPDATE/DELETE от пользователей запрещены
```

**`relations`**
```sql
ALTER TABLE relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "relations_select" ON relations FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "relations_insert" ON relations FOR INSERT
    WITH CHECK (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );

CREATE POLICY "relations_delete" ON relations FOR DELETE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );
```

**`trust_score_history`**
```sql
ALTER TABLE trust_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tsh_select" ON trust_score_history FOR SELECT
    USING (organization_id = current_org_id());
-- INSERT только через систему (Edge Functions)
```

**`trust_factor_config`**
```sql
ALTER TABLE trust_factor_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tfc_select" ON trust_factor_config FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "tfc_update" ON trust_factor_config FOR UPDATE
    USING (
        organization_id = current_org_id() AND
        current_user_role() IN ('owner', 'analyst')
    );
```

**`invitations`**
```sql
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_select" ON invitations FOR SELECT
    USING (organization_id = current_org_id());

CREATE POLICY "invitations_insert" ON invitations FOR INSERT
    WITH CHECK (
        organization_id = current_org_id() AND
        current_user_role() = 'owner'
    );
```

---

## 5. Автоматизация (Triggers)

### 5.1 Автоматическое создание паспорта при создании объекта

```sql
-- Trigger: создать trust_passport при INSERT в objects
CREATE OR REPLACE FUNCTION create_trust_passport()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trust_passports (object_id, organization_id)
    VALUES (NEW.id, NEW.organization_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_create_passport
    AFTER INSERT ON objects
    FOR EACH ROW EXECUTE FUNCTION create_trust_passport();
```

### 5.2 Обновление `updated_at`

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяется ко всем таблицам с полем updated_at
CREATE TRIGGER tr_objects_updated_at
    BEFORE UPDATE ON objects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Аналогично для: organizations, risks, trust_passports, trust_factor_config
```

### 5.3 Триггер пересчёта Trust Score

```sql
-- При изменении объекта, риска или связи — вызвать пересчёт через pg_notify
-- Фактический расчёт выполняется в Supabase Edge Function
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
```

---

## 6. Порядок миграций

При первичном развертывании таблицы создаются в следующем порядке (учитывает зависимости внешних ключей):

```
1. profiles                  (зависит от auth.users)
2. organizations             (зависит от profiles)
3. profiles (обновить FK)    (organization_id → organizations)
4. objects                   (зависит от organizations, profiles)
5. trust_passports           (зависит от objects, organizations)
6. trust_factor_config       (зависит от organizations)
7. risks                     (зависит от organizations, profiles)
8. object_risks              (зависит от objects, risks)
9. relations                 (зависит от organizations, objects)
10. trust_score_history      (зависит от objects, organizations)
11. invitations              (зависит от organizations, profiles)
```

---

## 7. Справочник перечисляемых значений

### Роли пользователей (`profiles.role`)
| Значение | Описание |
|---|---|
| `owner` | Владелец |
| `analyst` | Аналитик ИБ |
| `admin` | Администратор |
| `viewer` | Наблюдатель |

### Статусы пользователей (`profiles.status`)
| Значение | Описание |
|---|---|
| `active` | Активен |
| `invited` | Приглашён (не принял) |
| `blocked` | Заблокирован |

### Тарифные планы (`organizations.plan`)
| Значение | Описание |
|---|---|
| `free` | Бесплатный |
| `starter` | Стартовый |
| `professional` | Профессиональный |
| `enterprise` | Корпоративный |

### Типы объектов (`objects.type`)
| Значение | Отображение |
|---|---|
| `server` | Сервер |
| `workstation` | Рабочая станция |
| `laptop` | Ноутбук |
| `network` | Сетевое устройство |
| `app` | Приложение |
| `database` | База данных |
| `service` | Облачный сервис |
| `identity` | Учётная запись |
| `ot` | АСУ ТП / IoT |
| `policy` | Политика / Документ |
| `other` | Прочее |

### Критичность (`objects.criticality`)
| Значение | Отображение | База Trust Score |
|---|---|---|
| `low` | Низкая | 80 |
| `medium` | Средняя | 75 |
| `high` | Высокая | 70 |
| `critical` | Критичная | 65 |

### Статусы объектов (`objects.status`)
| Значение | Отображение |
|---|---|
| `active` | Активен |
| `warning` | Предупреждение |
| `risk` | Есть риски |
| `critical` | Критическое состояние |
| `archived` | Архивирован |

### Уровни доверия (`trust_score_level`)
| Диапазон | Значение | Отображение |
|---|---|---|
| 80–100 | `high` | Высокое |
| 60–79 | `good` | Достаточное |
| 40–59 | `medium` | Среднее |
| 20–39 | `low` | Низкое |
| 0–19 | `critical` | Критическое |

### Критичность рисков (`risks.severity`)
| Значение | Отображение | Штраф к фактору |
|---|---|---|
| `low` | Низкий | −5 |
| `medium` | Средний | −15 |
| `high` | Высокий | −25 |
| `critical` | Критический | −40 |

### Статусы рисков (`risks.status`)
| Значение | Отображение | Влияет на Trust Score |
|---|---|---|
| `open` | Открыт | ✓ |
| `in_progress` | В работе | ✓ |
| `mitigated` | Устранён | ✗ |
| `accepted` | Принят | ✗ |
| `closed` | Закрыт | ✗ |

### Типы связей (`relations.relation_type`)
| Значение | Отображение |
|---|---|
| `uses` | Использует |
| `depends_on` | Зависит от |
| `connected_to` | Подключён к |
| `managed_by` | Управляется |
| `owns` | Владеет |
| `interacts_with` | Взаимодействует |

---

## 8. Evidence-first Расширение

ADR-007 вводит целевую Evidence-first архитектуру, но текущая схема БД не должна изменяться без отдельной миграции.

Будущие таблицы для Discovery Layer, Connector Framework и Evidence Layer должны проектироваться отдельно и включать:

- `organization_id` для multi-tenant isolation;
- RLS-политики на каждую таблицу;
- source metadata;
- confidence;
- `collected_at` / `last_seen_at`;
- связь с objects, relations, risks и Trust Score factors;
- audit trail для import/sync действий;
- safe handling секретов коннекторов только server-side.

Потенциальные сущности будущей схемы:

- `data_sources`;
- `source_credentials` или безопасная ссылка на секреты;
- `evidence_records`;
- `normalized_evidence`;
- `discovery_candidates`;
- `object_source_coverage`;
- `auto_risk_candidates`;
- `connector_sync_runs`.
