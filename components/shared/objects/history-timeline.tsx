import { relativeTime } from '@/lib/utils/dates';

export interface HistoryEntry {
  id:         string;
  old_score:  number | null;
  new_score:  number;
  reason:     string | null;
  changed_by: string;
  created_at: string;
}

interface HistoryTimelineProps {
  entries:    HistoryEntry[];
  objectName: string;
}

const REASON_LABELS: Record<string, string> = {
  recalculated:    'Ручная переоценка',
  risk_changed:    'Риск обновлён',
  object_updated:  'Данные объекта изменены',
  weights_changed: 'Изменены веса факторов',
};

function entryTone(entry: HistoryEntry): string {
  if (entry.old_score === null) return 'info';
  if (entry.new_score > entry.old_score) return 'teal';
  if (entry.new_score < entry.old_score) return 'orange';
  return 'info';
}

function entryText(entry: HistoryEntry, objectName: string): string {
  const reasonLabel = (entry.reason ? REASON_LABELS[entry.reason] : null) ?? 'Переоценка доверия';

  if (entry.old_score === null) {
    return `Объект «${objectName}» оценён впервые — Trust Score: ${entry.new_score}`;
  }

  const delta = entry.new_score - entry.old_score;
  const sign  = delta > 0 ? '+' : '';
  return `${reasonLabel} — Trust Score: ${entry.old_score} → ${entry.new_score} (${sign}${delta})`;
}

function changedByLabel(changedBy: string): string {
  if (changedBy === 'system') return 'Система';
  if (changedBy.startsWith('user:')) return 'Пользователь';
  return changedBy;
}

export function HistoryTimeline({ entries, objectName }: HistoryTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-mute)' }}>
        <span style={{ fontSize: 13 }}>История изменений Trust Score пуста.</span>
        <br />
        <span style={{ fontSize: 12 }}>
          Нажмите «Переоценить» на странице Паспорта доверия, чтобы выполнить первый расчёт.
        </span>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="timeline">
        {entries.map(entry => (
          <div className="tl-item" key={entry.id}>
            <span className={`tl-dot tl-${entryTone(entry)}`} />
            <div className="tl-body">
              <span className="tl-time mono">
                {relativeTime(entry.created_at)} · {changedByLabel(entry.changed_by)}
              </span>
              <span className="tl-text">{entryText(entry, objectName)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
