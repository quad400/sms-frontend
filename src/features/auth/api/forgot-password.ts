import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { ForgotPasswordBody } from '../types';

export async function forgotPassword(body: ForgotPasswordBody): Promise<void> {
  await unwrap(
    api.POST('/api/v1/auth/password/forgot', {
      body,
    }),
  );
}
