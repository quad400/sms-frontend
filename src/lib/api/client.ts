import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '@/lib/api/schema';
import { newRequestId } from '@/lib/api/backend';

function rewriteApiPath(pathname: string): string {
  if (pathname.startsWith('/api/v1/')) {
    return `/api/proxy/${pathname.slice('/api/v1/'.length)}`;
  }
  return pathname;
}

const rewriteMiddleware: Middleware = {
  async onRequest({ request }) {
    const url = new URL(request.url);
    url.pathname = rewriteApiPath(url.pathname);
    const headers = new Headers(request.headers);
    if (!headers.has('X-Request-Id')) {
      headers.set('X-Request-Id', newRequestId());
    }
    return new Request(url, {
      method: request.method,
      headers,
      body: request.body,
      duplex: 'half',
    } as RequestInit);
  },
};

export function createApiClient(baseOrigin?: string) {
  const origin = baseOrigin?.replace(/\/$/, '') || undefined;
  const client = createClient<paths>({ baseUrl: origin });
  client.use(rewriteMiddleware);
  return client;
}

/** Browser client — relative `/api/proxy/*` calls. */
export const api = createApiClient();
