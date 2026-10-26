'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchNotificationPreferences } from '../api/get-notification-preferences';
import { accountKeys } from '../api/keys';
import type { NotificationPreferences } from '../types';

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences, ApiClientError>({
    queryKey: accountKeys.prefs(),
    queryFn: fetchNotificationPreferences,
  });
}
