'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import { getSchoolProfile, updateSchoolProfile } from '../api/school-profile';
import type { SchoolProfile } from '../types';

export function useSchoolProfile() {
  return useQuery<SchoolProfile, ApiClientError>({
    queryKey: adminKeys.schoolProfile(),
    queryFn: getSchoolProfile,
  });
}

export function useUpdateSchoolProfile() {
  const qc = useQueryClient();
  return useMutation<SchoolProfile, ApiClientError, SchoolProfile>({
    mutationFn: updateSchoolProfile,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.schoolProfile() }),
  });
}
