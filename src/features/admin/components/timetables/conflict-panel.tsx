'use client';

import { CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { TIMETABLES_UI_MOCK } from './ui-mock';

export function ConflictPanel() {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Shield className="size-4" />
          </span>
          <div>
            <h2 className="font-heading text-sm font-semibold tracking-tight">
              Conflict & Room Engine
            </h2>
            <p className="text-[11px] text-muted-foreground">Automated rule verification</p>
          </div>
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {TIMETABLES_UI_MOCK.conflicts.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-border bg-muted/20 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{c.label}</p>
              {c.status === 'ok' ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              )}
            </div>
            <p
              className={cn(
                'mt-1 text-[11px]',
                c.status === 'ok' ? 'text-muted-foreground' : 'text-amber-800',
              )}
            >
              {c.detail}
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-border p-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center">
          <Badge variant="successSoft" size="sm" className="mb-1.5">
            Zero Schedule Collisions
          </Badge>
          <p className="text-[11px] font-medium text-emerald-900">
            Strict mode · teacher & room isolation clear
          </p>
        </div>
      </div>
    </aside>
  );
}
