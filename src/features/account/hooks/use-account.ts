'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  accountKeys,
  changePassword,
  fetchNotificationPreferences,
  fetchSessions,
  revokeSession,
} from '../api/account-api';

export function useNotificationPreferences() {
  return useQuery({
    queryKey: accountKeys.prefs(),
    queryFn: fetchNotificationPreferences,
  });
}

export function useSessions() {
  return useQuery({ queryKey: accountKeys.sessions(), queryFn: fetchSessions });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => revokeSession(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: accountKeys.sessions() }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}
