import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { AuthSessions } from '../types';

export function fetchSessions(): Promise<AuthSessions> {
  return unwrap(api.GET('/api/v1/auth/sessions'));
}
