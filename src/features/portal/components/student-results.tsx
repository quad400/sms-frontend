'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ApiClientError } from '@/lib/api/errors';
import { usePortalResults } from '../hooks/use-portal-results';
import { QueryState } from './query-state';
import { asRecord, str } from '@/lib/utils/record';
import { cn } from '@/lib/utils/cn';
import { PageHeader } from '@/components/patterns/page-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { WithheldPanel } from './withheld-panel';
import { isWithheldRow, listFrom, scoreText, toRecords } from '../lib/format';

type TermGroup = { name: string; withheld: boolean; subjects: Record<string, unknown>[] };

function isWithheldError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.mapped.code.includes('WITHHOLD') ||
      error.mapped.code.includes('CLEARANCE') ||
      error.mapped.code.includes('FEE'))
  );
}

function groupByTerm(data: unknown): TermGroup[] {
  const rows = listFrom(data, 'results', 'terms', 'subjects', 'items');
  const groups = new Map<string, TermGroup>();
  for (const row of rows) {
    const name = str(row.termName ?? row.termId) || 'Current term';
    const group = groups.get(name) ?? { name, withheld: false, subjects: [] };
    if (isWithheldRow(row)) group.withheld = true;
    const nested = toRecords(row.subjects ?? row.results);
    if (nested.length > 0) group.subjects.push(...nested);
    else if (!Array.isArray(row.subjects) && !Array.isArray(row.results)) group.subjects.push(row);
    groups.set(name, group);
  }
  return Array.from(groups.values());
}

export function StudentResults() {
  const query = usePortalResults();
  const [picked, setPicked] = useState<string | null>(null);

  const terms = useMemo(() => groupByTerm(query.data), [query.data]);
  const rootWithheld = useMemo(() => {
    const root = asRecord(query.data);
    return !!root && isWithheldRow(root);
  }, [query.data]);

  const active = terms.find((t) => t.name === picked) ?? terms[0] ?? null;
  const withheld = isWithheldError(query.error) || rootWithheld || (active?.withheld ?? false);

  return (
    <div className="space-y-5">
      <PageHeader title="Results" description="Your scores by subject for each term." />

      {terms.length > 1 && active ? (
        <SegmentedControl
          aria-label="Term"
          value={active.name}
          onValueChange={setPicked}
          options={terms.map((term) => ({ value: term.name, label: term.name }))}
          className="w-full overflow-x-auto sm:w-fit"
        />
      ) : null}

      {withheld ? (
        <WithheldPanel />
      ) : (
        <QueryState
          isPending={query.isPending}
          error={query.error}
          isEmpty={!active || active.subjects.length === 0}
          onRetry={() => void query.refetch()}
        >
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {active?.subjects.map((row, index) => {
                const rank = row.rank ?? row.position;
                const remark = str(row.remark);
                const grade = str(row.grade);
                return (
                  <article
                    key={str(row.id, String(index))}
                    className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-heading text-lg font-semibold">
                          {str(row.subjectName ?? row.subjectId, 'Subject')}
                        </h2>
                        {remark ? <p className="text-sm text-muted-foreground">{remark}</p> : null}
                      </div>
                      {grade ? (
                        <span className="shrink-0 rounded-lg bg-academic/10 px-3 py-1 font-mono text-base font-semibold text-academic">
                          {grade}
                        </span>
                      ) : null}
                    </div>
                    <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
                      {(
                        [
                          ['CA', row.caScore],
                          ['Exam', row.examScore],
                          ['Total', row.totalScore ?? row.score ?? row.total],
                          ['Rank', rank],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-muted/60 px-2 py-2">
                          <dt className="text-[11px] text-muted-foreground">{label}</dt>
                          <dd
                            className={cn(
                              'font-mono font-semibold tabular-nums',
                              label === 'Total' ? 'text-lg text-academic' : 'text-base',
                            )}
                          >
                            {scoreText(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                );
              })}
            </div>
            <Link
              href="/student/report-cards"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-academic hover:underline"
            >
              View report cards <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </QueryState>
      )}
    </div>
  );
}
