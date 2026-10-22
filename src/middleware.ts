import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  accessTokenNeedsRefresh,
  PORTAL_COOKIE,
  REFRESH_COOKIE,
} from '@/lib/auth/cookie-names';
import { portalHomeForUserType, portalMatchesPath } from '@/lib/auth/portal';
import type { AuthUserType } from '@/lib/auth/types';

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/apply',
  '/application-status',
  '/accept-offer',
];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/api/session') || pathname.startsWith('/api/proxy')) {
    return true;
  }
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isProtectedPortal(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/parent') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/it')
  );
}

async function tryRefresh(request: NextRequest): Promise<NextResponse | null> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return null;
  }

  const refreshUrl = new URL('/api/session/refresh', request.url);
  const refreshed = await fetch(refreshUrl, {
    method: 'POST',
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
  });

  if (!refreshed.ok) {
    return null;
  }

  const response = NextResponse.next();
  const setCookie = refreshed.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookie) {
    response.headers.append('set-cookie', cookie);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const portal = request.cookies.get(PORTAL_COOKIE)?.value as AuthUserType | undefined;

  if (isPublicPath(pathname)) {
    if (accessToken && (pathname === '/login' || pathname === '/')) {
      const home = portal ? portalHomeForUserType(portal) : '/admin';
      return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/') {
    if (accessToken && portal) {
      return NextResponse.redirect(new URL(portalHomeForUserType(portal), request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!isProtectedPortal(pathname)) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (accessTokenNeedsRefresh(accessToken)) {
    const refreshed = await tryRefresh(request);
    if (!refreshed) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      response.cookies.delete(PORTAL_COOKIE);
      return response;
    }
    return refreshed;
  }

  if (portal && isProtectedPortal(pathname) && !portalMatchesPath(portal, pathname)) {
    if (pathname.startsWith('/it')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(portalHomeForUserType(portal), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
