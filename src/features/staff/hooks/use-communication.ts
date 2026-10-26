'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  fetchAnnouncements,
  fetchEvents,
  fetchThread,
  fetchThreads,
  sendThreadMessage,
} from '../api/communication';
import { staffKeys } from '../api/keys';
import type {
  AnnouncementRecord,
  CalendarEvent,
  MessageThread,
  MessageThreadDetail,
  ThreadMessage,
} from '../types';

export function useThreads() {
  return useQuery<MessageThread[], ApiClientError>({
    queryKey: staffKeys.threads(),
    queryFn: fetchThreads,
  });
}

export function useThread(id: number | null) {
  return useQuery<MessageThreadDetail, ApiClientError>({
    queryKey: staffKeys.thread(id ?? 0),
    queryFn: () => fetchThread(id as number),
    enabled: id !== null,
    refetchInterval: 30_000,
  });
}

export function useSendThreadMessage(threadId: number) {
  const queryClient = useQueryClient();
  return useMutation<ThreadMessage, ApiClientError, { clientRef: string; body: string }>({
    mutationFn: (payload) => sendThreadMessage(threadId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.thread(threadId) });
      void queryClient.invalidateQueries({ queryKey: staffKeys.threads() });
    },
  });
}

export function useAnnouncements() {
  return useQuery<AnnouncementRecord[], ApiClientError>({
    queryKey: staffKeys.announcements(),
    queryFn: fetchAnnouncements,
  });
}

export function useEvents() {
  return useQuery<CalendarEvent[], ApiClientError>({
    queryKey: staffKeys.events(),
    queryFn: fetchEvents,
  });
}
