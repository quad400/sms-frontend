'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  createAnnouncement,
  createEvent,
  createNotificationTemplate,
  createReminder,
  createThread,
  deleteAnnouncement,
  getThread,
  listAnnouncements,
  listDeliveries,
  listEvents,
  listNotificationTemplates,
  listReminders,
  listThreads,
  previewNotificationTemplate,
  publishAnnouncement,
  retryDelivery,
  sendMessage,
  updateReminder,
  type Announcement,
  type Delivery,
  type MessageThread,
  type NotificationTemplate,
  type Reminder,
  type SchoolEvent,
} from '../api/communication';
import { adminKeys } from '../api/keys';
import type { Paginated } from '../types';

export function useAnnouncements(page: number, enabled = true) {
  return useQuery<Paginated<Announcement>, ApiClientError>({
    queryKey: adminKeys.announcements({ page }),
    queryFn: () => listAnnouncements({ page }),
    enabled,
  });
}

function useInvalidateAnnouncements() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: adminKeys.announcements({}) });
}

export function useCreateAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation<Announcement, ApiClientError, { title: string; body: string; audience: string }>({
    mutationFn: ({ title, body, audience }) =>
      createAnnouncement({ title, body, targets: [{ type: audience }] }),
    onSuccess: invalidate,
  });
}

export function usePublishAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: publishAnnouncement,
    onSuccess: invalidate,
  });
}

export function useDeleteAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: deleteAnnouncement,
    onSuccess: invalidate,
  });
}

export function useThreads(page: number) {
  return useQuery<Paginated<MessageThread>, ApiClientError>({
    queryKey: adminKeys.threads({ page }),
    queryFn: () => listThreads({ page }),
  });
}

export function useThread(threadId: number | null) {
  return useQuery<unknown, ApiClientError>({
    queryKey: adminKeys.thread(threadId ?? 0),
    queryFn: () => getThread(threadId!),
    enabled: threadId != null,
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, { subject: string; body: string }>({
    mutationFn: (body) => createThread(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.threads({}) }),
  });
}

export function useSendMessage(threadId: number | null) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, string>({
    mutationFn: (body) => sendMessage(threadId!, { body }),
    onSuccess: () => {
      if (threadId != null) {
        void qc.invalidateQueries({ queryKey: adminKeys.thread(threadId) });
      }
    },
  });
}

export function useEvents(page: number) {
  return useQuery<Paginated<SchoolEvent>, ApiClientError>({
    queryKey: adminKeys.events({ page }),
    queryFn: () => listEvents({ page }),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation<SchoolEvent, ApiClientError, { title: string; startsAt: string }>({
    mutationFn: (body) => createEvent(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.events({}) }),
  });
}

export function useReminders(page: number) {
  return useQuery<Paginated<Reminder>, ApiClientError>({
    queryKey: adminKeys.reminders({ page }),
    queryFn: () => listReminders({ page }),
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation<Reminder, ApiClientError, { name: string; channel: string }>({
    mutationFn: ({ name, channel }) => createReminder({ name, channel, isActive: true }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.reminders({}) }),
  });
}

export function useToggleReminder() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, { id: number; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => updateReminder(id, { isActive }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.reminders({}) }),
  });
}

export function useNotificationTemplates(page: number) {
  return useQuery<Paginated<NotificationTemplate>, ApiClientError>({
    queryKey: adminKeys.notificationTemplates({ page }),
    queryFn: () => listNotificationTemplates({ page }),
  });
}

export function useCreateNotificationTemplate() {
  const qc = useQueryClient();
  return useMutation<
    NotificationTemplate,
    ApiClientError,
    { name: string; channel: string; subject: string; body: string }
  >({
    mutationFn: (body) => createNotificationTemplate(body),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: adminKeys.notificationTemplates({}) }),
  });
}

export function usePreviewNotificationTemplate() {
  return useMutation<
    unknown,
    ApiClientError,
    { id: number; data?: Record<string, unknown> }
  >({
    mutationFn: ({ id, data }) => previewNotificationTemplate(id, data),
  });
}

export function useDeliveries(params: { page: number; status?: string }) {
  return useQuery<Paginated<Delivery>, ApiClientError>({
    queryKey: adminKeys.deliveries({ page: params.page, status: params.status ?? '' }),
    queryFn: () => listDeliveries({ page: params.page, status: params.status || undefined }),
  });
}

export function useRetryDelivery() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: retryDelivery,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.deliveries({}) }),
  });
}
