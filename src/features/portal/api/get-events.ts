import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalEvents } from '../types';

export function fetchPortalEvents(): Promise<PortalEvents> {
  return unwrap(api.GET('/api/v1/portal/events'));
}
