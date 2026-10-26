'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { parentKeys } from '../api/keys';
import { fetchInbox, markAllInboxRead, markInboxRead } from '../api/notifications';
import type { InboxNotification, Paginated } from '../types';

export function useInbox(page: number) {
  return useQuery<Paginated<InboxNotification>, ApiClientError>({
    queryKey: parentKeys.inbox(page),
    queryFn: () => fetchInbox(page),
    placeholderData: (previous) => previous,
  });
}

export function useMarkInboxRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, number>({
    mutationFn: markInboxRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: parentKeys.inboxAll() }),
  });
}

export function useMarkAllInboxRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, void>({
    mutationFn: markAllInboxRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: parentKeys.inboxAll() }),
  });
}
