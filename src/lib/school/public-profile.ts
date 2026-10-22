import type { CSSProperties } from 'react';
import { backendFetch } from '@/lib/api/backend';

export type PublicSchoolProfile = {
  name: string;
  timezone: string;
  logoFileId: number | null;
  brandColour: string;
};

const FALLBACK_PROFILE: PublicSchoolProfile = {
  name: 'School',
  timezone: 'UTC',
  logoFileId: null,
  brandColour: '#0F766E',
};

export async function fetchPublicSchoolProfile(): Promise<PublicSchoolProfile> {
  const result = await backendFetch<PublicSchoolProfile>('/api/v1/school-profile/public', {
    method: 'GET',
  });

  if (!result.ok || !result.data?.name) {
    return FALLBACK_PROFILE;
  }

  return {
    name: result.data.name,
    timezone: result.data.timezone || FALLBACK_PROFILE.timezone,
    logoFileId: result.data.logoFileId ?? null,
    brandColour: result.data.brandColour || FALLBACK_PROFILE.brandColour,
  };
}

export function brandStyle(brandColour: string): CSSProperties {
  return {
    ['--brand' as string]: brandColour,
  };
}
