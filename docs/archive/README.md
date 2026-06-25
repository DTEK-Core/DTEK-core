# docs/archive — Архив устаревших документов

Эта папка содержит документы, которые были **официально заменены** более актуальными версиями.

Документы здесь:
- **НЕ являются источником истины** — используйте только для исторического контекста
- Могут содержать устаревшие архитектурные решения, схемы и концепции
- Были заменены по решениям ADR-001–005 в `ARCHITECTURE_DECISIONS.md`

## Содержимое архива

| Файл | Заменён на | Причина |
|---|---|---|
| `Database_Design.md` | `docs/architecture/Database_Design_Full.md` | ADR-005: неполная схема без типов и RLS |
| `Trust_Score_Model.md` | `docs/architecture/Trust_Score_Model_v2.md` | ADR-001: устаревшая формула (аддитивная вместо взвешенной) |
| `PRD_Configurator.md` | `docs/architecture/Configurator_Concept_Final.md` | ADR-002: неправильная концепция (wizard only вместо постоянного редактора) |
| `PRD.md` | `docs/product/PRD_Core_Modules.md` + `docs/product/User_Stories.md` | Устаревший PRD, заменён актуальными документами |
| `Development_Rules.md` | `.claude/engineering_rules.md` | Правила разработки перенесены в .claude/ |
| `Версия концепции 1.0.md` | `docs/product/Product_Concept.md` | Первоначальная концепция, заменена актуальной |
| `PROJECT_ANALYSIS.md` | `ARCHITECTURE_DECISIONS.md` | Анализ расхождений — все устранены в ADR |
