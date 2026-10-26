'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { login } from '../api/login';
import type { LoginBody, LoginResult } from '../types';

export function useLogin() {
  return useMutation<LoginResult, ApiClientError, LoginBody>({
    mutationFn: login,
  });
}
