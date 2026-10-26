'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { parentKeys } from '../api/keys';
import {
  fetchAnnouncements,
  fetchEvents,
  fetchPortalMe,
  patchPortalContact,
} from '../api/portal';
import type { AnnouncementItem, CalendarEvent, PortalMe } from '../types';

export function useAnnouncements() {
  return useQuery<AnnouncementItem[], ApiClientError>({
    queryKey: parentKeys.announcements(),
    queryFn: fetchAnnouncements,
  });
}

export function useEvents() {
  return useQuery<CalendarEvent[], ApiClientError>({
    queryKey: parentKeys.events(),
    queryFn: fetchEvents,
  });
}

export function usePortalMe() {
  return useQuery<PortalMe, ApiClientError>({
    queryKey: parentKeys.me(),
    queryFn: fetchPortalMe,
  });
}

export function usePatchPortalContact() {
  const queryClient = useQueryClient();
  return useMutation<
    PortalMe,
    ApiClientError,
    { phone?: string; email?: string | null; address?: string | null }
  >({
    mutationFn: patchPortalContact,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: parentKeys.me() }),
  });
}
