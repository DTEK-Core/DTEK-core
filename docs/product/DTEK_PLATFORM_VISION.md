# DTEK Platform Vision

`Статус: стратегическая концепция / implementation not started`
`Дата: 24.10.2026`
`Текущий продукт: Functional pre-pilot DTEK Core`
`Целевой продукт: DTEK — Cybersecurity & Digital Trust Platform`

---

## 1. Эволюция, А Не Перезапуск

DTEK Platform развивается поверх существующего DTEK Core. Auth,
organizations, Objects, Trust Passport, Trust Score, Trust Graph, Risk Registry,
Configurator, import/export, reporting, explainability, Dashboard и design
system остаются ценными production assets.

Новая концепция не означает новый frontend, backend, database или framework.
Стек Next.js, TypeScript, Supabase, PostgreSQL, RLS и текущий Business workflow
сохраняется и расширяется контролируемыми migrations и совместимыми contracts.

---

## 2. Platform Promise

**DTEK помогает человеку или команде понять, чему в их цифровой среде можно
доверять, почему, что изменилось и какое действие снизит риск сильнее всего.**

Единая смысловая цепочка:

```text
Assets / Identities
  -> Evidence
  -> Findings
  -> Risks
  -> Trust Passport
  -> Trust Score
  -> Trust Graph
  -> Recommendations / Remediation
```

Trust Core интерпретирует подтверждённые данные. DTEK не становится случайным
набором scanners, OSINT utilities или security dashboards.

---

## 3. Product Family

### DTEK Business

Эволюция текущего DTEK Core для организаций. Business связывает
инфраструктурные assets, evidence, findings и risks с Trust Passport, Trust
Graph, impact analysis и remediation priorities.

Текущий Core уже реализует ручной/import-driven фундамент. Будущее развитие:
safe discovery, connectors, vulnerability/configuration findings, dependency
analysis, single points of failure и проверяемое remediation.

### DTEK Home

Защищённый workspace домашней сети: router, computers, phones, IoT, cameras,
NAS и неизвестные устройства. Home показывает Device Passport, network
findings, понятные рекомендации и Home Trust Score.

Home discovery допускается только внутри подтверждённой локальной сети
владельца через paired collector с явно заданным scope. Облачный DTEK не
сканирует произвольные адреса от имени пользователя.

### DTEK Personal

Приватный workspace цифровой идентичности пользователя: собственные accounts,
identifiers, devices, exposure evidence, Personal Trust Passport, Personal
Trust Score и рекомендации.

Personal строится на явном consent, ownership verification, data minimization,
коротком retention и праве удаления. Чужие identifiers и скрытые секреты не
являются допустимым объектом поиска.

### DTEK Knowledge

Общий Remediation Center для Business, Home и Personal:

```text
Что обнаружено
  -> Почему это опасно
  -> Что затронуто
  -> Как безопасно проверить
  -> Как исправить
  -> Как подтвердить исправление
```

Knowledge content связывается с finding type, platform/mode, severity,
recommendation и verification evidence. Он не заменяет профессиональную
экспертизу и не публикует offensive exploit instructions.

### DTEK Exposure

Пользовательское имя capability внутри Personal и Business для легального
анализа собственной публичной цифровой экспозиции. В интерфейсе используется
понятный термин **Digital Footprint**, а `OSINT` остаётся внутренним техническим
классом источников.

---

## 4. Shared Trust Core

Общими для всех режимов являются contracts, а не обязательно одинаковые UI или
формулы:

- tenant/workspace isolation;
- Asset и Identity references;
- Evidence provenance and freshness;
- Finding lifecycle;
- Risk interpretation;
- versioned Trust Passport and scoring framework;
- Trust Graph relation contract;
- Recommendation/Remediation lifecycle;
- audit, consent, scope и safe errors.

Business, Home и Personal используют разные versioned score models. Их оценки
не сравниваются напрямую, а текущая Business formula ADR-001 не изменяется без
отдельного решения и migration plan.

---

## 5. Что Автоматизируется

Платформа постепенно автоматизирует:

- ingestion и обнаружение assets/identities;
- normalization, deduplication и freshness;
- evidence-backed finding candidates;
- relation candidates и изменение topology;
- priority/impact hints;
- повторную проверку после remediation;
- change summaries и новые exposure alerts.

Пользователь сохраняет контроль над:

- scan/connector scope и consent;
- merge/identity conflicts;
- business criticality и manual context;
- принятием неоднозначных findings/risks;
- manual overrides;
- remediation decision и verification;
- retention и удалением Personal data.

---

## 6. Retention Без Геймификации

Возврат пользователя создают полезные изменения, а не artificial engagement:

- «что изменилось с прошлой проверки»;
- новые устройства, findings и exposures;
- Trust Score trend с evidence explanation;
- remediation progress и verification result;
- weekly security summary;
- уведомления только по meaningful change;
- короткие contextual learning cards;
- optional security routine/streak без штрафов и публичного рейтинга.

---

## 7. Product Boundaries

DTEK Platform не является:

- публичным сервисом несанкционированного network scanning;
- doxxing/people-search сервисом;
- breach database с выдачей raw leaked secrets;
- SIEM, EDR/XDR, DLP или exploit framework;
- универсальным vulnerability scanner на первом этапе;
- CMDB или тяжёлой GRC-системой;
- набором несвязанных security utilities.

Любой новый capability должен отвечать минимум на один вопрос Trust Core:

1. Что является объектом доверия?
2. Какое evidence подтверждает вывод?
3. Какой finding/risk создаётся?
4. Как меняется Trust Passport/Graph?
5. Какое безопасное действие и verification предлагается?

---

## 8. MVP Boundaries

### Platform Foundation

Workspace isolation, Evidence/Finding model, Recommendation/Remediation model и
scoped assessment contract.

### Business MVP

Существующий Core плюс один допущенный source path, discovery/reconciliation,
evidence-backed findings, impact/dependency analysis и remediation workflow.

### Home MVP

Home workspace, paired local discovery, device inventory, Device Passports,
Home Trust Score и safe router/device recommendations.

### Personal MVP

Personal workspace, verified identifiers, Personal Trust Passport/Score,
limited breach/public exposure checks, privacy controls и history.

### Platform MVP

Business, Home и Personal работают на Shared Trust Core; Knowledge Center,
change history, notifications, abuse controls и release evidence готовы.

---

## 9. Future, Не Первый Platform MVP

- native Mobile App;
- general-purpose Desktop Agent;
- always-on Home Agent;
- continuous active scanning;
- broad OSINT catalog;
- autonomous remediation;
- custom scoring/rules marketplace;
- enterprise on-prem runtime;
- SSO/SAML и custom roles;
- cross-workspace analytics.

---

## 10. Positioning Framework

| Уровень | Рабочее позиционирование |
|---|---|
| DTEK Platform | Cybersecurity & Digital Trust Platform |
| Business | Understand and protect organizational infrastructure |
| Home | Understand and protect your digital home |
| Personal | Understand and protect your digital identity |
| Knowledge | Understand the problem and know how to fix it |

Это product architecture, а не финальный marketing copy.
