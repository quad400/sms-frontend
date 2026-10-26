'use client';

import { Download, Eye, FileText } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { childPath } from '@/components/shells/parent-nav';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { fetchFileDownloadUrl } from '../api/children';
import { useChildInvoices, useChildReportCards } from '../hooks/use-child-data';
import { childName, formatDate } from '../lib/format';
import { QueryState } from '../lib/shared';
import type { ParentChild, ReportCard } from '../types';
import { WithheldPayPanel } from './withheld-pay-panel';

function isWithheld(card: ReportCard): boolean {
  return card.withheld === true || card.status === 'withheld';
}

async function openDocument(card: ReportCard, mode: 'view' | 'download'): Promise<void> {
  const url =
    card.signedUrl ??
    (card.documentId != null ? (await fetchFileDownloadUrl(card.documentId)).url : null);
  if (!url) {
    toastError('Document unavailable', 'The school has not attached a file yet.');
    return;
  }
  if (mode === 'download') {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '';
    anchor.rel = 'noopener';
    anchor.click();
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function ParentReportCards({
  studentId,
  child,
}: {
  studentId: number;
  child: ParentChild | null;
}) {
  const cards = useChildReportCards(studentId);
  const invoices = useChildInvoices(studentId);
  const rows = cards.data ?? [];
  const anyWithheld = rows.some(isWithheld);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Report cards"
        description={child ? `Published reports for ${childName(child)}.` : 'Published report cards.'}
      />

      {anyWithheld ? (
        <WithheldPayPanel
          balances={invoices.data?.balances ?? []}
          feesHref={childPath(studentId, '/fees')}
        />
      ) : null}

      <QueryState
        isPending={cards.isPending}
        error={cards.error}
        onRetry={() => void cards.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No report cards have been published yet.
          </p>
        }
      >
        <ul className="grid gap-2">
          {rows.map((card) => (
            <li
              key={card.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileText className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">
                    {card.sessionName ?? 'Session'}
                    {card.termName ? ` · ${card.termName}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isWithheld(card)
                      ? 'Withheld until fees are cleared'
                      : card.publishedAt
                        ? `Published ${formatDate(card.publishedAt)}`
                        : 'Published'}
                  </p>
                </div>
              </div>
              {!isWithheld(card) ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void openDocument(card, 'view').catch((e) => toastError('Could not open', String(e)))}
                  >
                    <Eye className="size-4" aria-hidden />
                    View
                  </Button>
                  <button
                    type="button"
                    className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                    onClick={() =>
                      void openDocument(card, 'download').catch((e) =>
                        toastError('Could not download', String(e)),
                      )
                    }
                  >
                    <Download className="size-4" aria-hidden />
                    Download
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}
