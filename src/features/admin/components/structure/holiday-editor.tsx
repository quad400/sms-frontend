'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { useUpdateTermHolidays } from '../../hooks/use-structure';

export function HolidayEditor({
  termId,
  holidays,
  onSaved,
}: {
  termId: number;
  holidays: Array<{ name: string; date: string }>;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState(holidays);
  const saveHolidays = useUpdateTermHolidays();
  const save = {
    isPending: saveHolidays.isPending,
    mutate: () =>
      saveHolidays.mutate(
        { termId, holidays: rows },
        {
          onSuccess: () => {
            toastSuccess('Holidays saved');
            onSaved();
          },
          onError: (e) => toastError('Could not save holidays', e.message),
        },
      ),
  };

  return (
    <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Holidays
      </p>
      {rows.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No holidays listed.</p>
      ) : null}
      {rows.map((h, i) => (
        <div key={i} className="grid grid-cols-2 gap-1.5">
          <Input
            className="h-8 text-xs"
            value={h.name}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)),
              )
            }
            placeholder="Name"
          />
          <Input
            className="h-8 text-xs"
            type="date"
            value={h.date}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((r, idx) => (idx === i ? { ...r, date: e.target.value } : r)),
              )
            }
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setRows((prev) => [...prev, { name: '', date: '' }])}
        >
          <Plus className="size-3.5" />
          Add holiday
        </Button>
        <PermissionGate permission="school-structure.term.update">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? 'Saving…' : 'Save holidays'}
          </Button>
        </PermissionGate>
      </div>
    </div>
  );
}
