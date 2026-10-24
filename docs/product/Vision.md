# Vision.md — DTEK Platform

`Статус: актуальный`  
`Дата: 24.10.2026`

---

## Видение

DTEK развивается из B2B Evidence-first Trust Intelligence Platform в единую
**Cybersecurity & Digital Trust Platform** для организаций, домашних сетей и
личной цифровой безопасности.

Платформа отвечает на последовательность вопросов:

```text
Что находится в разрешённом scope?
  -> Какие evidence подтверждены?
  -> Какие findings обнаружены?
  -> Как они влияют на доверие и риск?
  -> Что исправить первым?
  -> Как проверить результат?
```

---

## Что Сохраняется

Существующий DTEK Core не отменяется и становится фундаментом режима
**DTEK Business**. Trust Passport, Trust Score, Trust Graph, Risk Registry,
import/reporting и design system переиспользуются и расширяются постепенно.

Общий Trust Core связывает:

```text
Assets / Identities
  -> Evidence
  -> Findings
  -> Trust Passport / Score / Graph
  -> Risks / Impact
  -> Recommendations / Remediation
```

---

## Продуктовые Режимы

- **Business** — понять и защитить организационную инфраструктуру.
- **Home** — понять и защитить собственную домашнюю сеть и устройства.
- **Personal** — понять и улучшать безопасность собственной цифровой личности.
- **DTEK Exposure** — безопасно проверить собственные подтверждённые
  identifiers и публичный цифровой след.
- **Knowledge & Remediation** — понять проблему, исправить её и проверить
  результат.

Это целевая модель. На текущем этапе реализован только Business foundation;
остальные режимы имеют статус `PLANNED`.

---

## Принципы

- evidence before claims;
- explicit authorization, consent и ownership;
- mode/workspace isolation;
- explainable, mode-specific Trust Score;
- human confirmation для неоднозначного discovery;
- no unauthorized scanning, doxxing или disclosure of secrets;
- рекомендация всегда отделена от автоматического изменения системы;
- развитие поверх текущего Next.js, TypeScript, Supabase, PostgreSQL и RLS.

---

## Долгосрочная Цель

Сделать DTEK понятным слоем цифрового доверия, который превращает разрозненные
технические сигналы в проверяемую модель состояния, приоритеты и безопасные
действия для разных контекстов пользователя.

Главный документ концепции:
[DTEK_PLATFORM_VISION.md](DTEK_PLATFORM_VISION.md).
