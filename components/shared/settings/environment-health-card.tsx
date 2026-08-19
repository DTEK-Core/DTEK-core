'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/shared/icon';
import { runEnvironmentHealthCheck } from '@/lib/actions/environment-health';
import type {
  EnvironmentHealthReport,
  EnvironmentHealthStatus,
} from '@/types/environment-health';

const STATUS_COPY: Record<EnvironmentHealthStatus, string> = {
  healthy: 'Работает',
  degraded: 'Требует внимания',
  unavailable: 'Недоступно',
};

const RUNBOOK_URL = 'https://github.com/DTEK-Core/DTEK-core/blob/develop/docs/operations/ENVIRONMENT_HEALTH_RUNBOOK.md';

function formatCheckedAt(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

function statusIcon(status: EnvironmentHealthStatus): string {
  if (status === 'healthy') return 'check';
  if (status === 'degraded') return 'clock';
  return 'x';
}

export function EnvironmentHealthCard() {
  const [report, setReport] = useState<EnvironmentHealthReport | null>(null);
  const [isPending, startTransition] = useTransition();

  function runCheck() {
    setReport(null);
    startTransition(async () => {
      const result = await runEnvironmentHealthCheck();
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setReport(result.report);
      if (result.report.status === 'healthy') toast.success('Окружение доступно');
      else if (result.report.status === 'degraded') toast.warning('Окружение требует внимания');
      else toast.error('Окружение недоступно');
    });
  }

  return (
    <section className="card env-health-card" aria-labelledby="environment-health-title">
      <div className="card-head env-health-head">
        <div>
          <span className="card-title" id="environment-health-title">Состояние окружения</span>
          <span className="env-health-sub">Supabase, сессия, конфигурация и доступ к данным</span>
        </div>
        {report && (
          <span className={`env-health-overall env-health-${report.status}`}>
            {STATUS_COPY[report.status]}
          </span>
        )}
      </div>

      <div className="card-body env-health-body">
        {!report && (
          <div className="env-health-empty">
            <span className="env-health-empty-icon"><Icon name="pulse" size={20} /></span>
            <div>
              <strong>Проверка ещё не запускалась</strong>
              <span>Диагностика выполняется по запросу и не замедляет открытие настроек.</span>
            </div>
          </div>
        )}

        {report && (
          <div className="env-health-list" aria-live="polite">
            {report.checks.map(check => (
              <article className={`env-health-item env-health-${check.status}`} key={check.id}>
                <span className="env-health-status-icon">
                  <Icon name={statusIcon(check.status)} size={15} />
                </span>
                <div className="env-health-copy">
                  <div className="env-health-row">
                    <strong>{check.label}</strong>
                    <span className="mono">{check.durationMs} мс</span>
                  </div>
                  <p>{check.detail}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="env-health-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={runCheck}
            disabled={isPending}
          >
            <Icon name="refresh" size={15} />
            {isPending ? 'Проверяем…' : report ? 'Проверить снова' : 'Проверить состояние'}
          </button>
          <a
            className="btn btn-ghost btn-sm"
            href={RUNBOOK_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="doc" size={15} />
            Runbook
          </a>
          {report && (
            <span className="env-health-checked mono">
              {formatCheckedAt(report.checkedAt)} · {report.durationMs} мс
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
