import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalResults } from '../types';

export function fetchPortalResults(): Promise<PortalResults> {
  return unwrap(api.GET('/api/v1/portal/me/results'));
}
