import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { NotificationPreferenceItem } from '../types';

export async function updateNotificationPreferences(
  preferences: NotificationPreferenceItem[],
): Promise<NotificationPreferenceItem[]> {
  const data = await unwrap(
    api.PUT('/api/v1/notification-preferences/me', {
      body: { preferences },
    }),
  );
  return data as unknown as NotificationPreferenceItem[];
}
