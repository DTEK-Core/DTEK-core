# DEPENDENCY_MANAGEMENT.md — DTEK Core

`Версия: 1.0`  
`Дата: 25.06.2026`  
`Статус: Актуальный`

---

## Обзор

Документ описывает процесс управления npm-зависимостями DTEK Core с точки зрения безопасности.

---

## Стек зависимостей

### Производственные зависимости (dependencies)

| Пакет | Версия | Назначение |
|---|---|---|
| next | 15.x | Фреймворк Next.js |
| react / react-dom | 19.x | UI runtime |
| @supabase/supabase-js | 2.x | Supabase клиент |
| @supabase/ssr | 0.x | Supabase для Next.js SSR |
| zod | 3.x (v4) | Валидация схем |
| d3 | 7.x | Trust Graph визуализация |
| sonner | latest | Toast-уведомления |
| lucide-react | latest | Иконки |
| clsx / tailwind-merge | latest | CSS утилиты |
| @radix-ui/* | latest | Shadcn/UI примитивы |

### Dev-зависимости (devDependencies)

| Пакет | Назначение |
|---|---|
| typescript | TypeScript компилятор |
| eslint / eslint-config-next | Линтер |
| tailwindcss / postcss | CSS утилиты |
| @types/* | TypeScript типы |

---

## Политика обновлений

### Принципы

1. **Не обновлять ради обновления** — обновление только при наличии security fix или явной необходимости
2. **Patch-версии** (`15.1.x` → `15.1.y`) — можно обновлять при наличии security fix без ревью
3. **Minor-версии** (`15.1.x` → `15.2.x`) — обновление с проверкой changelog
4. **Major-версии** (`14.x` → `15.x`) — только в рамках планового спринта с полным тестированием (как в Sprint 06: S06-T006)

### Аудит зависимостей

**Ручной аудит:**
```bash
npm audit                    # все уязвимости
npm audit --audit-level=high # только high и critical
npm audit fix                # автоматическое исправление (только patch)
npm audit fix --force        # включая breaking changes (осторожно!)
```

**Периодичность:**
- MVP: перед каждым Security Sprint
- Пост-MVP: ежемесячный аудит в CI

---

## История аудитов

| Дата | Sprint | Результат |
|---|---|---|
| 22.06.2026 | Sprint 06 (S06-T006) | next@15 upgrade, 0 critical, 5 low-moderate (acceptable) |

Подробности: [DEPENDENCY_AUDIT_S06.md](DEPENDENCY_AUDIT_S06.md)

---

## Запрещённые пакеты / практики

- Пакеты с известными unfixed critical CVE — не использовать
- `npm install --legacy-peer-deps` — только с явного одобрения (задокументировать причину)
- Пакеты без активной поддержки (последний commit > 2 лет) — не добавлять без обоснования
- Пакеты с лицензией GPL/AGPL — проверить совместимость с коммерческим использованием

---

## Lockfile политика

- `package-lock.json` всегда коммитится в репозиторий
- `npm ci` используется в CI (воспроизводимая установка из lockfile)
- `npm install` при добавлении/обновлении зависимостей обновляет lockfile

---

## Реагирование на уязвимости

При обнаружении critical/high CVE:

1. **Оценить** — используется ли уязвимый код-путь в продукции?
2. **Исправить** — `npm audit fix` или ручное обновление
3. **Протестировать** — `npm run type-check && npm run lint && npm run build`
4. **Задокументировать** — создать файл аудита в `docs/security/`
5. **Деплоить** — через обычный CI/CD

Критические CVE, затрагивающие production-код: исправить в течение 24 часов.

---

## Планы (Sprint 09)

- Добавить `npm audit --audit-level=high` как шаг CI
- Настроить GitHub Dependabot для автоматических PRs на patch-обновления
- Добавить Snyk или OWASP Dependency-Check для расширенного сканирования
