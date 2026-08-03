# 21. Git и release process

Repository хранит проект и историю. Branch изолирует линию работы: `develop` — текущая интеграционная ветка, `main` — release/production линия. Commit — снимок с hash, push отправляет commits, pull получает изменения, merge объединяет ветки, conflict требует осознанного выбора.

Conventional Commit описывает тип: `feat:`, `fix:`, `docs:`, `chore:`. В проекте применяется Sprint-oriented Git Flow: работа и документация попадают в `develop`; `main` синхронизируется только через отдельное release-решение после gate.

## Безопасная памятка

```bash
git status --short --branch
git diff
git diff --check
git log --oneline -10
git fetch origin
git rev-list --left-right --count origin/develop...develop
git add diploma README.md DOCUMENTATION_INDEX.md
git commit -m "docs(diploma): add complete project learning documentation"
git push origin develop
```

Перед merge нужно убедиться, что CI зелёный, ручные gates закрыты, миграции проверены и release notes актуальны. Команды `reset --hard`, принудительный push и удаление веток способны потерять данные и не входят в обычную памятку.

> Главное, что нужно запомнить: commit hash позволяет точно назвать состояние, которое тестировалось и защищается.

## Проверь себя

1. Чем commit отличается от push?
2. Для чего нужна `develop`?
3. Что показывает `git diff`?
4. Почему main не обновляется автоматически?

