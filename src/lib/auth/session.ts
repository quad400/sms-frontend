import { backendFetch } from '@/lib/api/backend';
import { readAccessToken } from '@/lib/auth/cookies';
import type { SessionUser } from '@/lib/auth/types';

function asSessionUser(data: unknown): SessionUser | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const user = data as SessionUser;
  if (typeof user.id !== 'number' || typeof user.userType !== 'string') {
    return null;
  }
  if (!Array.isArray(user.permissions) || !Array.isArray(user.campusIds)) {
    return null;
  }
  return user;
}

export async function fetchSessionUser(): Promise<SessionUser | null> {
  const accessToken = await readAccessToken();
  if (!accessToken) {
    return null;
  }

  const result = await backendFetch<SessionUser>('/api/v1/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!result.ok) {
    return null;
  }

  return asSessionUser(result.data);
}
