import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalReportCards } from '../types';

export function fetchPortalReportCards(): Promise<PortalReportCards> {
  return unwrap(api.GET('/api/v1/portal/me/report-cards'));
}
