# DEMO_SEED_PLAN.md — DTEK Core

`Sprint: S09-T003`  
`Статус: актуальный`  
`Дата: 09.07.2026`  
`Назначение: безопасный план наполнения demo organization`

---

## 1. Решение

Для Sprint 09 выбран безопасный MVP-подход:

> Demo data создаётся вручную через существующий UI DTEK Core и текущие Server Actions. SQL seed, admin-only seed action и service-role скрипты не добавляются в репозиторий на Sprint 09.

Причины:

- S09 — packaging sprint, а не feature sprint;
- текущий UI уже умеет создавать организации, объекты, риски, связи и веса;
- ручное наполнение 15 объектов, 12 рисков и 14 связей занимает приемлемое время;
- не нужно обходить RLS или использовать `service_role`;
- не появляются миграции, новые зависимости и seed-код, который может повлиять на production;
- автоматизация загрузки данных запланирована отдельно в Sprint 11 через CSV import.

---

## 2. Scope

### Входит

- порядок создания demo organization;
- порядок создания demo users;
- порядок создания объектов, рисков и связей;
- настройка отраслевого профиля весов;
- проверка Trust Score и Dashboard;
- правила безопасности demo data;
- acceptance checklist для demo readiness.

### Не входит

- SQL seed script;
- миграции;
- Supabase CLI seed;
- service-role automation;
- production data reset;
- CSV import;
- создание новых UI-экранов.

---

## 3. Demo Environment

Рекомендуемый контур:

| Контур | Назначение | Разрешено |
|---|---|---|
| Local dev | Первичная сборка demo data и проверка сценария | Да |
| Supabase development project | Демонстрации команде и подготовка demo org | Да |
| Production tenant | Только если выделен отдельный demo tenant и подтверждён owner | Осторожно |

### Правило

Demo data не должна смешиваться с реальными клиентскими организациями. Если используется общий Supabase project, demo organization должна быть явно отделена названием:

```text
АО "Северная Энергосеть" / DEMO
```

---

## 4. Source Documents

| Документ | Роль |
|---|---|
| [DEMO_NARRATIVE.md](DEMO_NARRATIVE.md) | Сценарий показа |
| [DEMO_DATASET_SPEC.md](DEMO_DATASET_SPEC.md) | Состав объектов, рисков, ролей и связей |
| [Trust_Score_Model_v2.md](../architecture/Trust_Score_Model_v2.md) | Расчёт Trust Score |
| [User_Roles.md](../architecture/User_Roles.md) | Роли и ограничения |
| [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md) | Security boundary |

---

## 5. Порядок Наполнения

### Шаг 1 — Создать Demo Owner

Создать пользователя:

```text
owner@demo.dtek.local
```

Если Supabase Auth не принимает `.local` или требуется реальное письмо, использовать контролируемый тестовый домен/alias владельца проекта. Реальные адреса сотрудников или клиентов не использовать.

Ожидаемый результат:

- пользователь создан;
- пользователь входит в приложение;
- профиль имеет роль `owner` после создания организации.

### Шаг 2 — Создать Demo Organization

Через `/onboarding/create` создать:

```text
АО "Северная Энергосеть" / DEMO
```

Заполнить:

- отрасль: энергетика / промышленная инфраструктура;
- регион: Северо-Западный федеральный округ;
- размер: 500–1500 сотрудников;
- описание: демо-организация для Market MVP сценария.

Ожидаемый результат:

- создана организация;
- owner привязан к организации;
- создана `trust_factor_config` с дефолтными весами.

### Шаг 3 — Настроить Trust Model

Через `/configurator` применить промышленный профиль:

| Factor | Weight |
|---|---:|
| `vuln` | 30 |
| `config` | 20 |
| `access` | 12 |
| `network` | 25 |
| `compliance` | 8 |
| `incident` | 5 |

Ожидаемый результат:

- сумма весов = 100;
- настройки сохранены;
- audit log фиксирует изменение весов.

### Шаг 4 — Создать Demo Users

Через `/users` создать приглашения:

| Email | Role |
|---|---|
| analyst@demo.dtek.local | `analyst` |
| admin@demo.dtek.local | `admin` |
| viewer@demo.dtek.local | `viewer` |

Если email delivery не используется, скопировать invite link из UI и пройти accept flow вручную.

Ожидаемый результат:

- в Users видны 4 роли;
- Role Info Card показывает права;
- demo можно показать с owner/analyst и отдельно проверить viewer read-only.

### Шаг 5 — Создать Demo Objects

Через `/objects` создать 15 объектов из [DEMO_DATASET_SPEC.md](DEMO_DATASET_SPEC.md).

Для каждого объекта заполнить:

- name;
- type;
- criticality;
- description;
- owner;
- ip/network identifier;
- platform, если применимо;
- segment;
- exposure.

Рекомендация: в description добавить demo code:

```text
Demo code: OBJ-001
```

Это нужно, потому что текущая схема не содержит отдельного `external_id`.

Ожидаемый результат:

- список объектов не пустой;
- карточки и таблица показывают разные типы и уровни критичности;
- Trust Passport автоматически доступен для каждого объекта.

### Шаг 6 — Создать Demo Risks

Через `/risks` создать 12 рисков из [DEMO_DATASET_SPEC.md](DEMO_DATASET_SPEC.md).

Для каждого риска заполнить:

- title;
- description;
- category;
- severity;
- probability;
- status;
- owner, если доступно;
- due date / SLA, если доступно;
- linked objects.

Рекомендация: в description добавить demo code:

```text
Demo code: RISK-001
```

Ожидаемый результат:

- риски покрывают все 6 факторов Trust Score;
- critical/high risks видны в Risk Registry;
- риски связаны с объектами;
- Trust Score объектов пересчитан через существующие Server Actions.

### Шаг 7 — Создать Trust Graph Relations

Через `/graph` создать связи из спецификации.

Использовать только допустимые `relation_type`:

- `uses`;
- `depends_on`;
- `connected_to`;
- `managed_by`;
- `owns`;
- `interacts_with`.

Ожидаемый результат:

- граф содержит 15 узлов;
- видна цепочка Contractor VPN Account -> VPN Gateway -> Firewall Cluster -> Historian DB / SCADA Core Server;
- боковая панель узла показывает Trust Score и связанные данные.

### Шаг 8 — Пересчитать Trust Score

Если после ручного наполнения оценки выглядят неактуальными:

- использовать существующее действие пересчёта на Dashboard, если доступно;
- либо изменить/сохранить вес в Configurator для запуска массового пересчёта;
- не обновлять `trust_score` вручную SQL-запросами.

Ожидаемый результат:

- org Trust Score в диапазоне 55–68;
- hero objects имеют ожидаемые low/medium trust ranges;
- Dashboard показывает top risky objects.

### Шаг 9 — Проверить Demo Walkthrough

Пройти сценарий из [DEMO_NARRATIVE.md](DEMO_NARRATIVE.md):

1. `/dashboard`
2. `/objects`
3. `/objects/[id]/passport`
4. `/risks`
5. `/graph`
6. `/configurator`
7. `/users`

Ожидаемый результат:

- нет пустых экранов;
- есть risk/story progression;
- demo занимает 10–15 минут;
- CISO narrative звучит связно.

---

## 6. Таблицы, Которые Будут Заполнены

| Таблица | Как заполняется |
|---|---|
| `profiles` | Через Supabase Auth / invite accept |
| `organizations` | Через onboarding create |
| `trust_factor_config` | Автоматически при создании org + Configurator update |
| `objects` | Через Objects UI |
| `trust_passports` | Автоматически при создании objects / пересчёте |
| `risks` | Через Risks UI |
| `object_risks` | Через link risk to object |
| `relations` | Через Graph UI |
| `trust_score_history` | Через Trust Score recalculation |
| `security_events` | Через audit helper при критичных действиях |
| `invitations` | Через Users invite flow |

---

## 7. Почему Не SQL Seed В Sprint 09

SQL seed выглядит быстрее, но несёт риски:

- может обойти Server Action validation;
- может создать данные без корректного audit trail;
- может нарушить expected recalculation flow;
- требует аккуратной работы с auth users;
- повышает риск случайного запуска не в том tenant/project;
- может закрепить demo data как production-like migration.

Для Sprint 09 важнее безопасный и повторяемый demo setup. Автоматизация будет уместна после появления CSV import в Sprint 11.

---

## 8. Безопасность

Запрещено:

- использовать реальные клиентские данные;
- коммитить `.env.local` или ключи Supabase;
- использовать service role key в клиентском коде;
- отключать RLS;
- править таблицы вручную для обхода RBAC;
- создавать demo users на реальные корпоративные email без разрешения.

Разрешено:

- использовать контролируемые тестовые email;
- использовать manual invite link;
- создавать demo data через UI;
- удалять demo organization вручную после показа, если она создана в shared environment.

---

## 9. Demo Reset Strategy

Для Sprint 09 reset выполняется вручную:

1. Создать новую demo organization с суффиксом даты, если нужна чистая демонстрация.
2. Старую demo organization не удалять до завершения проверки.
3. После подтверждения новой demo organization удалить старую только через безопасный approved flow.

Если безопасного удаления организации нет в UI, не удалять demo data вручную из БД без отдельной задачи.

---

## 10. Acceptance Criteria

S09-T003 считается выполненной, если:

- выбран способ наполнения demo data;
- описан порядок создания organization/users/objects/risks/relations;
- перечислены таблицы, которые будут заполнены;
- определены ограничения безопасности;
- определён reset strategy;
- план можно использовать для ручного demo setup;
- план не требует изменения архитектуры, миграций или новых зависимостей.

---

## 11. Передача В Следующие Задачи

### S09-T004

ICP/interview script должен опираться на demo story:

- энергетика / промышленность как основной demo vertical;
- CISO как основной buyer/user;
- интегратор как возможный channel.

### S09-T005

Product one-pager должен использовать:

- demo organization story;
- 14-дневный pilot offer;
- объекты, риски, Trust Score, Trust Graph как value chain.

### Sprint 11

CSV import должен использовать эту спецификацию как reference dataset:

- objects template;
- risks template;
- relation import future candidate;
- external demo codes (`OBJ-*`, `RISK-*`) как будущие import identifiers.
