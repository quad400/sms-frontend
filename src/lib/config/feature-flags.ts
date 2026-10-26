import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';

/** Module keys used by the student portal for nav and route gating. */
export const STUDENT_MODULE_FLAGS = {
  library: 'library',
  lms: 'lms',
  health: 'health-sickbay',
  studentChat: 'student-chat',
} as const;

export type FeatureFlags = Record<string, boolean>;

export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  const data = await unwrap(api.GET('/api/v1/feature-flags'));
  return (data ?? {}) as FeatureFlags;
}

export function isModuleEnabled(flags: FeatureFlags | undefined, key: string): boolean {
  if (!flags) return false;
  return flags[key] === true;
}
