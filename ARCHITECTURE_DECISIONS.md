# ARCHITECTURE DECISIONS — DTEK Core

`Проект: DTEK Core`
`Версия: 1.0`
`Дата: 08.06.2026`
`Статус: Утверждён`

---

## О документе

Architecture Decision Records (ADR) — это журнал ключевых архитектурных и продуктовых решений, принятых до начала разработки. Каждое решение зафиксировано с контекстом, обоснованием и последствиями.

Документ устраняет расхождения, выявленные в ходе аудита проектной документации (перенесён в `docs/archive/PROJECT_ANALYSIS.md`).

Решения в данном документе имеют приоритет над более ранними документами в случае конфликта.

---

## РЕЕСТР РЕШЕНИЙ

| ID | Тема | Статус |
|---|---|---|
| ADR-001 | Финальная модель Trust Score | Утверждён |
| ADR-002 | Концепция Конфигуратора MVP | Утверждён |
| ADR-003 | Структура ролей пользователей | Утверждён |
| ADR-004 | Облачная архитектура MVP | Утверждён |
| ADR-005 | Полнота схемы базы данных | Утверждён |
| ADR-006 | Продуктовая граница Market MVP | Утверждён |
| ADR-007 | Evidence-first Trust Platform | Утверждён |
| ADR-008 | Reporting Architecture | Утверждён |
| ADR-009 | Connector Framework Architecture | Утверждён |

---

## ADR-001 — Финальная модель Trust Score

**Статус:** Утверждён
**Дата:** 08.06.2026
**Затрагивает документы:** `Trust_Score_Model.md` → заменяется на `docs/architecture/Trust_Score_Model_v2.md`

### Контекст

В проекте обнаружены две несовместимые модели расчёта Trust Score:

**Модель A** (Trust_Score_Model.md — исходная документация):
```
Trust Score = Base Score(70) − Risk Penalty − Criticality Penalty + Completeness Bonus
```
Простая аддитивная формула. Три параметра: риски, критичность, полнота данных.

**Модель B** (дизайн-прототип design/src/data.jsx):
```
Trust Score = Σ (factor_score_i × weight_i) / 100
```
Взвешенная мультифакторная формула. Шесть независимых факторов с настраиваемыми весами.

### Решение

**Принята Модель B — взвешенная мультифакторная модель.**

Факторы и веса по умолчанию:

| Фактор | Ключ | Вес (%) |
|---|---|---|
| Уязвимости | `vuln` | 22 |
| Конфигурация | `config` | 18 |
| Доступы | `access` | 18 |
| Сетевая сегментация | `network` | 14 |
| Соответствие требованиям | `compliance` | 16 |
| Инциденты | `incident` | 12 |
| **Итого** | | **100** |

### Обоснование

1. **Дизайн-прототип является согласованным продуктом.** Прототип показывался заинтересованным сторонам и представляет UX-решение, которое будет воспроизведено в коде. Отказ от его модели означал бы разрыв между UI и логикой.

2. **Мультифакторная модель масштабируема.** В MVP факторы рассчитываются из ручных данных (рисков). В v2 каждый фактор сможет получать данные из своего коннектора (сканер уязвимостей → `vuln`, SIEM → `incident`, AD → `access`), не затрагивая остальные.

3. **Настраиваемые веса — ключевое преимущество продукта.** Возможность изменять веса факторов через Конфигуратор является частью ценностного предложения DTEK Core.

4. **Модель A неполна для enterprise.** Упрощённая формула (Base 70 ± корректировки) не позволяет приоритизировать угрозы по их природе и не соответствует уровню сложности, ожидаемому enterprise-аудиторией.

### Расчёт факторов в MVP

В MVP без внешних коннекторов каждый фактор рассчитывается из вручную введённых рисков, категоризированных по типу:

| Категория риска | Влияет на фактор |
|---|---|
| Уязвимость | `vuln` |
| Конфигурация | `config` |
| Доступы | `access` |
| Сетевая изоляция | `network` |
| Соответствие | `compliance` |
| Инцидент, Мониторинг | `incident` |
| Прочие категории | Все факторы равномерно (÷6) |

### Последствия

- Документ `Trust_Score_Model.md` считается устаревшим (перемещён в `docs/archive/`). Актуальная версия — `docs/architecture/Trust_Score_Model_v2.md`.
- База данных должна хранить шесть факторных оценок для каждого паспорта доверия.
- Таблица `trust_factor_config` хранит настраиваемые веса на уровне организации.
- При отсутствии данных по фактору используется нейтральное значение 70.

---

## ADR-002 — Концепция Конфигуратора MVP

**Статус:** Утверждён
**Дата:** 08.06.2026
**Затрагивает документы:** `PRD_Configurator.md` → заменяется на `docs/architecture/Configurator_Concept_Final.md`

### Контекст

Обнаружено принципиальное расхождение в концепции Конфигуратора:

**Концепция A** (PRD_Configurator.md): Конфигуратор — это **онбординговый мастер** (wizard), который запускается один раз при создании организации. Пользователь отвечает на вопросы, система создаёт базовую структуру.

**Концепция B** (дизайн-прототип screens_admin.jsx): Конфигуратор — это **панель настройки модели доверия**, доступная постоянно. Содержит редактор весов факторов, управление коннекторами (AD, SIEM, CMDB, сканер), редактор правил IF/THEN.

Две концепции описывают разные продукты с разной архитектурой.

### Решение

**Конфигуратор MVP состоит из двух фаз:**

**Фаза 1 — Мастер первичной настройки (Onboarding Wizard)**
- Запускается автоматически при создании новой организации
- Используется один раз
- Цель: быстро привести систему в рабочее состояние
- Входит в MVP

**Фаза 2 — Настройки модели доверия (Trust Model Settings)**
- Постоянно доступна в разделе "Конфигуратор"
- В MVP включает только редактор весов факторов
- Коннекторы и редактор правил — вне MVP (v2)

### Обоснование

1. **Обе потребности реальны.** Пользователю нужен как быстрый старт (Фаза 1), так и возможность кастомизации модели (Фаза 2).

2. **Редактор весов — MVP-функция.** Это чистый UI без зависимостей от внешних систем. Реализуем немедленно и даёт ключевое конкурентное преимущество (настраиваемость модели доверия).

3. **Коннекторы — не MVP.** Интеграции со внешними системами явно исключены из MVP_Scope.md. Их наличие в прототипе — демонстрация видения продукта, не MVP-функциональность.

4. **Редактор правил — не MVP.** Rule engine требует отдельного слоя бизнес-логики и значительно усложняет архитектуру.

### Граница MVP по Конфигуратору

| Функция | Фаза | MVP |
|---|---|---|
| Мастер создания организации (6 шагов) | 1 | ✓ |
| Редактор весов факторов Trust Score | 2 | ✓ |
| Коннекторы внешних систем | 2 | ✗ |
| Редактор правил IF/THEN | 2 | ✗ |
| Отраслевые конфигурации | 2 | ✗ |

### Последствия

- Документ `PRD_Configurator.md` считается устаревшим (перемещён в `docs/archive/`). Актуальная версия — `docs/architecture/Configurator_Concept_Final.md`.
- Мастер и панель настроек — разные компоненты с разным UX.
- Таблица `trust_factor_config` хранит веса факторов для каждой организации.

---

## ADR-003 — Структура ролей пользователей

**Статус:** Утверждён
**Дата:** 08.06.2026
**Затрагивает документы:** `User_Roles.md` (обновить матрицу)

### Контекст

Обнаружено расхождение в названиях ролей:

**Документация (User_Roles.md, PRD.md):** Owner, Security Officer, Administrator, Viewer

**Дизайн-прототип (data.jsx):** Владелец, Администратор, Аналитик ИБ, Наблюдатель

Роль "Security Officer" отсутствует в прототипе. Роль "Аналитик ИБ" отсутствует в документации. "Администратор" в документах (IT-администратор) отличается по правам от "Администратора" в прототипе.

### Решение

**Принята следующая финальная структура ролей:**

| Роль (UI) | Ключ (БД) | Описание |
|---|---|---|
| Владелец | `owner` | Полный контроль: организация, пользователи, биллинг |
| Аналитик ИБ | `analyst` | Работа с объектами, рисками, паспортами, графом |
| Администратор | `admin` | Управление инфраструктурными объектами, просмотр рисков, ограниченное управление не-owner участниками |
| Наблюдатель | `viewer` | Только просмотр данных |

### Матрица доступа (финальная)

| Действие | Владелец | Аналитик ИБ | Администратор | Наблюдатель |
|---|:---:|:---:|:---:|:---:|
| Удалить организацию | ✓ | ✗ | ✗ | ✗ |
| Управление пользователями | ✓ | ✗ | ✓* | ✗ |
| Управление тарифом | ✓ | ✗ | ✗ | ✗ |
| Настройки конфигуратора | ✓ | ✓ | ✗ | ✗ |
| Создание объектов | ✓ | ✓ | ✓* | ✗ |
| Редактирование объектов | ✓ | ✓ | ✓* | ✗ |
| Удаление объектов | ✓ | ✓ | ✗ | ✗ |
| Создание рисков | ✓ | ✓ | ✗ | ✗ |
| Управление рисками | ✓ | ✓ | ✗ | ✗ |
| Создание связей (граф) | ✓ | ✓ | ✗ | ✗ |
| Просмотр объектов | ✓ | ✓ | ✓ | ✓ |
| Просмотр рисков | ✓ | ✓ | ✓ | ✓ |
| Просмотр паспортов | ✓ | ✓ | ✓ | ✓ |
| Просмотр графа | ✓ | ✓ | ✓ | ✓ |
| Просмотр дашборда | ✓ | ✓ | ✓ | ✓ |

*Администратор создаёт только объекты типа: server, workstation, network, ot (инфраструктурные).

**Уточнение MVP после Sprint 10:** приглашения новых участников создаёт только `owner`. Роль `admin` может управлять уже существующими пользователями, которые не являются `owner` (смена роли в пределах `analyst/admin/viewer`, блокировка, удаление из организации), и может видеть журнал аудита. Назначение или приглашение второго `owner` запрещено.

### Обоснование

1. **"Аналитик ИБ" точнее описывает реальную роль.** Специалист по ИБ в российских организациях называется аналитиком или специалистом, а не "Security Officer" (термин нехарактерен для российского рынка).

2. **Разделение ролей ИБ и ИТ.** Аналитик ИБ работает с угрозами и рисками. Администратор (ИТ) управляет инфраструктурой. Это соответствует реальной организационной структуре.

3. **Критическое управление командой остаётся у Владельца.** Создание приглашений и назначение owner остаются исключительным правом Владельца. Делегированная роль `admin` допускает операционное управление не-owner пользователями в текущем MVP.

### Последствия

- Значение поля `role` в БД: `'owner' | 'analyst' | 'admin' | 'viewer'`
- В UI отображаются русскоязычные названия ролей
- Документ `User_Roles.md` должен быть обновлён данной матрицей
- RLS-политики строятся на ключах ролей (не на отображаемых названиях)

---

## ADR-004 — Облачная архитектура MVP

**Статус:** Утверждён
**Дата:** 08.06.2026
**Затрагивает документы:** `System_Architecture.md`

### Контекст

Обнаружено расхождение в концепции развертывания:

**System_Architecture.md:** Cloud First — Vercel (фронтенд) + Supabase Cloud (бэкенд + БД).

**Версия концепции 1.0:** Описывает два режима — Портал (облако) + Ядро (on-premise на инфраструктуре клиента). On-premise указывается как критически важный для российских организаций.

### Решение

**MVP развертывается исключительно в облаке.**

Итоговая схема MVP:

```
Пользователь
    ↓ HTTPS
Vercel (Next.js 15, Edge Runtime)
    ↓ Server Actions / Supabase Client
Supabase Cloud
    ├── PostgreSQL 15 (данные + RLS)
    ├── Auth (JWT, Email+Password)
    └── REST API / Realtime capabilities
```

On-premise развертывание (Enterprise Runtime) — запланировано на версию 2.0.

### Обоснование

1. **On-premise явно исключён из MVP.** Документ MVP_Scope.md и Product_Concept.md явно относят Enterprise Runtime к пост-MVP этапу с обоснованием: усложняет разработку.

2. **Облачный MVP позволяет быстро проверить гипотезу.** Основная цель MVP — подтвердить спрос на концепцию цифрового доверия. Это достигается без on-premise.

3. **Supabase поддерживает self-hosted развертывание.** При переходе к on-premise весь стек (PostgreSQL + Auth + Edge Functions) разворачивается на собственной инфраструктуре клиента без изменений приложения. Это упростит переход к v2.

4. **FOSS-совместимость обеспечена.** Supabase с открытым исходным кодом, PostgreSQL — стандарт отрасли. Вендорная зависимость управляема.

### Последствия

- Все переменные окружения разделены: dev / staging / production
- Суpabase проект создаётся с регионом EU (ближайший к РФ), при возможности — с российским размещением
- Edge Functions, Storage и AI API не являются обязательной частью MVP; они подключаются только под подтверждённые Post-MVP задачи
- На v2 планируется self-hosted Supabase или альтернативная private-cloud архитектура для enterprise-заказчиков
- Данная архитектура фиксируется в `System_Architecture.md` как единственная для MVP

---

## ADR-005 — Полнота схемы базы данных

**Статус:** Утверждён
**Дата:** 08.06.2026
**Затрагивает документы:** `Database_Design.md` → заменяется на `Database_Design_Full.md`

### Контекст

Исходный документ `Database_Design.md` содержит только перечень таблиц с полями без типов данных, ограничений, индексов и RLS-политик. Дизайн-прототип использует поля, отсутствующие в схеме (ip_address, os_platform, segment, exposure, cvss_score, sla_days и др.).

### Решение

Создан документ `Database_Design_Full.md` со следующими дополнениями:

- Типы данных PostgreSQL для каждого поля
- Ограничения: NOT NULL, UNIQUE, CHECK
- Определения внешних ключей с указанием ON DELETE-действий
- Индексы для часто используемых полей
- Политики Row Level Security (RLS) для Supabase
- Все поля из дизайн-прототипа
- Справочник перечисляемых значений (enums)

### Последствия

- Документ `Database_Design.md` считается устаревшим (перемещён в `docs/archive/`)
- Актуальная схема — `docs/architecture/Database_Design_Full.md`
- Все миграции Supabase создаются на основе данного документа
- Любое добавление поля требует обновления документа и создания новой миграции

---

## ADR-006 — Продуктовая граница Market MVP

**Статус:** Утверждён  
**Дата:** 08.07.2026  
**Затрагивает документы:** `docs/product/PRODUCT_STRATEGY.md`, `docs/roadmap/ROADMAP.md`, `docs/roadmap/SPRINT_ROADMAP.md`

### Контекст

После Sprint 08 функциональный MVP реализован и визуально отполирован. Следующий риск проекта — распыление: можно начать строить SIEM, EDR, DLP, сканер, CMDB, GRC, marketplace, коннекторы и enterprise runtime одновременно.

Для коммерческого MVP это опасно. Рынку нужно сначала доказать, что DTEK Core решает конкретную управленческую боль CISO: видеть доверие к активам, понимать причины риска и получать отчёт для принятия решений.

### Решение

**DTEK Core позиционируется как Evidence-first Trust Intelligence Platform.**

Платформа является управленческим слоем над активами, рисками, связями и доверительным состоянием организации.

В Market MVP входят:

- демо-данные и демонстрационный сценарий;
- CSV import объектов и рисков;
- PDF/CSV export;
- executive report;
- explainability Trust Score;
- risk impact hints;
- workflow риска;
- pilot readiness.

В Market MVP не входят:

- SIEM/SOAR;
- EDR/XDR;
- DLP;
- собственный агент;
- heavy GRC;
- marketplace;
- множество коннекторов;
- кастомные роли;
- on-prem runtime.

### Обоснование

1. **Продуктовая ценность DTEK Core — в интерпретации и приоритизации, а не в сборе всех сигналов.**

2. **Первые пилоты требуют загрузки данных и отчётов сильнее, чем интеграций.** Без import/export/reporting продукт сложно показать на реальных данных.

3. **Коннекторы должны следовать за рынком.** Первый connector prototype выбирается только после интервью и пилотов.

4. **TrustOps — стратегический термин, не первичный sales-message.** Для первых клиентов использовать понятное позиционирование: “цифровые паспорта доверия, Trust Score и карта рисков активов для CISO”.

### Последствия

- Roadmap после Sprint 08 перестраивается вокруг Market MVP.
- Sprint 09 не должен начинать новый крупный функционал без упаковки продукта и демо-данных.
- Интеграции переносятся после подтверждения пилотных сценариев.
- Любая задача, не приближающая продукт к демонстрации, import/export, explainability или пилоту, считается Post-MVP кандидатом.

---

## ADR-007 — Evidence-first Trust Platform

**Статус:** Утверждён  
**Дата:** 09.07.2026  
**Затрагивает документы:** `docs/product/EVIDENCE_FIRST_STRATEGY.md`, `docs/architecture/Evidence_First_Architecture.md`, `docs/roadmap/ROADMAP.md`, `docs/roadmap/SPRINT_ROADMAP.md`

### Контекст

Functional MVP DTEK Core реализовал ручную модель работы:

- пользователь создаёт объекты;
- пользователь создаёт связи;
- пользователь регистрирует риски;
- Trust Score и Trust Passport строятся на данных внутри платформы.

Эта модель достаточна для демонстрации и раннего Market MVP, но коммерчески ограничивает продукт: при полном ручном наполнении DTEK Core может восприниматься как красивая security-CMDB.

Изначальная ценность продукта сильнее: DTEK Core должен помогать CISO понять доверие к инфраструктуре на основе существующих цифровых доказательств из AD, monitoring, vulnerability management, SIEM, endpoint/security tooling, cloud и других источников.

### Решение

**DTEK Core развивается как Evidence-first Trust Platform / Trust Intelligence Platform.**

Пользователь не должен вручную строить всю инфраструктурную модель. Он подключает источники данных или загружает выгрузки, а платформа:

- обнаруживает инфраструктуру;
- сохраняет цифровые доказательства;
- нормализует данные;
- объединяет дубли;
- оценивает уверенность автоматического вывода;
- показывает неподтверждённые объекты в Discovery Inbox;
- строит Trust Passport;
- обновляет Trust Graph;
- рассчитывает Trust Score;
- формирует Risk Registry;
- отслеживает drift инфраструктуры.

Ручное создание объектов, связей и рисков сохраняется как fallback, экспертная корректировка и способ добавить бизнес-контекст.

### Новые Архитектурные Слои

В целевую архитектуру добавляются:

- Discovery Layer;
- Connector Framework;
- Evidence Layer;
- Normalization Engine;
- Identity Resolution;
- Confidence Engine;
- Discovery Inbox;
- Drift Detection;
- Auto Risk Mapper;
- Source Coverage;
- Evidence Timeline.

Подробная спецификация: `docs/architecture/Evidence_First_Architecture.md`.

### Обоснование

1. **Современные security-платформы не требуют полного ручного заполнения.** CAASM, ASM/EASM, Exposure Management, CSPM/CNAPP и VM-платформы строят ценность через discovery, aggregation, normalization и prioritization.

2. **Trust Score становится сильнее, когда опирается на evidence.** Пользователь должен видеть не только оценку, но и источники, которые её подтверждают.

3. **Trust Graph должен постепенно стать автоматически построенной цифровой моделью.** Ручные связи остаются, но не должны быть единственным способом построения графа.

4. **Российский рынок требует интеграций с существующей инфраструктурой.** Наиболее вероятные источники: CSV/XLSX, AD/LDAP/FreeIPA, Zabbix, MaxPatrol VM, Kaspersky Security Center, Wazuh, UserGate, OpenSearch/ELK, VMware, Proxmox, Kubernetes и cloud APIs.

5. **ADR-006 остаётся в силе.** DTEK Core не становится SIEM, EDR, VM-сканером или CMDB. Он становится слоем доверительной интерпретации поверх этих источников.

### Последствия

- Product Strategy обновляется на Trust Intelligence Platform.
- Roadmap после Sprint 09 перестраивается вокруг Evidence-first evolution.
- Sprint 11 CSV import трактуется как первый evidence ingestion path, а не просто bulk create.
- Sprint 12 explainability должна показывать evidence/source context.
- Sprint 13 risk workflow должен учитывать manual risks, imported risks и auto risk candidates.
- Sprint 15 становится Connector Framework Foundation, а не случайным одиночным коннектором.
- Будущие миграции БД должны проектироваться с `organization_id`, RLS, source metadata, confidence и audit trail.
- Полный connector runtime реализуется только поэтапно, после Market/Pilot MVP подтверждения.

---

## ADR-008 — Reporting Architecture

**Статус:** Утверждён  
**Дата:** 09.07.2026  
**Sprint:** S10-T001  
**Затрагивает документы:** `docs/architecture/Reporting_Architecture.md`, `tasks/SPRINT_10.md`, `docs/roadmap/ROADMAP.md`

### Контекст

Sprint 10 должен дать CISO экспортируемые артефакты:

- Trust Passport PDF;
- Risk Registry CSV;
- Executive Organization Report.

В текущем стеке нет PDF-библиотеки, headless browser runtime или report designer. Добавление тяжёлой зависимости до проверки Market MVP увеличивает риск деплоя и усложняет поддержку.

### Решение

**Reporting Sprint 10 строится через server-side report modules, защищённые report pages и route handlers.**

- Trust Passport PDF и Executive Report реализуются как print-optimized HTML reports, которые пользователь сохраняет в PDF через browser print/save as PDF.
- Risk Registry CSV реализуется через Next.js route handler с `Content-Disposition: attachment`.
- Данные загружаются только server-side.
- RBAC и RLS обязательны для каждого отчёта.
- Export/open actions логируются в Security Audit Log.
- Evidence/source placeholders добавляются в структуру отчётов, но не требуют Evidence Layer tables в Sprint 10.

Подробное решение: `docs/architecture/Reporting_Architecture.md`.

### Обоснование

1. **Не меняет стек.** Решение использует Next.js App Router, Server Components, route handlers и текущие Supabase clients.

2. **Минимизирует риск Sprint 10.** Нет Puppeteer/Playwright runtime, внешнего report service или новой layout-системы.

3. **Достаточно для Market MVP.** CISO получает printable/exportable артефакты для пилота и демонстрации.

4. **Сохраняет security-first модель.** Отчёты защищаются тем же middleware, RBAC/RLS и audit trail.

5. **Совместимо с ADR-007.** Отчёты могут показывать source/evidence context позже без пересборки архитектуры.

### Последствия

- В Sprint 10 не добавляются PDF/BI/report dependencies.
- Первый PDF UX может зависеть от browser print-to-PDF.
- Если пилоты потребуют server-generated binary PDF, потребуется отдельное решение и сравнение вариантов.
- Bulk export доступен не всем ролям: viewer и admin не получают Risk Registry CSV / Executive Report export в Market MVP.

---

## ADR-009 — Connector Framework Architecture

**Статус:** Утверждён<br>
**Дата:** 23.08.2026<br>
**Sprint:** S15-T001<br>
**Затрагивает документы:** `docs/architecture/Connector_Framework_Architecture.md`, `docs/architecture/System_Architecture.md`, `docs/security/SECURITY_OVERVIEW.md`, `tasks/SPRINT_15.md`

### Контекст

CSV/XLSX import стал первым evidence ingestion path, но текущий commit-flow
напрямую создаёт `objects` и `risks`, а source metadata временно хранится в
text block. Копирование такого подхода в отдельные vendor integrations создаст
несовместимые auth, mapping, retry, audit и tenant-isolation реализации.

Первый production connector ещё не подтверждён pilot feedback. При этом до
его выбора необходимо определить устойчивую границу между внешним источником,
raw evidence, normalization, identity resolution и финальной Trust model.

### Решение

**Connector Framework строится как versioned adapter layer внутри текущего
Next.js + Supabase приложения с единым server-only ingestion contract.**

- Connector Definition является code-owned allowlisted manifest.
- Connector Installation является tenant-scoped configuration с opaque
  `secret_ref`; raw credentials в обычных таблицах и клиенте запрещены.
- Adapter отвечает только за source-specific validation, connection test,
  bounded pull, pagination/cursor и error classification.
- Adapter не записывает напрямую в `objects`, `relations`, `risks`, Trust
  Passport или Trust Score.
- Все records проходят через Ingestion Gateway и будущий Evidence Layer.
- Foundation поддерживает manual/scheduled pull; realtime, agent и marketplace
  остаются non-scope.
- Execution является bounded, idempotent и resumable; checkpoint продвигается
  только после durable write.
- Ambiguous/low-confidence data не влияет на Trust Score до review.
- Manual override имеет приоритет над connector update.
- Tenant context фиксируется на installation/run и проверяется для каждой
  записи; service role не считается механизмом авторизации.
- Первый connector и конкретный scheduler/worker выбираются отдельным решением
  после pilot evidence.

Полный контракт:
`docs/architecture/Connector_Framework_Architecture.md`.

### Обоснование

1. **Сохраняет текущий стек.** Первый framework не требует отдельного
   microservice, queue, streaming platform или plugin marketplace.
2. **Не допускает ad hoc integrations.** Общие lifecycle, errors, audit,
   idempotency и ingestion применяются ко всем sources.
3. **Поддерживает ADR-007.** Source data сначала становится evidence, а не
   безусловной бизнес-сущностью.
4. **Снижает security risk.** Secrets, SSRF, service-role bypass и cross-tenant
   jobs являются явными gates до runtime.
5. **Сохраняет контроль пользователя.** Discovery/Confidence boundary не даёт
   connector незаметно перезаписать manual model.
6. **Позволяет выбирать source по рынку.** Framework не зависит от AD, Zabbix,
   MaxPatrol VM или другого конкретного vendor.

### Последствия

- S15-T002 проектирует Evidence Layer data model до любых connector migrations.
- S15-T003 определяет canonical normalization и identity keys.
- S15-T004 определяет confidence policy и Discovery Inbox.
- S15-T005 утверждает secret backend, окончательный RBAC, RLS, SSRF и runtime
  security controls.
- S15-T006/T007 нельзя закрыть без pilot source evidence или явного решения
  владельца отложить первый connector.
- CSV/XLSX остаётся стабильным current path до controlled compatibility
  migration.
- Future connector runtime должен иметь общий contract test suite, включая
  retries, redaction и two-tenant isolation.
- T001 не создаёт таблицы, UI, dependencies или production integrations.

---

*Документ подлежит обновлению при принятии новых архитектурных решений.*
*Все решения приняты до начала разработки и обязательны для исполнения.*
