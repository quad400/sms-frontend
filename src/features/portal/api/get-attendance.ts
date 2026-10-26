import { proxyGet } from '@/lib/api/proxy-fetch';
import type { PortalAttendance } from '../types';

export function fetchPortalAttendance(range?: {
  from?: string;
  to?: string;
}): Promise<PortalAttendance> {
  return proxyGet<PortalAttendance>('/api/v1/portal/me/attendance', {
    from: range?.from,
    to: range?.to,
  });
}
