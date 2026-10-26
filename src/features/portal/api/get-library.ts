import { proxyGet } from '@/lib/api/proxy-fetch';

export function fetchPortalLibrary(): Promise<unknown> {
  return proxyGet('/api/v1/portal/me/library');
}
