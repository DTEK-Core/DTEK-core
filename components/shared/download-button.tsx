'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/shared/icon';

type DownloadState = 'idle' | 'loading' | 'success' | 'error';
type DownloadVariant = 'primary' | 'line' | 'ghost';
type DownloadSize = 'sm' | 'md' | 'lg';

interface DownloadButtonProps {
  label: string;
  href?: string;
  onDownload?: () => void | Promise<void>;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  errorMessage?: string;
  fileName?: string;
  variant?: DownloadVariant;
  size?: DownloadSize;
  compact?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
}

const SUCCESS_RESET_MS = 1800;

function filenameFromDisposition(value: string | null): string | null {
  if (!value) return null;

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim().replace(/^"|"$/g, ''));
    } catch {
      return utf8Match[1].trim().replace(/^"|"$/g, '');
    }
  }

  const filenameMatch = value.match(/filename="([^"]+)"|filename=([^;]+)/i);
  return (filenameMatch?.[1] ?? filenameMatch?.[2] ?? '').trim() || null;
}

async function responseError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: unknown };
    if (typeof body.error === 'string' && body.error.trim()) return body.error;
  } catch {
    // The endpoint may return an empty or non-JSON error response.
  }
  return 'Не удалось скачать файл. Попробуйте ещё раз.';
}

function filenameFromHref(href: string): string | null {
  const segment = new URL(href, window.location.href).pathname.split('/').pop();
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

async function downloadFromHref(href: string, fileName?: string): Promise<void> {
  const response = await fetch(href, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(await responseError(response));

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName
    ?? filenameFromDisposition(response.headers.get('Content-Disposition'))
    ?? filenameFromHref(href)
    ?? 'download';
  link.hidden = true;
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }
}

export function DownloadButton({
  label,
  href,
  onDownload,
  loadingLabel = 'Скачивание…',
  successLabel = 'Готово',
  errorLabel = 'Повторить',
  errorMessage = 'Не удалось скачать файл. Попробуйте ещё раз.',
  fileName,
  variant = 'ghost',
  size = 'sm',
  compact = false,
  disabled = false,
  className = '',
  title,
}: DownloadButtonProps) {
  const [state, setState] = useState<DownloadState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoading = state === 'loading';

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function handleClick() {
    if (disabled || isLoading || (!href && !onDownload)) return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setState('loading');

    try {
      if (onDownload) await onDownload();
      else if (href) await downloadFromHref(href, fileName);

      setState('success');
      resetTimer.current = setTimeout(() => setState('idle'), SUCCESS_RESET_MS);
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : errorMessage;
      setState('error');
      toast.error(message);
    }
  }

  const visibleLabel = state === 'loading'
    ? loadingLabel
    : state === 'success'
      ? successLabel
      : state === 'error'
        ? errorLabel
        : label;

  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-${size} download-button${compact ? ' download-button-compact' : ''} ${className}`.trim()}
      data-state={state}
      onClick={() => void handleClick()}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      title={title}
    >
      <span className="download-button-label" aria-live="polite" key={state}>{visibleLabel}</span>
      <span className="download-button-icon" aria-hidden="true">
        <span className="download-button-arrow"><Icon name="download" size={14} /></span>
        <span className="download-button-check"><Icon name="check" size={14} /></span>
      </span>
    </button>
  );
}
