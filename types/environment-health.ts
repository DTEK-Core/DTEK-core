export type EnvironmentHealthStatus = 'healthy' | 'degraded' | 'unavailable';

export type EnvironmentHealthCheckId =
  | 'configuration'
  | 'authorization'
  | 'supabase_auth'
  | 'database';

export interface EnvironmentHealthCheck {
  id: EnvironmentHealthCheckId;
  label: string;
  status: EnvironmentHealthStatus;
  detail: string;
  durationMs: number;
}

export interface EnvironmentHealthReport {
  status: EnvironmentHealthStatus;
  checkedAt: string;
  durationMs: number;
  checks: EnvironmentHealthCheck[];
}

export type EnvironmentHealthResult =
  | { success: true; report: EnvironmentHealthReport }
  | { success: false; error: string };
