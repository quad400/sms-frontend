import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalAnnouncements } from '../types';

export function fetchPortalAnnouncements(): Promise<PortalAnnouncements> {
  return unwrap(api.GET('/api/v1/portal/announcements'));
}
