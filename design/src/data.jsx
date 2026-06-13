// ============================================================
// DTEK Core — демо-данные цифровой модели организации
// ============================================================

const ORG = {
  name: 'АО «Меридиан-Энерго»',
  short: 'Меридиан-Энерго',
  industry: 'Электроэнергетика · Генерация и распределение',
  inn: '7704112233',
  region: 'Москва · Сибирский ФО',
  objects: 1248,
  monitored: 1184,
  trust: 74,
  trustTrend: +3,
  employees: 4120,
  plan: 'Enterprise',
};

// Уровни доверия → бэнды
function trustBand(v) {
  if (v >= 80) return { key: 'high', label: 'Высокое', color: 'var(--teal)' };
  if (v >= 60) return { key: 'good', label: 'Достаточное', color: 'var(--lime)' };
  if (v >= 40) return { key: 'medium', label: 'Среднее', color: 'var(--amber)' };
  if (v >= 20) return { key: 'low', label: 'Низкое', color: 'var(--orange)' };
  return { key: 'critical', label: 'Критическое', color: 'var(--crit)' };
}

const SEVERITY = {
  critical: { label: 'Критический', color: 'var(--crit)', rank: 4 },
  high: { label: 'Высокий', color: 'var(--orange)', rank: 3 },
  medium: { label: 'Средний', color: 'var(--amber)', rank: 2 },
  low: { label: 'Низкий', color: 'var(--info)', rank: 1 },
};

// Типы объектов цифровой модели
const OBJ_TYPES = {
  server:   { label: 'Сервер', glyph: 'server', cat: 'Инфраструктура' },
  workstation: { label: 'Рабочая станция', glyph: 'monitor', cat: 'Инфраструктура' },
  network:  { label: 'Сетевое устройство', glyph: 'network', cat: 'Инфраструктура' },
  app:      { label: 'Приложение', glyph: 'app', cat: 'ПО и сервисы' },
  database: { label: 'База данных', glyph: 'db', cat: 'ПО и сервисы' },
  service:  { label: 'Облачный сервис', glyph: 'cloud', cat: 'ПО и сервисы' },
  identity: { label: 'Учётная запись', glyph: 'user', cat: 'Идентичности' },
  ot:       { label: 'АСУ ТП / IoT', glyph: 'chip', cat: 'Технологический сегмент' },
  policy:   { label: 'Политика / Документ', glyph: 'doc', cat: 'Управление' },
};

// Факторы оценки доверия (веса в сумме = 100)
const TRUST_FACTORS = [
  { key: 'vuln',    label: 'Уязвимости',     weight: 22, desc: 'Известные CVE, давность патчей, поверхность атаки' },
  { key: 'config',  label: 'Конфигурация',   weight: 18, desc: 'Соответствие эталонным конфигурациям и хардненингу' },
  { key: 'access',  label: 'Доступы',        weight: 18, desc: 'Избыточные права, MFA, ротация секретов' },
  { key: 'network', label: 'Сегментация',    weight: 14, desc: 'Сетевая изоляция, открытые порты, внешняя экспозиция' },
  { key: 'compliance', label: 'Соответствие', weight: 16, desc: 'Покрытие политиками ИБ и регуляторными требованиями' },
  { key: 'incident', label: 'Инциденты',     weight: 12, desc: 'Аномалии, инциденты и их давность' },
];

// Объекты (сокращённая цифровая модель)
const OBJECTS = [
  { id: 'OBJ-1042', name: 'core-db-prod-01', type: 'database', trust: 38, prevTrust: 44, owner: 'Платформенная команда', segment: 'ЦОД-Москва', criticality: 'Критичный', risks: 4, conns: 11, ip: '10.20.4.11', os: 'PostgreSQL 14', updated: '2 ч назад', exposure: 'Внутренний' },
  { id: 'OBJ-0571', name: 'scada-gw-novosib', type: 'ot', trust: 31, prevTrust: 35, owner: 'АСУ ТП Новосибирск', segment: 'Технологический', criticality: 'Критичный', risks: 5, conns: 8, ip: '172.16.9.4', os: 'Siemens S7', updated: '14 мин назад', exposure: 'Изолированный' },
  { id: 'OBJ-0088', name: 'auth.meridian.ru', type: 'app', trust: 82, prevTrust: 79, owner: 'Команда идентичности', segment: 'DMZ', criticality: 'Критичный', risks: 1, conns: 23, ip: '10.20.2.9', os: 'Keycloak 23', updated: '1 ч назад', exposure: 'Внешний' },
  { id: 'OBJ-1190', name: 'fileshare-corp', type: 'server', trust: 54, prevTrust: 52, owner: 'ИТ-инфраструктура', segment: 'Корпоративный', criticality: 'Средний', risks: 3, conns: 17, ip: '10.20.6.30', os: 'Windows Server 2019', updated: '6 ч назад', exposure: 'Внутренний' },
  { id: 'OBJ-0334', name: 'k8s-prod-cluster', type: 'service', trust: 71, prevTrust: 68, owner: 'Платформенная команда', segment: 'ЦОД-Москва', criticality: 'Критичный', risks: 2, conns: 41, ip: '10.20.10.0/24', os: 'Kubernetes 1.29', updated: '23 мин назад', exposure: 'Внутренний' },
  { id: 'OBJ-2210', name: 'a.petrov (admin)', type: 'identity', trust: 46, prevTrust: 58, owner: 'A. Петров', segment: 'Идентичности', criticality: 'Высокий', risks: 3, conns: 14, ip: '—', os: 'Domain Account', updated: '40 мин назад', exposure: 'Внутренний' },
  { id: 'OBJ-0902', name: 'billing-api', type: 'app', trust: 67, prevTrust: 64, owner: 'Биллинг', segment: 'Корпоративный', criticality: 'Высокий', risks: 2, conns: 19, ip: '10.20.3.21', os: 'Node 20', updated: '3 ч назад', exposure: 'Внешний' },
  { id: 'OBJ-1501', name: 'vpn-gw-edge', type: 'network', trust: 59, prevTrust: 61, owner: 'Сетевая команда', segment: 'DMZ', criticality: 'Критичный', risks: 2, conns: 28, ip: '203.0.113.7', os: 'FortiOS 7.4', updated: '11 мин назад', exposure: 'Внешний' },
  { id: 'OBJ-0445', name: 'ws-buh-204', type: 'workstation', trust: 49, prevTrust: 49, owner: 'Бухгалтерия', segment: 'Корпоративный', criticality: 'Средний', risks: 2, conns: 5, ip: '10.30.12.88', os: 'Windows 11', updated: '5 ч назад', exposure: 'Внутренний' },
  { id: 'OBJ-0067', name: 'backup-vault', type: 'server', trust: 88, prevTrust: 85, owner: 'ИТ-инфраструктура', segment: 'ЦОД-Москва', criticality: 'Высокий', risks: 0, conns: 9, ip: '10.20.8.5', os: 'Veeam / Linux', updated: '1 ч назад', exposure: 'Изолированный' },
  { id: 'OBJ-1777', name: 'plc-turbine-3', type: 'ot', trust: 43, prevTrust: 41, owner: 'АСУ ТП Москва', segment: 'Технологический', criticality: 'Критичный', risks: 3, conns: 6, ip: '172.16.4.18', os: 'Allen-Bradley', updated: '8 мин назад', exposure: 'Изолированный' },
  { id: 'OBJ-0612', name: 'crm.meridian.ru', type: 'app', trust: 76, prevTrust: 73, owner: 'Коммерческий блок', segment: 'Корпоративный', criticality: 'Средний', risks: 1, conns: 22, ip: '10.20.3.40', os: 'SaaS', updated: '2 ч назад', exposure: 'Внешний' },
  { id: 'OBJ-2098', name: 'svc-monitoring', type: 'service', trust: 80, prevTrust: 78, owner: 'SOC', segment: 'ЦОД-Москва', criticality: 'Средний', risks: 0, conns: 33, ip: '10.20.11.2', os: 'Prometheus', updated: '30 мин назад', exposure: 'Внутренний' },
  { id: 'OBJ-0019', name: 'Политика парольной защиты', type: 'policy', trust: 62, prevTrust: 62, owner: 'CISO Office', segment: 'Управление', criticality: 'Средний', risks: 1, conns: 4, ip: '—', os: 'v3.2', updated: '12 дн назад', exposure: '—' },
  { id: 'OBJ-1330', name: 'dc-msk-01', type: 'server', trust: 70, prevTrust: 66, owner: 'ИТ-инфраструктура', segment: 'ЦОД-Москва', criticality: 'Критичный', risks: 1, conns: 37, ip: '10.20.0.1', os: 'Windows AD DC', updated: '18 мин назад', exposure: 'Внутренний' },
  { id: 'OBJ-0756', name: 'ws-dev-117', type: 'workstation', trust: 57, prevTrust: 55, owner: 'Разработка', segment: 'Корпоративный', criticality: 'Низкий', risks: 1, conns: 7, ip: '10.30.5.44', os: 'macOS 14', updated: '4 ч назад', exposure: 'Внутренний' },
];

// Реестр рисков
const RISKS = [
  { id: 'RISK-3041', title: 'Критическая уязвимость СУБД (CVE-2024-1086)', severity: 'critical', status: 'Открыт', obj: 'core-db-prod-01', objId: 'OBJ-1042', cat: 'Уязвимость', owner: 'Платформенная команда', impact: 'Компрометация данных', age: '3 дня', sla: 'Просрочен', score: 9.4 },
  { id: 'RISK-2987', title: 'Устаревшая прошивка контроллера АСУ ТП', severity: 'critical', status: 'В работе', obj: 'scada-gw-novosib', objId: 'OBJ-0571', cat: 'Конфигурация', owner: 'АСУ ТП Новосибирск', impact: 'Нарушение техпроцесса', age: '6 дней', sla: '2 дня', score: 9.1 },
  { id: 'RISK-3102', title: 'Избыточные привилегии администратора', severity: 'high', status: 'Открыт', obj: 'a.petrov (admin)', objId: 'OBJ-2210', cat: 'Доступы', owner: 'Команда идентичности', impact: 'Эскалация привилегий', age: '1 день', sla: '5 дней', score: 7.8 },
  { id: 'RISK-3088', title: 'Открытый порт управления в DMZ', severity: 'high', status: 'Открыт', obj: 'vpn-gw-edge', objId: 'OBJ-1501', cat: 'Сетевая изоляция', owner: 'Сетевая команда', impact: 'Внешний доступ', age: '2 дня', sla: '4 дня', score: 7.2 },
  { id: 'RISK-2950', title: 'Отсутствие MFA для сервисной учётной записи', severity: 'high', status: 'В работе', obj: 'billing-api', objId: 'OBJ-0902', cat: 'Доступы', owner: 'Биллинг', impact: 'Несанкц. доступ', age: '4 дня', sla: '1 день', score: 6.9 },
  { id: 'RISK-3110', title: 'Несоответствие политике резервного копирования', severity: 'medium', status: 'Открыт', obj: 'fileshare-corp', objId: 'OBJ-1190', cat: 'Соответствие', owner: 'ИТ-инфраструктура', impact: 'Потеря данных', age: '5 дней', sla: '8 дней', score: 5.1 },
  { id: 'RISK-3055', title: 'Антивирус не обновлялся 14 дней', severity: 'medium', status: 'Открыт', obj: 'ws-buh-204', objId: 'OBJ-0445', cat: 'Конфигурация', owner: 'Бухгалтерия', impact: 'Заражение ВПО', age: '1 день', sla: '6 дней', score: 4.7 },
  { id: 'RISK-2901', title: 'Самоподписанный TLS-сертификат', severity: 'low', status: 'Принят', obj: 'crm.meridian.ru', objId: 'OBJ-0612', cat: 'Конфигурация', owner: 'Коммерческий блок', impact: 'MITM (низк.)', age: '12 дней', sla: '—', score: 2.8 },
  { id: 'RISK-3120', title: 'Логирование событий не централизовано', severity: 'medium', status: 'В работе', obj: 'plc-turbine-3', objId: 'OBJ-1777', cat: 'Мониторинг', owner: 'АСУ ТП Москва', impact: 'Слепые зоны SOC', age: '2 дня', sla: '7 дней', score: 4.9 },
  { id: 'RISK-3061', title: 'Сегмент без микросегментации', severity: 'high', status: 'Открыт', obj: 'k8s-prod-cluster', objId: 'OBJ-0334', cat: 'Сетевая изоляция', owner: 'Платформенная команда', impact: 'Боковое перемещение', age: '3 дня', sla: '3 дня', score: 6.4 },
];

// Лента событий центра управления
const EVENTS = [
  { time: '14:42', type: 'risk', text: 'Новый критический риск на core-db-prod-01', obj: 'OBJ-1042', sev: 'critical' },
  { time: '14:18', type: 'trust', text: 'Снижение доверия a.petrov (admin) на 12 пунктов', obj: 'OBJ-2210', sev: 'high' },
  { time: '13:55', type: 'scan', text: 'Переоценка сегмента «Технологический» завершена', obj: null, sev: 'info' },
  { time: '13:30', type: 'trust', text: 'backup-vault достиг высокого уровня доверия (88)', obj: 'OBJ-0067', sev: 'low' },
  { time: '12:47', type: 'risk', text: 'Риск RISK-2950 переведён в работу', obj: 'OBJ-0902', sev: 'high' },
  { time: '11:20', type: 'config', text: 'Изменена политика парольной защиты v3.2', obj: 'OBJ-0019', sev: 'info' },
];

// Пользователи платформы
const USERS = [
  { id: 'U-01', name: 'Анна Соколова', email: 'a.sokolova@meridian.ru', role: 'Владелец', status: 'Активен', team: 'CISO Office', last: 'Сейчас' },
  { id: 'U-02', name: 'Дмитрий Орлов', email: 'd.orlov@meridian.ru', role: 'Администратор', status: 'Активен', team: 'SOC', last: '5 мин назад' },
  { id: 'U-03', name: 'Игорь Мельник', email: 'i.melnik@meridian.ru', role: 'Аналитик ИБ', status: 'Активен', team: 'SOC', last: '1 ч назад' },
  { id: 'U-04', name: 'Елена Кузнецова', email: 'e.kuznetsova@meridian.ru', role: 'Аналитик ИБ', status: 'Активен', team: 'Платформа', last: '2 ч назад' },
  { id: 'U-05', name: 'Павел Громов', email: 'p.gromov@meridian.ru', role: 'Наблюдатель', status: 'Приглашён', team: 'Руководство', last: '—' },
  { id: 'U-06', name: 'Сергей Лазарев', email: 's.lazarev@meridian.ru', role: 'Администратор', status: 'Заблокирован', team: 'ИТ', last: '8 дн назад' },
];

const ROLES = [
  { key: 'owner', label: 'Владелец', desc: 'Полный доступ, биллинг, удаление организации', perms: 'Все права' },
  { key: 'admin', label: 'Администратор', desc: 'Управление объектами, рисками, пользователями', perms: '12 из 14' },
  { key: 'analyst', label: 'Аналитик ИБ', desc: 'Работа с рисками и оценками, без админ-функций', perms: '8 из 14' },
  { key: 'viewer', label: 'Наблюдатель', desc: 'Только чтение дашбордов и паспортов', perms: '3 из 14' },
];

// Организации (мультиарендность)
const ORGS_LIST = [
  { id: 'ORG-01', name: 'АО «Меридиан-Энерго»', industry: 'Электроэнергетика', objects: 1248, trust: 74, role: 'Владелец', active: true },
  { id: 'ORG-02', name: 'ООО «ТрансЛогистик»', industry: 'Логистика', objects: 412, trust: 81, role: 'Администратор', active: false },
  { id: 'ORG-03', name: 'ГК «СибПром»', industry: 'Промышленность', objects: 2034, trust: 63, role: 'Аналитик ИБ', active: false },
];

// История доверия (для спарклайнов и графиков)
const TRUST_HISTORY = [68, 66, 67, 65, 69, 71, 70, 72, 71, 73, 72, 74];
const RISK_HISTORY = [22, 24, 21, 25, 23, 19, 18, 20, 17, 16, 15, 14];

// Распределение по уровням доверия (для дашборда)
const TRUST_DIST = [
  { band: 'Высокое', range: '80–100', count: 214, color: 'var(--teal)' },
  { band: 'Достаточное', range: '60–79', count: 498, color: 'var(--lime)' },
  { band: 'Среднее', range: '40–59', count: 372, color: 'var(--amber)' },
  { band: 'Низкое', range: '20–39', count: 124, color: 'var(--orange)' },
  { band: 'Критическое', range: '0–19', count: 40, color: 'var(--crit)' },
];

// Граф доверия — узлы и связи (для force-directed)
const GRAPH = (() => {
  const nodes = OBJECTS.map(o => ({
    id: o.id, name: o.name, type: o.type, trust: o.trust,
    criticality: o.criticality, size: o.criticality === 'Критичный' ? 13 : o.criticality === 'Высокий' ? 11 : 9,
  }));
  // организация как центральный узел
  nodes.unshift({ id: 'ORG', name: 'Меридиан-Энерго', type: 'org', trust: 74, criticality: 'Критичный', size: 22 });
  const E = (a, b) => ({ source: a, target: b });
  const links = [
    E('ORG', 'OBJ-1330'), E('ORG', 'OBJ-0088'), E('ORG', 'OBJ-0334'), E('ORG', 'OBJ-2098'),
    E('OBJ-1330', 'OBJ-2210'), E('OBJ-1330', 'OBJ-0445'), E('OBJ-1330', 'OBJ-0756'), E('OBJ-1330', 'OBJ-1190'),
    E('OBJ-0088', 'OBJ-2210'), E('OBJ-0088', 'OBJ-0902'), E('OBJ-0088', 'OBJ-0612'),
    E('OBJ-0334', 'OBJ-1042'), E('OBJ-0334', 'OBJ-0902'), E('OBJ-0334', 'OBJ-2098'),
    E('OBJ-1042', 'OBJ-0067'), E('OBJ-0902', 'OBJ-1042'),
    E('OBJ-1501', 'OBJ-0088'), E('OBJ-1501', 'OBJ-0612'), E('ORG', 'OBJ-1501'),
    E('OBJ-0571', 'OBJ-1777'), E('ORG', 'OBJ-0571'), E('OBJ-2098', 'OBJ-0571'),
    E('OBJ-2098', 'OBJ-1042'), E('OBJ-2098', 'OBJ-1330'), E('OBJ-1190', 'OBJ-0445'),
    E('OBJ-0019', 'OBJ-2210'), E('OBJ-0019', 'ORG'),
  ];
  return { nodes, links };
})();

Object.assign(window, {
  ORG, OBJECTS, RISKS, EVENTS, USERS, ROLES, ORGS_LIST,
  TRUST_FACTORS, TRUST_HISTORY, RISK_HISTORY, TRUST_DIST, GRAPH,
  OBJ_TYPES, SEVERITY, trustBand,
});
