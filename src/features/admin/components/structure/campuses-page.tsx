'use client';

import { EmptyState } from '@/components/patterns/empty-state';
import { useMemo, useState } from 'react';
import Link from 'next/link';
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
import { SummaryCard } from '@/components/patterns/summary-card';
import { PermissionGate } from '@/lib/auth/permissions';
import { useCampuses } from '../../hooks/use-structure';
import { QueryState } from '../../lib/shared';

export function CampusesPanel() {
  const campuses = useCampuses();
  const [q, setQ] = useState('');

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
          <EmptyState
            icon={Building2}
            title={q ? 'No campuses match' : 'No campuses yet'}
            description={
              q
                ? 'Try a different search.'
                : 'Add your first campus to scope sessions, classes, and staff.'
            }
            action={
              !q ? (
                <PermissionGate permission="school-structure.campus.create">
                  <Button asChild className="bg-teal-700 hover:bg-teal-800">
                    <Link href="/admin/campuses/new">
                      <Plus className="size-4" />
                      Add campus
                    </Link>
                  </Button>
                </PermissionGate>
              ) : undefined
            }
          />
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
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/campuses/${c.id}/edit`}>
                            <Pencil className="size-3.5" />
                            Edit
                          </Link>
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
    </div>
  );
}

/** @deprecated Use SchoolStructurePage — kept for direct imports. */
export function CampusesPage() {
  return <CampusesPanel />;
}

