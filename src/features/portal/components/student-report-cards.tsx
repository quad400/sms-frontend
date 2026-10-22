'use client';

import { useMemo } from 'react';
import { usePortalReportCards } from '../hooks/use-portal';
import { QueryState } from './query-state';
import { PortalApiError } from '../api/portal-api';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { Button } from '@/components/ui/button';

export function StudentReportCards() {
  const query = usePortalReportCards();
  const withheld =
    query.error instanceof PortalApiError &&
    (query.error.mapped.code.includes('WITHHOLD') ||
      query.error.mapped.code.includes('CLEARANCE') ||
      query.error.mapped.code.includes('FEE'));

  const cards = useMemo(
    () =>
      asArray(query.data)
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => !!row),
    [query.data],
  );

  if (withheld) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Report cards</h1>
        <div className="rounded-2xl border border-border bg-card px-4 py-6 text-sm">
          Your results are not available yet. Please see the school office.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Report cards</h1>
        <p className="text-sm text-muted-foreground">Published report cards you can view as PDF.</p>
      </div>

      <QueryState isPending={query.isPending} error={query.error} isEmpty={cards.length === 0}>
        <ul className="space-y-2">
          {cards.map((card, index) => {
            const title = [
              str(card.sessionName ?? card.sessionId),
              str(card.termName ?? card.termId),
            ]
              .filter(Boolean)
              .join(' · ');
            const url = str(card.signedUrl ?? card.pdfUrl ?? card.url);
            return (
              <li
                key={num(card.id, index)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{title || 'Report card'}</p>
                  <p className="text-xs text-muted-foreground">{str(card.publishedAt).slice(0, 10)}</p>
                </div>
                {url ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={url} target="_blank" rel="noreferrer">
                      View PDF
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">PDF pending</span>
                )}
              </li>
            );
          })}
        </ul>
      </QueryState>
    </div>
  );
}
