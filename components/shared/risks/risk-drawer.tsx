'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/shared/icon';
import { SeverityTag } from '@/components/shared/severity-tag';
import { Meter } from '@/components/shared/meter';
import { addRiskComment, updateRiskStatus, linkRiskToObject } from '@/lib/actions/risks';
import { formatSla, relativeTime } from '@/lib/utils/dates';
import type { LinkedObj, RiskRow, SimpleObj } from './risks-page-client';

// ── Constants ──────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'var(--crit)',
  high:     'var(--orange)',
  medium:   'var(--amber)',
  low:      'var(--info)',
};

const STATUS_LABELS: Record<string, string> = {
  open:        'Открыт',
  in_progress: 'В работе',
  accepted:    'Принят',
  mitigated:   'Устранён',
  closed:      'Закрыт',
};

const STATUS_TONE: Record<string, string> = {
  open:        'orange',
  in_progress: 'info',
  accepted:    'neutral',
  mitigated:   'teal',
  closed:      'neutral',
};

const CATEGORY_LABELS: Record<string, string> = {
  vulnerability:  'Уязвимость',
  configuration:  'Конфигурация',
  access:         'Доступ',
  network:        'Сеть',
  compliance:     'Соответствие',
  incident:       'Инцидент',
  monitoring:     'Мониторинг',
  organizational: 'Организационный',
  physical:       'Физический',
  human:          'Человеческий',
  other:          'Прочее',
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  manual_csv:           'Ручная таблица',
  asset_inventory:      'Инвентаризация / CMDB',
  vulnerability_export: 'Сканер уязвимостей',
  monitoring_export:    'Мониторинг',
  directory_export:     'AD / LDAP / FreeIPA',
  security_tool_export: 'Средство защиты',
  network_export:       'Сетевое оборудование',
  other:                'Другой источник',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high:   'Высокая',
  medium: 'Средняя',
  low:    'Низкая',
};

const ACTIVITY_ICONS: Record<RiskRow['activity'][number]['event_type'], string> = {
  owner_assigned: 'user',
  due_date_changed: 'clock',
  status_changed: 'refresh',
  comment_added: 'doc',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function riskAge(createdAt: string): string {
  const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return '1 день';
  if (diffDays < 7)  return `${diffDays} дн`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед`;
  return `${Math.floor(diffDays / 30)} мес`;
}

function impactCopy(hint: NonNullable<LinkedObj['impactHint']>): string {
  if (hint.state === 'inactive') return 'Риск сейчас не влияет на Trust Score.';
  if (hint.state === 'no_rounded_change') {
    return 'В текущей конфигурации закрытие риска не изменит округлённый Trust Score.';
  }
  return `Закрытие риска может повысить Trust Score объекта примерно на ${hint.potentialGain}.`;
}

function sourceDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(date);
}


// ── Component ──────────────────────────────────────────────────────────────────

interface RiskDrawerProps {
  risk: RiskRow;
  objects: SimpleObj[];
  canComment: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function RiskDrawer({ risk, objects, canComment, onClose, onEdit }: RiskDrawerProps) {
  const router = useRouter();
  const [isPending, startTransition]         = useTransition();
  const [linkMode, setLinkMode]              = useState(false);
  const [linkObjId, setLinkObjId]            = useState('');
  const [linkError, setLinkError]            = useState<string | null>(null);
  // BUG-003: optimistic status for instant UI feedback
  const [optimisticStatus, setOptimistic]    = useState<string | null>(null);
  // BUG-005: surface action errors without crashing
  const [actionError, setActionError]        = useState<string | null>(null);
  const [commentBody, setCommentBody]        = useState('');
  const [commentError, setCommentError]      = useState<string | null>(null);

  const effectiveStatus = optimisticStatus ?? risk.status;

  const sla          = formatSla(risk.due_date, effectiveStatus);
  const color        = SEVERITY_COLORS[risk.severity] ?? 'var(--teal)';
  const linkedObj    = risk.linked_objects[0] ?? null;
  const statusTone   = STATUS_TONE[effectiveStatus] ?? 'neutral';
  const statusLabel  = STATUS_LABELS[effectiveStatus] ?? effectiveStatus;
  const catLabel     = CATEGORY_LABELS[risk.category] ?? risk.category;
  const cvssValue    = risk.cvss_score != null ? risk.cvss_score * 10 : 0;
  const cvssDisplay  = risk.cvss_score != null ? risk.cvss_score.toFixed(1) : '—';
  const isResolved   = ['mitigated', 'accepted', 'closed'].includes(effectiveStatus);

  function changeStatus(newStatus: string) {
    setActionError(null);
    setOptimistic(newStatus);               // BUG-003: instant UI update
    startTransition(async () => {
      try {
        const result = await updateRiskStatus(risk.id, newStatus);
        if (result?.error) {
          setOptimistic(null);              // revert on server error
          setActionError(result.error);
          return;
        }
        router.refresh();                   // sync server state in background
      } catch {
        setOptimistic(null);               // BUG-005: revert on exception
        setActionError('Не удалось обновить статус. Попробуйте ещё раз.');
      }
    });
  }

  function handleLink() {
    if (!linkObjId) return;
    setLinkError(null);
    startTransition(async () => {
      const result = await linkRiskToObject(risk.id, linkObjId);
      if (result?.error) {
        setLinkError(result.error);
        return;
      }
      setLinkMode(false);
      setLinkObjId('');
      router.refresh();
    });
  }

  function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = commentBody.trim();
    if (!body) return;

    setCommentError(null);
    startTransition(async () => {
      try {
        const result = await addRiskComment(risk.id, body);
        if (result?.error) {
          setCommentError(result.error);
          return;
        }
        setCommentBody('');
        router.refresh();
      } catch {
        setCommentError('Не удалось добавить комментарий. Попробуйте ещё раз.');
      }
    });
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">

        {/* ── Head ── */}
        <div className="drawer-head">
          <div className="drawer-head-top">
            <SeverityTag value={risk.severity} />
            <button className="icon-btn sm" onClick={onClose} aria-label="Закрыть">
              <Icon name="x" size={16} />
            </button>
          </div>
          <h2 className="drawer-title">{risk.title}</h2>
          <div className="drawer-id mono">{risk.id.slice(0, 8).toUpperCase()}</div>
        </div>

        {/* ── Body ── */}
        <div className="drawer-body">

          {/* CVSS score */}
          <div className="drawer-score">
            <div className="drawer-score-val mono" style={{ color }}>
              {cvssDisplay}
            </div>
            <div className="drawer-score-info">
              <span className="drawer-score-label">Оценка риска (CVSS-подобная)</span>
              <Meter value={cvssValue} color={color} h={6} />
            </div>
          </div>

          {/* Meta grid */}
          <div className="drawer-meta">
            <Fact
              label="Объект"
              value={
                linkedObj ? (
                  <button
                    className="link-inline mono"
                    onClick={() => router.push(`/objects/${linkedObj.id}`)}
                  >
                    {linkedObj.name}
                  </button>
                ) : (
                  <span className="ot-dim">—</span>
                )
              }
            />
            <Fact label="Категория" value={catLabel} />
            <Fact
              label="Статус"
              value={
                <span className={`badge badge-${statusTone} soft`}>
                  <span className="badge-dot" />
                  {statusLabel}
                </span>
              }
            />
            <Fact label="Владелец" value={risk.owner_name ?? '—'} />
            <Fact label="Возраст"  value={riskAge(risk.created_at)} />
            <Fact
              label="SLA"
              value={
                <span className={`sla-indicator sla-indicator-start sla-${sla.state}`}>
                  <span className="sla-state">{sla.label}</span>
                  {sla.dateLabel && <span className="sla-date mono">{sla.dateLabel}</span>}
                </span>
              }
            />
            {risk.impact && <Fact label="Влияние" value={risk.impact} />}
          </div>

          {/* Manual/imported origin context. This is metadata, not an Evidence record. */}
          <div>
            <h3 className="drawer-sec-title">Происхождение риска</h3>
            <div className={`risk-origin-card is-${risk.origin.kind}`}>
              <div className="risk-origin-head">
                <span className={`risk-origin-badge is-${risk.origin.kind}`}>
                  {risk.origin.kind === 'imported' ? 'Импортирован' : 'Создан вручную'}
                </span>
                <strong>{risk.origin.sourceName}</strong>
              </div>
              {risk.origin.kind === 'imported' ? (
                <div className="risk-origin-meta">
                  <span>{risk.origin.sourceType ? SOURCE_TYPE_LABELS[risk.origin.sourceType] ?? risk.origin.sourceType : 'Тип не указан'}</span>
                  <span>{risk.origin.confidence ? `Уверенность: ${CONFIDENCE_LABELS[risk.origin.confidence]}` : 'Уверенность не указана'}</span>
                  <span>{sourceDate(risk.origin.collectedAt) ?? 'Дата сбора не указана'}</span>
                </div>
              ) : (
                <p>Риск зарегистрирован участником организации в DTEK Core.</p>
              )}
              <p className="risk-origin-note">
                Контекст происхождения помогает оценить актуальность данных, но не является отдельной Evidence-записью.
              </p>
            </div>
          </div>

          {/* Link to object (only if no object linked) */}
          {!linkedObj && canComment && (
            <div>
              <h3 className="drawer-sec-title">Привязать к объекту</h3>
              {linkMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <select
                    className="set-input"
                    value={linkObjId}
                    onChange={e => setLinkObjId(e.target.value)}
                    style={{ fontSize: 13 }}
                  >
                    <option value="">— Выберите объект</option>
                    {objects.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  {linkError && (
                    <p style={{ fontSize: 12, color: 'var(--crit)', margin: 0 }}>{linkError}</p>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-line btn-sm"
                      onClick={handleLink}
                      disabled={!linkObjId || isPending}
                    >
                      {isPending ? '…' : 'Привязать'}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setLinkMode(false); setLinkError(null); }}
                      disabled={isPending}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setLinkMode(true)}
                  style={{ fontSize: 13 }}
                >
                  <Icon name="link" size={13} />
                  Привязать к объекту
                </button>
              )}
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="drawer-sec-title">Комментарии</h3>
            {risk.comments.length > 0 ? (
              <div className="risk-comments-list">
                {risk.comments.map((comment) => (
                  <article className="risk-comment" key={comment.id}>
                    <div className="risk-comment-meta">
                      <span>{comment.author_name ?? 'Бывший участник'}</span>
                      <time dateTime={comment.created_at}>{relativeTime(comment.created_at)}</time>
                    </div>
                    <p>{comment.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="drawer-text">Комментариев пока нет.</p>
            )}

            {canComment && (
              <form className="risk-comment-form" onSubmit={handleCommentSubmit}>
                <textarea
                  className="set-input"
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Зафиксировать ход устранения"
                  rows={3}
                  maxLength={2000}
                  disabled={isPending}
                />
                <div className="risk-comment-actions">
                  <span className="risk-comment-counter mono">{commentBody.length}/2000</span>
                  <button
                    className="btn btn-line btn-sm"
                    type="submit"
                    disabled={isPending || commentBody.trim().length === 0}
                  >
                    <Icon name="plus" size={14} />
                    {isPending ? 'Добавление…' : 'Добавить'}
                  </button>
                </div>
                {commentError && <p className="risk-comment-error">{commentError}</p>}
              </form>
            )}
          </div>

          {/* Workflow history is separate from the security audit log. */}
          <div>
            <h3 className="drawer-sec-title">История работы</h3>
            {risk.activity.length > 0 ? (
              <ol className="risk-activity-list">
                {risk.activity.map(event => (
                  <li className="risk-activity-item" key={event.id}>
                    <span className={`risk-activity-marker is-${event.event_type}`}>
                      <Icon name={ACTIVITY_ICONS[event.event_type]} size={13} />
                    </span>
                    <div className="risk-activity-content">
                      <div className="risk-activity-head">
                        <strong>{event.title}</strong>
                        <time dateTime={event.created_at}>{relativeTime(event.created_at)}</time>
                      </div>
                      {event.detail && <p>{event.detail}</p>}
                      <span className="risk-activity-actor">
                        {event.actor_name ?? 'Бывший участник'}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="drawer-text">
                История появится после изменения статуса, ответственного, срока или добавления комментария.
              </p>
            )}
          </div>

          {/* Trust impact */}
          <div>
            <h3 className="drawer-sec-title">Влияние на доверие</h3>
            {risk.linked_objects.length > 0 ? (
              <div className="risk-impact-list">
                {risk.linked_objects.map((object) => {
                  const hint = object.impactHint;
                  return (
                    <div className="risk-impact-row" key={object.id}>
                      <button
                        className="risk-impact-object"
                        onClick={() => router.push(`/objects/${object.id}/passport`)}
                      >
                        <Icon name="passport" size={14} />
                        <span>{object.name}</span>
                      </button>
                      {hint ? (
                        <div className={`risk-impact-result is-${hint.state}`}>
                          <span className="risk-impact-value mono">
                            {hint.state === 'potential_gain' ? `+${hint.potentialGain}` : '—'}
                          </span>
                          <span className="risk-impact-copy">{impactCopy(hint)}</span>
                          {hint.state !== 'inactive' && (
                            <span className="risk-impact-scores mono">
                              {hint.currentScore} → {hint.projectedScore}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="risk-impact-unavailable">
                          Влияние для этой связи пока не рассчитано.
                        </p>
                      )}
                    </div>
                  );
                })}
                <p className="risk-impact-note">
                  Ориентировочный расчёт по текущим данным и весам. До фактического закрытия другие условия могут измениться.
                </p>
              </div>
            ) : (
              <p className="drawer-text">
                Влияние не рассчитывается, пока риск не связан с объектом.
              </p>
            )}
          </div>

          {/* Recommended actions */}
          <div>
            <h3 className="drawer-sec-title">Рекомендуемые действия</h3>
            <ul className="drawer-steps">
              <li>
                <span className="step-n mono">01</span>
                Назначить ответственного и срок устранения
              </li>
              <li>
                <span className="step-n mono">02</span>
                Применить компенсирующие меры (изоляция / патч)
              </li>
              <li>
                <span className="step-n mono">03</span>
                Запустить переоценку доверия объекта
              </li>
            </ul>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="drawer-foot" style={{ flexWrap: 'wrap', gap: 8 }}>
          {actionError && (
            <p style={{ width: '100%', fontSize: 12, color: 'var(--crit)', margin: 0 }}>
              {actionError}
            </p>
          )}
          {onEdit && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={onEdit}
              disabled={isPending}
            >
              <Icon name="edit" size={14} />
              Редактировать
            </button>
          )}
          {canComment && !isResolved && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => changeStatus('accepted')}
              disabled={isPending || effectiveStatus === 'accepted'}
            >
              Принять риск
            </button>
          )}
          {canComment && effectiveStatus === 'open' && (
            <button
              className="btn btn-line btn-sm"
              onClick={() => changeStatus('in_progress')}
              disabled={isPending}
            >
              <Icon name="check" size={14} />
              Взять в работу
            </button>
          )}
          {canComment && effectiveStatus === 'in_progress' && (
            <button
              className="btn btn-line btn-sm"
              onClick={() => changeStatus('mitigated')}
              disabled={isPending}
            >
              <Icon name="check" size={14} />
              Устранить
            </button>
          )}
          {canComment && isResolved && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => changeStatus('open')}
              disabled={isPending}
            >
              Открыть повторно
            </button>
          )}
        </div>

      </aside>
    </>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────────

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="fact">
      <span className="fact-label">{label}</span>
      <span className="fact-value">{value}</span>
    </div>
  );
}
