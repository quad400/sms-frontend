import { newRequestId } from '@/lib/api/backend';
import { ApiClientError, isApiErrorBody, mapError } from '@/lib/api/errors';

/**
 * Authenticated browser fetch through `/api/proxy/*` for paths not yet in
 * the generated OpenAPI client.
 */
export async function proxyGet<T = unknown>(
  apiPath: string,
  query?: Record<string, string | undefined>,
): Promise<T> {
  const path = apiPath.replace(/^\/api\/v1\//, '');
  const url = new URL(`/api/proxy/${path}`, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'X-Request-Id': newRequestId() },
    credentials: 'same-origin',
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiClientError(mapError(body));
    }
    throw new ApiClientError({
      kind: 'retry',
      message: 'Something went wrong. Please try again.',
      code: 'UNKNOWN',
      requestId: '',
    });
  }
  return body as T;
}

export async function proxyPost<T = unknown>(
  apiPath: string,
  json: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const path = apiPath.replace(/^\/api\/v1\//, '');
  const response = await fetch(`/api/proxy/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': newRequestId(),
      ...extraHeaders,
    },
    credentials: 'same-origin',
    body: JSON.stringify(json),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiClientError(mapError(body));
    }
    throw new ApiClientError({
      kind: 'retry',
      message: 'Something went wrong. Please try again.',
      code: 'UNKNOWN',
      requestId: '',
    });
  }
  return body as T;
}

export async function proxyPostFormData<T = unknown>(
  apiPath: string,
  formData: FormData,
): Promise<T> {
  const path = apiPath.replace(/^\/api\/v1\//, '');
  const response = await fetch(`/api/proxy/${path}`, {
    method: 'POST',
    headers: { 'X-Request-Id': newRequestId() },
    credentials: 'same-origin',
    body: formData,
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiClientError(mapError(body));
    }
    throw new ApiClientError({
      kind: 'retry',
      message: 'Something went wrong. Please try again.',
      code: 'UNKNOWN',
      requestId: '',
    });
  }
  return body as T;
}

async function proxySend<T>(
  method: 'PUT' | 'PATCH' | 'DELETE',
  apiPath: string,
  json?: unknown,
): Promise<T> {
  const path = apiPath.replace(/^\/api\/v1\//, '');
  const headers: Record<string, string> = { 'X-Request-Id': newRequestId() };
  if (json !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`/api/proxy/${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: json === undefined ? undefined : JSON.stringify(json),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiClientError(mapError(body));
    }
    throw new ApiClientError({
      kind: 'retry',
      message: 'Something went wrong. Please try again.',
      code: 'UNKNOWN',
      requestId: '',
    });
  }
  return body as T;
}

export function proxyPut<T = unknown>(apiPath: string, json: unknown): Promise<T> {
  return proxySend<T>('PUT', apiPath, json);
}

export function proxyPatch<T = unknown>(apiPath: string, json: unknown): Promise<T> {
  return proxySend<T>('PATCH', apiPath, json);
}

export function proxyDelete<T = unknown>(apiPath: string): Promise<T> {
  return proxySend<T>('DELETE', apiPath);
}
