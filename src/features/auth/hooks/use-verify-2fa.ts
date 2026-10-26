'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { verify2fa } from '../api/verify-2fa';
import type { Verify2faBody, Verify2faResult } from '../types';

export function useVerify2fa() {
  return useMutation<Verify2faResult, ApiClientError, Verify2faBody>({
    mutationFn: verify2fa,
  });
}
