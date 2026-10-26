'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { childPath } from '@/components/shells/parent-nav';
import { useChildInvoices, useChildResults } from '../hooks/use-child-data';
import { childName } from '../lib/format';
import { QueryState } from '../lib/shared';
import type { ParentChild, ResultTerm } from '../types';
import { WithheldPayPanel } from './withheld-pay-panel';

function isWithheld(term: ResultTerm): boolean {
  return term.withheld === true || term.status === 'withheld';
}

export function ParentResults({
  studentId,
  child,
}: {
  studentId: number;
  child: ParentChild | null;
}) {
  const results = useChildResults(studentId);
  const invoices = useChildInvoices(studentId);
  const terms = results.data ?? [];
  const options = useMemo(
    () =>
      terms.map((term, index) => ({
        value: String(term.termId ?? index),
        label: term.termName ?? `Term ${index + 1}`,
      })),
    [terms],
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const activeValue = chosen && options.some((o) => o.value === chosen) ? chosen : options[0]?.value;
  const term =
    terms.find((row, index) => String(row.termId ?? index) === activeValue) ?? terms[0] ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Results"
        description={child ? `Published results for ${childName(child)}.` : 'Published term results.'}
      />

      <QueryState
        isPending={results.isPending}
        error={results.error}
        onRetry={() => void results.refetch()}
        isEmpty={terms.length === 0}
        empty={
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No published results yet.
          </p>
        }
      >
        {options.length > 1 ? (
          <div className="overflow-x-auto">
            <SegmentedControl
              aria-label="Term"
              value={activeValue!}
              onValueChange={setChosen}
              options={options}
            />
          </div>
        ) : null}

        {term && isWithheld(term) ? (
          <WithheldPayPanel
            balances={invoices.data?.balances ?? []}
            feesHref={childPath(studentId, '/fees')}
          />
        ) : term ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Summary label="Total" value={term.total != null ? String(term.total) : '—'} />
              <Summary label="Average" value={term.average != null ? String(term.average) : '—'} />
              <Summary
                label="Class position"
                value={term.position != null ? String(term.position) : '—'}
              />
            </div>
            <ul className="grid gap-2">
              {(term.subjects ?? []).map((subject) => (
                <li
                  key={subject.subjectId}
                  className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {subject.subjectName ?? `Subject ${subject.subjectId}`}
                      </p>
                      {subject.remark ? (
                        <p className="text-xs text-muted-foreground">{subject.remark}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {subject.score != null ? subject.score : '—'}
                        {subject.grade ? (
                          <span className="ml-2 text-sm text-muted-foreground">{subject.grade}</span>
                        ) : null}
                      </p>
                      {subject.position != null ? (
                        <p className="text-xs text-muted-foreground">Pos. {subject.position}</p>
                      ) : null}
                    </div>
                  </div>
                  {subject.classAverage != null ? (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>Class avg</span>
                        <span className="tabular-nums">{subject.classAverage}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-academic/60"
                          style={{ width: `${Math.min(100, Number(subject.classAverage))}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            {terms.length > 1 ? (
              <section className="space-y-2">
                <h2 className="font-heading text-base font-semibold">Trend</h2>
                <ul className="grid gap-2">
                  {[...terms].reverse().map((row, index) => (
                    <li
                      key={row.termId ?? index}
                      className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"
                    >
                      <span>{row.termName ?? `Term ${index + 1}`}</span>
                      <span className="tabular-nums font-medium">
                        {isWithheld(row)
                          ? 'Withheld'
                          : row.average != null
                            ? row.average
                            : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null}
      </QueryState>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
