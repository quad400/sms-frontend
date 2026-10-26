import { proxyGet } from '@/lib/api/proxy-fetch';

export function fetchPortalLiveSessions(): Promise<unknown> {
  return proxyGet('/api/v1/portal/me/live-sessions');
}
