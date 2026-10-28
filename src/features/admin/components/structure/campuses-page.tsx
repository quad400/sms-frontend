'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { Campus } from '../../api/structure';
import { useCampuses, useSaveCampus } from '../../hooks/use-structure';
import { QueryState } from '../../lib/shared';

export function CampusesPanel({
  createRequested,
  onCreateHandled,
}: {
  createRequested?: boolean;
  onCreateHandled?: () => void;
} = {}) {
  const campuses = useCampuses();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Campus | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [q, setQ] = useState('');

  const saveCampus = useSaveCampus();

  const rows = useMemo(() => {
    const list = campuses.data ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((c) => {
      const hay = `${c.name} ${c.code ?? ''} ${c.city ?? ''} ${c.state ?? ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [campuses.data, q]);

  const summary = useMemo(() => {
    const list = campuses.data ?? [];
    const active = list.filter((c) => c.isActive !== false).length;
    const students = list.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);
    const withAddress = list.filter((c) => c.city || c.state || c.addressLine).length;
    return { total: list.length, active, students, withAddress };
  }, [campuses.data]);

  const openCreate = () => {
    setEdit(null);
    setCode('');
    setName('');
    setOpen(true);
  };

  useEffect(() => {
    if (!createRequested) return;
    setEdit(null);
    setCode('');
    setName('');
    setOpen(true);
    onCreateHandled?.();
  }, [createRequested, onCreateHandled]);

  const openEdit = (c: Campus) => {
    setEdit(c);
    setName(c.name);
    setCode(c.code ?? '');
    setOpen(true);
  };

  const save = () => {
    saveCampus.mutate(
      { editId: edit?.id, code, name },
      {
        onSuccess: () => {
          toastSuccess(edit ? 'Campus updated' : 'Campus created');
          setOpen(false);
          setEdit(null);
        },
        onError: (e) => toastError('Could not save campus', e.message),
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total campuses"
          value={String(summary.total)}
          icon={<Building2 className="size-4" />}
          iconClass="bg-sky-50 text-sky-700"
        >
          <p className="text-xs text-muted-foreground">Registered sites</p>
        </SummaryCard>
        <SummaryCard
          label="Active sites"
          value={String(summary.active)}
          icon={<Building2 className="size-4" />}
          iconClass="bg-emerald-50 text-emerald-700"
        >
          <Badge variant="successSoft" size="sm">
            {summary.total > 0
              ? `${Math.round((summary.active / summary.total) * 100)}% online`
              : '—'}
          </Badge>
        </SummaryCard>
        <SummaryCard
          label="Students on roll"
          value={summary.students.toLocaleString()}
          icon={<Users className="size-4" />}
          iconClass="bg-teal-50 text-teal-700"
        >
          <p className="text-xs text-muted-foreground">Across all campuses</p>
        </SummaryCard>
        <SummaryCard
          label="Addressed sites"
          value={`${summary.withAddress} / ${summary.total || 0}`}
          icon={<MapPin className="size-4" />}
          iconClass="bg-violet-50 text-violet-700"
        >
          <p className="text-xs text-muted-foreground">City / state on file</p>
        </SummaryCard>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-heading text-base font-semibold tabular-nums text-foreground">
            {rows.length}
          </span>{' '}
          campus{rows.length === 1 ? '' : 'es'}
        </p>
        <div className="relative min-w-[14rem] sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter name, code, city…"
            className="h-9 pl-8"
            aria-label="Filter campuses"
          />
        </div>
      </div>

      <QueryState
        isPending={campuses.isPending}
        error={campuses.error}
        onRetry={() => void campuses.refetch()}
      >
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Building2 className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                {q ? 'No campuses match' : 'No campuses yet'}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {q
                  ? 'Try a different search.'
                  : 'Add your first campus to scope sessions, classes, and staff.'}
              </p>
            </div>
            {!q ? (
              <PermissionGate permission="school-structure.campus.create">
                <Button
                  type="button"
                  className="bg-teal-700 hover:bg-teal-800"
                  onClick={openCreate}
                >
                  <Plus className="size-4" />
                  Add campus
                </Button>
              </PermissionGate>
            ) : null}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((c) => {
              const location =
                [c.city, c.state].filter(Boolean).join(', ') || 'No address on file';
              return (
                <li key={c.id}>
                  <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition hover:border-teal-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                          <Building2 className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate font-heading text-base font-semibold tracking-tight">
                            {c.name}
                          </h2>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {c.code || `CAMP-${c.id}`}
                          </p>
                        </div>
                      </div>
                      {c.isActive === false ? (
                        <StatusBadge status="inactive" />
                      ) : (
                        <StatusBadge status="active" />
                      )}
                    </div>

                    <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                      <span className="min-w-0">{location}</span>
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                        <Users className="size-3" />
                        {c.studentCount != null
                          ? `${c.studentCount.toLocaleString()} students`
                          : 'Enrolment —'}
                      </span>
                      <PermissionGate permission="school-structure.campus.update">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                      </PermissionGate>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </QueryState>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <form
            className="flex h-full flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <SheetHeader className="text-left">
              <SheetTitle>{edit ? 'Edit campus' : 'Add campus'}</SheetTitle>
              <SheetDescription>
                {edit
                  ? 'Update the display name for this site.'
                  : 'Create a campus code and name used across sessions and people.'}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              {!edit ? (
                <div className="grid gap-1.5">
                  <Label required htmlFor="campus-code">
                    Code
                  </Label>
                  <Input
                    id="campus-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MAIN"
                    autoComplete="off"
                  />
                </div>
              ) : (
                <div className="grid gap-1.5">
                  <Label>Code</Label>
                  <Input value={code || '—'} disabled />
                </div>
              )}
              <div className="grid gap-1.5">
                <Label required htmlFor="campus-name">
                  Name
                </Label>
                <Input
                  id="campus-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Main Campus"
                  autoComplete="organization"
                />
              </div>
            </div>

            <SheetFooter className="mt-auto flex-row gap-2 pt-6 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || (!edit && !code.trim()) || saveCampus.isPending}
                className="bg-teal-700 hover:bg-teal-800"
              >
                {saveCampus.isPending ? 'Saving…' : 'Save campus'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** @deprecated Use SchoolStructurePage — kept for direct imports. */
export function CampusesPage() {
  return <CampusesPanel />;
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
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
      <p className="mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
