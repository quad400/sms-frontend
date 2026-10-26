'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { changePassword } from '../api/change-password';
import type { ChangePasswordBody } from '../types';

export function useChangePassword() {
  return useMutation<void, ApiClientError, ChangePasswordBody>({
    mutationFn: changePassword,
  });
}
