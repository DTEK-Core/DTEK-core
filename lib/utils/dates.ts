// Locale-independent date formatting — avoids SSR/client hydration mismatch
// toLocaleDateString('ru') produces different output in Node.js vs browser ICU data.

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export function fmtDateShort(d: Date): string {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatSla(dueDate: string | null): { label: string; overdue: boolean } {
  if (!dueDate) return { label: '—', overdue: false };
  const due = new Date(dueDate);
  if (due < new Date()) return { label: 'Просрочен', overdue: true };
  return { label: fmtDateShort(due), overdue: false };
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
