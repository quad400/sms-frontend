'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchSessions } from '../api/get-sessions';
import { accountKeys } from '../api/keys';
import type { AuthSessions } from '../types';

export function useSessions() {
  return useQuery<AuthSessions, ApiClientError>({
    queryKey: accountKeys.sessions(),
    queryFn: fetchSessions,
  });
}
