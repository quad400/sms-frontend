'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { postPortalMePhoto, type PortalMePhotoResult } from '../api/post-me-photo';
import { portalKeys } from '../api/keys';

export function usePortalMePhoto() {
  const queryClient = useQueryClient();
  return useMutation<PortalMePhotoResult, ApiClientError, File>({
    mutationFn: postPortalMePhoto,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: portalKeys.me() }),
        queryClient.invalidateQueries({ queryKey: portalKeys.overview() }),
      ]);
    },
  });
}
