# COPY_ALIGNMENT.md — DTEK Core

`Sprint: S09-T006`  
`Статус: актуальный`  
`Дата: 09.07.2026`  
`Назначение: выравнивание публичного copy с Market MVP стратегией`

---

## 1. Назначение

Документ фиксирует результат S09-T006 — сверку текста лендинга и README с новой стратегией DTEK Core.

Цель правок — привести публичное описание продукта к формулировкам из:

- [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md);
- [PRODUCT_ONE_PAGER.md](PRODUCT_ONE_PAGER.md);
- [ICP_INTERVIEW_SCRIPT.md](ICP_INTERVIEW_SCRIPT.md);
- [DEMO_NARRATIVE.md](DEMO_NARRATIVE.md).

---

## 2. Принцип Выравнивания

DTEK Core описывается как:

> Evidence-first Trust Intelligence Platform.

В публичном copy не использовать формулировки, которые могут создать ожидание тяжёлой enterprise-платформы, SIEM, сканера, CMDB, GRC или интеграционного хаба.

---

## 3. Что Было Выравнено

| Область | Было | Стало |
|---|---|---|
| Категория на лендинге | Операционная система цифрового доверия | Digital Trust & Cyber Risk Management |
| Hero message | Цифровой двойник инфраструктуры | Управленческая картина доверия, рисков и связей |
| H1 | Цифровая модель доверия вашей организации | Цифровое доверие и киберриски активов |
| CTA | Начать работу | Запросить пилот |
| Product boundary | Платформа управления доверием | Не SIEM / не EDR / не CMDB / не GRC, а trust/risk layer |
| Configurator | Веса, коннекторы и правила | Отраслевые веса Trust Score |
| Stats | 1248 объектов в демо-модели | 50–200 активов в пилоте |
| README status | Sprint 08 завершён, Market MVP консолидация | Sprint 09 активен, Market MVP Packaging |

---

## 4. Утверждённые Формулировки

### Короткое Позиционирование

```text
DTEK Core — платформа управления цифровым доверием и киберрисками активов.
```

### Hero Copy

```text
Цифровое доверие и киберриски активов
```

### Value Copy

```text
DTEK Core связывает активы, риски, Trust Score и зависимости в единую управленческую картину для CISO.
```

### Pilot Copy

```text
За 14 дней собрать цифровую карту доверия 50–200 ключевых активов, показать Trust Score организации и топ-10 рисков.
```

---

## 5. Что Не Менялось

S09-T006 не менял:

- архитектуру приложения;
- маршруты;
- бизнес-логику;
- Supabase-схему;
- роли и RBAC;
- дизайн-систему;
- зависимости;
- roadmap.

---

## 6. Acceptance Criteria

S09-T006 считается выполненной, если:

- landing не обещает SIEM, EDR, CMDB, GRC, сканер или integration hub;
- hero copy соответствует Digital Trust & Cyber Risk Management;
- README отражает активный Sprint 09 и Market MVP Packaging;
- CTA и stats не противоречат 14-дневному pilot offer;
- Sprint 09 содержит ссылку на этот артефакт.
