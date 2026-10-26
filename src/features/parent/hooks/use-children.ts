'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { fetchChildren } from '../api/children';
import { parentKeys } from '../api/keys';
import type { ParentChild } from '../types';

export function useChildren() {
  return useQuery<ParentChild[], ApiClientError>({
    queryKey: parentKeys.children(),
    queryFn: fetchChildren,
    staleTime: 60_000,
  });
}
