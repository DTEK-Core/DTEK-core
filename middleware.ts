import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isSupabaseConnectionError } from '@/lib/supabase/config';

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory store — acceptable for single-instance MVP.
// Replace with Upstash Redis for multi-instance (Enterprise).
const rateLimits = new Map<string, { count: number; resetAt: number }>();

interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
}

const RULES: Record<string, RateLimitRule> = {
  '/join': { windowMs: 60_000, maxRequests: 10 },
  '/api/': { windowMs: 60_000, maxRequests: 60 },
};

function getRuleForPath(pathname: string): RateLimitRule | null {
  for (const [prefix, rule] of Object.entries(RULES)) {
    if (pathname.startsWith(prefix)) return rule;
  }
  return null;
}

function checkRateLimit(key: string, rule: RateLimitRule): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + rule.windowMs });
    return true;
  }

  if (entry.count >= rule.maxRequests) return false;

  entry.count++;
  return true;
}

// ── Path helpers ──────────────────────────────────────────────────────────────

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
const PUBLIC_PATHS = ['/', '/favicon.ico'];
const PUBLIC_PREFIXES = ['/_next', '/templates/'];

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p)
    || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isOnboardingCreatePath(pathname: string) {
  return pathname === '/onboarding/create' || pathname.startsWith('/onboarding/create/');
}

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(({ name }) =>
    name.startsWith('sb-') && name.includes('auth-token'),
  );
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block abnormally large request bodies (> 100 KB) before any processing
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 102_400) {
    return new NextResponse('Payload Too Large', { status: 413 });
  }

  // IP-based rate limiting for sensitive routes
  const rule = getRuleForPath(pathname);
  if (rule) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const key = `${ip}:${pathname.split('/').slice(0, 2).join('/')}`;

    if (!checkRateLimit(key, rule)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    }
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Every Server Action performs its own authorization. Avoid running a second
  // session/profile round-trip before the action can validate the same request.
  if (request.headers.has('next-action')) {
    return NextResponse.next();
  }

  // A request with no Supabase auth cookie cannot have a valid server session.
  // Avoid an Auth/DNS round-trip for public auth screens and protected-route
  // redirects; session refresh stays active whenever an auth cookie is present.
  if (!hasSupabaseAuthCookie(request)) {
    if (isAuthPath(pathname)) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  let session;
  try {
    session = await updateSession(request);
  } catch (error) {
    if (isSupabaseConnectionError(error)) {
      console.error('[supabase] connection unavailable in middleware:', error);

      if (isAuthPath(pathname) || isOnboardingCreatePath(pathname)) {
        return NextResponse.next();
      }

      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'supabase_unavailable');
      return NextResponse.redirect(url);
    }

    throw error;
  }

  const { supabaseResponse, userId, organizationId } = session;

  // Unauthenticated user on protected route → login
  if (!userId && !isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user on auth route → dashboard (or org creation if no org)
  if (userId && isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = organizationId ? '/dashboard' : '/onboarding/create';
    return NextResponse.redirect(url);
  }

  if (userId) {
    // No org → must create one first (all app routes except /onboarding/create)
    if (!organizationId && !isOnboardingCreatePath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding/create';
      return NextResponse.redirect(url);
    }

    // Already has org → /onboarding/create is no longer needed
    if (organizationId && isOnboardingCreatePath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
