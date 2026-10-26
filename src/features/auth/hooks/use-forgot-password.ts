'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { forgotPassword } from '../api/forgot-password';
import type { ForgotPasswordBody } from '../types';

export function useForgotPassword() {
  return useMutation<void, ApiClientError, ForgotPasswordBody>({
    mutationFn: forgotPassword,
  });
}
