'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useActivateSession,
  useActivateTerm,
  useCloseTerm,
  useCreateSession,
  useSession,
  useSessions,
  useTerms,
} from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { HolidayEditor } from './holiday-editor';

export function SessionsPage() {
  const { campusQuery } = useAdminCampus();
  const sessions = useSessions(campusQuery);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = selectedId ?? sessions.data?.[0]?.id ?? null;
  const detail = useSession(selected);
  const terms = useTerms(selected != null ? String(selected) : undefined, selected != null);
  const [closeId, setCloseId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const activateMutation = useActivateSession();
  const activateTermMutation = useActivateTerm(selected);
  const closeMutation = useCloseTerm(selected);
  const createMutation = useCreateSession();

  const activate = {
    mutate: (id: number) =>
      activateMutation.mutate(id, {
        onSuccess: () => toastSuccess('Session activated'),
        onError: (e) => toastError('Could not activate', e.message),
      }),
  };
  const activateT = {
    mutate: (id: number) =>
      activateTermMutation.mutate(id, {
        onSuccess: () => toastSuccess('Term activated'),
        onError: (e) => toastError('Could not activate term', e.message),
      }),
  };
  const close = {
    isPending: closeMutation.isPending,
    mutate: (id: number) =>
      closeMutation.mutate(id, {
        onSuccess: () => {
          toastSuccess('Term closed');
          setCloseId(null);
        },
        onError: (e) => toastError('Could not close term', e.message),
      }),
  };
  const create = {
    isPending: createMutation.isPending,
    mutate: () =>
      createMutation.mutate(
        { campusId: Number(campusQuery), name, startDate, endDate },
        {
          onSuccess: () => {
            toastSuccess('Session created');
            setCreateOpen(false);
          },
          onError: (e) => toastError('Could not create', e.message),
        },
      ),
  };

  const termRows = terms.data?.length ? terms.data : detail.data?.terms ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sessions & terms"
        actions={
          <PermissionGate permission="school-structure.session.create">
            <Button type="button" onClick={() => setCreateOpen(true)} disabled={!campusQuery}>
              Add session
            </Button>
          </PermissionGate>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <QueryState
          isPending={sessions.isPending}
          error={sessions.error}
          onRetry={() => void sessions.refetch()}
        >
          <ul className="space-y-1 rounded-xl border border-border p-2">
            {(sessions.data ?? []).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm ${
                    selected === s.id ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <span>{s.name}</span>
                  {s.isActive ? <StatusBadge status="active" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </QueryState>
        <div className="space-y-3">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-lg font-semibold">
                  {detail.data?.name ?? 'Session'}
                </h2>
                <PermissionGate permission="school-structure.session.activate">
                  <Button size="sm" variant="outline" onClick={() => activate.mutate(selected)}>
                    Activate session
                  </Button>
                </PermissionGate>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {termRows.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium">
                        {t.periodName ?? t.name ?? t.period ?? `Term ${t.id}`}
                      </h3>
                      {t.closedAt ? (
                        <StatusBadge status="closed" />
                      ) : t.isActive ? (
                        <StatusBadge status="active" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.startDate} → {t.endDate}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.holidays?.length ?? 0} holidays
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <PermissionGate permission="school-structure.term.activate">
                        <Button size="sm" variant="outline" onClick={() => activateT.mutate(t.id)}>
                          Activate
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="school-structure.term.close">
                        <Button size="sm" variant="outline" onClick={() => setCloseId(t.id)}>
                          Close
                        </Button>
                      </PermissionGate>
                    </div>
                    <HolidayEditor
                      termId={t.id}
                      holidays={t.holidays ?? []}
                      onSaved={() => void terms.refetch()}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a session.</p>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={closeId !== null}
        onOpenChange={(o) => !o && setCloseId(null)}
        title="Close term?"
        description="Closing locks scores and registers for this term and may trigger downstream jobs."
        confirmLabel="Close term"
        destructive
        isPending={close.isPending}
        onConfirm={() => closeId && close.mutate(closeId)}
      />
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New session</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Start</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>End</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button
              type="button"
              disabled={!name || !startDate || !endDate || create.isPending}
              onClick={() => create.mutate()}
            >
              Create
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
