export const RISK_ACTIVITY_EVENT_TYPES = [
  'owner_assigned',
  'due_date_changed',
  'status_changed',
  'comment_added',
] as const;

export type RiskActivityEventType = typeof RISK_ACTIVITY_EVENT_TYPES[number];

export interface RiskActivityCopy {
  title: string;
  detail: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Открыт',
  in_progress: 'В работе',
  accepted: 'Принят',
  mitigated: 'Устранён',
  closed: 'Закрыт',
};

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function dateLabel(value: unknown): string {
  const raw = nullableString(value);
  if (!raw) return 'Без срока';

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'Без срока';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function statusLabel(value: unknown): string {
  const status = nullableString(value);
  if (!status) return 'Не указан';
  return STATUS_LABELS[status] ?? status;
}

export function isRiskActivityEventType(value: string): value is RiskActivityEventType {
  return RISK_ACTIVITY_EVENT_TYPES.some(eventType => eventType === value);
}

export function buildRiskActivityCopy(
  eventType: RiskActivityEventType,
  metadata: Record<string, unknown> | null,
): RiskActivityCopy {
  const values = metadata ?? {};

  if (eventType === 'owner_assigned') {
    const previousOwner = nullableString(values.previous_owner_name) ?? 'Без ответственного';
    const owner = nullableString(values.owner_name) ?? 'Без ответственного';
    return {
      title: owner === 'Без ответственного' ? 'Ответственный снят' : 'Ответственный назначен',
      detail: `${previousOwner} → ${owner}`,
    };
  }

  if (eventType === 'due_date_changed') {
    const previousDate = dateLabel(values.previous_due_date);
    const dueDate = dateLabel(values.due_date);
    const previousSla = nullableNumber(values.previous_sla_days);
    const sla = nullableNumber(values.sla_days);
    const details = [`Срок: ${previousDate} → ${dueDate}`];

    if (previousSla !== sla) {
      details.push(`SLA: ${previousSla ?? '—'} → ${sla ?? '—'} дн.`);
    }

    return {
      title: dueDate === 'Без срока' ? 'Срок устранения снят' : 'Срок устранения изменён',
      detail: details.join(' · '),
    };
  }

  if (eventType === 'status_changed') {
    return {
      title: 'Статус изменён',
      detail: `${statusLabel(values.previous_status)} → ${statusLabel(values.status)}`,
    };
  }

  return {
    title: 'Добавлен комментарий',
    detail: null,
  };
}
