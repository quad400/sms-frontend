import { proxyGet, proxyPut } from '@/lib/api/proxy-fetch';
import type { SchoolProfile } from '../types';

export function getSchoolProfile(): Promise<SchoolProfile> {
  return proxyGet('/api/v1/school-profile');
}

export function updateSchoolProfile(body: Partial<SchoolProfile>): Promise<SchoolProfile> {
  return proxyPut('/api/v1/school-profile', body);
}
