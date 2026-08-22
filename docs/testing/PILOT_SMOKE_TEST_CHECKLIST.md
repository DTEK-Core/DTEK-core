# Pilot Smoke Test Checklist

`Проект: DTEK Core`  
`Задача: S14-T004 — Smoke Test Automation Baseline`  
`Дата: 22.08.2026`  
`Тип: повторяемый release-candidate smoke baseline`  
`Статус: подготовлен; authenticated прогон фиксируется отдельно для каждого release candidate`

---

## 1. Назначение

Checklist проверяет кратчайший критический путь DTEK Core перед pilot handoff.
Он состоит из двух разных gates:

1. **Automated production HTTP smoke** — доступность public/auth routes,
   security headers, import templates, invalid invitation safe state и защита
   app routes от неавторизованного доступа.
2. **Authenticated manual smoke** — реальные Supabase Auth, organization
   context, Server Actions, RBAC/RLS и основные пользовательские сценарии.

Зелёный автоматический smoke не подтверждает регистрацию, запись в БД,
tenant isolation или права ролей. Эти пункты получают `PASS` только после
фактического browser-прогона.

---

## 2. Карточка Прогона

```text
Дата и время:
Среда: local / preview / pilot
Base URL:
Branch:
Commit:
Проверяющий:
Тестовая организация:
Owner email:
Viewer email:
Automated result: PASS / FAIL / BLOCKED
Authenticated result: PASS / FAIL / BLOCKED
Итог: PASS / FAIL / BLOCKED
Evidence:
Замечания:
```

Не записывайте пароли, invite token, cookies, Supabase keys и service role key
в checklist, screenshots, issue или terminal output.

---

## 3. Статусы И Stop Conditions

| Статус | Значение |
|---|---|
| `PASS` | Сценарий выполнен, ожидаемый результат и evidence подтверждены |
| `FAIL` | Есть воспроизводимое несоответствие |
| `BLOCKED` | Проверка невозможна из-за окружения, доступа или внешнего сервиса |
| `PENDING` | Проверка ещё не выполнялась |

Немедленно остановить handoff и установить `FAIL`, если:

- пользователь видит данные другой организации;
- viewer выполняет mutation;
- client/raw error раскрывает token, key, cookie, UUID другого tenant или stack;
- регистрация, login, создание организации или invitation полностью не работают;
- Objects/Risks import повреждает существующие данные;
- production build или automated smoke завершается ненулевым exit code.

---

## 4. Automated Production HTTP Smoke

### Локальный Release Candidate

Сначала создать production build, затем отдельной командой запустить smoke:

```bash
npm run build
npm run test:smoke
```

Runner сам запускает `next start` на `127.0.0.1:3210`, выполняет проверки и
останавливает дочерний процесс. Если порт занят:

```bash
SMOKE_PORT=3211 npm run test:smoke
```

### Preview Или Pilot URL

Remote mode выполняет только безопасные GET-запросы и не запускает локальный
server:

```bash
SMOKE_BASE_URL=https://preview.example.ru npm run test:smoke
```

Доступные настройки:

| Переменная | Default | Назначение |
|---|---:|---|
| `SMOKE_BASE_URL` | local server | Внешняя среда без trailing slash |
| `SMOKE_PORT` | `3210` | Порт локального `next start` |
| `SMOKE_STARTUP_TIMEOUT_MS` | `30000` | Максимальное ожидание server readiness |
| `SMOKE_REQUEST_TIMEOUT_MS` | `8000` | Timeout одного HTTP-запроса |
| `SMOKE_MAX_RESPONSE_MS` | `8000` | Максимально допустимое время ответа |

### Автоматический Контракт

Runner должен показать `18 passed, 0 failed`:

- landing, login, registration и password recovery возвращают ожидаемые pages;
- invalid `/invite/{token}` показывает безопасное состояние без redirect;
- CSV templates объектов и рисков доступны и соответствуют header contract;
- присутствуют `X-Frame-Options`, `X-Content-Type-Options` и CSP
  `frame-ancestors`;
- Dashboard, Objects, Risks, Graph, Configurator, Settings, Users, Executive
  Report, Risk CSV API и organization onboarding без cookie перенаправляются
  только на `/login`;
- каждый ответ укладывается в configured threshold;
- server завершается после PASS, FAIL, startup error и terminal signal.

Результат:

```text
Команда:
Passed:
Failed:
Максимальное время ответа:
Результат: PASS / FAIL / BLOCKED
Evidence:
```

---

## 5. Подготовка Authenticated Smoke

- [ ] Используется отдельная тестовая, не production-клиентская организация.
- [ ] Названия тестовых данных имеют префикс `SMOKE-<date>-`.
- [ ] Supabase project имеет статус Active.
- [ ] Environment Health Check не показывает `unavailable`.
- [ ] Подготовлены два отдельных browser profile: `owner` и `viewer`.
- [ ] Viewer создан штатным manual invite flow, а не отдельной регистрацией.
- [ ] Для import используются fixtures из `testing/demo-import/` либо
  `testing/sprint-11-import/partial-success/`.
- [ ] DevTools Console и Network открыты для фиксации raw/runtime errors.

---

## 6. Auth И Организация

| ID | Действие | Ожидаемый результат | Статус | Evidence |
|---|---|---|---|---|
| SM-AUTH-01 | Открыть `/register`, создать новый owner account | Нет raw error; auth user создаётся один раз |  |  |
| SM-AUTH-02 | Создать тестовую организацию | Созданы organization, owner profile и default config |  |  |
| SM-AUTH-03 | Завершить onboarding wizard | Переход в Dashboard; скрытые invitation не создаются |  |  |
| SM-AUTH-04 | Обновить страницу Dashboard | Session и organization context сохраняются |  |  |
| SM-AUTH-05 | Logout и повторный login | Сессия корректно завершается и создаётся заново |  |  |
| SM-AUTH-06 | Создать viewer invitation и принять в другом browser profile | Viewer попадает в ту же организацию и правильную роль |  |  |

Если новый account уже существует, используйте новую тестовую почту. Не
удаляйте auth users или organization через service role в рамках smoke.

---

## 7. Data Onboarding И Trust Passport

| ID | Действие | Ожидаемый результат | Статус | Evidence |
|---|---|---|---|---|
| SM-DATA-01 | Скачать objects CSV template | Файл открывается, header и UTF-8 корректны |  |  |
| SM-DATA-02 | Импортировать demo objects | Preview показывает source metadata; валидные строки создаются |  |  |
| SM-DATA-03 | Открыть Objects list и один объект | Tenant data отображается без дубликатов и raw errors |  |  |
| SM-DATA-04 | Открыть Trust Passport | Видны Trust Score, drivers, sources и history/empty state |  |  |
| SM-DATA-05 | Импортировать demo risks | Preview валиден; риски связываются с ожидаемыми объектами |  |  |
| SM-DATA-06 | Повторить тот же import до final confirmation | Duplicate warnings есть; неконтролируемая mutation не происходит |  |  |

Для расширенной проверки partial success используйте профильные Sprint 11
fixtures и [Data Onboarding Checklist](DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md).

---

## 8. Risk Workflow

| ID | Действие | Ожидаемый результат | Статус | Evidence |
|---|---|---|---|---|
| SM-RISK-01 | Открыть импортированный риск | Видны severity, status, source origin и linked object |  |  |
| SM-RISK-02 | Назначить owner и due date/SLA | Значения сохраняются, warning рассчитывается корректно |  |  |
| SM-RISK-03 | Добавить комментарий | Комментарий появляется один раз, без runtime error |  |  |
| SM-RISK-04 | Изменить status | Timeline показывает owner/date/comment/status по порядку |  |  |
| SM-RISK-05 | Обновить страницу | Workflow data не теряется и не дублируется |  |  |

Полная ролевая и edge-case проверка остаётся в
[Risk Workflow QA Checklist](RISK_WORKFLOW_QA_CHECKLIST.md).

---

## 9. Dashboard, Graph И Configurator

| ID | Действие | Ожидаемый результат | Статус | Evidence |
|---|---|---|---|---|
| SM-CORE-01 | Открыть Dashboard | KPI, explainability summary и risk data соответствуют tenant |  |  |
| SM-CORE-02 | Открыть Trust Graph | Узлы/связи либо корректный empty state; canvas не пуст из-за ошибки |  |  |
| SM-CORE-03 | Открыть Configurator | Веса загружаются и сумма равна 100% |  |  |
| SM-CORE-04 | Применить preset и сохранить | Разрешённая owner mutation завершается без зависания |  |  |
| SM-CORE-05 | Вернуть исходный preset | Тест не оставляет случайную конфигурацию |  |  |

---

## 10. Reports, Users И Settings

| ID | Действие | Ожидаемый результат | Статус | Evidence |
|---|---|---|---|---|
| SM-OPS-01 | Открыть Executive Organization Report | Report содержит фактические KPI и safe empty states |  |  |
| SM-OPS-02 | Скачать Risk Registry CSV | Файл скачивается, открывается и ограничен текущим tenant |  |  |
| SM-OPS-03 | Открыть Trust Passport print/PDF | Содержимое пригодно для печати, internal IDs отсутствуют |  |  |
| SM-OPS-04 | Открыть Users | Owner и viewer/invitation отображаются с правильными ролями |  |  |
| SM-OPS-05 | Открыть Settings/Profile | Профиль и organization context загружаются без ошибок |  |  |
| SM-OPS-06 | Открыть Audit Log | Owner видит invitation/risk/import/report events без sensitive metadata |  |  |

---

## 11. Минимальный RBAC/RLS Smoke

В отдельном viewer browser profile:

| ID | Действие | Ожидаемый результат | Статус | Evidence |
|---|---|---|---|---|
| SM-RBAC-01 | Открыть Dashboard, Objects, Risks, Graph, Passport | Read-only данные текущей организации доступны |  |  |
| SM-RBAC-02 | Проверить create/edit/import controls | Mutation controls отсутствуют или недоступны |  |  |
| SM-RBAC-03 | Открыть `/users` напрямую | Viewer не получает Users management |  |  |
| SM-RBAC-04 | Открыть `/settings` | Audit/health privileged controls недоступны |  |  |
| SM-RBAC-05 | Использовать известный ID объекта другого tenant | Данные не раскрываются; safe not-found/error state |  |  |

Полный four-role matrix и две организации проверяются по
[RBAC Testing Guide](RBAC_TESTING_GUIDE.md) и master release gate, а не
подменяются этим коротким smoke.

---

## 12. Mobile И Error Surface

Проверить минимум viewport `390 x 844`:

- [ ] App Shell открывает и закрывает navigation без overlap.
- [ ] Dashboard, Objects, Risks и Graph не имеют критичного horizontal overflow.
- [ ] Import dialog и validation preview доступны полностью.
- [ ] Risk drawer, comments и timeline прокручиваются.
- [ ] Invitation dialog и accept form не обрезают URL/actions.
- [ ] Report controls доступны, длинные значения не перекрывают соседний UI.
- [ ] Console не содержит unhandled exception или hydration error.
- [ ] Пользователь не видит raw Supabase object `{message, details, hint, code}`.

---

## 13. Cleanup

- [ ] Тестовый Configurator возвращён к исходному preset.
- [ ] Незавершённые invitation отозваны.
- [ ] Временные local downloads удалены при необходимости.
- [ ] Тестовые записи не находятся в tenant реального клиента.
- [ ] Dev server, watchers и log streams остановлены.
- [ ] Найденные defects оформлены по [Bug Report Template](BUG_REPORT_TEMPLATE.md).

Не удаляйте тестовую организацию перед сохранением evidence, если она нужна
для воспроизведения дефекта или последующего release recheck.

---

## 14. Итог

```text
Automated HTTP smoke: PASS / FAIL / BLOCKED
Authenticated critical path: PASS / FAIL / BLOCKED
RBAC/RLS minimum: PASS / FAIL / BLOCKED
Mobile/error surface: PASS / FAIL / BLOCKED
Open Blocker/Critical:
Итог: PASS / FAIL / BLOCKED
Проверяющий:
Дата:
Evidence:
```

Итоговый `PASS` этого checklist является evidence для gate G-07 в
[Pilot Readiness Checklist](PILOT_READINESS_CHECKLIST.md), но не закрывает
остальные gates Sprint 12–14.
