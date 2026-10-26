'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { accountKeys } from '../api/keys';
import { revokeSession } from '../api/revoke-session';

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, number>({
    mutationFn: (id) => revokeSession(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.sessions() });
    },
  });
}
