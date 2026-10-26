'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { updateNotificationPreferences } from '../api/update-notification-preferences';
import { accountKeys } from '../api/keys';
import type { NotificationPreferenceItem } from '../types';

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation<NotificationPreferenceItem[], ApiClientError, NotificationPreferenceItem[]>({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(accountKeys.prefs(), data);
    },
  });
}
