import { proxyGet } from '@/lib/api/proxy-fetch';

export function fetchPortalMedical(): Promise<unknown> {
  return proxyGet('/api/v1/portal/me/medical');
}
