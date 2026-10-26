'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalChatChannels, fetchPortalChatMessages } from '../api/get-chat';
import { portalKeys } from '../api/keys';
import { asArray, asRecord } from '@/lib/utils/record';

export function usePortalChatChannels() {
  return useQuery<unknown[], ApiClientError>({
    queryKey: portalKeys.chatChannels(),
    queryFn: async () => {
      const data = await fetchPortalChatChannels();
      const root = asRecord(data);
      return asArray(root?.channels ?? data);
    },
  });
}

export function usePortalChatMessages(channelId: string | null) {
  return useQuery<unknown[], ApiClientError>({
    queryKey: portalKeys.chatMessages(channelId ?? 'none'),
    enabled: !!channelId,
    queryFn: async () => {
      const data = await fetchPortalChatMessages(channelId!);
      const root = asRecord(data);
      return asArray(root?.items ?? data);
    },
  });
}
