'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
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

export function SessionsPanel({
  createRequested,
  onCreateHandled,
}: {
  createRequested?: boolean;
  onCreateHandled?: () => void;
} = {}) {
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

  const termRows = terms.data?.length ? terms.data : detail.data?.terms ?? [];
  const sessionList = sessions.data ?? [];
  const activeSession = sessionList.find((s) => s.isActive) ?? null;

  useEffect(() => {
    if (!createRequested) return;
    setCreateOpen(true);
    onCreateHandled?.();
  }, [createRequested, onCreateHandled]);

  const summary = useMemo(() => {
    const holidayCount = termRows.reduce(
      (n, t) => n + (t.holidays?.length ?? 0),
      0,
    );
    const openTerms = termRows.filter((t) => !t.closedAt).length;
    return {
      sessions: sessionList.length,
      terms: termRows.length,
      openTerms,
      holidays: holidayCount,
    };
  }, [sessionList.length, termRows]);

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
          onSuccess: (row) => {
            toastSuccess('Session created');
            setCreateOpen(false);
            setName('');
            setStartDate('');
            setEndDate('');
            setSelectedId(row.id);
          },
          onError: (e) => toastError('Could not create', e.message),
        },
      ),
  };

  if (!campusQuery) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center shadow-[var(--shadow-card)]">
        <CalendarDays className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-heading text-base font-semibold">Select a campus</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sessions are scoped to the campus in the shell switcher.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Sessions"
          value={String(summary.sessions)}
          icon={<CalendarDays className="size-4" />}
          iconClass="bg-sky-50 text-sky-700"
        >
          <p className="text-xs text-muted-foreground">For this campus</p>
        </SummaryCard>
        <SummaryCard
          label="Active session"
          value={activeSession?.name ?? '—'}
          icon={<Sparkles className="size-4" />}
          iconClass="bg-teal-50 text-teal-700"
          valueClass="text-lg"
        >
          {activeSession ? (
            <Badge variant="successSoft" size="sm">
              Live
            </Badge>
          ) : (
            <p className="text-xs text-muted-foreground">Activate one below</p>
          )}
        </SummaryCard>
        <SummaryCard
          label="Terms in view"
          value={String(summary.terms)}
          icon={<CheckCircle2 className="size-4" />}
          iconClass="bg-emerald-50 text-emerald-700"
        >
          <p className="text-xs text-muted-foreground">
            {summary.openTerms} open · {summary.terms - summary.openTerms} closed
          </p>
        </SummaryCard>
        <SummaryCard
          label="Holidays"
          value={String(summary.holidays)}
          icon={<CalendarDays className="size-4" />}
          iconClass="bg-amber-50 text-amber-800"
        >
          <p className="text-xs text-muted-foreground">On selected session terms</p>
        </SummaryCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)] lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Academic sessions
          </p>
          <QueryState
            isPending={sessions.isPending}
            error={sessions.error}
            onRetry={() => void sessions.refetch()}
          >
            {sessionList.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs text-muted-foreground">
                No sessions yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {sessionList.map((s) => {
                  const active = selected === s.id;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(s.id)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition',
                          active
                            ? 'bg-teal-700 text-white'
                            : 'text-foreground hover:bg-muted',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {s.name}
                          </span>
                          {s.startDate && s.endDate ? (
                            <span
                              className={cn(
                                'block truncate text-[11px]',
                                active ? 'text-white/75' : 'text-muted-foreground',
                              )}
                            >
                              {s.startDate} → {s.endDate}
                            </span>
                          ) : null}
                        </span>
                        {s.isActive ? (
                          <Badge
                            variant={active ? 'secondary' : 'successSoft'}
                            size="sm"
                            className={active ? 'bg-white/20 text-white' : undefined}
                          >
                            Active
                          </Badge>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </QueryState>
        </aside>

        <div className="min-w-0 space-y-4">
          {selected ? (
            <QueryState
              isPending={detail.isPending && !detail.data}
              error={detail.error}
              onRetry={() => void detail.refetch()}
            >
              <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                <div className="bg-[linear-gradient(160deg,rgba(15,118,110,0.1),transparent_55%)] px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading text-xl font-semibold tracking-tight">
                          {detail.data?.name ?? 'Session'}
                        </h2>
                        {detail.data?.isActive ||
                        sessionList.find((s) => s.id === selected)?.isActive ? (
                          <Badge variant="successSoft" size="sm">
                            Active session
                          </Badge>
                        ) : null}
                      </div>
                      {detail.data?.startDate && detail.data?.endDate ? (
                        <p className="text-sm text-muted-foreground">
                          {detail.data.startDate} → {detail.data.endDate}
                        </p>
                      ) : null}
                    </div>
                    <PermissionGate permission="school-structure.session.activate">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activateMutation.isPending}
                        onClick={() => activate.mutate(selected)}
                      >
                        Activate session
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </header>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {termRows.length === 0 ? (
                  <p className="col-span-full rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                    No terms on this session yet.
                  </p>
                ) : (
                  termRows.map((t) => (
                    <article
                      key={t.id}
                      className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-base font-semibold">
                          {t.periodName ?? t.name ?? t.period ?? `Term ${t.id}`}
                        </h3>
                        {t.closedAt ? (
                          <StatusBadge status="closed" />
                        ) : t.isActive ? (
                          <StatusBadge status="active" />
                        ) : (
                          <Badge variant="secondary" size="sm">
                            Idle
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.startDate} → {t.endDate}
                      </p>
                      <p className="mt-2 text-xs font-medium text-muted-foreground">
                        {t.holidays?.length ?? 0} holiday
                        {(t.holidays?.length ?? 0) === 1 ? '' : 's'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <PermissionGate permission="school-structure.term.activate">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!t.closedAt || activateTermMutation.isPending}
                            onClick={() => activateT.mutate(t.id)}
                          >
                            Activate
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="school-structure.term.close">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-danger hover:bg-danger/10"
                            disabled={!!t.closedAt}
                            onClick={() => setCloseId(t.id)}
                          >
                            Close
                          </Button>
                        </PermissionGate>
                      </div>

                      <HolidayEditor
                        termId={t.id}
                        holidays={t.holidays ?? []}
                        onSaved={() => void terms.refetch()}
                      />
                    </article>
                  ))
                )}
              </div>
            </QueryState>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
              <CalendarDays className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-heading text-sm font-semibold">Select a session</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose a session from the list to manage terms and holidays.
              </p>
            </div>
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

      <Sheet
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) {
            setName('');
            setStartDate('');
            setEndDate('');
          }
        }}
      >
        <SheetContent>
          <form
            className="flex h-full flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <SheetHeader className="text-left">
              <SheetTitle>New session</SheetTitle>
              <SheetDescription>
                Create an academic year for the current campus. Terms are managed after creation.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="grid gap-1.5">
                <Label required htmlFor="session-name">
                  Name
                </Label>
                <Input
                  id="session-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2026/2027"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>Start date</Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Select start"
                  aria-label="Session start"
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>End date</Label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select end"
                  aria-label="Session end"
                />
              </div>
            </div>

            <SheetFooter className="mt-auto flex-row gap-2 pt-6 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name || !startDate || !endDate || create.isPending}
                className="bg-teal-700 hover:bg-teal-800"
              >
                {create.isPending ? 'Creating…' : 'Create session'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** @deprecated Use SchoolStructurePage — kept for direct imports. */
export function SessionsPage() {
  return <SessionsPanel />;
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
  valueClass,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            iconClass,
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          'mt-2 font-heading font-semibold tracking-tight tabular-nums',
          valueClass ?? 'text-2xl',
          value.length > 18 ? 'truncate text-base' : null,
        )}
        title={value}
      >
        {value}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
