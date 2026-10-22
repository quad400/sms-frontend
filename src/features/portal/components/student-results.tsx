'use client';

import { useMemo, useState } from 'react';
import { usePortalResults } from '../hooks/use-portal';
import { QueryState } from './query-state';
import { PortalApiError } from '../api/portal-api';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export function StudentResults() {
  const query = usePortalResults();
  const withheld =
    query.error instanceof PortalApiError &&
    (query.error.mapped.code.includes('WITHHOLD') ||
      query.error.mapped.code.includes('CLEARANCE') ||
      query.error.mapped.code.includes('FEE'));

  const subjects = useMemo(() => {
    const root = asRecord(query.data);
    const list = asArray(root?.subjects ?? root?.results ?? query.data);
    return list
      .map((row) => asRecord(row))
      .filter((row): row is Record<string, unknown> => !!row);
  }, [query.data]);

  const terms = useMemo(() => {
    const set = new Set<string>();
    for (const row of subjects) {
      const term = str(row.termName ?? row.termId ?? 'Current');
      set.add(term);
    }
    return Array.from(set);
  }, [subjects]);

  const [term, setTerm] = useState<string | null>(null);
  const activeTerm = term ?? terms[0] ?? 'Current';
  const filtered = subjects.filter((row) => {
    if (terms.length <= 1) return true;
    return str(row.termName ?? row.termId ?? 'Current') === activeTerm;
  });

  if (withheld) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
        <div className="rounded-2xl border border-border bg-card px-4 py-6 text-sm">
          Your results are not available yet. Please see the school office.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
        <p className="text-sm text-muted-foreground">Scores by subject for the selected term.</p>
      </div>

      {terms.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1">
          {terms.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className={cn(
                'rounded-full px-3 py-2 text-sm font-medium',
                activeTerm === t ? 'bg-brand text-brand-foreground' : 'text-muted-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}

      <QueryState
        isPending={query.isPending}
        error={query.error}
        isEmpty={filtered.length === 0}
      >
        <div className="grid gap-3">
          {filtered.map((row, index) => (
            <Card key={num(row.id, index)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {str(row.subjectName ?? row.subjectId, 'Subject')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-semibold tabular-nums">{str(row.score ?? row.total, '—')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Grade</p>
                  <p className="font-semibold">{str(row.grade, '—')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="font-semibold tabular-nums">{str(row.position, '—')}</p>
                </div>
                {str(row.remark) ? (
                  <p className="col-span-3 text-muted-foreground">{str(row.remark)}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
