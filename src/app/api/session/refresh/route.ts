import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import {
  applySessionCookies,
  clearSessionCookies,
  readRefreshToken,
} from '@/lib/auth/cookies';
import { isAuthSuccess, type AuthSuccessBody } from '@/lib/auth/types';

export async function POST() {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) {
    const response = NextResponse.json(
      {
        statusCode: 401,
        code: 'NO_REFRESH_TOKEN',
        message: 'Session expired. Please sign in again.',
        requestId: crypto.randomUUID(),
      },
      { status: 401 },
    );
    clearSessionCookies(response);
    return response;
  }

  const result = await backendFetch<AuthSuccessBody>('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (!result.ok || !isAuthSuccess(result.data)) {
    const response = NextResponse.json(
      result.ok
        ? {
            statusCode: 401,
            code: 'INVALID_REFRESH_RESPONSE',
            message: 'Session expired. Please sign in again.',
            requestId: crypto.randomUUID(),
          }
        : result.error,
      { status: 401 },
    );
    clearSessionCookies(response);
    return response;
  }

  const response = NextResponse.json({ user: result.data.user });
  applySessionCookies(response, {
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    expiresIn: result.data.expiresIn,
    userType: result.data.user.userType,
  });
  return response;
}
