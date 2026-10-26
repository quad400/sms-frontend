'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { fetchInbox, markAllInboxRead, markInboxRead } from '../api/notifications';
import { staffKeys } from '../api/keys';
import type { InboxNotification, Paginated } from '../types';

export function useInbox(page: number) {
  return useQuery<Paginated<InboxNotification>, ApiClientError>({
    queryKey: staffKeys.inbox(page),
    queryFn: () => fetchInbox(page),
    placeholderData: (previous) => previous,
  });
}

export function useMarkInboxRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, number>({
    mutationFn: markInboxRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: staffKeys.inboxAll() }),
  });
}

export function useMarkAllInboxRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, void>({
    mutationFn: markAllInboxRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: staffKeys.inboxAll() }),
  });
}
