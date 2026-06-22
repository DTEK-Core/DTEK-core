import Link from 'next/link';

export interface EventItem {
  object_id: string;
  old_score: number | null;
  new_score: number;
  reason: string | null;
  created_at: string;
  object_name: string;
  object_type: string;
}

const MONTHS_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];

function fmtEventTime(iso: string): string {
  const d = new Date(iso);
  const h  = String(d.getHours()).padStart(2, '0');
  const m  = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${h}:${m}`;
}

function eventTone(oldScore: number | null, newScore: number): string {
  if (oldScore === null) return 'info';
  const delta = newScore - oldScore;
  if (delta < -20) return 'crit';
  if (delta < 0)   return 'orange';
  if (delta > 0)   return 'teal';
  return 'info';
}

const REASON_LABELS: Record<string, string> = {
  recalculated:         'Ручная переоценка',
  risk_created:         'Риск добавлен',
  risk_updated:         'Риск обновлён',
  risk_status_changed:  'Статус риска изменён',
  risk_deleted:         'Риск удалён',
  object_updated:       'Объект обновлён',
};

function eventText(e: EventItem): string {
  const label = e.reason ? (REASON_LABELS[e.reason] ?? 'Пересчёт Trust Score') : 'Пересчёт Trust Score';
  if (e.old_score === null) return `${e.object_name}: Trust Score ${e.new_score} · ${label}`;
  const delta = e.new_score - e.old_score;
  const sign  = delta > 0 ? '+' : '';
  return `${e.object_name}: ${e.old_score} → ${e.new_score} (${sign}${delta}) · ${label}`;
}

export function EventFeed({ events }: { events: EventItem[] }) {
  if (events.length === 0) {
    return (
      <div style={{ padding: '32px 8px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
        Событий пока нет
      </div>
    );
  }
  return (
    <div className="feed">
      {events.map((e, i) => {
        const tone = eventTone(e.old_score, e.new_score);
        return (
          <div className="feed-item" key={`${e.object_id}-${e.created_at}-${i}`}>
            <span className="feed-time">{fmtEventTime(e.created_at)}</span>
            <span className={`feed-rail feed-${tone}`} />
            <div className="feed-body">
              <span className="feed-text">{eventText(e)}</span>
              <Link
                href={`/objects/${e.object_id}`}
                className="feed-obj"
              >
                {e.object_id.slice(0, 8)}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
