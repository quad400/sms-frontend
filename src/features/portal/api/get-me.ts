import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalMe } from '../types';

export function fetchPortalMe(): Promise<PortalMe> {
  return unwrap(api.GET('/api/v1/portal/me'));
}
