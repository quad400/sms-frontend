import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalTimetable } from '../types';

export function fetchPortalTimetable(): Promise<PortalTimetable> {
  return unwrap(api.GET('/api/v1/portal/me/timetable'));
}
