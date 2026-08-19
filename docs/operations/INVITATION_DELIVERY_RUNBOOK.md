# Invitation Delivery Runbook

`Проект: DTEK Core`  
`Задача: S14-T003 — Invitation Delivery Finalization`  
`Дата: 19.08.2026`  
`Статус: актуальный для Commercial MVP / pilot`

---

## 1. Принятое Решение

Официальный способ доставки приглашений в Commercial MVP — **manual invite
link**. DTEK Core создаёт персональную ссылку, а владелец организации передаёт
её приглашённому пользователю по согласованному доверенному каналу.

Автоматическая отправка email не заявляется и не имитируется. Email provider
не добавляется в Sprint 14: для production email delivery нужны отдельное
решение, домен отправителя, credentials, шаблоны, retry/bounce handling,
мониторинг доставки и privacy review.

Manual delivery выбран потому, что он:

- уже соответствует архитектуре и не добавляет внешний runtime dependency;
- не блокирует onboarding пилотной команды при отказе почтового провайдера;
- даёт владельцу явный контроль над адресатом и каналом передачи;
- позволяет проверить весь accept-flow до решения об email provider.

---

## 2. Поддержанный Поток

```text
owner -> /users -> Создать приглашение
      -> email + analyst/admin/viewer
      -> DTEK Core создаёт или возвращает активную ссылку
      -> owner копирует ссылку и передаёт адресату
      -> адресат открывает /invite/{token} без существующей сессии
      -> задаёт имя, фамилию и пароль
      -> профиль привязывается к организации и назначенной роли
      -> invitation получает status=accepted
      -> пользователь попадает в Dashboard
```

Новые приглашения создаёт только `owner`. `admin` может управлять разрешёнными
участниками и отзывать pending invitation, но не создаёт invite link. Роль
`owner` через приглашение недоступна.

Onboarding wizard не создаёт скрытые приглашения: после первичной настройки он
направляет владельца использовать `/users`, где каждая созданная ссылка сразу
видна и может быть доставлена.

---

## 3. Контракт Ссылки

Формат:

```text
${NEXT_PUBLIC_APP_URL}/invite/{token}
```

- URL строится только из `NEXT_PUBLIC_APP_URL`, без hardcode домена.
- Token — случайное 64-символьное hex-значение, не содержащее UUID
  организации, профиля или invitation.
- Ссылка действует 7 дней.
- Активная ссылка для того же email возвращается повторно без новой записи.
- Истёкшая или отозванная ссылка не принимается; owner создаёт новую явно.
- Страница invitation имеет `noindex, nofollow` и не должна попадать в поиск.
- Неверный формат token отклоняется до запроса к Supabase.

Invite link является bearer secret: любой получивший ссылку видит email,
название организации и назначенную роль, но принять приглашение может только
после аутентификации указанного email через signup/sign-in flow.

---

## 4. Инструкция Для Владельца

1. Войдите под `owner` и откройте `/users`.
2. Нажмите «Пригласить».
3. Укажите email и одну из ролей: `analyst`, `admin`, `viewer`.
4. Нажмите «Создать ссылку».
5. Проверьте email и роль в result state.
6. Нажмите «Копировать» или выделите URL вручную.
7. Передайте ссылку конкретному адресату по корпоративной почте, защищённому
   мессенджеру или другому согласованному каналу.
8. Не публикуйте ссылку в общем канале, тикете с публичным доступом или
   документации.
9. После принятия проверьте участника и роль в `/users`.
10. Если ссылка была раскрыта не тому адресату, немедленно отзовите invitation
    и создайте новую.

Автоматическое письмо после нажатия кнопки не отправляется. Email в форме
задаёт идентичность приглашённого и используется при принятии ссылки.

---

## 5. Состояния И Восстановление

| Состояние | Поведение | Действие owner |
|---|---|---|
| Новое | Создаётся ссылка и audit event | Передать адресату |
| Active existing | Возвращается прежняя активная ссылка | Повторно передать при необходимости |
| Expired | Ссылка не показывается как активная | Создать новую явно |
| Revoked | Старая ссылка недействительна | Создать новую при необходимости |
| Accepted | Пользователь уже добавлен | Проверить роль в `/users` |
| Config error | Ссылка не строится | Проверить `NEXT_PUBLIC_APP_URL` по Environment Health Runbook |
| Supabase unavailable | Показывается безопасная ошибка | Выполнить environment triage, затем повторить |

В текущей схеме естественное истечение и отзыв используют status `expired`.
Это осознанное ограничение MVP; факт отзыва отдельно фиксируется событием
`invitation.cancelled`.

---

## 6. Безопасность

- Server Action повторно проверяет session, organization context и роль owner.
- Insert ограничен RLS и `organization_id = current_org_id()`.
- Accept/revoke используют service client только на сервере и всегда
  ограничивают запрос invitation/organization context.
- Существующий аккаунт другой организации не переносится в новый tenant.
- В клиент не передаются service role key, internal IDs или raw Supabase error.
- События `invitation.sent`, `invitation.accepted` и `invitation.cancelled`
  записываются в Security Audit Log.
- Маршрут `/invite/{token}` публичен только для открытия invitation и имеет
  in-memory MVP rate limit 10 запросов за 60 секунд на instance/IP.
- После добавления distributed/multi-instance runtime in-memory limiter должен
  быть заменён общим rate-limit storage.

---

## 7. Pilot QA Checklist

Проверка проводится на release candidate с реальными owner и отдельными
браузерными профилями. Реализация задачи не является автоматическим `PASS`.

### Создание И Доставка

- [ ] Owner создаёт analyst invitation и видит email, роль, URL.
- [ ] URL использует актуальный `NEXT_PUBLIC_APP_URL`.
- [ ] В URL отсутствуют organization/profile/invitation UUID.
- [ ] Copy работает через Clipboard API.
- [ ] Clipboard fallback проверен в окружении без Clipboard API.
- [ ] «Открыть» открывает invite page в новой вкладке.
- [ ] Повторный запрос того же email возвращает активную ссылку.
- [ ] Admin, analyst и viewer не могут создать invitation через UI/Server Action.
- [ ] Роль owner отсутствует в форме и отклоняется Server Action.

### Принятие

- [ ] Новый пользователь открывает ссылку без auth cookie и не перенаправляется
  на login до показа формы.
- [ ] Форма показывает ожидаемые организацию, email и роль.
- [ ] Новый пользователь задаёт пароль и входит в нужную организацию.
- [ ] Существующий аккаунт с правильным email может принять приглашение со
  своим паролем.
- [ ] Аккаунт другой организации не переносится между tenant.
- [ ] Повторное использование принятой ссылки отклоняется.

### Истечение, Отзыв И Audit

- [ ] Истёкшая ссылка показывает безопасное недоступное состояние.
- [ ] Owner может создать новую ссылку после истечения.
- [ ] Owner/admin отзывает pending invitation; старая ссылка больше не работает.
- [ ] Audit Log содержит sent/accepted/cancelled без token в metadata.
- [ ] Invalid и чрезмерно длинный token не вызывает raw runtime error.
- [ ] На mobile форма, URL и кнопки не создают horizontal overflow.

Evidence для gate:

```text
Дата:
Release candidate / commit:
Проверяющий:
Роли:
Результат: PASS / FAIL / BLOCKED
Evidence:
Замечания:
```

---

## 8. Когда Нужен Email Provider

Email delivery рассматривается отдельной Post-MVP задачей, если пилоты
подтвердят необходимость автоматической отправки. До выбора provider нужны:

- требования к российской локализации и договорным ограничениям;
- собственный sending domain и SPF/DKIM/DMARC;
- server-only credentials и secret rotation;
- шаблоны, локализация и suppression policy;
- delivery/bounce/complaint observability;
- retry/idempotency contract без создания дубликатов invitation;
- manual link как обязательный fallback.

До выполнения этих условий UI не должен использовать формулировки
«письмо отправлено» или «проверьте почту».

---

## 9. Связанные Документы

- [Pilot Readiness Checklist](../testing/PILOT_READINESS_CHECKLIST.md)
- [RBAC Testing Guide](../testing/RBAC_TESTING_GUIDE.md)
- [Environment Health Runbook](ENVIRONMENT_HEALTH_RUNBOOK.md)
- [RBAC Model](../security/RBAC_MODEL.md)
- [Security Overview](../security/SECURITY_OVERVIEW.md)
- [User Guide](../user/USER_GUIDE.md)
- [Sprint 14](../../tasks/SPRINT_14.md)
