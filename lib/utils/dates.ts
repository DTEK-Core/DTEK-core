// Locale-independent date formatting — avoids SSR/client hydration mismatch
// toLocaleDateString('ru') produces different output in Node.js vs browser ICU data.

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_LONG  = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const ACTIVE_RISK_STATUSES = new Set(['open', 'in_progress']);
const DAY_MS = 86_400_000;

export type SlaState = 'none' | 'overdue' | 'due_soon' | 'on_track' | 'completed';

export interface SlaInfo {
  label: string;
  dateLabel: string | null;
  state: SlaState;
  overdue: boolean;
  daysRemaining: number | null;
}

export function fmtDateShort(d: Date): string {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** Полная дата с годом: «21 июня 2026» */
export function fmtDateLong(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatSla(
  dueDate: string | null,
  riskStatus = 'open',
  now = new Date(),
): SlaInfo {
  if (!dueDate) {
    return {
      label: 'Не задан',
      dateLabel: null,
      state: 'none',
      overdue: false,
      daysRemaining: null,
    };
  }

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) {
    return {
      label: 'Не задан',
      dateLabel: null,
      state: 'none',
      overdue: false,
      daysRemaining: null,
    };
  }

  const year = due.getUTCFullYear();
  const month = due.getUTCMonth();
  const day = due.getUTCDate();
  const deadline = Date.UTC(year, month, day, 23, 59, 59, 999);
  const dateLabel = `${day} ${MONTHS_SHORT[month]}`;

  if (!ACTIVE_RISK_STATUSES.has(riskStatus)) {
    return {
      label: 'Завершено',
      dateLabel,
      state: 'completed',
      overdue: false,
      daysRemaining: null,
    };
  }

  const remainingMs = deadline - now.getTime();
  if (remainingMs < 0) {
    return {
      label: 'Просрочено',
      dateLabel,
      state: 'overdue',
      overdue: true,
      daysRemaining: 0,
    };
  }

  const daysRemaining = Math.ceil(remainingMs / DAY_MS);
  if (remainingMs < 3 * DAY_MS) {
    return {
      label: 'Скоро срок',
      dateLabel,
      state: 'due_soon',
      overdue: false,
      daysRemaining,
    };
  }

  return {
    label: 'В графике',
    dateLabel,
    state: 'on_track',
    overdue: false,
    daysRemaining,
  };
}

export function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)     return 'только что';
  if (diff < 3600)   return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 172800) return 'Вчера';
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
  return fmtDateShort(new Date(iso));
}
