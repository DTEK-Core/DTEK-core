'use client';

import Link from 'next/link';
import { Icon } from '@/components/shared/icon';

interface ReportStateProps {
  icon?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  onRetry?: () => void;
}

export function ReportState({
  icon = 'doc',
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  onRetry,
}: ReportStateProps) {
  return (
    <section className="report-state">
      <div className="report-state-icon">
        <Icon name={icon} size={26} />
      </div>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="report-state-actions">
        {onRetry && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
            <Icon name="refresh" size={14} />
            Повторить
          </button>
        )}
        {primaryHref && primaryLabel && (
          <Link href={primaryHref} className="btn btn-primary btn-sm">
            {primaryLabel}
          </Link>
        )}
        {secondaryHref && secondaryLabel && (
          <Link href={secondaryHref} className="btn btn-ghost btn-sm">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
