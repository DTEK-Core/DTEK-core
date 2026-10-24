# DTEK Platform Roadmap

`Статус: актуальный`
`Дата: 24.10.2026`
`Горизонт: от Functional pre-pilot MVP до первого DTEK Platform MVP`

---

## 1. Точка Отсчёта

DTEK Core не начинается заново. Sprint 01–15 создали функциональное B2B-ядро:

- authentication, organizations, RBAC и RLS;
- Objects, Trust Passport, Trust Score и Trust Graph;
- Risk Registry и pilot risk workflow;
- Dashboard, Configurator и Audit Log;
- CSV/XLSX onboarding, exports и reports;
- evidence-backed explainability;
- Connector/Evidence/Discovery architecture specifications.

Текущая стадия: **DTEK Business Functional pre-pilot MVP**. Connector runtime,
Discovery Inbox, Home, Personal, DTEK Exposure и Knowledge Center не
реализованы.

Перед расширением обязателен
[Security & Stabilization Gate](../../tasks/SECURITY_STABILIZATION_GATE.md) со
статусом `PREPARED / NOT STARTED`. Он закрывает известные privilege,
blocked-user, tenant isolation, atomicity, generated types, DB RLS tests и
authenticated QA gaps. Gate не является Sprint и начинается только по отдельной
команде владельца.

---

## 2. Продуктовая Эволюция

```text
DTEK Core (implemented B2B foundation)
  -> DTEK Business
  -> shared Trust Core
  -> DTEK Home
  -> DTEK Personal + DTEK Exposure
  -> Knowledge & Remediation Center
  -> DTEK Platform MVP
```

Общий принцип:

```text
Authorized Sources
  -> Ingestion / Discovery
  -> Evidence / Findings
  -> Assets / Identities
  -> Trust Passport / Score / Graph
  -> Risks / Impact
  -> Recommendations / Remediation / Verification
```

Новые режимы используют общее ядро, но не смешивают данные, consent, роли или
Trust Score semantics. ADR-001 сохраняет Business score; Home и Personal
получают отдельные модели и не сравниваются с Business как единый рейтинг.

---

## 3. Последовательность

| Этап | Sprint | Результат |
|---|---:|---|
| Stabilize | Gate | Безопасный подтверждённый Business baseline |
| Generalize Core | 16–19 | Workspace, Evidence/Finding, Remediation и Assessment foundations |
| Business Evolution | 20–24 | Controlled discovery, findings, impact и Business MVP release |
| Home MVP | 25–27 | Home workspace, paired collector, device trust и рекомендации |
| Personal MVP | 28–31 | Consent, personal trust, exposure и bounded public intelligence |
| Shared Platform | 32–34 | Knowledge Center, continuous trust и unified governance |
| Platform Release | 35 | Независимый security/privacy/operations GO/NO-GO |

Полный task-level план: [SPRINT_ROADMAP.md](SPRINT_ROADMAP.md).

---

## 4. Milestones

### Foundation Ready — после Sprint 19

Пользователь ещё работает прежде всего в Business-режиме. Технически готовы
workspace boundary, evidence/finding semantics, recommendation/remediation
contract и безопасное исполнение bounded assessments. Home и Personal не
обещаются пользователю.

### Business MVP — после Sprint 24

Организация может подключить допущенный источник, подтвердить discovery,
увидеть evidence-backed findings, влияние через Trust Graph и вести remediation
до проверки результата. Release возможен только после Business security gate.

### Home MVP — после Sprint 27

Пользователь создаёт Home workspace, сопрягает локальный collector, видит свои
устройства, Home Trust Score и безопасные рекомендации. Произвольное облачное
сканирование и unattended general-purpose agent не входят в MVP.

### Personal MVP — после Sprint 31

Пользователь управляет подтверждёнными identifiers, Personal Trust Passport,
exposure history и рекомендациями. DTEK Exposure использует ограниченные
providers и публичные данные; people search, doxxing и раскрытие секретов
запрещены.

### DTEK Platform MVP — после Sprint 35

Business, Home и Personal работают через общий Trust Core, Knowledge Center и
единые governance controls. Итоговый release требует явного `GO`; документация
или наличие экранов не заменяют security/privacy/restore evidence.

---

## 5. MVP Boundaries

### Входит

- существующий DTEK Business и его безопасная эволюция;
- workspace isolation для Business/Home/Personal;
- Evidence, Finding, Risk и Remediation separation;
- один или ограниченный набор допущенных Business sources;
- paired Home collector с явным scope;
- verified Personal identifiers и breach/exposure providers;
- bounded domain, URL, hash и local metadata capabilities;
- Knowledge Center, history и notifications;
- security, privacy, rate limit, abuse, audit и deletion controls.

### Не Входит

- SIEM, EDR, DLP, SOAR или универсальный vulnerability scanner replacement;
- несанкционированное сканирование чужих сетей;
- people search, скрытый enrichment, doxxing или password disclosure;
- autonomous remediation;
- native mobile application;
- general-purpose endpoint/Home agent;
- marketplace, custom roles, SSO/SAML, on-prem/private cloud;
- массовое подключение vendors до admission evidence.

---

## 6. Phase Gates

| Gate | Когда | Минимальное evidence |
|---|---|---|
| Security & Stabilization | До Sprint 16 | Все blocking findings закрыты, DB/RLS/authenticated QA PASS |
| Foundation | После Sprint 19 | Two-workspace isolation, consent/scope, execution abuse tests |
| Business | После Sprint 24 | Connector/source admission, tenant tests, pilot E2E, rollback |
| Home | После Sprint 27 | Pairing, local scope, household privacy, resource/abuse tests |
| Personal | После Sprint 31 | Ownership, consent, minimization, provider/legal and deletion tests |
| Platform | Sprint 35 | Cross-mode isolation, pentest, privacy/legal, restore and incident rehearsal |

Ни один Gate нельзя отметить `PASS` на основании только документации.

---

## 7. Основные Риски

| Риск | Контроль в Roadmap |
|---|---|
| Разрушение текущей multi-tenant модели | Gate, Sprint 16, additive migration и rollback |
| Connector пишет прямо в business tables | ADR-009, Sprint 17 и 20 |
| SSRF/command injection/scanner abuse | Sprint 19, 20, 26, 31 и security gates |
| Home network overreach | Local paired collector, explicit subnet scope, Home gate |
| Personal/breach data leakage | Sprint 28–31 consent, minimization, retention и deletion |
| OSINT превращается в doxxing | Capability allowlist, ownership checks, rate limit, audit |
| Универсальный misleading Trust Score | Mode-specific models, evidence coverage и explainability |
| Слишком ранняя enterprise-разработка | Enterprise capabilities вынесены за Platform MVP |

---

## 8. Самокритика И Правила Сокращения

Roadmap из двадцати Sprint велик, но описывает четыре продукта и общий security
core. Это не обязательство реализовать всё без повторной проверки гипотез.

- Sprint 16–19 нельзя сокращать за счёт security boundaries.
- Sprint 20–24 подтверждает, что shared core полезен в уже существующем рынке.
- Home и Personal имеют отдельные admission gates; слабая гипотеза может быть
  остановлена без разрушения Business.
- Sprint 32 можно начать раньше только для уже подтверждённых findings; нельзя
  наполнять Knowledge Center непроверенным массовым контентом.
- Sprint 33–34 допустимо объединить после реализации трёх режимов, если scope
  останется ограниченным.
- Mobile apps, broad agents, enterprise deployment и gamification остаются
  привлекательными, но необязательными идеями.

---

## 9. Следующий Шаг

После следующей явной команды владельца открыть
[`tasks/SECURITY_STABILIZATION_GATE.md`](../../tasks/SECURITY_STABILIZATION_GATE.md),
сверить только изменившиеся после аудита файлы и выполнить **SEC-01 — Profile
Privilege Boundary**, начиная с fresh linked Supabase migration parity check.

Sprint 16 и любая новая продуктовая функциональность до закрытия Gate не
начинаются.
