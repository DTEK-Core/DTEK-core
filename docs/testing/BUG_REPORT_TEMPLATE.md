# BUG_REPORT_TEMPLATE.md — DTEK Core

> Шаблон отчёта об ошибке. Копируйте и заполняйте для каждого дефекта.

---

## Отчёт об ошибке

**ID:** BUG-DTEK-XXX  
**Дата обнаружения:** YYYY-MM-DD  
**Обнаружил:** [имя]  
**Компонент:** [страница / функция / CSS / API]  
**Приоритет:** P0 / P1 / P2 / P3 / P4  
**Статус:** Открыт / В работе / Исправлен / Не воспроизвелось

> Не прикладывайте пароли, tokens, cookies, keys, `.env.local`, connection
> strings, invite/reset links, customer rows или internal UUID. Перед
> публикацией отредактируйте screenshots и log excerpts.

---

### Краткое описание
[Одно предложение о проблеме]

### Шаги воспроизведения
1. Перейти на страницу...
2. Нажать кнопку...
3. Ввести значение...
4. Наблюдать: ...

### Ожидаемый результат
[Что должно произойти]

### Фактический результат
[Что происходит на самом деле]

### Среда
- Браузер: Chrome / Safari / Firefox + версия
- URL: localhost:3000 или prod
- Аккаунт (роль): owner / analyst / admin / viewer
- OS: macOS / Windows
- Время и timezone: YYYY-MM-DD HH:mm UTC±XX
- Release commit / deployment: [SHA или deployment ID]

### Operational context
- Scope: один пользователь / tenant / все tenants
- Safe operation / route template: [без token и sensitive query]
- Severity: P0 / P1 / P2 / P3
- Vercel requestId / Next digest: [если доступен]
- Environment Health: healthy / degraded / unavailable / не запускался
- Provider status: operational / incident / неизвестно

### Дополнительно
- [ ] Скриншот / запись экрана прикреплены
- [ ] Ошибки в консоли браузера: да / нет
- [ ] Воспроизводится стабильно: да / нет / иногда

### Ошибки консоли
```
[вставить только отредактированный текст без secrets, tokens и customer data]
```

### Примечания
[Любой дополнительный контекст]
