'use client';

import { useMemo, useState } from 'react';
import { FileText, Lock } from 'lucide-react';
import { ApiClientError } from '@/lib/api/errors';
import { proxyGet } from '@/lib/api/proxy-fetch';
import { usePortalReportCards } from '../hooks/use-portal-report-cards';
import { QueryState } from './query-state';
import { asRecord, str } from '@/lib/utils/record';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { WithheldPanel } from './withheld-panel';
import { WITHHELD_COPY, formatDate, isWithheldRow, listFrom } from '../lib/format';

function isWithheldError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.mapped.code.includes('WITHHOLD') ||
      error.mapped.code.includes('CLEARANCE') ||
      error.mapped.code.includes('FEE'))
  );
}

function documentUrl(payload: unknown): string {
  const root = asRecord(payload);
  const file = asRecord(root?.file);
  return str(root?.signedUrl ?? root?.url ?? root?.downloadUrl ?? file?.signedUrl ?? file?.url);
}

function documentIdOf(card: Record<string, unknown>): string {
  const value = card.documentId;
  if (typeof value === 'string' && value) return value;
  if (typeof value === 'number') return String(value);
  return '';
}

export function StudentReportCards() {
  const query = usePortalReportCards();
  const cards = useMemo(() => listFrom(query.data, 'items', 'reportCards', 'results'), [query.data]);
  const withheld = isWithheldError(query.error);

  return (
    <div className="space-y-5">
      <PageHeader title="Report cards" description="Your published report cards." />

      {withheld ? (
        <WithheldPanel />
      ) : (
        <QueryState
          isPending={query.isPending}
          error={query.error}
          isEmpty={cards.length === 0}
          onRetry={() => void query.refetch()}
        >
          <ul className="space-y-3">
            {cards.map((card, index) => (
              <ReportCardRow key={str(card.id, String(index))} card={card} />
            ))}
          </ul>
        </QueryState>
      )}
    </div>
  );
}

function ReportCardRow({ card }: { card: Record<string, unknown> }) {
  const [opening, setOpening] = useState(false);
  const [failed, setFailed] = useState(false);

  const title =
    [str(card.sessionName ?? card.sessionId), str(card.termName ?? card.termId)]
      .filter(Boolean)
      .join(' · ') || 'Report card';
  const published = formatDate(card.publishedAt);
  const documentId = documentIdOf(card);
  const withheld = isWithheldRow(card);

  async function openPdf(): Promise<void> {
    setOpening(true);
    setFailed(false);
    // Open synchronously so the popup is not blocked once the URL resolves.
    const tab = window.open('', '_blank');
    if (tab) tab.opener = null;
    try {
      const payload = await proxyGet(`/api/v1/documents/${encodeURIComponent(documentId)}`);
      const url = documentUrl(payload);
      if (!url) throw new Error('missing document url');
      if (tab) tab.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      tab?.close();
      setFailed(true);
    } finally {
      setOpening(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-[var(--shadow-card)]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-academic/10 text-academic">
          {withheld ? <Lock className="size-5" aria-hidden /> : <FileText className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold">{title}</p>
          {withheld ? (
            <p className="text-sm text-muted-foreground">{WITHHELD_COPY}</p>
          ) : published ? (
            <p className="font-mono text-xs text-muted-foreground">{published}</p>
          ) : null}
        </div>
      </div>
      {!withheld && documentId ? (
        <div className="flex flex-col items-end gap-1">
          <Button
            type="button"
            size="sm"
            className="bg-academic text-academic-foreground hover:bg-academic/90"
            disabled={opening}
            onClick={() => void openPdf()}
          >
            {opening ? 'Opening…' : 'View PDF'}
          </Button>
          {failed ? (
            <p role="alert" className="text-xs text-muted-foreground">
              Couldn&rsquo;t open the PDF. Please try again.
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
