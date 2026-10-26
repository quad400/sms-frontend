'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  OUTBOX_CHANGED_EVENT,
  OUTBOX_FLUSHED_EVENT,
  flushOutbox,
  listOutbox,
} from './outbox';
import type { SyncStatus } from '@/components/shells/shell-sync-chip';

function subscribeOnline(cb: () => void): () => void {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

function useOnline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

export function useOfflineOutbox() {
  const online = useOnline();
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (typeof indexedDB === 'undefined') return;
    try {
      const items = await listOutbox();
      if (!mountedRef.current) return;
      const nextPending = items.length;
      const nextFailed = items.filter((i) => !!i.lastError).length;
      setPendingCount((prev) => (prev === nextPending ? prev : nextPending));
      setFailedCount((prev) => (prev === nextFailed ? prev : nextFailed));
    } catch {
      // ignore
    }
  }, []);

  const flush = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const result = await flushOutbox();
      if (!mountedRef.current) return;
      setFailedCount((prev) => (prev === result.failed ? prev : result.failed));
      await refresh();
    } finally {
      syncingRef.current = false;
      if (mountedRef.current) setSyncing(false);
    }
  }, [refresh]);

  // Initial load (flush any leftover queue once) + periodic count refresh.
  useEffect(() => {
    void refresh().then(() => {
      if (navigator.onLine) void flush();
    });
    const id = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(id);
  }, [refresh, flush]);

  // New queue items → refresh counts and attempt flush. Successful flush → refresh counts only.
  useEffect(() => {
    const onChanged = () => {
      void refresh().then(() => {
        if (navigator.onLine) void flush();
      });
    };
    const onFlushed = () => void refresh();
    window.addEventListener(OUTBOX_CHANGED_EVENT, onChanged);
    window.addEventListener(OUTBOX_FLUSHED_EVENT, onFlushed);
    return () => {
      window.removeEventListener(OUTBOX_CHANGED_EVENT, onChanged);
      window.removeEventListener(OUTBOX_FLUSHED_EVENT, onFlushed);
    };
  }, [refresh, flush]);

  // Flush once when coming back online (not on every flush identity change).
  const wasOnlineRef = useRef(online);
  useEffect(() => {
    const cameOnline = online && !wasOnlineRef.current;
    wasOnlineRef.current = online;
    if (cameOnline) void flush();
  }, [online, flush]);

  const status: SyncStatus = !online
    ? 'offline'
    : syncing
      ? 'syncing'
      : failedCount > 0
        ? 'attention'
        : pendingCount > 0
          ? 'pending'
          : 'online';

  return { status, pendingCount, failedCount, flush, refresh, online };
}
