'use client';

import { useEffect, useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Subject } from '../../api/structure';
import {
  useCreateSubject,
  useCurriculumSubjects,
  useLevels,
  useSaveCurriculum,
  useSubjects,
  useUpdateSubject,
} from '../../hooks/use-structure';
import { QueryState } from '../../lib/shared';

export function SubjectsPage() {
  const [tab, setTab] = useState<'subjects' | 'curriculum'>('subjects');
  const subjects = useSubjects();
  const levels = useLevels();
  const [levelId, setLevelId] = useState('');
  const curriculum = useCurriculumSubjects(levelId);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [matrix, setMatrix] = useState<Record<number, boolean>>({});

  const createSubjectMutation = useCreateSubject();
  const saveCurriculumMutation = useSaveCurriculum(levelId);
  const updateSubjectMutation = useUpdateSubject();

  const create = {
    isPending: createSubjectMutation.isPending,
    mutate: () =>
      createSubjectMutation.mutate(
        { code, name },
        {
          onSuccess: () => {
            toastSuccess('Subject created');
            setCode('');
            setName('');
          },
          onError: (e) => toastError('Could not create', e.message),
        },
      ),
  };

  const saveCurriculum = {
    isPending: saveCurriculumMutation.isPending,
    mutate: () =>
      saveCurriculumMutation.mutate(
        Object.entries(matrix)
          .filter(([, on]) => on)
          .map(([subjectId]) => ({ subjectId: Number(subjectId), isCompulsory: true })),
        {
          onSuccess: () => toastSuccess('Curriculum saved'),
          onError: (e) => toastError('Could not save', e.message),
        },
      ),
  };

  useEffect(() => {
    const next: Record<number, boolean> = {};
    for (const s of subjects.data ?? []) next[s.id] = false;
    for (const c of curriculum.data ?? []) {
      if (!levelId || String(c.levelId) === levelId) next[c.subjectId] = true;
    }
    setMatrix(next);
  }, [subjects.data, curriculum.data, levelId]);

  const columns: DataTableColumn<Subject>[] = [
    { id: 'code', header: 'Code', cell: (r) => r.code },
    { id: 'name', header: 'Name', cell: (r) => r.name },
    {
      id: 'active',
      header: 'Active',
      cell: (r) => <StatusBadge status={r.isActive === false ? 'inactive' : 'active'} />,
    },
    {
      id: 'actions',
      header: '',
      cell: (r) => (
        <PermissionGate permission="school-structure.subject.update">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              updateSubjectMutation.mutate(
                { id: r.id, body: { isActive: r.isActive === false } },
                {
                  onSuccess: () => toastSuccess('Updated'),
                  onError: (e) => toastError('Failed', e.message),
                },
              )
            }
          >
            Toggle
          </Button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Subjects & curriculum"
        actions={
          <SegmentedControl
            aria-label="Subjects sections"
            value={tab}
            onValueChange={setTab}
            options={[
              { value: 'subjects', label: 'Subjects' },
              { value: 'curriculum', label: 'Curriculum' },
            ]}
          />
        }
      />
      {tab === 'subjects' ? (
        <>
          <PermissionGate permission="school-structure.subject.create">
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-[8rem]"
                placeholder="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Input
                className="max-w-xs"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                type="button"
                disabled={!code || !name || create.isPending}
                onClick={() => create.mutate()}
              >
                Add
              </Button>
            </div>
          </PermissionGate>
          <QueryState
            isPending={subjects.isPending}
            error={subjects.error}
            onRetry={() => void subjects.refetch()}
          >
            <DataTable columns={columns} rows={subjects.data ?? []} />
          </QueryState>
        </>
      ) : (
        <div className="space-y-3">
          <label className="grid max-w-xs gap-1 text-xs text-muted-foreground">
            Level
            <select
              className="h-10 rounded-md border border-border bg-background px-2 text-sm text-foreground"
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
            >
              <option value="">Select…</option>
              {(levels.data ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <QueryState isPending={curriculum.isPending || subjects.isPending} error={curriculum.error}>
            <ul className="space-y-1 rounded-xl border border-border p-3">
              {(subjects.data ?? []).map((s) => (
                <li key={s.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!matrix[s.id]}
                      onChange={(e) => setMatrix((prev) => ({ ...prev, [s.id]: e.target.checked }))}
                      disabled={!levelId}
                    />
                    {s.code} — {s.name}
                  </label>
                </li>
              ))}
            </ul>
          </QueryState>
          <PermissionGate permission="academics.curriculum.update">
            <Button
              type="button"
              disabled={!levelId || saveCurriculum.isPending}
              onClick={() => saveCurriculum.mutate()}
            >
              Save curriculum
            </Button>
          </PermissionGate>
        </div>
      )}
    </div>
  );
}
