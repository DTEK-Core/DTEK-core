'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/shared/icon';

type EventCategory = 'all' | 'access' | 'config' | 'user' | 'system';

interface EventConfig {
  label: string;
  icon: string;
  category: Exclude<EventCategory, 'all'>;
}

const EVENT_CONFIG: Record<string, EventConfig> = {
  'role.changed':           { label: 'Изменение роли', icon: 'users', category: 'access' },
  'user.blocked':           { label: 'Блокировка', icon: 'shield', category: 'access' },
  'user.removed':           { label: 'Удаление пользователя', icon: 'x', category: 'access' },
  'invitation.sent':        { label: 'Приглашение отправлено', icon: 'users', category: 'user' },
  'invitation.accepted':    { label: 'Вход по приглашению', icon: 'check', category: 'user' },
  'invitation.cancelled':   { label: 'Приглашение отозвано', icon: 'x', category: 'user' },
  'org.updated':            { label: 'Данные организации', icon: 'building', category: 'system' },
  'config.weights_changed': { label: 'Веса Trust Score', icon: 'config', category: 'config' },
  'object.created':         { label: 'Объект создан', icon: 'objects', category: 'system' },
  'object.deleted':         { label: 'Объект удалён', icon: 'objects', category: 'system' },
  'risk.created':           { label: 'Риск добавлен', icon: 'risk', category: 'config' },
  'risk.deleted':           { label: 'Риск удалён', icon: 'risk', category: 'config' },
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  all:    'Все',
  access: 'Доступ',
  config: 'Конфиг',
  user:   'Пользователи',
  system: 'Система',
};

const FILTERS: EventCategory[] = ['all', 'access', 'config', 'user', 'system'];

export interface SecurityEventRow {
  id: string;
  event_type: string;
  actor_email: string | null;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getEventConfig(eventType: string): EventConfig {
  return EVENT_CONFIG[eventType] ?? {
    label:    eventType,
    icon:     'shield',
    category: 'system',
  };
}

function formatMetaValue(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '—';
}

function formatMeta(row: SecurityEventRow): string {
  const m = row.metadata;
  if (!m) return '—';
  if (row.event_type === 'role.changed') {
    return `${formatMetaValue(m.fromRole)} → ${formatMetaValue(m.toRole)}`;
  }
  if (row.event_type === 'invitation.sent' || row.event_type === 'invitation.accepted') {
    return `${formatMetaValue(m.email)} · ${formatMetaValue(m.role)}`;
  }
  if (row.event_type === 'invitation.cancelled') {
    return formatMetaValue(m.email ?? row.target_id);
  }
  if (row.event_type === 'user.blocked' || row.event_type === 'user.removed') {
    return formatMetaValue(m.targetEmail ?? row.target_id);
  }
  if (row.event_type === 'config.weights_changed') {
    return 'веса обновлены';
  }
  if (row.event_type === 'org.updated') {
    const fields = m.changedFields;
    return Array.isArray(fields) ? fields.join(', ') : '—';
  }
  return '—';
}

function getInitials(email: string | null): string {
  if (!email) return 'SYS';
  const [name] = email.split('@');
  const parts = name.split(/[._-]/).filter(Boolean);
  const initials = parts.length > 1
    ? parts.slice(0, 2).map(part => part[0]).join('')
    : name.slice(0, 2);

  return initials.toUpperCase();
}

interface Props {
  events: SecurityEventRow[];
}

export function SecurityLog({ events }: Props) {
  const [filter, setFilter] = useState<EventCategory>('all');
  const categoryCounts = useMemo(() => {
    return events.reduce<Record<EventCategory, number>>((acc, event) => {
      const category = getEventConfig(event.event_type).category;
      acc.all += 1;
      acc[category] += 1;
      return acc;
    }, { all: 0, access: 0, config: 0, user: 0, system: 0 });
  }, [events]);

  const visibleEvents = filter === 'all'
    ? events
    : events.filter(event => getEventConfig(event.event_type).category === filter);

  return (
    <div className="card slog-card">
      <div className="slog-head">
        <div>
          <span className="card-title">Журнал аудита</span>
          <span className="slog-sub">
            {events.length} событий · последние 100 записей
          </span>
        </div>
        <div className="slog-filters" aria-label="Фильтр событий аудита">
          {FILTERS.map(item => (
            <button
              key={item}
              type="button"
              className={`slog-filter${filter === item ? ' active' : ''}`}
              onClick={() => setFilter(item)}
            >
              {CATEGORY_LABELS[item]}
              <span className="slog-filter-count">{categoryCounts[item]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="slog-body">
        {events.length === 0 ? (
          <div className="slog-empty">
            <Icon name="shield" size={22} />
            <span>Событий пока нет</span>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="slog-empty">
            <Icon name="filter" size={22} />
            <span>Нет событий в выбранной категории</span>
          </div>
        ) : (
          <div className="slog-list">
            {visibleEvents.map((event) => {
              const config = getEventConfig(event.event_type);
              return (
                <article
                  key={event.id}
                  className={`slog-item slog-${config.category}`}
                >
                  <div className="slog-icon">
                    <Icon name={config.icon} size={17} />
                  </div>

                  <div className="slog-main">
                    <div className="slog-row-top">
                      <div className="slog-event-title">{config.label}</div>
                      <time className="slog-time" dateTime={event.created_at}>
                        {formatDate(event.created_at)}
                      </time>
                    </div>

                    <div className="slog-meta-row">
                      <div className="slog-actor">
                        <span className="slog-avatar">{getInitials(event.actor_email)}</span>
                        <span className="slog-actor-email">{event.actor_email ?? 'system'}</span>
                      </div>
                      <span className={`slog-badge slog-badge-${config.category}`}>
                        {CATEGORY_LABELS[config.category]}
                      </span>
                    </div>

                    <div className="slog-details">
                      <span className="slog-detail-label">Детали</span>
                      <span>{formatMeta(event)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
