import { isApiErrorBody, type ApiErrorBody } from '@/lib/api/errors';

const DEFAULT_BACKEND_URL = 'http://localhost:3000';

export function getBackendUrl(): string {
  return process.env.BACKEND_URL?.replace(/\/$/, '') || DEFAULT_BACKEND_URL;
}

export function newRequestId(): string {
  return crypto.randomUUID();
}

export type BackendResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: ApiErrorBody };

export async function backendFetch<T>(
  path: string,
  init: RequestInit & { requestId?: string } = {},
): Promise<BackendResult<T>> {
  const requestId = init.requestId ?? newRequestId();
  const headers = new Headers(init.headers);
  headers.set('X-Request-Id', requestId);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${getBackendUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch {
    return {
      ok: false,
      status: 0,
      error: {
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the server. Check your connection and try again.',
        requestId,
      },
    };
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    if (isApiErrorBody(parsed)) {
      return { ok: false, status: response.status, error: parsed };
    }
    return {
      ok: false,
      status: response.status,
      error: {
        statusCode: response.status,
        code: 'HTTP_ERROR',
        message: text || response.statusText || 'Request failed.',
        requestId,
      },
    };
  }

  return { ok: true, status: response.status, data: parsed as T };
}
