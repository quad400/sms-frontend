import { proxyPost } from '@/lib/api/proxy-fetch';
import type { ChangePasswordBody } from '../types';

export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await proxyPost('/api/v1/auth/password/change', body);
}
