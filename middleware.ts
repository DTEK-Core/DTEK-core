import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
const PUBLIC_PATHS = ['/', '/favicon.ico'];

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith('/_next');
}

function isOnboardingCreatePath(pathname: string) {
  return pathname === '/onboarding/create' || pathname.startsWith('/onboarding/create/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const { supabaseResponse, user, organizationId } = await updateSession(request);

  // Unauthenticated user on protected route → login
  if (!user && !isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user on auth route → dashboard (or org creation if no org)
  if (user && isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = organizationId ? '/dashboard' : '/onboarding/create';
    return NextResponse.redirect(url);
  }

  if (user) {
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
