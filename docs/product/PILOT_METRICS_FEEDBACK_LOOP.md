# PILOT_METRICS_FEEDBACK_LOOP.md - DTEK Core

`Спринт: Sprint 14 - Pilot Readiness`  
`Задача: S14-T007 - Pilot Metrics & Feedback Loop`  
`Версия: 1.0`  
`Дата: 22.08.2026`  
`Статус: IMPLEMENTED / PILOT DATA PENDING`

---

## 1. Назначение

Документ определяет, как измерять первые пилоты DTEK Core и превращать
наблюдения в проверяемые продуктовые решения. Он отвечает на пять вопросов:

1. Получил ли клиент первую ценность за обещанный срок?
2. Достаточно ли данных для полезной цифровой модели доверия?
3. Понятны ли Trust Passport, Trust Score, Trust Graph и Risk Registry?
4. Можно ли использовать отчёты и приоритеты для решения CISO?
5. За какой следующий шаг клиент действительно готов отвечать временем,
   данными, бюджетом или procurement action?

План рассчитан на 1-3 пилота длительностью 2-4 недели и дополняет
[PILOT_OFFER.md](PILOT_OFFER.md). Он не добавляет product analytics SDK и не
собирает скрытую телеметрию. Метрики фиксируются через согласованный scorecard,
UI/audit aggregates, рабочие сессии и структурированную обратную связь.

---

## 2. Принципы Измерения

1. До kickoff зафиксировать baseline, target и источник каждой метрики.
2. Отделять фактическое использование от мнения после демонстрации.
3. Не считать feature request доказательством готовности платить.
4. Не смешивать product value, operational quality и commercial signal.
5. Не собирать данные, которые не влияют на решение о следующем шаге.
6. Не превращать небольшой pilot sample в статистическое доказательство рынка.
7. Не обещать connector только потому, что источник упомянут один раз.
8. Не отмечать отсутствующее evidence как `PASS`.

Статусы показателя:

| Статус | Значение |
|---|---|
| `PASS` | Target достигнут, evidence и дата зафиксированы |
| `AT RISK` | Есть прогресс, но target пока не достигнут |
| `FAIL` | Target не достигнут к decision point |
| `BLOCKED` | Проверка невозможна из-за данных, окружения или stakeholder |
| `N/A` | Неприменимо по согласованной причине |

---

## 3. Гипотезы Пилота

| ID | Гипотеза | Подтверждающий сигнал | Опровергающий сигнал |
|---|---|---|---|
| H-01 | Разрозненные активы и риски можно собрать в полезную модель за 14 дней | Time to first value <= 1 рабочего дня после принятого dataset | До финальной сессии нет пригодной модели |
| H-02 | Trust Score помогает приоритизировать внимание | CISO/ИБ объясняют top drivers и принимают/обоснованно корректируют приоритеты | Score воспринимается как непрозрачный рейтинг |
| H-03 | Trust Passport является рабочим артефактом обсуждения | Clarity >= 4/5 и паспорт используется на review | Паспорт не даёт нового контекста |
| H-04 | Trust Graph показывает значимые зависимости | Подтверждена минимум одна полезная цепочка | Граф воспринимается только как визуализация |
| H-05 | Executive report сокращает подготовку управленческого snapshot | Sponsor считает report пригодным или называет точечные правки | Отчёт приходится полностью собирать заново |
| H-06 | CSV/XLSX достаточно для первого evidence onboarding | Dataset загружен без connector и source context понятен | Пилот блокируется без real-time connector |
| H-07 | Есть коммерческий следующий шаг | WTP stage >= 2 и назначен owner/date | Только общая похвала без commitment |

Гипотеза может быть подтверждена частично. Итог должен содержать факты и
ограничения, а не только `да/нет`.

---

## 4. Карточка Пилота

Заполнять в закрытом рабочем пространстве клиента, не в публичном Git:

```text
Pilot ID:
Company alias:
Segment / company size:
Pilot start / end:
Release commit / environment:
Client sponsor:
Client security owner:
DTEK Core pilot owner:
Qualification score:
Agreed business question:
Dataset scope:
Security/data restrictions:
Baseline reporting time:
Success criteria agreed at kickoff:
Final decision date:
Evidence location:
```

Company alias используется в cross-pilot анализе. Реальное название, контакты,
договорные условия и customer data хранятся только в одобренном закрытом
пространстве.

---

## 5. Core Pilot Scorecard

### 5.1. Qualification И Scope

| ID | Метрика | Target | Источник | Когда |
|---|---|---|---|---|
| Q-01 | ICP qualification score | `>=10/15`; `13-15` strong candidate | ICP scoring rubric | До pilot offer |
| Q-02 | Named sponsor и security owner | Оба назначены | Kickoff notes | До Day 1 |
| Q-03 | Business question | Один проверяемый вопрос | Pilot card | Day 1 |
| Q-04 | Final decision session | Дата и decision makers назначены | Calendar/pilot card | Day 1 |
| Q-05 | Security boundary | Data scope/retention/access согласованы | Readiness evidence | До data intake |

Кандидат с score `10-12` допускается только как learning pilot с явным
одобрением product owner. Score `13-15` является предпочтительным commercial
pilot candidate.

### 5.2. Time To Value И Onboarding

| ID | Метрика | Target | Как считать |
|---|---|---|---|
| O-01 | Time to accepted dataset | <= 2 рабочих дней после получения файлов | От получения файла до preview/validation accepted |
| O-02 | Time to first value | <= 1 рабочего дня после accepted dataset | До первого reviewable Dashboard/Passport/priority insight |
| O-03 | Import correction cycles | <= 2 | Количество upload-preview-correction cycles до accepted import |
| O-04 | Importable row success | >= 90% после correction pass | Created rows / valid non-duplicate intended rows |
| O-05 | Manual onboarding effort | Записан в person-hours | Подготовка, mapping, correction, manual links |

`Time to first value` начинается не с подписания pilot offer, а с момента,
когда клиент передал согласованный и допустимый dataset. Ожидание клиента
фиксируется отдельно и не маскирует product onboarding time.

### 5.3. Data Completeness

Targets уточняются на kickoff, но не могут быть задним числом снижены без
причины.

| ID | Метрика | Pilot target | Источник |
|---|---|---|---|
| D-01 | Assets in scope | 50-200 или согласованный scope | Objects count |
| D-02 | Risks/findings in scope | 20-100 или согласованный scope | Risk Registry count |
| D-03 | Asset criticality completeness | >= 90% | Objects review/count |
| D-04 | Risk severity/status completeness | 100% | Risk Registry review |
| D-05 | Risks linked to assets | >= 80% применимых risks | Linked / applicable risks |
| D-06 | Source metadata coverage | >= 80% imported records | Records with identifiable source context |
| D-07 | Critical relationships | >= 10 или согласованный scope | Trust Graph review |
| D-08 | Hero objects validated | 3-5 | Client IT/security owner confirmation |
| D-09 | Stale/disputed records | Count и причины зафиксированы | Review notes |

`Source metadata coverage` не означает автоматически verified evidence.
Manual/import source и confidence остаются контекстом происхождения данных.

### 5.4. Product Usage И Workflow

Из-за отсутствия скрытой product analytics usage подтверждается через рабочие
сессии, UI counts и allowlisted audit events.

| ID | Метрика | Target | Evidence |
|---|---|---|---|
| U-01 | Active client roles | Минимум sponsor + working user; желательно 2 working roles | Users + session attendance |
| U-02 | Core modules reviewed | Dashboard, Objects, Passport, Risks, Graph, Executive Report | Session checklist |
| U-03 | Risk priorities reviewed | Top 10 либо весь согласованный small scope | Review notes |
| U-04 | Workflow exercised | >= 5 meaningful risk assignment/status/comment actions | Risk Activity aggregate/session notes, без comment body |
| U-05 | Reports used | Executive Report reviewed; минимум один Passport/report/export action | Audit/session evidence |
| U-06 | Return engagement | Минимум одна самостоятельная или повторная рабочая сессия после first value | Session record |

Нельзя создавать искусственные clicks или comments ради target. Если workflow
не соответствует процессу клиента, фиксируется product insight, а не usage
failure пользователя.

### 5.5. Product Value

Оценка `1-5`:

```text
1 - бесполезно / непонятно
2 - слабая ценность
3 - полезно с существенными ограничениями
4 - полезно в реальном процессе
5 - критично полезно / готов рекомендовать следующий шаг
```

| ID | Метрика | Target | Кто оценивает |
|---|---|---|---|
| V-01 | CISO overall usefulness | >= 4/5 | Sponsor/CISO |
| V-02 | Trust Passport clarity | >= 4/5 | Sponsor + working user |
| V-03 | Trust Score explainability | >= 4/5 | Security owner/analyst |
| V-04 | Risk prioritization usefulness | >= 4/5 | Security owner |
| V-05 | Trust Graph usefulness | >= 3/5 и одна подтверждённая dependency | IT/security owner |
| V-06 | Executive Report usability | `Да` или <= 3 конкретных required changes | Sponsor/CISO |
| V-07 | Decision insight | Минимум один новый или быстрее подтверждённый вывод | Final session notes |
| V-08 | Priority agreement | >= 7 из top 10 приняты либо корректировки обоснованы | Client review |

Score записывается вместе с причиной. Ответ `4/5` без комментария является
слабым evidence.

### 5.6. Operational Quality

| ID | Метрика | Target | Источник |
|---|---|---|---|
| R-01 | P0 incidents | 0 | Incident log |
| R-02 | Open P1 at final session | 0 | Incident log |
| R-03 | Critical path availability | Все planned sessions без application blocker | Session/monitoring notes |
| R-04 | Support response | В пределах S14-T006 targets | Incident timestamps |
| R-05 | Data integrity/RBAC/RLS | 0 confirmed violation | QA/security evidence |
| R-06 | Workarounds | Count, duration и affected module зафиксированы | Incident log |

Provider outage учитывается отдельно, но его влияние на клиента и response
DTEK Core всё равно измеряются.

### 5.7. Commercial Signal

`Willingness to pay` нельзя измерять вопросом «вам нравится?». Используется
лестница commitment:

| Stage | Наблюдаемый сигнал |
|---:|---|
| 0 | Не видит следующего шага / stop |
| 1 | Готов ещё раз посмотреть или дать feedback, без ресурсов |
| 2 | Готов обсуждать paid pilot/budget; назначены owner и следующий разговор |
| 3 | Запущен procurement, согласован budget range или подтверждён paid next step |

| ID | Метрика | Target |
|---|---|---|
| C-01 | WTP stage | >= 2 |
| C-02 | Named economic buyer | Да |
| C-03 | Next decision | Stop / iterate / repeat demo / product gap / paid pilot |
| C-04 | Next action | Owner и дата назначены |
| C-05 | Procurement blockers | Список и приоритет зафиксированы |
| C-06 | Expected buying value | Сформулирован клиентом своими словами |

Технический интерес без owner/date не считается commercial validation.

---

## 6. Feedback Cadence

| Этап | Участники | Что фиксировать | Артефакт |
|---|---|---|---|
| Qualification | Product owner + prospect | ICP score, pain, data readiness, buyer access | Interview notes |
| Day 1 kickoff | Sponsor + working team | Baseline, business question, targets, source inventory | Pilot card + scorecard |
| Day 2-5 onboarding | Security/IT owner | Mapping effort, errors, missing fields, source quality | Data intake log |
| Day 6-7 midpoint | Working users | First value, model accuracy, blockers, workflow fit | Midpoint review |
| Day 11-12 validation | Security/IT owner | Priority agreement, corrections, missing context | Validation notes |
| Day 14 final | Sponsor/CISO | Value scores, report usability, WTP stage, decision | Final scorecard |
| +2 working days | DTEK Core team | Cross-signal synthesis, backlog evidence, connector ranking | Internal review |
| +7 days | Economic buyer | Commitment status и next action | Follow-up record |

После каждой сессии заметки оформляются в течение одного рабочего дня. В
scorecard записываются observation, evidence и owner, а не только итоговый
балл.

---

## 7. Feedback Questions

### Midpoint

1. Какую задачу вы уже смогли выполнить в DTEK Core?
2. Где данные или связи выглядят неверно/неполно?
3. Какой блок пришлось объяснять дополнительно?
4. Что заняло больше всего ручного времени?
5. Какого источника данных не хватило именно для текущего решения?
6. Что будет достаточно исправить до final session?

### Final Sponsor Interview

1. Какой вывод вы получили быстрее или впервые?
2. Какие приоритеты вы приняли, а какие изменили и почему?
3. Можно ли показать Executive Report руководству без переработки?
4. Что в Trust Score вызывает доверие или сомнение?
5. Какой процесс продукт может заменить или сократить?
6. Без какой функции продолжение невозможно, а какая просто желательна?
7. Какой источник данных даст наибольший следующий эффект?
8. Кто и когда принимает решение о paid next step?
9. Какой budget/procurement action вы готовы выполнить следующим?

Не подсказывать желаемый ответ и не объединять несколько оценок в один вопрос.

---

## 8. Source Inventory

Source inventory нужен для понимания data landscape и приоритизации Sprint 15.
Он не является обещанием интеграции.

### 8.1. Карточка Источника

| Поле | Что фиксировать |
|---|---|
| Source alias | Обезличенное имя/категория |
| Current system/vendor | Реальный продукт только в закрытых notes |
| `source_type` | Текущий canonical import type |
| Data owner | Роль/команда, без лишних персональных данных |
| Data provided | Assets, risks, identities, vulnerabilities, relations, controls |
| Format/access | CSV/XLSX/API/agent/manual/other |
| Volume | Приблизительное число записей |
| Update cadence | Ad hoc/daily/weekly/monthly |
| Required freshness | Насколько быстро данные устаревают |
| Stable external key | Есть/нет; сам identifier в общий report не копируется |
| Data quality | Completeness, duplicates, naming, confidence |
| Security boundary | SaaS допустим, обезличивание, on-prem requirement |
| Manual effort | Person-hours per update |
| Decision supported | Какое решение улучшает источник |
| Requested path | Import improvement / connector / no action |

Canonical `source_type`:

```text
manual_csv
asset_inventory
vulnerability_export
monitoring_export
directory_export
security_tool_export
network_export
other
```

### 8.2. Connector Demand Score

Demand и feasibility оцениваются отдельно по `0-3`.

| Demand factor | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Decision value | Не влияет | Удобство | Регулярно помогает | Блокирует critical decision |
| Manual burden | Почти нет | <1 ч/цикл | 1-4 ч/цикл | >4 ч/цикл или систематические ошибки |
| Freshness need | Разово | Monthly | Weekly | Daily/near-real-time |
| Cross-pilot demand | Не запрошен | 1 pilot | 2 pilots | 3+ independent signals |
| Evidence quality gain | Нет | Metadata only | Существенно повышает completeness | Критично для trust/evidence model |

`Demand score = сумма`, максимум 15.

| Feasibility factor | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Access | Нет допустимого доступа | Сложный/manual | Stable export | Documented API/standard protocol |
| Identity quality | Нет stable key | Слабый matching | Частичный stable key | Надёжный external identity |
| Security/deployment fit | Не соответствует boundary | Требует отдельного решения | Допустим с ограничениями | Соответствует connector model |
| Implementation scope | Неизвестен/enterprise | Large | Medium | Small foundation-compatible |

`Feasibility score = сумма`, максимум 12. Высокий demand не отменяет security
и architecture gate.

### 8.3. Решение По Источнику

| Решение | Когда использовать |
|---|---|
| Improve import/template | Данные обновляются редко, export стабилен |
| Connector candidate | Повторяющийся manual burden/freshness need и допустимый access |
| Research first | Demand высокий, но identity/security/ownership неясны |
| No action | Нет decision value или existing import достаточно |
| Enterprise requirement | On-prem/certification/custom runtime вне текущего boundary |

Источник попадает в Sprint 15 shortlist только если:

- есть минимум два независимых pilot signals; или
- один стратегически сильный pilot signal с высоким decision value и явным
  product owner approval;
- описаны data contract, owner, freshness и stable identity;
- feasibility/security оценены;
- решение не превращает DTEK Core в SIEM/EDR/CMDB replacement.

---

## 9. Feature Feedback И Backlog Evidence

Каждый запрос получает карточку:

```text
Feedback ID:
Pilot alias / participant role:
Observed problem:
Current workaround:
Frequency:
Decision impact:
Requested outcome (не solution):
Evidence:
Affected module/source:
MVP blocker: yes/no
Demand score:
Feasibility/security notes:
Decision: clarify / backlog / reject / research / candidate
Owner / review date:
```

Приоритизация запрещена только по числу упоминаний. Учитываются severity боли,
частота, decision impact, commercial commitment, архитектурная совместимость и
security cost.

---

## 10. Итоговое Решение По Пилоту

### Mandatory gates

- [ ] Нет P0 и открытых P1 incidents.
- [ ] Security/data boundary соблюдён.
- [ ] Final sponsor session проведена.
- [ ] Scorecard содержит evidence, а не только оценки.
- [ ] Dataset и limitations честно зафиксированы.
- [ ] Есть named next decision, owner и дата либо явный `stop`.

### Outcome levels

| Outcome | Условие | Следующий шаг |
|---|---|---|
| `VALIDATED` | Mandatory gates; 5+ criteria Pilot Offer; V-01 >=4; WTP >=2 | Paid/expanded pilot proposal |
| `PROMISING` | Mandatory gates; product value есть, но data/workflow/commercial signal неполный | Time-boxed iteration с новой гипотезой |
| `PRODUCT GAP` | Ценность подтверждена, но blocker имеет evidence | Backlog/architecture decision без обещания срока |
| `NOT VALIDATED` | Core value не подтверждена или sponsor не продолжает | Stop и сохранить learning |
| `INVALID PILOT` | Не было данных/decision maker/final session или нарушены gates | Не делать product conclusion, исправить pilot design |

`VALIDATED` для одного клиента не означает market validation. Решение о
Post-MVP roadmap принимается после cross-pilot synthesis.

---

## 11. Cross-Pilot Synthesis

После каждого пилота обновить обезличенную таблицу:

| Pilot alias | Segment | ICP score | TTFV | Data coverage | CISO score | WTP stage | Outcome | Top source demand | Top blocker |
|---|---|---:|---:|---:|---:|---:|---|---|---|
| PILOT- |  |  |  |  |  |  |  |  |  |

После 1-3 pilots ответить:

1. Какие hypotheses подтверждены независимо?
2. Где результат зависит от ручной подготовки DTEK Core team?
3. Какие metrics не удалось собрать и почему?
4. Какие sources повторяются и какой у них demand/feasibility score?
5. Какие objections являются MVP blocker, а какие enterprise requirement?
6. Есть ли repeatable WTP signal с owner/date?
7. Что входит в Sprint 15 evidence, а что остаётся в research backlog?

Цитаты можно использовать только с согласия и в обезличенном виде.

---

## 12. Data Minimization И Хранение

- Не хранить в scorecard passwords, tokens, keys, cookies, raw files и
  connection strings.
- Не копировать customer asset names, IP, vulnerabilities, comments и internal
  UUID в cross-pilot таблицу.
- Recording выполнять только после явного согласия.
- Отделять contact/commercial data от product research notes.
- Ограничить доступ pilot owner, product owner и согласованными reviewers.
- Срок хранения и удаление согласовать до data intake.
- В Git хранить только шаблон и обезличенные выводы, не заполненные client cards.

Security или operational defects оформляются по соответствующим runbooks, а в
pilot scorecard попадает только безопасный итог и влияние.

---

## 13. Release Gate S14-T007

### Реализовано в задаче

- [x] Определены hypotheses и core scorecard.
- [x] Определены usage, data completeness, reports, product value и WTP metrics.
- [x] Определены feedback cadence, questions и decision outcomes.
- [x] Созданы source inventory и connector demand/feasibility model.
- [x] Зафиксированы cross-pilot synthesis и data minimization.

### Заполняется Для Реального Пилота

- [ ] Назначены pilot owner, sponsor и working users.
- [ ] Kickoff scorecard и source inventory заполнены.
- [ ] Baseline/targets согласованы до first value.
- [ ] Midpoint и final feedback sessions проведены.
- [ ] WTP stage подтверждён наблюдаемым commitment.
- [ ] Final outcome согласован с sponsor.
- [ ] Cross-pilot synthesis обновлён обезличенными результатами.

До появления фактического pilot data статус остаётся
`IMPLEMENTED / PILOT DATA PENDING`, а не `PASS`.

---

## 14. Связанные Документы

- [PILOT_OFFER.md](PILOT_OFFER.md)
- [ICP_INTERVIEW_SCRIPT.md](ICP_INTERVIEW_SCRIPT.md)
- [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md)
- [PILOT_READINESS_CHECKLIST.md](../testing/PILOT_READINESS_CHECKLIST.md)
- [PILOT_SMOKE_TEST_CHECKLIST.md](../testing/PILOT_SMOKE_TEST_CHECKLIST.md)
- [MONITORING_ERROR_HANDLING_PLAN.md](../operations/MONITORING_ERROR_HANDLING_PLAN.md)
- [BACKUP_RESTORE_RUNBOOK.md](../operations/BACKUP_RESTORE_RUNBOOK.md)
- [Evidence_Import_Schema.md](../architecture/Evidence_Import_Schema.md)
- [IMPORT_GUIDE.md](../user/IMPORT_GUIDE.md)

---

*Документ закрывает проектирование S14-T007. Success подтверждается только
фактическими pilot observations, evidence и commercial commitments.*
