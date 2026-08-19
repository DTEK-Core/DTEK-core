'use server';

import { getCurrentUserContext } from '@/lib/supabase/auth';
import {
  createSupabaseFetch,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConnectionError,
} from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import type {
  EnvironmentHealthCheck,
  EnvironmentHealthReport,
  EnvironmentHealthResult,
  EnvironmentHealthStatus,
} from '@/types/environment-health';

const HEALTH_ROLES = new Set(['owner', 'admin']);

interface HealthProfile {
  role: string | null;
  organization_id: string | null;
}

interface SafeConfiguration {
  url: string;
  anonKey: string;
}

function duration(startedAt: number): number {
  return Math.max(0, Date.now() - startedAt);
}

function overallStatus(checks: EnvironmentHealthCheck[]): EnvironmentHealthStatus {
  if (checks.some(check => check.status === 'unavailable')) return 'unavailable';
  if (checks.some(check => check.status === 'degraded')) return 'degraded';
  return 'healthy';
}

function connectionFailureDetail(error: unknown): string {
  return isSupabaseConnectionError(error)
    ? 'Сервис не ответил за установленный интервал.'
    : 'Проверка завершилась безопасной ошибкой.';
}

function inspectConfiguration(): {
  check: EnvironmentHealthCheck;
  configuration: SafeConfiguration | null;
} {
  const startedAt = Date.now();

  try {
    const url = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();
    getSupabaseServiceRoleKey();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) throw new Error('Application URL is missing');
    const parsedAppUrl = new URL(appUrl);
    if (!['http:', 'https:'].includes(parsedAppUrl.protocol)) {
      throw new Error('Application URL protocol is invalid');
    }

    return {
      check: {
        id: 'configuration',
        label: 'Конфигурация сервера',
        status: 'healthy',
        detail: 'Обязательные параметры заданы и имеют допустимый формат.',
        durationMs: duration(startedAt),
      },
      configuration: { url, anonKey },
    };
  } catch {
    return {
      check: {
        id: 'configuration',
        label: 'Конфигурация сервера',
        status: 'unavailable',
        detail: 'Не все обязательные параметры заданы корректно.',
        durationMs: duration(startedAt),
      },
      configuration: null,
    };
  }
}

async function checkSupabaseAuth(
  configuration: SafeConfiguration,
): Promise<EnvironmentHealthCheck> {
  const startedAt = Date.now();

  try {
    const response = await createSupabaseFetch()(
      `${configuration.url.replace(/\/$/, '')}/auth/v1/health`,
      {
        cache: 'no-store',
        headers: { apikey: configuration.anonKey },
      },
    );

    return {
      id: 'supabase_auth',
      label: 'Supabase Auth API',
      status: response.ok ? 'healthy' : 'degraded',
      detail: response.ok
        ? 'Auth API доступен.'
        : 'Auth API ответил, но сообщил нештатное состояние.',
      durationMs: duration(startedAt),
    };
  } catch (error) {
    return {
      id: 'supabase_auth',
      label: 'Supabase Auth API',
      status: 'unavailable',
      detail: connectionFailureDetail(error),
      durationMs: duration(startedAt),
    };
  }
}

async function checkTenantDatabase(organizationId: string): Promise<EnvironmentHealthCheck> {
  const startedAt = Date.now();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .maybeSingle();

    if (error || !data) {
      return {
        id: 'database',
        label: 'База данных и RLS',
        status: 'unavailable',
        detail: 'Tenant-scoped запрос не выполнен.',
        durationMs: duration(startedAt),
      };
    }

    return {
      id: 'database',
      label: 'База данных и RLS',
      status: 'healthy',
      detail: 'Tenant-scoped запрос выполнен успешно.',
      durationMs: duration(startedAt),
    };
  } catch (error) {
    return {
      id: 'database',
      label: 'База данных и RLS',
      status: 'unavailable',
      detail: connectionFailureDetail(error),
      durationMs: duration(startedAt),
    };
  }
}

export async function runEnvironmentHealthCheck(): Promise<EnvironmentHealthResult> {
  const startedAt = Date.now();

  let context: Awaited<ReturnType<typeof getCurrentUserContext>>;
  try {
    context = await getCurrentUserContext();
  } catch {
    return {
      success: false,
      error: 'Не удалось подтвердить сессию. Проверьте соединение и войдите повторно.',
    };
  }

  if (!context) {
    return { success: false, error: 'Требуется повторный вход в систему.' };
  }

  const profile = context.profile as HealthProfile | null;
  if (!profile?.organization_id) {
    return { success: false, error: 'Организация не определена для текущей сессии.' };
  }

  if (!profile.role || !HEALTH_ROLES.has(profile.role)) {
    return { success: false, error: 'Диагностика доступна владельцу и администратору.' };
  }

  const configurationResult = inspectConfiguration();
  const authorizationCheck: EnvironmentHealthCheck = {
    id: 'authorization',
    label: 'Сессия и организация',
    status: 'healthy',
    detail: 'Server authorization и organization context подтверждены.',
    durationMs: duration(startedAt),
  };

  let remoteChecks: EnvironmentHealthCheck[];
  if (configurationResult.configuration) {
    remoteChecks = await Promise.all([
      checkSupabaseAuth(configurationResult.configuration),
      checkTenantDatabase(profile.organization_id),
    ]);
  } else {
    remoteChecks = [
      {
        id: 'supabase_auth',
        label: 'Supabase Auth API',
        status: 'unavailable',
        detail: 'Проверка пропущена из-за конфигурации сервера.',
        durationMs: 0,
      },
      {
        id: 'database',
        label: 'База данных и RLS',
        status: 'unavailable',
        detail: 'Проверка пропущена из-за конфигурации сервера.',
        durationMs: 0,
      },
    ];
  }

  const checks = [configurationResult.check, authorizationCheck, ...remoteChecks];
  const report: EnvironmentHealthReport = {
    status: overallStatus(checks),
    checkedAt: new Date().toISOString(),
    durationMs: duration(startedAt),
    checks,
  };

  return { success: true, report };
}
