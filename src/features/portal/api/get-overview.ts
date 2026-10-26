import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalOverview } from '../types';

export function fetchPortalOverview(): Promise<PortalOverview> {
  return unwrap(api.GET('/api/v1/portal/me/overview'));
}
