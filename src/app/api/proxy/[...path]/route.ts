import { NextResponse, type NextRequest } from 'next/server';
import { getBackendUrl, newRequestId } from '@/lib/api/backend';
import {
  ACCESS_COOKIE,
  accessTokenNeedsRefresh,
  applySessionCookies,
  clearSessionCookies,
  REFRESH_COOKIE,
} from '@/lib/auth/cookies';
import { isAuthSuccess, type AuthSuccessBody } from '@/lib/auth/types';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ path: string[] }> };

async function refreshAccess(refreshToken: string): Promise<AuthSuccessBody | null> {
  const response = await fetch(`${getBackendUrl()}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': newRequestId(),
    },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    return null;
  }
  const data: unknown = await response.json();
  return isAuthSuccess(data) ? data : null;
}

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const targetPath = path.join('/');
  const incomingUrl = new URL(request.url);
  const targetUrl = `${getBackendUrl()}/api/v1/${targetPath}${incomingUrl.search}`;

  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let refreshed: AuthSuccessBody | null = null;

  if ((!accessToken || accessTokenNeedsRefresh(accessToken)) && refreshToken) {
    refreshed = await refreshAccess(refreshToken);
    if (refreshed) {
      accessToken = refreshed.accessToken;
    }
  }

  const headers = new Headers();
  const requestId = request.headers.get('x-request-id') ?? newRequestId();
  headers.set('X-Request-Id', requestId);
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  const idempotencyKey = request.headers.get('idempotency-key');
  if (idempotencyKey) {
    headers.set('Idempotency-Key', idempotencyKey);
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: 'manual',
  });

  const responseHeaders = new Headers();
  const passThrough = ['content-type', 'cache-control'];
  for (const name of passThrough) {
    const value = upstream.headers.get(name);
    if (value) {
      responseHeaders.set(name, value);
    }
  }
  responseHeaders.set('X-Request-Id', requestId);

  const body = await upstream.arrayBuffer();
  const response = new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  });

  if (refreshed) {
    applySessionCookies(response, {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresIn: refreshed.expiresIn,
      userType: refreshed.user.userType,
    });
  } else if (upstream.status === 401) {
    clearSessionCookies(response);
  }

  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
