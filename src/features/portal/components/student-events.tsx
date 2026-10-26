'use client';

import { useMemo } from 'react';
import { usePortalEvents } from '../hooks/use-portal-events';
import { QueryState } from './query-state';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { PageHeader } from '@/components/patterns/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StudentEvents() {
  const query = usePortalEvents();
  const rows = useMemo(
    () =>
      asArray(query.data)
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => !!row),
    [query.data],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Events" description="School events coming up." />

      <QueryState isPending={query.isPending} error={query.error} isEmpty={rows.length === 0}>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <Card key={num(row.id, index)}>
              <CardHeader>
                <CardTitle className="text-base">{str(row.title, 'Event')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{str(row.startsAt ?? row.startAt ?? row.date)}</p>
                {str(row.location) ? <p>{str(row.location)}</p> : null}
                {str(row.description ?? row.body) ? (
                  <p className="mt-2 whitespace-pre-wrap">{str(row.description ?? row.body)}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
