'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Campus } from '../../api/structure';
import { useCampuses, useSaveCampus } from '../../hooks/use-structure';
import { QueryState } from '../../lib/shared';

export function CampusesPage() {
  const campuses = useCampuses();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Campus | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const saveCampus = useSaveCampus();
  const save = {
    isPending: saveCampus.isPending,
    mutate: () =>
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
      ),
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Campuses"
        actions={
          <PermissionGate permission="school-structure.campus.create">
            <Button
              type="button"
              onClick={() => {
                setEdit(null);
                setCode('');
                setName('');
                setOpen(true);
              }}
            >
              Add campus
            </Button>
          </PermissionGate>
        }
      />
      <QueryState
        isPending={campuses.isPending}
        error={campuses.error}
        onRetry={() => void campuses.refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(campuses.data ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40"
              onClick={() => {
                setEdit(c);
                setName(c.name);
                setCode(c.code ?? '');
                setOpen(true);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold">{c.name}</h2>
                {c.isActive === false ? (
                  <StatusBadge status="inactive" />
                ) : (
                  <StatusBadge status="active" />
                )}
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{c.code}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {[c.city, c.state].filter(Boolean).join(', ') || 'No address'}
              </p>
              {c.studentCount != null ? (
                <p className="mt-2 text-xs text-muted-foreground">{c.studentCount} students</p>
              ) : null}
            </button>
          ))}
        </div>
      </QueryState>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{edit ? 'Edit campus' : 'Add campus'}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-3">
            {!edit ? (
              <div className="grid gap-1.5">
                <Label>Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
            ) : null}
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="button" disabled={!name || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
