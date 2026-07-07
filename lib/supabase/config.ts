const DEFAULT_SUPABASE_TIMEOUT_MS = 4_000;

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');

  try {
    new URL(url);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is invalid');
  }

  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return key;
}

export function getSupabaseFetchTimeoutMs(): number {
  const raw = process.env.SUPABASE_FETCH_TIMEOUT_MS;
  if (!raw) return DEFAULT_SUPABASE_TIMEOUT_MS;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1_000) return DEFAULT_SUPABASE_TIMEOUT_MS;
  return parsed;
}

export function createSupabaseFetch(timeoutMs = getSupabaseFetchTimeoutMs()): typeof fetch {
  return async (input, init = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const upstreamSignal = init.signal;

    if (upstreamSignal) {
      if (upstreamSignal.aborted) controller.abort();
      else upstreamSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

export function getSupabaseClientOptions() {
  return {
    global: {
      fetch: createSupabaseFetch(),
    },
  };
}

export function isSupabaseConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  return (
    error.name === 'AbortError' ||
    error.message.includes('fetch failed') ||
    error.message.includes('ENOTFOUND') ||
    error.message.includes('timed out') ||
    error.message.includes('Could not resolve host')
  );
}

export function getSupabaseUnavailableMessage(): string {
  return 'Нет соединения с Supabase. Проверьте интернет, DNS и переменные окружения.';
}
