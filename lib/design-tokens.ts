/**
 * DTEK Core — Design Tokens
 * Источник истины: design/src/base.css
 * Используются для динамических стилей в React-компонентах (canvas, SVG, инлайн-стили).
 * Для статических стилей используй CSS-переменные и Tailwind-утилиты.
 */

/* ── Цвета ── */
export const COLORS = {
  bg:       '#07090d',
  bg1:      '#0a0e14',
  surface:  '#0f141c',
  surface2: '#141b25',
  surface3: '#1a222e',

  teal:     '#2dd4bf',
  teal2:    '#14b8a6',
  lime:     '#5fcf80',
  amber:    '#f5c451',
  orange:   '#f59145',
  crit:     '#f0566d',
  info:     '#5b9bf5',

  text:     '#e7edf4',
  textDim:  '#95a3b3',
  textMute: '#5d6b7c',

  tealSoft: 'rgba(45,212,191,.13)',
  tealLine: 'rgba(45,212,191,.30)',

  borderSubtle: 'rgba(255,255,255,.06)',
  border1:      'rgba(255,255,255,.10)',
  border2:      'rgba(255,255,255,.15)',
} as const;

/* ── Радиусы скругления ── */
export const RADII = {
  sm: '7px',
  base: '11px',
  lg: '16px',
  xl: '22px',
} as const;

/* ── Тени ── */
export const SHADOWS = {
  '1':  '0 1px 2px rgba(0,0,0,.4)',
  '2':  '0 12px 32px -8px rgba(0,0,0,.55)',
  pop:  '0 20px 50px -12px rgba(0,0,0,.7)',
} as const;

/* ── Размеры лэйаута ── */
export const LAYOUT = {
  sidebarWidth:     '250px',
  sidebarCollapsed: '74px',
  topbarHeight:     '64px',
} as const;

/* ── Факторы Trust Score (ADR-001) ──
   Порядок отображения и дефолтные веса. */
export const TRUST_FACTORS = [
  { key: 'vuln',       label: 'Уязвимости',   weight: 22 },
  { key: 'config',     label: 'Конфигурация', weight: 18 },
  { key: 'access',     label: 'Доступ',       weight: 18 },
  { key: 'network',    label: 'Сеть',         weight: 14 },
  { key: 'compliance', label: 'Соответствие', weight: 16 },
  { key: 'incident',   label: 'Инциденты',    weight: 12 },
] as const;

export type TrustFactorKey = (typeof TRUST_FACTORS)[number]['key'];

/* ── Уровни доверия (Trust Bands) ── */
export const TRUST_BANDS = [
  { label: 'Критический', range: [0, 39]   as const, color: COLORS.crit,   key: 'critical' },
  { label: 'Низкий',      range: [40, 54]  as const, color: COLORS.orange,  key: 'low' },
  { label: 'Средний',     range: [55, 69]  as const, color: COLORS.amber,   key: 'medium' },
  { label: 'Хороший',     range: [70, 84]  as const, color: COLORS.lime,    key: 'good' },
  { label: 'Высокий',     range: [85, 100] as const, color: COLORS.teal,    key: 'high' },
] as const;

export type TrustBandKey = (typeof TRUST_BANDS)[number]['key'];

/** Возвращает уровень доверия для числового значения score (0–100). */
export function getTrustBand(score: number) {
  return TRUST_BANDS.find(b => score >= b.range[0] && score <= b.range[1]) ?? TRUST_BANDS[0];
}

/* ── Роли пользователей (ADR-003) ── */
export const ROLES = [
  { key: 'owner',   label: 'Владелец',       description: 'Полный доступ, управление организацией' },
  { key: 'analyst', label: 'Аналитик ИБ',    description: 'Создание и редактирование объектов, рисков, паспортов' },
  { key: 'admin',   label: 'Администратор',  description: 'Управление пользователями и приглашениями' },
  { key: 'viewer',  label: 'Наблюдатель',    description: 'Только просмотр, без права изменений' },
] as const;

export type UserRole = (typeof ROLES)[number]['key'];

/* Роли, доступные для назначения через приглашение (owner исключён). */
export const INVITABLE_ROLES = ROLES.filter(r => r.key !== 'owner');

/* ── Типы объектов ── */
export const OBJECT_TYPES = [
  { key: 'server',      label: 'Сервер' },
  { key: 'workstation', label: 'Рабочая станция' },
  { key: 'laptop',      label: 'Ноутбук' },
  { key: 'network',     label: 'Сетевое оборудование' },
  { key: 'app',         label: 'Приложение' },
  { key: 'database',    label: 'База данных' },
  { key: 'service',     label: 'Сервис' },
  { key: 'identity',    label: 'Учётная запись' },
  { key: 'ot',          label: 'АСУ ТП' },
  { key: 'policy',      label: 'Политика' },
  { key: 'other',       label: 'Другое' },
] as const;

export type ObjectTypeKey = (typeof OBJECT_TYPES)[number]['key'];

/* ── Критичность объектов ── */
export const CRITICALITY_LEVELS = [
  { key: 'low',      label: 'Низкая',      color: COLORS.info },
  { key: 'medium',   label: 'Средняя',     color: COLORS.amber },
  { key: 'high',     label: 'Высокая',     color: COLORS.orange },
  { key: 'critical', label: 'Критическая', color: COLORS.crit },
] as const;

/* ── Серьёзность рисков ── */
export const SEVERITY_LEVELS = [
  { key: 'low',      label: 'Низкая',      color: COLORS.info },
  { key: 'medium',   label: 'Средняя',     color: COLORS.amber },
  { key: 'high',     label: 'Высокая',     color: COLORS.orange },
  { key: 'critical', label: 'Критическая', color: COLORS.crit },
] as const;

export type SeverityKey = (typeof SEVERITY_LEVELS)[number]['key'];

/* ── Маппинг типа объекта на имя иконки ── */
export function typeGlyph(type: string): string {
  const map: Record<string, string> = {
    server:      'server',
    workstation: 'monitor',
    laptop:      'monitor',
    network:     'network',
    app:         'app',
    database:    'db',
    service:     'cloud',
    identity:    'user',
    ot:          'chip',
    policy:      'doc',
    other:       'layers',
  };
  return map[type] ?? 'layers';
}
