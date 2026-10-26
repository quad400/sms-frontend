'use client';

import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type SyncStatus = 'online' | 'offline' | 'pending' | 'syncing' | 'attention';

export function ShellSyncChip({
  status,
  pendingCount = 0,
  onSync,
  className,
}: {
  status: SyncStatus;
  pendingCount?: number;
  onSync?: () => void;
  className?: string;
}) {
  const label =
    status === 'offline'
      ? 'Offline'
      : status === 'syncing'
        ? 'Syncing…'
        : status === 'attention'
          ? 'Sync issues'
          : pendingCount > 0
            ? `${pendingCount} pending`
            : 'Synced';

  return (
    <button
      type="button"
      onClick={onSync}
      disabled={status === 'syncing' || !onSync}
      title={label}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-mono text-[11px] font-semibold tracking-wide shadow-[0_1px_3px_0_rgba(15,30,54,0.04)] transition-colors',
        status === 'offline' || status === 'attention'
          ? 'bg-danger/10 text-danger'
          : pendingCount > 0 || status === 'syncing'
            ? 'bg-amber-500/10 text-amber-800'
            : 'bg-muted/70 text-muted-foreground',
        className,
      )}
    >
      {status === 'offline' ? (
        <CloudOff className="size-3.5" aria-hidden />
      ) : status === 'syncing' ? (
        <RefreshCw className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Cloud className="size-3.5" aria-hidden />
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
