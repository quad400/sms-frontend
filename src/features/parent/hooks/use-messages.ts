'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { parentKeys } from '../api/keys';
import { createThread, fetchThread, fetchThreads, sendThreadMessage } from '../api/messages';
import type { MessageThread, MessageThreadDetail, ThreadMessage } from '../types';

export function useThreads() {
  return useQuery<MessageThread[], ApiClientError>({
    queryKey: parentKeys.threads(),
    queryFn: fetchThreads,
  });
}

export function useThread(id: number | null) {
  return useQuery<MessageThreadDetail, ApiClientError>({
    queryKey: parentKeys.thread(id ?? 0),
    queryFn: () => fetchThread(id as number),
    enabled: id !== null,
    refetchInterval: 30_000,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation<
    MessageThread,
    ApiClientError,
    { subject: string; studentId: number; participantUserIds: number[] }
  >({
    mutationFn: createThread,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: parentKeys.threads() }),
  });
}

export function useSendThreadMessage(threadId: number) {
  const queryClient = useQueryClient();
  return useMutation<ThreadMessage, ApiClientError, { clientRef: string; body: string }>({
    mutationFn: (payload) => sendThreadMessage(threadId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: parentKeys.thread(threadId) });
      void queryClient.invalidateQueries({ queryKey: parentKeys.threads() });
    },
  });
}
