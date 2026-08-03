# 13. Trust Score

Trust Score — оценка 0–100, позволяющая сравнивать состояние объектов в одной организации. Число полезно только вместе с причинами, данными и ограничениями.

## Фактический алгоритм

`lib/trust/calculate.ts` рассчитывает шесть факторов: vulnerabilities, configuration, access, network segmentation, compliance, incidents. База зависит от criticality; активные risks распределяют penalties по категориям; completeness может дать ограниченный bonus; factor ограничивается 0–100. Итог — взвешенная сумма.

Веса по умолчанию: 22/18/18/14/16/12, сумма строго 100. Configurator разрешает owner/analyst менять веса организации и запускает пересчёт.

## Учебный пример

Если факторы условно равны `60, 70, 80, 50, 75, 65`, а веса стандартные, итог считается как сумма `factor × weight / 100`. Это демонстрация взвешивания; точный score конкретного объекта нужно получать только через `calcTrustScore`, потому что до факторов применяются penalties, bonus, category mapping, clamp и rounding.

## Explainability

Sprint 12 добавил top drivers относительно reference 70, reason cards, risk impact counterfactual, history delta и dashboard summary. Confidence metadata сейчас не влияет на формулу. Impact hint — ориентир «что было бы без выбранного риска», а не гарантия результата.

**Статус:** формула и explainability реализованы; ручная QA Sprint 12 не закрыта. ML scoring, evidence confidence weighting и versioned model отсутствуют.

> Главное, что нужно запомнить: Score — объяснимая модель приоритизации, а не объективная вероятность взлома.

## Проверь себя

1. Какие шесть факторов используются?
2. Почему сумма весов равна 100?
3. Что означает reference 70?
4. Почему confidence пока не влияет на Score?
5. Чем impact hint отличается от обещания?

