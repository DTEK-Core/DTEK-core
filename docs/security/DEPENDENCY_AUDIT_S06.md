# Dependency Audit — Sprint 06

**Дата:** 2026-06-23  
**Проводил:** AI-агент (Sprint 06, T006)  
**Следующий аудит:** Sprint 09 — Security Assessment

---

## Статус до обновления

```
5 уязвимостей: 4 high (next.js), 1 moderate (postcss bundled in next)
+ glob (high) в eslint-config-next 14.x (dev-only)
```

## Что обновлено

| Пакет | До | После | Причина |
|---|---|---|---|
| `next` | 14.2.35 | 15.5.19 | 4 высоких CVE в next@14 (DoS, cache poisoning, request smuggling) |
| `eslint-config-next` | 14.2.35 | 15.5.19 | CVE `GHSA-5j98-mcp5-4vw2` — glob CLI command injection (dev-only) |
| `@supabase/supabase-js` | 2.108.1 | 2.108.2 | Patch update |
| `lucide-react` | 1.17.0 | 1.21.0 | Minor update (новые иконки) |

### Breaking changes при обновлении next@14 → next@15

Next.js 15 изменил `params` и `searchParams` в page-компонентах на `Promise<>`. Исправлено в:

- `app/(app)/objects/[id]/page.tsx` — `params: Promise<{ id: string }>`
- `app/(app)/objects/[id]/passport/page.tsx` — `params: Promise<{ id: string }>`
- `app/(auth)/invite/[token]/page.tsx` — `params: Promise<{ token: string }>`
- `app/(auth)/reset-password/page.tsx` — `searchParams: Promise<{ code?: string }>`
- `components/shared/auth/accept-invite-form.tsx` — `<a>` → `<Link>` (новое lint-правило в next@15)

---

## Статус после обновления

```
2 уязвимости: 2 moderate (postcss bundled in next/node_modules/postcss)
0 critical, 0 high
```

---

## Известные риски (Known Risk)

### postcss < 8.5.10 (moderate) — GHSA-qx2v-qp2m-jg93

**Уязвимость:** PostCSS XSS via unescaped `</style>` в CSS stringify output.

**Затронуто:** `next/node_modules/postcss` (bundled dependency, не в prod runtime).

**Диапазон:** `next 9.3.4-canary.0 – 16.3.0-canary.5`. Уязвимость присутствует во всех версиях Next.js, включая `15.5.19`.

**Почему не обновлено:**
- Единственный доступный fix — `next@16.2.9` (major version bump).
- Next.js 16 не имеет стабильного LTS-тега, является major breaking change.
- `postcss` используется во внутреннем CSS pipeline Next.js, не в пользовательском коде.
- XSS в postcss stringify не применим к нашей threat model: мы не используем postcss API напрямую; уязвимость касается CSS-стриминга, а не HTTP-ответов.

**Mitigation:** Следить за выходом стабильного Next.js 16 LTS или следующей 15.x-патча с обновлённым postcss.

**Запланировано:** Sprint 09 (Security Assessment) — переоценить после выхода стабильного next@16.

---

## Пакеты, не обновлённые намеренно

| Пакет | Текущая | Последняя | Причина |
|---|---|---|---|
| `@types/node` | 20.x | 26.x | Major — требует Node 26; CI/prod работает на Node 20 |
| `@types/react` | 18.x | 19.x | Major — React 19 не тестировался с текущей кодовой базой |
| `eslint` | 8.x | 10.x | Major — ESLint 10 имеет breaking changes в конфигурации |
| `@radix-ui/*` | patch/minor | latest | Нет CVE; patch без причины нарушает принцип стабильности |
