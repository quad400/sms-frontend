'use client';

import { useMemo } from 'react';
import { usePortalAnnouncements } from '../hooks/use-portal';
import { QueryState } from './query-state';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StudentAnnouncements() {
  const query = usePortalAnnouncements();
  const rows = useMemo(
    () =>
      asArray(query.data)
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => !!row),
    [query.data],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
        <p className="text-sm text-muted-foreground">News from your school.</p>
      </div>

      <QueryState isPending={query.isPending} error={query.error} isEmpty={rows.length === 0}>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <Card key={num(row.id, index)}>
              <CardHeader>
                <CardTitle className="text-base">{str(row.title, 'Announcement')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-xs text-muted-foreground">
                  {str(row.publishedAt ?? row.createdAt).slice(0, 10)}
                </p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {str(row.body ?? row.summary)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
