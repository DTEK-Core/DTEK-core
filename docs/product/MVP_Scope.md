# MVP_Scope.md — DTEK Core

`Статус: актуальный`  
`Дата: 07.08.2026`

---

## 1. Цель MVP

Подтвердить, что DTEK Core может быть рабочим инструментом для управления цифровым доверием активов и киберрисками организации.

Пользователь должен пройти путь:

```text
Создать организацию
-> добавить или импортировать объекты
-> зарегистрировать или импортировать риски
-> увидеть Trust Passport
-> получить Trust Score
-> увидеть Trust Graph
-> принять управленческое решение
```

После ADR-007 стратегический путь расширяется: сейчас пользователь загружает выгрузки как первый evidence ingestion path, а подключение источников и автоматическое построение модели остаются Post-MVP развитием.

---

## 2. Functional MVP — Статус

Функциональный MVP реализован в Sprint 01–08.

| Блок | Статус |
|---|---|
| Аутентификация | Реализовано |
| Организации | Реализовано |
| Пользователи и роли | Реализовано |
| Invitations | Реализовано на MVP-уровне |
| Объекты | Реализовано |
| Trust Passport | Реализовано |
| Trust Score | Реализовано |
| Risk Registry | Реализовано |
| Trust Graph | Реализовано |
| Dashboard | Реализовано |
| Configurator | Реализовано |
| RBAC/RLS | Реализовано |
| Security Audit Log | Реализовано |
| UX polish | Реализовано в Sprint 08 |

---

## 3. Market MVP — Следующий Scope

Market MVP нужен для первых внешних демонстраций, интервью и пилотов.

Обязательно:

- demo seed data;
- demo scenario;
- CSV/XLSX import объектов как первый evidence ingestion path;
- CSV/XLSX import рисков;
- PDF Trust Passport export;
- CSV Risk Registry export;
- executive organization report;
- Trust Score explainability;
- risk impact hints;
- workflow риска: owner, due date, comments, activity и manual/imported origin context;
- source/evidence context в explainability;
- стабильный invite flow;
- pilot runbook.
- финальный pilot/release checklist, включая Sprint 12 manual QA и Cloud migration check.

---

## 4. Post-MVP / Не Входит В Commercial MVP

- полноценный SIEM/SOAR;
- DLP;
- EDR/XDR;
- собственный агент;
- marketplace;
- on-prem runtime;
- кастомные роли;
- SSO/SAML;
- много внешних коннекторов одновременно;
- ML/AI scoring.
- Connector Framework, Evidence Layer, Discovery Inbox и Identity Resolution runtime;
- auto-candidate риски и автоматическое discovery;
- первый production connector и marketplace.

---

## 5. Критерии Успеха Market MVP

| Критерий | Ожидаемый результат |
|---|---|
| Demo readiness | Продукт можно показать без ручной подготовки БД |
| Data onboarding | 50–200 активов можно загрузить без ручного ввода |
| Reporting | CISO получает отчёт для руководства |
| Explainability | Пользователь понимает причину Trust Score и происхождение данных |
| Pilot readiness | Продукт можно дать 1–3 организациям на 2–4 недели |
| Product validation | Есть подтверждение интереса и willingness to pilot |

---

## 6. Метрики

- Количество организаций.
- Количество активных пользователей.
- Количество объектов.
- Количество рисков.
- Количество связей.
- Средний Trust Score организации.
- Количество экспортированных отчётов.
- Time to first value.
- Доля объектов с заполненным Trust Passport.
- Доля объектов с source/evidence context.
