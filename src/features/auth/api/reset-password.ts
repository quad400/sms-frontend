import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { ResetPasswordBody } from '../types';

export async function resetPassword(body: ResetPasswordBody): Promise<void> {
  await unwrap(
    api.POST('/api/v1/auth/password/reset', {
      body,
    }),
  );
}
