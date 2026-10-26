import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { NotificationPreferences } from '../types';

export function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return unwrap(api.GET('/api/v1/notification-preferences/me'));
}
