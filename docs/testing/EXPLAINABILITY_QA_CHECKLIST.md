# EXPLAINABILITY_QA_CHECKLIST.md — DTEK Core

`Спринт: Sprint 12 — Evidence-backed Trust Explainability`  
`Задача: S12-T008 — Explainability QA Checklist`  
`Тип: ручная приёмка объяснимости Trust Score`  
`Дата: 20.07.2026`

---

## Назначение

Этот документ проверяет целостность Evidence-backed Trust Explainability Sprint 12:

- итоговый Trust Score совпадает с факторной формулой ADR-001;
- Top Score Drivers ранжируются по фактическому взвешенному отклонению от уровня 70;
- Factor Reason Cards объясняют base, penalties, completeness bonus и contribution;
- Risk Impact Hint использует counterfactual расчёт текущего engine;
- история показывает только фактически сохранённые изменения и доступные factor snapshots;
- import source context отображается без подмены полноценного evidence record;
- Dashboard агрегирует object-level drivers без новой организационной формулы;
- explainability сохраняет RBAC, RLS и multi-tenant isolation;
- empty/error/mobile states не вводят пользователя в заблуждение.

Чеклист не меняет данные напрямую в Supabase, не запускает миграции и не требует `service_role`. Тестовые данные создаются через UI и существующий import flow.

Если найден дефект, заполните **Журнал замечаний** или используйте [BUG_REPORT_TEMPLATE.md](BUG_REPORT_TEMPLATE.md).

---

## Границы Достоверности

Во время проверки считайте дефектом любую формулировку, которая утверждает больше, чем известно системе.

Корректные границы Sprint 12:

- `source context` описывает происхождение записи, но не является самостоятельным evidence record;
- `confidence` является metadata и не влияет на Trust Score;
- Risk Impact Hint является ориентировочным counterfactual результатом, а не гарантией;
- дата источника рядом с историей не доказывает причинность изменения Score;
- отсутствие зарегистрированных активных рисков не означает абсолютную безопасность объекта;
- Dashboard summary агрегирует причины объектов и не вводит отдельный organization score engine.

---

## Статусы Проверки

| Статус | Значение |
|---|---|
| `PASS` | Фактический результат соответствует ожидаемому |
| `FAIL` | Найдено расхождение UI, формулы, source context или прав доступа |
| `BLOCKED` | Проверка невозможна из-за окружения или внешнего сервиса |
| `N/A` | Сценарий неприменим к текущей тестовой организации |

Не отмечайте сценарий как `PASS`, если проверена только видимость блока без сверки значений или поведения.

---

## Инженерный Baseline

Перед передачей checklist на ручную приёмку выполняются:

| Проверка | Статус | Ожидаемый результат |
|---|---|---|
| `npm run type-check` | `PASS` | TypeScript strict без ошибок |
| `npm run lint` | `PASS` | ESLint без ошибок |
| `npm run build` | `PASS` | Production build успешен |
| `npm run test:trust-explainability` | `PASS` | 17/17 explainability contract tests проходят |
| `npm run test:import` | `PASS` | 19/19 import contract tests проходят |

Автоматические проверки подтверждают pure calculation contracts, но не заменяют authenticated UI, RBAC и responsive testing.

---

## Подготовка Окружения

### 1. Безопасная Тестовая Организация

Используйте отдельную организацию без рабочих данных. Зафиксируйте перед началом:

```text
Организация:
URL окружения:
Commit:
Дата и время:
Проверяющий:
```

### 2. Запуск Приложения

```bash
npm run dev
```

Откройте `http://localhost:3000`, DevTools Console и Network. Supabase должен быть доступен; постоянные `fetch failed`, refresh-token retry и необработанные ошибки недопустимы.

### 3. Тестовые Роли

Все аккаунты должны находиться в одной организации:

| Роль | Что Проверяется |
|---|---|
| `owner` | Полный data setup, Configurator и explainability |
| `analyst` | Чтение explainability и разрешённая переоценка |
| `admin` | Чтение explainability и переоценка отдельного объекта |
| `viewer` | Read-only explainability без возможности переоценки |

Создайте роли через invite flow владельца. Не регистрируйте analyst/admin/viewer через `/register`, иначе они окажутся владельцами отдельных организаций. Подробности: [RBAC_TESTING_GUIDE.md](RBAC_TESTING_GUIDE.md).

### 4. Тестовые Объекты

Подготовьте четыре объекта:

| Префикс | Назначение | Подготовка |
|---|---|---|
| `S12-WORKED-01` | Эталон формулы | `high`, completeness 85%, high vulnerability risk, medium configuration risk |
| `S12-CLAMP-01` | Clamp и zero rounded impact | `critical`, минимум три active critical vulnerability risks |
| `S12-EMPTY-01` | Empty/manual source states | Объект без активных рисков и import metadata |
| `S11-OBJ-SERVER-001` | Import source context | Импорт из Sprint 11 fixture |

Для `S12-WORKED-01` заполните name, type, owner, criticality, IP, OS, segment и exposure, но оставьте description пустым. Это даёт completeness 85% по ADR-001.

Создайте и свяжите с ним два активных риска:

| Название | Категория | Severity | Status | Penalty |
|---|---|---|---|---:|
| `S12-VULN-HIGH` | `vulnerability` | `high` | `open` | 25 |
| `S12-CONFIG-MEDIUM` | `configuration` | `medium` | `in_progress` | 15 |

Используйте default weights: `22 / 18 / 18 / 14 / 16 / 12`.

### 5. Эталонные Значения

Для `S12-WORKED-01` после переоценки ожидается:

| Factor | Base | Penalty | Bonus | Score | Weight | Contribution | Delta К 70 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Уязвимости | 70 | 25 | 0 | 45 | 22% | 9.9 | -5.5 |
| Конфигурация | 70 | 15 | 0 | 55 | 18% | 9.9 | -2.7 |
| Доступ | 70 | 0 | 0 | 70 | 18% | 12.6 | 0.0 |
| Сеть | 70 | 0 | 0 | 70 | 14% | 9.8 | 0.0 |
| Соответствие | 70 | 0 | 10 | 80 | 16% | 12.8 | +1.6 |
| Инциденты | 70 | 0 | 0 | 70 | 12% | 8.4 | 0.0 |

```text
Trust Score = round(63.4) = 63
Risk Impact: S12-VULN-HIGH = +6, S12-CONFIG-MEDIUM = +3
```

---

## Краткий Итог Проверки

| Блок | Статус | Замечания |
|---|---|---|
| Formula и Top Drivers |  |  |
| Factor Reason Cards |  |  |
| Source Context |  |  |
| Risk Impact Hint |  |  |
| Score Delta Timeline |  |  |
| Dashboard Summary |  |  |
| Import Regression |  |  |
| RBAC и Tenant Isolation |  |  |
| Empty/Error States |  |  |
| Mobile/Desktop UI |  |  |
| Документация |  |  |

---

## Блок 1 — Formula И Top Score Drivers

### TC-S12-001 — Эталонный Trust Score

**Роль:** owner  
**Объект:** `S12-WORKED-01`

1. Откройте `/objects/[id]/passport`.
2. Нажмите **Переоценить**.
3. Сверьте итоговый Score и шесть factor scores с таблицей эталонных значений.

Ожидаемый результат:

- [ ] Completeness равен 85%.
- [ ] Итоговый Trust Score равен 63.
- [ ] Factor scores равны `45 / 55 / 70 / 70 / 80 / 70`.
- [ ] Сумма contributions равна 63.4, а итог округлён один раз до 63.
- [ ] UI не показывает альтернативную формулу или второй Score.
- [ ] В Console и Network нет необработанных ошибок.

**Статус:**

**Замечания:**

---

### TC-S12-002 — Ranking Top Drivers

**Роль:** owner  
**Объект:** `S12-WORKED-01`

1. Найдите блок **Ключевые факторы оценки**.
2. Сверьте порядок, направление и вклад drivers.

Ожидаемый результат:

- [ ] Drivers отсортированы: Уязвимости, Конфигурация, Соответствие.
- [ ] Показаны значения `-5.5`, `-2.7`, `+1.6` относительно уровня 70.
- [ ] Нейтральные факторы с delta `0.0` не попали в список.
- [ ] Отображается не более пяти drivers.
- [ ] Направление и текст соответствуют знаку: negative снижает, positive поддерживает Score.
- [ ] При одинаковом абсолютном влиянии порядок стабилен и не меняется после refresh.

**Статус:**

**Замечания:**

---

### TC-S12-003 — Custom Weights

**Роль:** owner или analyst

1. Зафиксируйте текущий порядок drivers `S12-WORKED-01`.
2. В `/configurator` увеличьте вес Конфигурации и уменьшите вес Уязвимостей, сохранив сумму 100%.
3. Выполните пересчёт и снова откройте паспорт.
4. После проверки верните default weights.

Ожидаемый результат:

- [ ] Factor scores не меняются только из-за смены весов.
- [ ] Contributions и neutral deltas используют новые веса.
- [ ] Порядок Top Drivers меняется в соответствии с абсолютным взвешенным влиянием.
- [ ] Итоговый Score совпадает с суммой новых contributions после округления.
- [ ] После возврата default weights эталонные значения восстанавливаются.

**Статус:**

**Замечания:**

---

## Блок 2 — Factor Reason Cards

### TC-S12-004 — Арифметика Reason Cards

**Роль:** owner  
**Объект:** `S12-WORKED-01`

1. В блоке **Расчёт оценки** раскройте все шесть карточек.
2. Сверьте base, penalties, bonus, factor score, weight и contribution.

Ожидаемый результат:

- [ ] Каждая карточка показывает `base - penalties + bonus = factor score`.
- [ ] Уязвимости: `70 - 25 + 0 = 45`.
- [ ] Конфигурация: `70 - 15 + 0 = 55`.
- [ ] Соответствие: `70 - 0 + 10 = 80`.
- [ ] Contribution каждой карточки равен `factor score × weight / 100`.
- [ ] Сохранённый factor score совпадает с текущим расчётом; warning о рассинхронизации отсутствует.
- [ ] Раскрытие карточек не меняет размеры или значения соседних блоков.

**Статус:**

**Замечания:**

---

### TC-S12-005 — Active И Inactive Risks В Причинах

**Роль:** owner

1. Создайте дополнительный закрытый vulnerability risk и свяжите его с `S12-WORKED-01`.
2. Переоцените объект.
3. Раскройте карточку **Уязвимости**.

Ожидаемый результат:

- [ ] В списке причин присутствует active риск `S12-VULN-HIGH`.
- [ ] Показанный applied penalty равен 25.
- [ ] Закрытый риск не добавляет penalty и не показывается как активная причина.
- [ ] Текст говорит об отсутствии зарегистрированных активных рисков, а не об абсолютной безопасности.
- [ ] Риски другого фактора не попадают в карточку Уязвимостей.

**Статус:**

**Замечания:**

---

### TC-S12-006 — Clamp В Reason Card

**Роль:** owner  
**Объект:** `S12-CLAMP-01`

1. Свяжите минимум три active critical vulnerability risks.
2. Переоцените объект.
3. Раскройте карточку **Уязвимости**.

Ожидаемый результат:

- [ ] Сумма raw penalties может превышать base.
- [ ] Factor score ограничен снизу значением 0.
- [ ] Показано пояснение, что результат ограничен диапазоном 0–100.
- [ ] UI не показывает отрицательный factor score.
- [ ] Итоговый Score использует clamped factor score 0.

**Статус:**

**Замечания:**

---

## Блок 3 — Source Context

### TC-S12-007 — Manual Source Fallback

**Роль:** любая  
**Объект:** `S12-EMPTY-01`

1. Откройте Trust Passport объекта, созданного вручную без `[Import Source]` metadata.
2. Раскройте Factor Reason Cards и блок **Почему изменился Score**.

Ожидаемый результат:

- [ ] Показывается источник **Ручные данные DTEK Core**.
- [ ] Источник явно не обозначен как evidence record.
- [ ] Не показываются выдуманные confidence, collected date или external source ID.
- [ ] Отсутствие import metadata не ломает страницу.

**Статус:**

**Замечания:**

---

### TC-S12-008 — Imported Source Metadata

**Роль:** owner или analyst  
**Fixture:** `testing/sprint-11-import/objects/objects-valid-60.csv`

1. Импортируйте fixture в свежую тестовую организацию.
2. Откройте паспорт `S11-OBJ-SERVER-001`.
3. Раскройте любую reason card и source timeline.

Ожидаемый результат:

- [ ] Показан source name `S11 Test Asset Inventory`.
- [ ] Показаны source type, collected date и confidence `medium`.
- [ ] Текст явно говорит `source context, не evidence record`.
- [ ] Внутренний `source_record_id` не показан в UI.
- [ ] `confidence` не изменяет factor score, contribution или Trust Score.
- [ ] Source metadata отображается как текст и не исполняется как HTML/скрипт.

**Статус:**

**Замечания:**

---

### TC-S12-009 — Malformed Source Block

**Роль:** owner

1. Создайте тестовый объект с description:

```text
[Import Source]
source_name: Broken Source
unknown_key: value
confidence: high
```

2. Откройте его Trust Passport.

Ожидаемый результат:

- [ ] Страница открывается без ошибки.
- [ ] Malformed block не считается валидным import source.
- [ ] Используется безопасный manual fallback.
- [ ] Raw parser error, stack trace и внутренние ID не показываются.

**Статус:**

**Замечания:**

---

## Блок 4 — Risk Impact Hint

### TC-S12-010 — Counterfactual Impact Активных Рисков

**Роль:** owner  
**Объект:** `S12-WORKED-01`

1. Откройте паспорт объекта и Risk Drawer обоих связанных рисков.
2. Сверьте current score, projected score и potential gain.

Ожидаемый результат:

- [ ] Для `S12-VULN-HIGH`: `63 → 69`, ориентировочно `+6`.
- [ ] Для `S12-CONFIG-MEDIUM`: `63 → 66`, ориентировочно `+3`.
- [ ] Значения одинаковы в Risk Drawer и Trust Passport.
- [ ] Формулировка использует «может» или «ориентировочно», а не обещает результат.
- [ ] Расчёт hint не меняет риск, паспорт, историю или Score.

**Статус:**

**Замечания:**

---

### TC-S12-011 — Inactive Risk

**Роль:** owner

1. Переведите один тестовый риск в `closed`, `mitigated` или `accepted`.
2. Откройте Risk Drawer и Trust Passport.

Ожидаемый результат:

- [ ] Риск обозначен как не влияющий сейчас на Trust Score.
- [ ] Potential gain равен 0 и не выдаётся как ожидаемое улучшение.
- [ ] Риск не входит в active penalties reason card.
- [ ] После переоценки Score соответствует только оставшимся active рискам.

**Статус:**

**Замечания:**

---

### TC-S12-012 — Clamp И No Rounded Change

**Роль:** owner  
**Объект:** `S12-CLAMP-01`

1. Убедитесь, что vulnerability factor уже clamped к 0 несколькими critical risks.
2. Откройте impact каждого риска.

Ожидаемый результат:

- [ ] Хотя raw penalty существует, удаление одного риска может не изменить clamped factor.
- [ ] Для такого риска показано **Закрытие не изменит округлённый Score**.
- [ ] Current и projected Score совпадают.
- [ ] UI не показывает фиктивный положительный gain.

**Статус:**

**Замечания:**

---

## Блок 5 — Score Delta Explanation

### TC-S12-013 — Первая Запись Истории

**Роль:** owner или analyst

1. Создайте новый объект и выполните первую переоценку.
2. Откройте **Почему изменился Score**.

Ожидаемый результат:

- [ ] Показана первая зафиксированная оценка.
- [ ] Factor causality не выдумывается при отсутствии предыдущего snapshot.
- [ ] Показано честное ограничение исторических данных.
- [ ] Инициатор показан как безопасная роль `Пользователь`, `Система` или `Служебный процесс`, без UUID.

**Статус:**

**Замечания:**

---

### TC-S12-014 — Изменение Score И Factors

**Роль:** owner  
**Объект:** `S12-WORKED-01`

1. Зафиксируйте текущий Score и factor scores.
2. Измените статус `S12-VULN-HIGH` так, чтобы риск перестал быть active.
3. Выполните переоценку.
4. Откройте последнюю запись и предыдущие изменения.

Ожидаемый результат:

- [ ] История показывает фактические old score, new score и delta.
- [ ] В factor deltas присутствует только реально изменившийся factor.
- [ ] Значения factor before/after совпадают с соседними полными snapshots.
- [ ] Предыдущие записи доступны в раскрываемом списке, максимум пять событий.
- [ ] Refresh страницы не меняет сохранённую историю.

**Статус:**

**Замечания:**

---

### TC-S12-015 — Source Timeline Без Недоказанной Причинности

**Роль:** любая  
**Объект:** импортированный объект с импортированным риском

1. Откройте блок **Контекст источников** рядом с историей.
2. Сверьте sources и даты.

Ожидаемый результат:

- [ ] Sources дедуплицированы и более свежие даты идут раньше.
- [ ] Текст явно говорит, что даты сбора не являются доказанной причиной изменения Score.
- [ ] Текущий source context не подменяет исторический event.
- [ ] UUID пользователя и `source_record_id` отсутствуют.

**Статус:**

**Замечания:**

---

## Блок 6 — Dashboard Explainability Summary

### TC-S12-016 — Организационная Агрегация

**Роль:** любая  
**URL:** `/dashboard`

1. Убедитесь, что в организации есть несколько пересчитанных объектов с negative drivers.
2. Откройте блок **Что снижает доверие**.

Ожидаемый результат:

- [ ] Показывается максимум три отрицательных фактора.
- [ ] Positive и neutral drivers не включены.
- [ ] Для каждого фактора видны текущий вес, affected objects, coverage и среднее negative delta.
- [ ] Счётчик `Паспорта X/Y` соответствует активным объектам с полной факторной оценкой.
- [ ] Объект **Наибольшее влияние** действительно имеет наиболее отрицательный object-level delta.
- [ ] Dashboard не показывает отдельную новую формулу organization score.

**Статус:**

**Замечания:**

---

### TC-S12-017 — Ссылка На Leading Object

**Роль:** любая

1. В каждой строке Dashboard summary нажмите объект **Наибольшее влияние**.

Ожидаемый результат:

- [ ] Открывается Trust Passport выбранного объекта.
- [ ] В его Top Drivers присутствует соответствующий фактор.
- [ ] Object-level factor score и delta совпадают со значениями Dashboard.
- [ ] Back navigation возвращает Dashboard без потери состояния приложения.

**Статус:**

**Замечания:**

---

### TC-S12-018 — Dashboard Empty States

**Роль:** owner  
**Окружение:** свежая тестовая организация либо организация без material negative drivers

Ожидаемый результат:

- [ ] Без рассчитанных паспортов показано **Недостаточно данных для сводки**.
- [ ] При наличии паспортов без material negative drivers показано **Материальных отрицательных факторов нет**.
- [ ] Empty state не утверждает, что организация безопасна или риски отсутствуют.
- [ ] Блок не исчезает с layout shift и не ломает Dashboard.

**Статус:**

**Замечания:**

---

## Блок 7 — Import Regression

### TC-S12-019 — Explainability После CSV/XLSX Import

**Роль:** owner или analyst

1. Импортируйте objects и risks fixtures Sprint 11.
2. Убедитесь, что импортированные риски связаны с указанными объектами.
3. Переоцените связанные объекты.
4. Откройте Objects, Risks, Passport и Dashboard.

Ожидаемый результат:

- [ ] Import preview и commit продолжают работать.
- [ ] Imported source metadata участвует только в source context.
- [ ] Active imported risks создают те же penalties, что и ручные риски той же категории/severity.
- [ ] Trust Score, reason cards, impact hints и Dashboard используют импортированные данные.
- [ ] Duplicate detection и create-only поведение Sprint 11 не изменились.
- [ ] Нет постоянных retry, зависаний или повторной записи данных при чтении explainability.

**Статус:**

**Замечания:**

---

## Блок 8 — RBAC И Multi-tenant Isolation

### TC-S12-020 — Read Access Четырёх Ролей

В одной организации по очереди откройте тот же Trust Passport и Dashboard под `owner`, `analyst`, `admin`, `viewer`.

Ожидаемый результат:

- [ ] Все четыре роли видят одинаковые tenant-scoped Score, drivers, reason cards, sources, impact и history.
- [ ] `owner`, `analyst`, `admin` могут переоценить отдельный объект.
- [ ] Для `viewer` кнопка **Переоценить** disabled и Server Action не расширяет права.
- [ ] Explainability не открывает новых действий редактирования риска или объекта.
- [ ] В UI нет organization ID, profile UUID, raw SQL/Supabase errors или service keys.

**Статус:**

**Замечания:**

---

### TC-S12-021 — Изоляция Второй Организации

**Роль:** owner второй организации

1. В первой организации скопируйте URL паспорта тестового объекта.
2. Войдите в аккаунт второй организации в отдельном браузере.
3. Откройте скопированный URL.

Ожидаемый результат:

- [ ] Объект и explainability первой организации не отображаются.
- [ ] Показано безопасное not-found/недоступное состояние или redirect.
- [ ] Network response не содержит Score, factors, risks, sources или history чужого tenant.
- [ ] Внутренние ID и SQL/Supabase details не раскрываются.

**Статус:**

**Замечания:**

---

## Блок 9 — Empty, Error И Responsive States

### TC-S12-022 — Empty Passport States

**Роль:** любая  
**Объект:** `S12-EMPTY-01`

Ожидаемый результат:

- [ ] Без active risks показывается «Активные риски этого фактора не зарегистрированы».
- [ ] Без history показывается «История изменений пока пуста».
- [ ] Без import metadata работает manual source fallback.
- [ ] При neutral factors Top Drivers показывает отсутствие существенных отклонений.
- [ ] Ни одно empty state не заявляет абсолютную безопасность.

**Статус:**

**Замечания:**

---

### TC-S12-023 — Safe Error Handling

**Роль:** любая

1. Откройте несуществующий passport URL с валидным UUID.
2. Кратковременно проверьте поведение при недоступном Supabase только в безопасной локальной среде, если это уже предусмотрено вашим smoke setup.

Ожидаемый результат:

- [ ] Показано безопасное состояние, redirect или not found.
- [ ] UI не показывает stack trace, SQL, raw Supabase error или secrets.
- [ ] Нет бесконечного loading state и постоянных retry.
- [ ] После восстановления соединения обычная навигация снова работает без очистки данных.

**Статус:**

**Замечания:**

---

### TC-S12-024 — Mobile И Desktop Layout

**Роль:** любая

Проверьте `/dashboard`, `/objects/[id]/passport` и Risk Drawer на ширинах 390 px, 768 px и desktop.

Ожидаемый результат:

- [ ] Drivers, formulas и signed deltas не обрезаются.
- [ ] Длинные object/risk/source names переносятся и не перекрывают соседние значения.
- [ ] Reason Cards и history раскрываются с доступной областью нажатия.
- [ ] Dashboard leading-object link полностью доступен.
- [ ] Нет горизонтального overflow страницы, наложения текста и layout shift при раскрытии.
- [ ] Keyboard focus видим на интерактивных элементах.

**Статус:**

**Замечания:**

---

## Блок 10 — Документация

### TC-S12-025 — User Documentation Alignment

Сверьте фактический UI с [TRUST_SCORE_GUIDE.md](../user/TRUST_SCORE_GUIDE.md), [FAQ.md](../user/FAQ.md) и [USER_GUIDE.md](../user/USER_GUIDE.md).

Ожидаемый результат:

- [ ] Названия блоков и пользовательские формулировки совпадают с UI.
- [ ] Neutral reference 70 и driver ranking описаны корректно.
- [ ] Formula, rounding, clamp и completeness bonus не противоречат ADR-001.
- [ ] Source context отделён от будущего Evidence Layer.
- [ ] Risk Impact Hint описан как ориентировочный.
- [ ] Ограничения history и current source timeline объяснены честно.
- [ ] Все локальные ссылки работают.

**Статус:**

**Замечания:**

---

## Журнал Замечаний

| ID | Сценарий | Роль | Фактический Результат | Ожидаемый Результат | Severity | Статус |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

Severity:

- `Blocker`: explainability или Trust Passport нельзя использовать;
- `Critical`: формула расходится с UI, нарушены RBAC/RLS или tenant isolation;
- `Major`: drivers, reasons, impact, history, source или Dashboard дают неверный результат;
- `Minor`: визуальная, responsive или текстовая проблема без искажения смысла;
- `Question`: требуется продуктовое или архитектурное уточнение.

---

## Definition Of Ready Для Закрытия Sprint 12

Sprint 12 можно считать достигшим milestone **Evidence-backed Explainability Ready**, если:

- [ ] Все P1-сценарии имеют статус `PASS`.
- [ ] Нет открытых `Blocker` и `Critical` замечаний.
- [ ] Эталонный Score, factor scores и contributions совпадают с ADR-001.
- [ ] Top Drivers, reason cards, rounding и clamp подтверждены вручную.
- [ ] Risk Impact Hint совпадает с counterfactual engine result.
- [ ] History не выдумывает причинность при неполных snapshots.
- [ ] Manual/imported/malformed source states безопасны и честны.
- [ ] Dashboard summary согласован с object-level drivers.
- [ ] Четыре роли и tenant isolation подтверждены.
- [ ] Import flow Sprint 11 не получил регрессию.
- [ ] Mobile/desktop UI и user documentation соответствуют реализации.
- [ ] Инженерный baseline полностью `PASS`.

---

## Итоговый Протокол

Заполните после ручного прогона:

```text
Дата проверки:
Проверяющий:
Окружение:
Браузер:
Commit / версия:

Эталон S12-WORKED-01:
Trust Score:
Top Drivers:
Risk Impact:

Итоговый статус:
PASS / FAIL / BLOCKED

Краткий вывод:

Критичные замечания:

Некритичные замечания:

Решение:
Sprint 12 готов к закрытию / Требуются исправления
```

---

## Связанные Документы

- [Evidence_Explainability_Model.md](../architecture/Evidence_Explainability_Model.md) — технический explainability contract.
- [Trust_Score_Model_v2.md](../architecture/Trust_Score_Model_v2.md) — утверждённая формула ADR-001.
- [TRUST_SCORE_GUIDE.md](../user/TRUST_SCORE_GUIDE.md) — пользовательское объяснение Score.
- [DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md](DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md) — regression baseline импорта.
- [RBAC_TESTING_GUIDE.md](RBAC_TESTING_GUIDE.md) — подготовка ролей.
- [BUG_REPORT_TEMPLATE.md](BUG_REPORT_TEMPLATE.md) — оформление дефекта.
- [SPRINT_12.md](../../tasks/SPRINT_12.md) — scope и статус Sprint 12.

---

*Чеклист подготовлен для ручной приёмки Sprint 12. Milestone закрывается после заполнения итогового протокола владельцем проекта.*
