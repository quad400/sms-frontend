import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalLessonNotes } from '../types';

export function fetchPortalLessonNotes(): Promise<PortalLessonNotes> {
  return unwrap(api.GET('/api/v1/portal/me/lesson-notes'));
}
