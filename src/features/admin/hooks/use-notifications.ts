'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  fetchAdminInbox,
  markAdminInboxRead,
  markAllAdminInboxRead,
  type AdminInboxPage,
} from '../api/notifications';
import { adminKeys } from '../api/keys';

export function useAdminInbox(page: number) {
  return useQuery<AdminInboxPage, ApiClientError>({
    queryKey: adminKeys.notifications(page),
    queryFn: () => fetchAdminInbox(page),
    placeholderData: (previous) => previous,
  });
}

export function useMarkAdminInboxRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, number>({
    mutationFn: markAdminInboxRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: adminKeys.notificationsAll() }),
  });
}

export function useMarkAllAdminInboxRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, void>({
    mutationFn: markAllAdminInboxRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: adminKeys.notificationsAll() }),
  });
}
