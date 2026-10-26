import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';

export async function revokeSession(id: number): Promise<void> {
  await unwrap(
    api.DELETE('/api/v1/auth/sessions/{id}', {
      params: { path: { id } },
    }),
  );
}
