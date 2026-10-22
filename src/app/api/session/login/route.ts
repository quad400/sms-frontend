import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { applySessionCookies } from '@/lib/auth/cookies';
import {
  isAuthChallenge,
  isAuthSuccess,
  type AuthChallengeBody,
  type AuthSuccessBody,
} from '@/lib/auth/types';

type LoginBody = {
  identifier: string;
  password: string;
  otp?: string;
  challengeToken?: string;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
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

  const result = await backendFetch<AuthSuccessBody | AuthChallengeBody>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier: body.identifier,
      password: body.password,
      ...(body.otp ? { otp: body.otp } : {}),
      ...(body.challengeToken ? { challengeToken: body.challengeToken } : {}),
    }),
  });

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status || 502 });
  }

  if (isAuthChallenge(result.data)) {
    return NextResponse.json({
      challenge: { challengeToken: result.data.challengeToken },
    });
  }

  if (!isAuthSuccess(result.data)) {
    return NextResponse.json(
      {
        statusCode: 502,
        code: 'INVALID_LOGIN_RESPONSE',
        message: 'Unexpected login response from the server.',
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
