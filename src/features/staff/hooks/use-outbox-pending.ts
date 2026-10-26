'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  OUTBOX_CHANGED_EVENT,
  OUTBOX_FLUSHED_EVENT,
  listOutbox,
  type OutboxItem,
} from '@/lib/offline/outbox';
import { staffKeys } from '../api/keys';

/** Queued (not yet synced) writes whose path starts with `pathPrefix` (all when omitted). */
export function useOutboxPending(pathPrefix?: string): OutboxItem[] {
  const [items, setItems] = useState<OutboxItem[]>([]);

  const refresh = useCallback(async () => {
    if (typeof indexedDB === 'undefined') return;
    try {
      const all = await listOutbox();
      setItems(pathPrefix ? all.filter((item) => item.path.startsWith(pathPrefix)) : all);
    } catch {
      // IndexedDB can be unavailable (private mode); treat as nothing pending.
    }
  }, [pathPrefix]);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(OUTBOX_CHANGED_EVENT, onChange);
    const id = window.setInterval(onChange, 15_000);
    return () => {
      window.removeEventListener(OUTBOX_CHANGED_EVENT, onChange);
      window.clearInterval(id);
    };
  }, [refresh]);

  return items;
}

/** Refetch staff data after the shell's outbox flush delivered queued writes. */
export function useRefetchOnOutboxFlush(): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    const onFlushed = () => void queryClient.invalidateQueries({ queryKey: staffKeys.all });
    window.addEventListener(OUTBOX_FLUSHED_EVENT, onFlushed);
    return () => window.removeEventListener(OUTBOX_FLUSHED_EVENT, onFlushed);
  }, [queryClient]);
}
