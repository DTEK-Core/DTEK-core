# SECURE_SDLC.md — DTEK Core

`Версия: 1.0`  
`Дата: 25.06.2026`  
`Статус: MVP-базовый; расширяется в Sprint 09`

---

## Обзор

Secure SDLC (Software Development Lifecycle) описывает, как безопасность встроена в каждый этап разработки DTEK Core — от проектирования до деплоя.

---

## Этапы и меры безопасности

### 1. Проектирование (Design)

**Что делаем:**
- ADR (Architecture Decision Records) для всех ключевых решений
- Модель угроз перед началом нового функционального блока
- Проектирование с принципом "deny by default" (RBAC, RLS)
- Ревью данных: определяем, какие поля чувствительны

**Документы:**
- `ARCHITECTURE_DECISIONS.md` — ADR-001–005
- `docs/security/THREAT_MODEL.md`
- `docs/security/RBAC_MODEL.md`

### 2. Разработка (Development)

**Что делаем:**
- TypeScript strict mode — ловит ошибки типизации на этапе компиляции
- Zod-валидация всех входящих данных в Server Actions
- Никаких `any` — запрещено по проектным соглашениям
- RLS на каждой новой таблице — обязательное требование
- `SUPABASE_SERVICE_ROLE_KEY` только в Server Actions, никогда на клиенте
- Никаких секретов в коде — только через `process.env`

**Инструменты:**
- ESLint с правилами безопасности
- TypeScript strict (`tsconfig.json`)
- Zod (`lib/validation/schemas.ts`)

### 3. Ревью кода (Code Review)

**Что проверяем при ревью:**
- Все новые SA имеют RBAC-проверку
- Новые таблицы имеют RLS + политики
- Нет утечки `service_role_key` или других секретов
- Zod-валидация есть на всех пользовательских входах
- Обработка ошибок не раскрывает внутренние детали

**Чеклист ревью безопасности:**
```
[ ] RBAC-проверка в Server Action
[ ] RLS на новых таблицах
[ ] Zod-валидация входных данных
[ ] Нет секретов в коде
[ ] Ошибки не раскрывают внутреннюю логику
[ ] Нет SQL-конкатенации (только prepared statements)
[ ] Нет небезопасного innerHTML / dangerouslySetInnerHTML
```

### 4. Тестирование (Testing)

**Что тестируем:**
- RBAC: каждая роль проверяется на разрешённые и запрещённые действия
- RLS: данные другой организации недоступны
- Валидация: некорректные входные данные отклоняются
- Security Headers присутствуют в ответах

**Документы:**
- `docs/testing/RBAC_TESTING_GUIDE.md` — ручное тестирование RBAC
- `docs/security/SECURITY_TESTING_PLAN.md` — план тестирования безопасности

### 5. Деплой (Deployment)

**Что делаем:**
- Vercel CI/CD: `lint` → `type-check` → `build` перед каждым деплоем
- Переменные окружения только через Vercel ENV (не в коде)
- `.env.local` в `.gitignore` — не попадает в репозиторий
- Security Headers через `next.config.mjs`
- Supabase migrations: применяются через Supabase CLI, не вручную

**Ветковая модель:**
```
main     ← только через PR + CI прохождение
develop  ← основная ветка разработки
```

### 6. Мониторинг (Monitoring)

**Что мониторим:**
- `security_events` таблица: все критические события в журнале
- Типы событий: auth.*,  config.*, invitation.*, user.*, risk.*
- Доступно в `/settings` → «Журнал аудита» (owner, admin)

**Планируется (Sprint 09+):**
- Alerting на критические события (блокировки, смена ролей)
- Экспорт журнала аудита (CSV/PDF)
- Retention policy для старых событий

---

## CI/CD Пайплайн безопасности

Текущий (`.github/workflows/ci.yml`):
```yaml
lint → type-check → build
```

Расширение в Sprint 09:
```yaml
lint → type-check → build → dependency-audit → security-scan
```

---

## Работа с уязвимостями зависимостей

1. Обнаружение: `npm audit` (ручной и плановый в CI)
2. Оценка критичности (severity: low/moderate/high/critical)
3. Обновление зависимостей: `npm update` / `npm audit fix`
4. Документирование: `docs/security/DEPENDENCY_AUDIT_S06.md`

Подробнее: [DEPENDENCY_MANAGEMENT.md](DEPENDENCY_MANAGEMENT.md)

---

## Что будет добавлено в Sprint 09

| Мера | Приоритет |
|---|---|
| SAST-сканирование в CI (CodeQL или Snyk) | P1 |
| Dependency audit в CI (npm audit --audit-level=high) | P1 |
| Penetration testing checklist | P1 |
| ФСТЭК-ориентированные требования | P2 |
| 2FA (TOTP) | P2 |
| Расширенный audit log (экспорт, фильтры) | P2 |
