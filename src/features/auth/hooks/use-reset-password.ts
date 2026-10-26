'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { resetPassword } from '../api/reset-password';
import type { ResetPasswordBody } from '../types';

export function useResetPassword() {
  return useMutation<void, ApiClientError, ResetPasswordBody>({
    mutationFn: resetPassword,
  });
}
