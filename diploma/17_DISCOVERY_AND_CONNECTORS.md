# 17. Discovery и Connectors

Этот документ описывает целевую архитектуру, а не готовую функцию.

Connector получает данные источника; collector выполняет конкретный сбор. API integration обычно обращается к готовому API, agent запускается ближе к инфраструктуре. Pull означает, что DTEK Core запрашивает данные; push — источник отправляет их.

Raw Evidence Store сохраняет исходное доказательство и provenance. Normalization Engine приводит разные форматы к канонической модели. Identity Resolution решает, относятся ли записи AD, Zabbix и VM к одному объекту. Confidence показывает степень уверенности. Discovery Inbox позволяет подтвердить, отклонить или объединить candidate. Drift Detection обнаруживает изменение. Auto Risk Mapper предлагает risk candidates.

```text
AD + Zabbix + MaxPatrol VM
→ Connector Framework → Raw Evidence → Normalization
→ Identity Resolution → Discovery Inbox → Object
→ Passport → Score/Graph → Risk candidates
```

**Фактический статус:** import — первый source-aware ingestion path; duplicate detection работает только в его ограниченном контексте. Sprint 15 должен подготовить foundation и выбрать первый источник. Connector runtime, evidence tables, inbox, cross-source merge, drift и auto risks отсутствуют.

DTEK Core не должен становиться SIEM/EDR/VM: он использует их специализированные результаты и добавляет доверительную интерпретацию.

> Главное, что нужно запомнить: connector привозит факты, но не должен автоматически объявлять спорный факт подтверждённым объектом или риском.

## Проверь себя

1. Чем pull отличается от push?
2. Зачем хранить raw evidence?
3. Что делает Identity Resolution?
4. Какие блоки реально работают сейчас?

