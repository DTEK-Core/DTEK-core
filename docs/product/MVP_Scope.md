# MVP_Scope.md — DTEK Core

`Статус: актуальный`  
`Дата: 08.07.2026`

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

После ADR-007 целевой путь расширяется: пользователь подключает источники или загружает выгрузки, DTEK Core создаёт evidence-backed цифровую модель, а аналитик подтверждает и корректирует её.

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
- workflow риска: owner, due date, comments, evidence;
- source/evidence context в explainability;
- стабильный invite flow;
- pilot runbook.
- Connector Framework Foundation.

---

## 4. Не Входит В Market MVP

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

---

## 5. Критерии Успеха Market MVP

| Критерий | Ожидаемый результат |
|---|---|
| Demo readiness | Продукт можно показать без ручной подготовки БД |
| Data onboarding | 50–200 активов можно загрузить без ручного ввода |
| Reporting | CISO получает отчёт для руководства |
| Explainability | Пользователь понимает причину Trust Score и происхождение данных |
| Pilot readiness | Продукт можно дать 1–3 организациям на 2–4 недели |
| Connector foundation | Понятно, какие источники подключать первыми и как делать это безопасно |
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
