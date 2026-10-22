import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import {
  clearSessionCookies,
  readAccessToken,
  readRefreshToken,
} from '@/lib/auth/cookies';

export async function POST() {
  const [accessToken, refreshToken] = await Promise.all([
    readAccessToken(),
    readRefreshToken(),
  ]);

  if (accessToken) {
    await backendFetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookies(response);
  return response;
}
