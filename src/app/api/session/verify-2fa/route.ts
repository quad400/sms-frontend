import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { applySessionCookies } from '@/lib/auth/cookies';
import { isAuthSuccess, type AuthSuccessBody } from '@/lib/auth/types';

type VerifyBody = {
  code: string;
  challengeToken: string;
};

export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json(
      {
        statusCode: 400,
        code: 'INVALID_BODY',
        message: 'Request body must be JSON.',
        requestId: crypto.randomUUID(),
      },
      { status: 400 },
    );
  }

  const result = await backendFetch<AuthSuccessBody>('/api/v1/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({
      code: body.code,
      challengeToken: body.challengeToken,
    }),
  });

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status || 502 });
  }

  if (!isAuthSuccess(result.data)) {
    return NextResponse.json(
      {
        statusCode: 502,
        code: 'INVALID_2FA_RESPONSE',
        message: 'Unexpected two-factor response from the server.',
        requestId: crypto.randomUUID(),
      },
      { status: 502 },
    );
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
