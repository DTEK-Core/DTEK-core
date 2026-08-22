# PILOT_DOCUMENTATION_PACK.md — DTEK Core

`Версия: 1.0`  
`Дата: 22.08.2026`  
`Статус: комплект подготовлен; выдача внешнего доступа зависит от Pilot GO`  
`Задача: S14-T008`  
`Владелец: Pilot Lead / Release Owner`

---

## 1. Назначение

Этот документ — единая точка входа в материалы пилота DTEK Core. Он помогает:

- pilot team понять цель, границы и порядок работы;
- участникам клиента безопасно получить доступ и начать работу;
- внутренней команде подготовить окружение, сопровождать пилот и реагировать на
  инциденты;
- собрать измеримую обратную связь и корректно завершить пилот.

Документ не заменяет release approval. Ссылка на пакет передаётся внешним
участникам только после решения `GO` или допустимого `CONDITIONAL GO` по
[Pilot Readiness Checklist](../testing/PILOT_READINESS_CHECKLIST.md).

---

## 2. Аудитории И Уровни Доступа

| Аудитория | Что Получает | Что Не Передаётся |
|---|---|---|
| Sponsor / CISO | цель, scope, ожидаемые результаты, метрики, итоговые отчёты | внутренние incident logs, конфигурация и recovery procedure |
| Pilot Owner клиента | весь клиентский пакет, onboarding, роли, импорт, support и feedback flow | секреты окружения, service credentials, внутренние security evidence |
| Analyst / Admin / Viewer | руководство пользователя и инструкции своей роли | внутренние release и operations runbook |
| DTEK Core Pilot Lead | клиентский и внутренний разделы, scorecard, cadence и журнал решений | production secrets в документации |
| Release / Security / Operations | readiness, smoke, backup, monitoring и incident materials | customer dataset вне согласованной need-to-know области |

Внешнему участнику нельзя отправлять весь репозиторий или внутреннюю папку
`docs/`. Pilot Lead формирует разрешённый набор ссылок из раздела 5 и проверяет
их доступность для конкретного канала доставки.

---

## 3. Карточка Запуска Пилота

Карточка заполняется для каждого pilot candidate до выдачи доступа. Секреты,
пароли, invitation token и персональные данные сверх необходимого здесь не
хранятся.

```text
Pilot ID:
Организация:
Pilot URL:
Период: с ____ по ____
Timezone / рабочее окно:

Sponsor клиента:
Pilot Owner клиента:
Data Owner клиента:
Security contact клиента:

DTEK Core Pilot Lead:
Release Owner:
Support Owner:
Incident Commander:
Security Reviewer:

Основной support channel:
Резервный escalation channel:
Support hours:
Целевое время первой реакции:

Release candidate / commit:
Readiness decision: PENDING / GO / CONDITIONAL GO / NO-GO
Условия Conditional GO:
Срок хранения pilot data:
Дата review / удаления pilot data:
```

Если контакты, support channel, срок хранения данных или readiness decision не
заполнены, доступ внешним участникам не выдаётся.

---

## 4. Порядок Запуска

### Этап 0 — Qualification

1. Согласовать ICP, проблему, sponsor, dataset и критерии успеха.
2. Зафиксировать scope и non-scope по [Pilot Offer](../product/PILOT_OFFER.md).
3. Создать карточку пилота и kickoff baseline в
   [Pilot Metrics & Feedback Loop](../product/PILOT_METRICS_FEEDBACK_LOOP.md).
4. Согласовать допустимые данные, срок хранения и способ удаления.

### Этап 1 — Release Gate

1. Выполнить все обязательные gates
   [Pilot Readiness Checklist](../testing/PILOT_READINESS_CHECKLIST.md).
2. Зафиксировать release candidate и evidence.
3. Получить решение `GO` или допустимый `CONDITIONAL GO`.
4. Не выдавать доступ при `PENDING`, `NO-GO`, Blocker/Critical, нарушении tenant
   isolation, непроверенном restore или незавершённом authenticated QA.

### Этап 2 — Доступ И Onboarding

1. Owner создаёт invitation для конкретного email и роли.
2. Owner передаёт ссылку адресату через согласованный доверенный канал.
3. Адресат открывает ссылку, входит или регистрируется с тем же email и
   принимает приглашение.
4. Pilot Owner проверяет membership и корректную роль.
5. Команда проходит короткий walkthrough по разделу 5.

### Этап 3 — Data Intake И Работа

1. Data Owner готовит минимальный согласованный dataset без секретов.
2. Owner или Analyst импортирует Objects, затем Risks через preview.
3. Команда проверяет цифровую модель, Trust Passport, Score и Graph.
4. Риски получают owner, due date/SLA и рабочие комментарии.
5. Sponsor получает Executive Report, а рабочая команда — согласованные
   exports.

### Этап 4 — Feedback И Closeout

1. Pilot Lead проводит midpoint и final sessions по утверждённому cadence.
2. Source requests фиксируются в Source Inventory без обещания коннектора.
3. Итог классифицируется по evidence, usage, value и commercial commitment.
4. Доступ, invitations, retention и удаление данных обрабатываются по разделу
   9.

---

## 5. Клиентский Пакет

### 5.1. Начать Работу

| Материал | Для Кого | Назначение |
|---|---|---|
| [Pilot Offer](../product/PILOT_OFFER.md) | Sponsor, Pilot Owner | scope, план, результаты и ограничения пилота |
| [Руководство пользователя](../user/USER_GUIDE.md) | Все участники | продукт, навигация и первый рабочий сценарий |
| [Рабочий процесс платформы](../user/PLATFORM_WORKFLOW.md) | Pilot Owner, Analyst | последовательность от организации до аналитики |
| [FAQ](../user/FAQ.md) | Все участники | ответы на типовые продуктовые и технические вопросы |

### 5.2. Доступ И Роли

Текущий Commercial MVP использует четыре роли:

| Роль | Назначение В Пилоте | Ключевое Ограничение |
|---|---|---|
| `owner` | владелец tenant, invitations, организация, все данные и отчёты | единственный owner; роль нельзя выдать invitation |
| `analyst` | основной рабочий пользователь Objects, Risks, Graph и Configurator | не управляет организацией и командой |
| `admin` | инфраструктурные Objects, health check и ограниченное управление командой | не создаёт invitations и не управляет Risks |
| `viewer` | read-only review Dashboard, Objects, Passports, Risks и Graph | не изменяет данные |

Полная матрица: [RBAC Model](../security/RBAC_MODEL.md). Invitation создаёт
только `owner`; email provider в MVP отсутствует. Поддержанный поток и
безопасная передача ссылки описаны в
[Invitation Delivery Runbook](../operations/INVITATION_DELIVERY_RUNBOOK.md).

### 5.3. Data Onboarding

| Материал | Назначение |
|---|---|
| [Import Guide](../user/IMPORT_GUIDE.md) | CSV/XLSX, templates, preview, validation, duplicates и source metadata |
| `/objects/template.csv` | актуальный CSV-шаблон Objects из приложения |
| `/risks/template.csv` | актуальный CSV-шаблон Risks из приложения |
| [Object Model Guide](../user/OBJECT_MODEL_GUIDE.md) | типы, критичность и атрибуты объектов |

Порядок: сначала Objects, затем Risks. Preview не создаёт записи. Импорт
create-only: он не выполняет массовый update/merge и не предоставляет rollback
всего файла.

### 5.4. Аналитика И Рабочий Процесс

| Материал | Назначение |
|---|---|
| [Trust Score Guide](../user/TRUST_SCORE_GUIDE.md) | формула, факторы, источники и объяснение изменений |
| [Risk Registry Guide](../user/RISK_REGISTRY_GUIDE.md) | owner, SLA, comments, origin, timeline и статусы риска |
| [Configurator Guide](../user/CONFIGURATOR_GUIDE.md) | отраслевой preset и веса Trust Score |
| [Reports & Export Guide](../user/REPORTS_AND_EXPORT_GUIDE.md) | Trust Passport PDF, Risk CSV и Executive Report |

Trust Graph в текущем MVP уточняется вручную. Автоматическое discovery и
connector runtime относятся к Post-MVP.

### 5.5. Обратная Связь

Pilot Lead, а не каждый участник отдельно, ведёт canonical scorecard:

- kickoff: исходное состояние, dataset и источники;
- midpoint: usage, blockers, понятность Score и workflow;
- final: value, outcome, commercial commitment и next step;
- +7 дней: подтверждение решения и backlog evidence.

Порядок, вопросы и шаблоны находятся в
[Pilot Metrics & Feedback Loop](../product/PILOT_METRICS_FEEDBACK_LOOP.md).

---

## 6. Известные Ограничения Commercial MVP

Ограничения сообщаются до kickoff и не маскируются как дефекты:

- данные поступают через manual input и CSV/XLSX import; production connectors
  отсутствуют;
- import работает по create-only модели без массового update/merge и file-level
  rollback;
- source metadata пока является контекстом импорта, а не отдельной Evidence
  Layer model;
- Trust Graph строится вручную, automatic discovery отсутствует;
- Trust Passport PDF сохраняется средствами browser print;
- invitation link передаётся вручную, автоматической email delivery нет;
- authenticated multi-role и multi-tenant проверки выполняются вручную по
  release checklists;
- Risk Activity не выполняет backfill действий, совершённых до появления
  timeline.

Актуальный технический источник:
[Technical Debt](../architecture/TECHNICAL_DEBT.md). Любое новое ограничение,
обнаруженное во время пилота, регистрируется как defect, question или backlog
evidence; оно не исправляется скрыто внутри pilot dataset.

---

## 7. Support И Сообщение О Проблеме

### Что Делает Пользователь

1. Повторяет действие один раз без многократных retry.
2. Записывает время и timezone, страницу, роль и ожидаемый результат.
3. Делает screenshot без token, cookies, ключей и лишних данных клиента.
4. Передаёт информацию через support channel из карточки пилота.

Запрещено отправлять пароль, invitation token, access/refresh token,
Supabase/Vercel keys, `.env`, cookies, SQL dump или полный customer dataset.

### Что Фиксирует Support Owner

- Pilot ID и время;
- route/module и роль;
- reproduction steps;
- expected/actual result;
- безопасный screenshot или request correlation context;
- severity, workaround, owner и срок;
- влияние на scorecard и readiness decision.

Шаблон: [Bug Report Template](../testing/BUG_REPORT_TEMPLATE.md).

### Escalation

| Ситуация | Действие |
|---|---|
| Подозрение на утечку, cross-tenant access или неверный RBAC | немедленно остановить сценарий, уведомить Incident Commander и Security Reviewer |
| Login, organization или критический Server Action недоступен | уведомить Support Owner; выполнить environment triage |
| Data integrity или restore concern | остановить mutations и передать Operations / Release Owner |
| UX-вопрос с обходным путём | зарегистрировать как Minor/Question и продолжить по согласованию Pilot Lead |

Внутренняя severity и triage procedure:
[Monitoring & Error Handling Plan](../operations/MONITORING_ERROR_HANDLING_PLAN.md).

---

## 8. Внутренний Operations Pack

Этот раздел предназначен для DTEK Core team и не рассылается внешним
участникам как единый пакет.

| Область | Канонический Документ | Обязательный Результат До Access |
|---|---|---|
| Release control | [Pilot Readiness Checklist](../testing/PILOT_READINESS_CHECKLIST.md) | подписанное решение и evidence по gates |
| Critical path | [Pilot Smoke Test Checklist](../testing/PILOT_SMOKE_TEST_CHECKLIST.md) | automated и authenticated RC runs |
| Explainability | [Explainability QA](../testing/EXPLAINABILITY_QA_CHECKLIST.md) | authenticated Sprint 12 gate |
| Risk workflow | [Risk Workflow QA](../testing/RISK_WORKFLOW_QA_CHECKLIST.md) | authenticated Sprint 13 multi-role gate |
| RBAC/RLS | [RBAC Testing Guide](../testing/RBAC_TESTING_GUIDE.md) | роли и tenant isolation подтверждены |
| Environment | [Environment Health Runbook](../operations/ENVIRONMENT_HEALTH_RUNBOOK.md) | env/Auth/DB/RLS health подтверждён |
| Invitation | [Invitation Delivery Runbook](../operations/INVITATION_DELIVERY_RUNBOOK.md) | delivery и acceptance E2E подтверждены |
| Recovery | [Backup & Restore Runbook](../operations/BACKUP_RESTORE_RUNBOOK.md) | backup state, RPO/RTO и restore rehearsal подтверждены |
| Monitoring | [Monitoring & Error Handling Plan](../operations/MONITORING_ERROR_HANDLING_PLAN.md) | owners, alerts и P1 rehearsal подтверждены |
| Measurement | [Pilot Metrics & Feedback Loop](../product/PILOT_METRICS_FEEDBACK_LOOP.md) | kickoff card, scorecard и source inventory готовы |

Environment values, credentials и customer evidence хранятся только в
утверждённых защищённых системах, не в Markdown, issue comments или Git.

---

## 9. Завершение Пилота

### Product И Commercial Closeout

- [ ] Final sponsor interview проведён.
- [ ] Scorecard заполнен evidence, а не предположениями.
- [ ] Outcome и commercial next step зафиксированы.
- [ ] Source requests имеют demand/feasibility scores.
- [ ] Product gaps переданы в backlog без автоматического обещания срока.
- [ ] Итоговый Executive Report передан согласованным получателям.

### Access И Data Closeout

- [ ] Неиспользованные invitation отозваны.
- [ ] Решение по memberships и pilot environment зафиксировано.
- [ ] Экспорты и временные локальные файлы обработаны по согласованной политике.
- [ ] Pilot data удалены или сохранены до утверждённой даты.
- [ ] Удаление/retention подтверждено Data Owner и Pilot Lead.
- [ ] Incident/defect evidence очищено от лишних customer data.

### Internal Handoff

- [ ] Открытые defects имеют severity, owner, срок и workaround.
- [ ] Архитектурные изменения направлены в ADR process.
- [ ] Connector candidates прошли product, security и feasibility gates.
- [ ] Cross-pilot synthesis обновлён обезличенно.
- [ ] Решение о следующем этапе подтверждено sponsor и DTEK Core owner.

---

## 10. Release Gate S14-T008

### Реализовано В Задаче

- [x] Есть единая точка входа для pilot team и внутреннего сопровождения.
- [x] Клиентские и внутренние operations materials разделены.
- [x] Описаны access, onboarding, data intake, support, feedback и closeout.
- [x] Зафиксированы известные ограничения Commercial MVP.
- [x] Все материалы Sprint 14 связаны в последовательный launch workflow.

### Требует Фактического Выполнения Для Каждого Пилота

- [ ] Карточка запуска заполнена реальными владельцами и каналами.
- [ ] Внешний пакет проверен на доступность и отсутствие internal-only данных.
- [ ] Release gates получили фактический `PASS` и подписанное решение.
- [ ] Участники получили актуальные ссылки и прошли kickoff walkthrough.
- [ ] Closeout и data retention выполнены по фактическому завершению.

Статус S14-T008 означает готовность структуры документационного пакета, а не
автоматическую готовность конкретного release candidate или pilot tenant.

---

## 11. Контроль Актуальности

Pilot Lead проверяет пакет:

- перед qualification нового пилота;
- после изменения route, RBAC, import/report workflow или known limitation;
- после изменения release/operations procedure;
- перед финальной выдачей внешних ссылок.

При конфликте источников приоритет имеют ADR, текущий Sprint, security/RBAC
документы и фактическое поведение release candidate. Несоответствие блокирует
выдачу инструкции до исправления.

---

## 12. Связанные Документы

- [Sprint 14](../../tasks/SPRINT_14.md) — план Pilot Readiness.
- [Documentation Index](../../DOCUMENTATION_INDEX.md) — полный каталог проекта.
- [MVP Scope](../product/MVP_Scope.md) — границы Commercial MVP и Post-MVP.
- [Security Overview](../security/SECURITY_OVERVIEW.md) — security baseline.
- [Deployment](../operations/DEPLOYMENT.md) — deployment и environment contract.

