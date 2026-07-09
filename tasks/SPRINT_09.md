# SPRINT 09 — Market MVP Packaging

`Проект: DTEK Core`  
`Спринт: 09`  
`Тип: Market MVP Preparation`  
`Основа: ADR-006, PRODUCT_STRATEGY.md, ROADMAP.md`  
`Статус: 🔜 Активный`

---

## 1. Цель Спринта

Подготовить DTEK Core к первым внешним демонстрациям, интервью с CISO и обсуждению пилотов.

Sprint 09 не добавляет тяжёлую продуктовую функциональность. Его задача — упаковать уже реализованный MVP так, чтобы новая команда, потенциальный клиент или интегратор сразу понимали продуктовую ценность.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Market MVP |
| Предыдущий Sprint | Sprint 08 — UX Refinement |
| Следующий Sprint | Sprint 10 — Reporting & Export |
| Milestone | Demo Ready + Interview Ready |

---

## 3. Бизнес-Ценность

После Sprint 09 DTEK Core можно показывать без пустых экранов и длинных объяснений. CISO должен увидеть понятный сценарий:

```text
Организация -> объекты -> риски -> Trust Score -> Trust Graph -> executive story
```

---

## 4. Scope / Non-Scope

### Входит

- демо-сценарий;
- демо-данные;
- ICP и interview script;
- product one-pager;
- синхронизация публичного описания продукта;
- подготовка первого pilot narrative.

### Не входит

- интеграции;
- импорт/экспорт;
- новая модель Trust Score;
- новые роли;
- enterprise security;
- on-prem.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости | Статус |
|---|---|---|---|---|---|
| S09-T001 | Demo Narrative: сценарий демонстрации DTEK Core | P1 | M | — | ✅ |
| S09-T002 | Demo Dataset Specification | P1 | M | T001 | ✅ |
| S09-T003 | Demo Seed Plan: данные организации, объектов, рисков и графа | P1 | M | T002 | 📋 |
| S09-T004 | ICP & Interview Script для российского рынка ИБ | P1 | S | T001 | 📋 |
| S09-T005 | Product One-Pager для CISO | P1 | S | T001 | 📋 |
| S09-T006 | Landing/Product Copy Alignment | P2 | S | T005 | 📋 |
| S09-T007 | Pilot Offer: 14-дневный сценарий оценки доверия | P1 | S | T004, T005 | 📋 |
| S09-T008 | Sprint 09 Documentation Sync | P1 | S | T001–T007 | 📋 |

---

## 6. Порядок Выполнения

```text
День 1
  S09-T001 Demo Narrative
  S09-T004 ICP & Interview Script

День 2
  S09-T002 Demo Dataset Specification
  S09-T005 Product One-Pager

День 3
  S09-T003 Demo Seed Plan
  S09-T006 Landing/Product Copy Alignment

День 4
  S09-T007 Pilot Offer
  S09-T008 Documentation Sync
```

---

## 7. Детализация Задач

### S09-T001 — Demo Narrative: сценарий демонстрации DTEK Core

**Описание:** описать последовательный сценарий показа продукта от входа в демо-организацию до вывода executive insight.

**Ожидаемый результат:** документированный сценарий 10–15 минут, показывающий Dashboard, Objects, Trust Passport, Risks, Graph, Configurator и Users.

**Артефакт:** `docs/product/DEMO_NARRATIVE.md`

### S09-T002 — Demo Dataset Specification

**Описание:** определить состав демонстрационной организации: отрасль, активы, риски, связи, роли пользователей, ожидаемые Trust Score.

**Ожидаемый результат:** спецификация данных для seed/import в Sprint 09 или Sprint 11.

**Артефакт:** `docs/product/DEMO_DATASET_SPEC.md`

### S09-T003 — Demo Seed Plan

**Описание:** определить способ наполнения demo org без нарушения архитектуры: seed script, SQL, admin-only action или documented manual import.

**Ожидаемый результат:** выбранный безопасный способ создания demo data и список необходимых таблиц.

### S09-T004 — ICP & Interview Script

**Описание:** подготовить профиль первого клиента и вопросы для интервью с CISO/ИБ-интеграторами.

**Ожидаемый результат:** 10–15 вопросов, критерии отбора компаний, expected signals.

### S09-T005 — Product One-Pager

**Описание:** описать DTEK Core на одном листе: проблема, решение, value proposition, 14-дневный pilot offer.

**Ожидаемый результат:** документ для отправки потенциальным пользователям.

### S09-T006 — Landing/Product Copy Alignment

**Описание:** сверить текст лендинга и README с новой стратегией Digital Trust & Cyber Risk Management.

**Ожидаемый результат:** список правок или обновлённый copy без изменения архитектуры.

### S09-T007 — Pilot Offer

**Описание:** сформировать предложение первого пилота: сроки, входные данные, результат, критерии успеха.

**Ожидаемый результат:** 14-дневный pilot сценарий для CISO.

### S09-T008 — Documentation Sync

**Описание:** синхронизировать README, DOCUMENTATION_INDEX, roadmap и user docs по результатам Sprint 09.

**Ожидаемый результат:** документация отражает demo-ready и interview-ready состояние.

---

## 8. Definition Of Done

- [x] Есть demo narrative.
- [x] Есть demo dataset specification.
- [ ] Есть ICP и interview script.
- [ ] Есть product one-pager.
- [ ] Есть pilot offer.
- [ ] Roadmap и документация синхронизированы.
- [ ] `npm run type-check` проходит.
- [ ] `npm run lint` проходит.
- [ ] `npm run build` проходит.

---

## 9. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| Demo dataset станет слишком искусственным | Средняя | Среднее | Использовать реальные типы активов и рисков из ICP |
| One-pager будет слишком техническим | Средняя | Высокое | Писать для CISO, не для разработчика |
| Попытка начать интеграции раньше времени | Низкая | Высокое | Следовать ADR-006 |
