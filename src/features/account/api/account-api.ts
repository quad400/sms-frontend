import { api } from '@/lib/api/client';
import { isApiErrorBody, mapError, type MappedError } from '@/lib/api/errors';

export class AccountApiError extends Error {
  readonly mapped: MappedError;

  constructor(mapped: MappedError) {
    super(mapped.message);
    this.name = 'AccountApiError';
    this.mapped = mapped;
  }
}

async function unwrap<T>(promise: Promise<{ data?: T; error?: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    if (isApiErrorBody(error)) {
      throw new AccountApiError(mapError(error));
    }
    throw new AccountApiError({
      kind: 'retry',
      message: 'Something went wrong. Please try again.',
      code: 'UNKNOWN',
      requestId: '',
    });
  }
  return data as T;
}

export function changePassword(body: { currentPassword: string; newPassword: string }) {
  return unwrap(
    api.POST('/api/v1/auth/password/change', {
      body,
    }),
  );
}

export function fetchNotificationPreferences() {
  return unwrap(api.GET('/api/v1/notification-preferences/me'));
}

export function fetchSessions() {
  return unwrap(api.GET('/api/v1/auth/sessions'));
}

export function revokeSession(id: number) {
  return unwrap(
    api.DELETE('/api/v1/auth/sessions/{id}', {
      params: { path: { id } },
    }),
  );
}

export const accountKeys = {
  all: ['account'] as const,
  prefs: () => [...accountKeys.all, 'prefs'] as const,
  sessions: () => [...accountKeys.all, 'sessions'] as const,
};
