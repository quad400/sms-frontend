import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  PORTAL_COOKIE,
  REFRESH_COOKIE,
} from '@/lib/auth/cookie-names';
import type { AuthUserType } from '@/lib/auth/types';

export {
  ACCESS_COOKIE,
  PORTAL_COOKIE,
  REFRESH_COOKIE,
  accessTokenNeedsRefresh,
  decodeJwtExp,
} from '@/lib/auth/cookie-names';

const ACCESS_MAX_AGE_SECONDS = 60 * 15;
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function cookieSecure(): boolean {
  return process.env.NODE_ENV === 'production';
}

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  userType?: AuthUserType;
};

export function applySessionCookies(response: NextResponse, session: SessionTokens): void {
  const secure = cookieSecure();
  const accessMaxAge = session.expiresIn ?? ACCESS_MAX_AGE_SECONDS;

  response.cookies.set(ACCESS_COOKIE, session.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: accessMaxAge,
  });

  response.cookies.set(REFRESH_COOKIE, session.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });

  if (session.userType) {
    response.cookies.set(PORTAL_COOKIE, session.userType, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_MAX_AGE_SECONDS,
    });
  }
}

export function clearSessionCookies(response: NextResponse): void {
  const secure = cookieSecure();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, PORTAL_COOKIE]) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
}

export async function readAccessToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value;
}

export async function readRefreshToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value;
}
