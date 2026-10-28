'use client';

import { useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toastError, toastSuccess } from '@/lib/toast';
import { usePutStaffAllocations } from '../../../hooks/use-staff';
import { useClasses, useSessions, useSubjects } from '../../../hooks/use-structure';
import { useAdminCampus } from '../../../lib/campus';
import { Field, FormSection } from '../../students/admission/form-bits';

type Row = { key: string; classId: string; subjectId: string };

export function AllocationsStep({
  staffId,
  campusId,
  onContinue,
  onSkip,
}: {
  staffId: number;
  campusId?: number | null;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const { campusQuery } = useAdminCampus();
  const campusKey =
    campusId != null ? String(campusId) : campusQuery ?? undefined;
  const sessions = useSessions(campusQuery);
  const classes = useClasses({ campusId: campusKey, key: campusKey });
  const subjects = useSubjects();
  const save = usePutStaffAllocations(staffId);

  const [sessionId, setSessionId] = useState('');
  const [rows, setRows] = useState<Row[]>([
    { key: crypto.randomUUID(), classId: '', subjectId: '' },
  ]);

  const activeSessions = (sessions.data ?? []).filter((s) => s.isActive);
  const sessionOptions =
    activeSessions.length > 0 ? activeSessions : (sessions.data ?? []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) {
      toastError('Session required', 'Choose an academic session.');
      return;
    }
    const allocations = rows
      .filter((r) => r.classId && r.subjectId)
      .map((r) => ({
        classId: Number(r.classId),
        subjectId: Number(r.subjectId),
      }));
    if (allocations.length === 0) {
      toastError('Add an allocation', 'Pick at least one class and subject.');
      return;
    }
    save.mutate(
      { sessionId: Number(sessionId), allocations },
      {
        onSuccess: () => {
          toastSuccess('Allocations saved');
          onContinue();
        },
        onError: (err) => toastError('Could not save allocations', err.message),
      },
    );
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormSection title="Teaching allocations" icon={BookOpen}>
        <p className="text-xs text-muted-foreground">
          Assign classes and subjects for the selected session. You can skip and
          manage this later from the staff profile.
        </p>
        <Field label="Academic session" required>
          <Select value={sessionId || undefined} onValueChange={setSessionId}>
            <SelectTrigger aria-label="Session">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessionOptions.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                  {s.isActive ? ' (active)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li
              key={row.key}
              className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Field label="Class">
                <Select
                  value={row.classId || undefined}
                  onValueChange={(v) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.key === row.key ? { ...r, classId: v } : r,
                      ),
                    )
                  }
                >
                  <SelectTrigger aria-label={`Class ${index + 1}`}>
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Subject">
                <Select
                  value={row.subjectId || undefined}
                  onValueChange={(v) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.key === row.key ? { ...r, subjectId: v } : r,
                      ),
                    )
                  }
                >
                  <SelectTrigger aria-label={`Subject ${index + 1}`}>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {(subjects.data ?? []).map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-danger"
                  aria-label="Remove allocation"
                  disabled={rows.length <= 1}
                  onClick={() =>
                    setRows((prev) => prev.filter((r) => r.key !== row.key))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { key: crypto.randomUUID(), classId: '', subjectId: '' },
            ])
          }
        >
          <Plus className="size-4" />
          Add allocation
        </Button>
      </FormSection>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button
          type="submit"
          disabled={save.isPending}
          className="bg-teal-700 hover:bg-teal-800"
        >
          {save.isPending ? 'Saving…' : 'Save & finish'}
        </Button>
      </div>
    </form>
  );
}
