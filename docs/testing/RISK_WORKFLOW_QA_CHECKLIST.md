# RISK_WORKFLOW_QA_CHECKLIST.md — DTEK Core

`Спринт: Sprint 13 — Pilot Risk Workflow`
`Задача: S13-T008 — Documentation & QA`
`Тип: ручная authenticated приёмка Risk Workflow`
`Дата: 12.08.2026`
`Статус: PENDING — ожидается ручной прогон`

---

## Назначение

Чеклист проверяет полный workflow ручных и импортированных рисков:

- назначение и снятие ответственного внутри текущей организации;
- явный срок, SLA и состояния `Просрочено`, `Скоро срок`, `В графике`;
- immutable comments и безопасные ошибки;
- manual/imported origin context без раскрытия внутренних metadata;
- newest-first activity timeline;
- security audit критичных изменений;
- пересчёт Trust Score связанных объектов;
- RBAC для owner, analyst, admin и viewer;
- RLS/multi-tenant isolation, empty/error и mobile states.

Автоматические проверки подтверждают типы и pure contracts, но не заменяют
authenticated UI, Supabase RLS и multi-role проверку. Не отмечайте checklist как
`PASS` без фактического прогона. Дефекты фиксируйте в [BUG_REPORT_TEMPLATE.md](BUG_REPORT_TEMPLATE.md).

---

## Статусы

| Статус | Значение |
|---|---|
| `PASS` | Фактический результат соответствует ожидаемому |
| `FAIL` | Найден функциональный, security или UX-дефект |
| `BLOCKED` | Проверка невозможна из-за окружения/Supabase |
| `N/A` | Сценарий неприменим, причина записана |

---

## Инженерный Baseline

| Проверка | Статус На Handoff | Ожидаемый результат |
|---|---|---|
| `npm run type-check` | `PASS` | TypeScript strict без ошибок |
| `npm run lint` | `PASS` | ESLint без warnings/errors |
| `npm run build` | `PASS` | Production build успешен |
| `npm run test:risk-workflow` | `PASS` | 9/9 workflow contracts |
| `npm run test:import` | `PASS` | 19/19 import regression contracts |
| `npm run test:trust-explainability` | `PASS` | 17/17 explainability regression contracts |
| `npm audit --audit-level=low` | `PASS` | 0 известных уязвимостей |

---

## Подготовка

### Тестовое Окружение

Используйте отдельную организацию без реальных клиентских данных:

```text
Организация:
Tenant B для isolation:
URL:
Commit:
Дата и время:
Проверяющий:
Desktop browser:
Mobile viewport/device:
```

Запустите приложение через `npm run dev`. Откройте Console и Network; постоянные
`fetch failed`, auth retry, raw Supabase errors и зависшие Server Actions
недопустимы.

### Роли

Создайте owner обычной регистрацией, а analyst/admin/viewer пригласите owner-ом
в эту же организацию. Не регистрируйте их отдельно через `/register`.
Используйте разные browser profiles. Полная инструкция:
[RBAC_TESTING_GUIDE.md](RBAC_TESTING_GUIDE.md).

### Тестовые Данные

| Данные | Назначение |
|---|---|
| Объект `S13-QA-SERVER-01` | Проверка связи и Trust Score |
| Риск `S13-QA-MANUAL-01` | Manual workflow |
| Риск `S13-QA-IMPORTED-01` | Origin после CSV/XLSX import |
| Риск `S13-QA-EMPTY-01` | Empty owner/due/comments/history |
| Tenant B и риск `S13-QA-TENANT-B` | Tenant isolation |

Для imported риска используйте актуальный Risk CSV template и source name
`S13 QA Vulnerability Scanner`. Не используйте прямые записи service role.

---

## Сводка Приёмки

| Блок | Статус | Замечания |
|---|---|---|
| Create / owner assignment |  |  |
| Due date / SLA warnings |  |  |
| Status / Trust Score |  |  |
| Comments |  |  |
| Manual/imported origin |  |  |
| Activity timeline |  |  |
| Security audit |  |  |
| RBAC |  |  |
| Tenant isolation |  |  |
| Empty/error/mobile |  |  |
| Regression |  |  |

---

## Блок 1 — Создание И Назначение

### TC-S13-001 — Manual Risk С Owner И Сроком

**Роль:** owner

1. Создайте `S13-QA-MANUAL-01` со статусом `open`, severity `high`.
2. Назначьте analyst ответственным.
3. Задайте явный срок через семь календарных дней.
4. Свяжите риск с `S13-QA-SERVER-01`.

Ожидаемый результат:

- [ ] Risk создаётся один раз без зависания и raw server error.
- [ ] В реестре видны owner, `Вручную` и SLA state.
- [ ] Drawer показывает analyst и выбранную дату.
- [ ] История содержит initial owner и due date events.
- [ ] В metadata/UI не отображаются внутренние profile/organization UUID.
- [ ] Связанный Trust Score пересчитан; несвязанный объект не изменён.

**Статус:**
**Замечания:**

### TC-S13-002 — Reassign И Unassign

**Роль:** analyst

1. Переназначьте owner риска с analyst на owner.
2. Сохраните ту же форму повторно без изменений.
3. Снимите ответственного.

Ожидаемый результат:

- [ ] Реестр и drawer отражают каждое фактическое изменение.
- [ ] Timeline показывает корректные display names до/после.
- [ ] No-op сохранение не добавляет дублирующее activity/audit event.
- [ ] После снятия отображается `Не назначен` / `Без ответственного`.
- [ ] Неактивный участник не доступен для нового назначения.

**Статус:**
**Замечания:**

---

## Блок 2 — Due Date И SLA

### TC-S13-003 — Явная Дата И SLA

**Роль:** owner или analyst

1. Откройте редактирование `S13-QA-MANUAL-01`.
2. Введите SLA `14`: поле явной даты должно очиститься.
3. Сохраните и проверьте вычисленный due date.
4. Затем задайте явную дату: поле SLA должно очиститься.
5. Снимите оба значения.

Ожидаемый результат:

- [ ] Одновременно сохраняется один источник срока.
- [ ] SLA вычисляет дату от текущей даты в календарных днях.
- [ ] Drawer и таблица показывают одинаковый срок.
- [ ] Timeline показывает даты/SLA до и после без UUID.
- [ ] Снятие срока даёт состояние `Не задан`.

**Статус:**
**Замечания:**

### TC-S13-004 — Warning States

Проверьте активные риски со сроком вчера, через 1–2 дня и через 7 дней.

- [ ] Прошедший срок: `Просрочено`.
- [ ] Остаток менее трёх дней: `Скоро срок`.
- [ ] Остаток три дня и более: `В графике`.
- [ ] Для `mitigated`, `accepted`, `closed`: `Завершено`, без overdue warning.
- [ ] Состояния стабильны после refresh и не имеют hydration warning.

**Статус:**
**Замечания:**

---

## Блок 3 — Status И Trust Score

### TC-S13-005 — Active → Resolved → Active

**Роль:** analyst

1. Зафиксируйте Trust Score связанного объекта при `open`.
2. Переведите риск в `in_progress`, затем `mitigated` и `closed`.
3. Верните в `open` для проверки обратного пути.

Ожидаемый результат:

- [ ] Optimistic status откатывается при server error и сохраняется при успехе.
- [ ] `open`/`in_progress` применяют penalty; resolved statuses снимают его.
- [ ] Trust Passport, Dashboard и Risk Impact не противоречат текущему status.
- [ ] Timeline содержит только фактические status transitions newest-first.
- [ ] Повторный выбор текущего статуса не создаёт событие.

**Статус:**
**Замечания:**

---

## Блок 4 — Comments И Timeline

### TC-S13-006 — Immutable Comments

**Роль:** owner и analyst

1. Добавьте комментарий `S13 QA: remediation started`.
2. Добавьте второй комментарий другим пользователем.
3. Попробуйте пустой текст и текст более 2000 символов.

Ожидаемый результат:

- [ ] Успешные комментарии появляются с автором и временем.
- [ ] Комментарии нельзя редактировать или удалять.
- [ ] Пустой текст не отправляется; UI ограничивает 2000 символов.
- [ ] При ошибке введённый текст сохраняется для повтора.
- [ ] Timeline получает `Комментарий добавлен`, но не копирует body в metadata.
- [ ] Console не показывает raw PostgREST object как Runtime Error.

**Статус:**
**Замечания:**

### TC-S13-007 — Timeline Ordering И Empty State

- [ ] События owner, due, status и comment отображаются newest-first.
- [ ] У каждого события есть actor, время, title и безопасный detail.
- [ ] Для удалённого участника используется нейтральный fallback.
- [ ] `S13-QA-EMPTY-01` показывает честный empty state.
- [ ] Старые действия не синтезируются задним числом.
- [ ] Неизвестные database event types не попадают в UI.

**Статус:**
**Замечания:**

---

## Блок 5 — Origin Context

### TC-S13-008 — Manual И Imported

1. Сравните `S13-QA-MANUAL-01` и импортированный `S13-QA-IMPORTED-01`.
2. Отредактируйте обычное описание imported риска и сохраните.

Ожидаемый результат:

- [ ] Реестр показывает `Вручную` и `Импорт` соответственно.
- [ ] Drawer imported риска показывает source name/type/date/confidence.
- [ ] UI честно сообщает, что source context не является Evidence-записью.
- [ ] `source_record_id` и trailing `[Import Source]` block не видны пользователю.
- [ ] Редактирование описания сохраняет source context.
- [ ] Confidence не изменяет Trust Score.

**Статус:**
**Замечания:**

---

## Блок 6 — Security Audit

### TC-S13-009 — Critical Workflow Events

**Роли:** owner выполняет изменения и проверяет Audit Log; admin только проверяет

1. Измените owner, due date/SLA и status риска.
2. Добавьте комментарий с контрольным секретоподобным текстом
   `DO-NOT-COPY-S13`.
3. Откройте `/settings` → «Журнал аудита» как owner и admin.

Ожидаемый результат:

- [ ] Есть `Ответственный по риску`, `Срок риска`, `Статус риска`.
- [ ] Показаны локализованные значения до/после.
- [ ] No-op и отклонённые операции не показаны как успешные.
- [ ] В audit metadata/UI нет UUID, description, import source и `DO-NOT-COPY-S13`.
- [ ] Analyst/viewer не видят Audit Log.
- [ ] Прямой authenticated SELECT к `security_events` отклонён для analyst/viewer RLS policy.
- [ ] Недоступность audit write не раскрывает raw error пользователю.

**Статус:**
**Замечания:**

---

## Блок 7 — RBAC И Tenant Isolation

### TC-S13-010 — Матрица Ролей

| Действие | owner | analyst | admin | viewer |
|---|:---:|:---:|:---:|:---:|
| Читать risks/comments/timeline | [ ] | [ ] | [ ] | [ ] |
| Создать/редактировать/удалить risk | [ ] | [ ] | deny | deny |
| Назначить owner и срок | [ ] | [ ] | deny | deny |
| Изменить status | [ ] | [ ] | deny | deny |
| Добавить comment | [ ] | [ ] | deny | deny |
| Привязать risk к object | [ ] | [ ] | deny | deny |
| Читать security audit | [ ] | deny | [ ] | deny |

Для denied действий проверьте и отсутствие UI, и отказ Server Action. Не
считайте скрытую кнопку достаточным подтверждением RBAC.

**Статус:**
**Замечания:**

### TC-S13-011 — Tenant Isolation

1. В Tenant B создайте `S13-QA-TENANT-B`.
2. Как пользователь Tenant A попытайтесь открыть/использовать ID риска, object,
   assignee, comment/activity и audit event Tenant B.

Ожидаемый результат:

- [ ] Tenant A не видит риск, comments, timeline и audit Tenant B.
- [ ] Нельзя назначить профиль или связать объект Tenant B.
- [ ] Server Actions возвращают безопасный `not found`/permission error.
- [ ] Ответ не раскрывает существование tenant data, SQL или stack trace.
- [ ] Данные Tenant B не изменились.

**Статус:**
**Замечания:**

---

## Блок 8 — Empty, Error, Mobile И Regression

### TC-S13-012 — Empty И Error States

- [ ] Риск без owner/due/comments/history отображается без broken layout.
- [ ] Риск без object показывает отсутствие impact и разрешённую link action.
- [ ] Потеря сети во время mutation показывает понятную ошибку без crash.
- [ ] Повтор после восстановления создаёт одну mutation/event.
- [ ] Refresh не дублирует comment/activity/audit.

**Статус:**
**Замечания:**

### TC-S13-013 — Responsive UI

Проверьте `/risks` на `1440×900`, `768×1024` и `390×844`.

- [ ] Таблица/список не создаёт неконтролируемый горизонтальный overflow.
- [ ] Owner, origin и SLA читаются и не перекрывают соседние значения.
- [ ] Drawer помещает title, actions, comments и timeline без overlap.
- [ ] Кнопки и поля доступны касанием; клавиатура не скрывает submit.
- [ ] Закрытие drawer возвращает фокус/контекст к реестру.

**Статус:**
**Замечания:**

### TC-S13-014 — Regression

- [ ] Risk CSV import/export работает.
- [ ] Связи risk-object не дублируются.
- [ ] Trust Passport и Dashboard загружаются без ошибок.
- [ ] Configurator пересчёт не ломает Risk Impact.
- [ ] Logout/login сохраняет записанный workflow.
- [ ] Основные Server Actions завершаются без долгих retry.

**Статус:**
**Замечания:**

---

## Журнал Замечаний

| ID | Test Case | Severity | Описание | Evidence | Статус |
|---|---|---|---|---|---|
| S13-QA- |  |  |  |  | Open |

## Итоговое Решение

```text
Manual QA: PENDING / PASS / FAIL / BLOCKED
Обязательные дефекты:
Остаточные ограничения:
Решение проверяющего:
Дата:
```

Sprint 13 получает ручной `PASS` только после заполнения всех обязательных
блоков, отсутствия Critical/High defects и подтверждения RBAC/RLS. До этого
статус checklist остаётся `PENDING`, даже если все автоматические проверки зелёные.
