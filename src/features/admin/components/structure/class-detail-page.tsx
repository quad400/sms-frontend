'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { EntityHeader } from '@/components/patterns/entity-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { useAllocations } from '../../hooks/use-academics';
import { useClass, useDeleteClass } from '../../hooks/use-structure';
import { QueryState } from '../../lib/shared';
import { ClassRoster } from './class-roster';

export function ClassDetailPage({ classId }: { classId: number }) {
  const router = useRouter();
  const schoolClass = useClass(classId);
  const allocations = useAllocations({ classId: String(classId), page: 1 }, true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const removeMutation = useDeleteClass();

  const c = schoolClass.data;
  const title = c?.name || c?.armName || `Class ${classId}`;
  const subtitle = [
    c?.levelName ?? (c ? `Level ${c.levelId}` : null),
    c?.armName ? `Arm ${c.armName}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const remove = {
    isPending: removeMutation.isPending,
    mutate: () =>
      removeMutation.mutate(classId, {
        onSuccess: () => {
          toastSuccess('Class deleted');
          setDeleteOpen(false);
          router.push('/admin/classes');
        },
        onError: (e) => toastError('Could not delete', e.message),
      }),
  };

  return (
    <div className="space-y-5">
      <p>
        <Link
          href="/admin/classes"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Classes
        </Link>
      </p>

      <QueryState
        isPending={schoolClass.isPending}
        error={schoolClass.error}
        onRetry={() => void schoolClass.refetch()}
      >
        {!c ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Class not available.
          </p>
        ) : (
          <>
            <EntityHeader
              title={title}
              subtitle={subtitle}
              meta={
                c.studentCount != null
                  ? `${c.studentCount} student${c.studentCount === 1 ? '' : 's'} on roll`
                  : undefined
              }
              actions={
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/timetables?classId=${classId}`}>Timetable</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/attendance?classId=${classId}`}>Attendance</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/allocations?classId=${classId}`}>Teachers</Link>
                  </Button>
                  <PermissionGate permission="school-structure.class.delete">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                  </PermissionGate>
                </>
              }
            />

            <ClassRoster classId={classId} />

            {!allocations.isPending && (allocations.data?.data?.length ?? 0) > 0 ? (
              <p className="text-xs text-muted-foreground">
                {allocations.data!.data!.length} subject teacher
                {allocations.data!.data!.length === 1 ? '' : 's'} assigned ·{' '}
                <Link
                  href={`/admin/allocations?classId=${classId}`}
                  className="font-medium text-primary hover:underline"
                >
                  Edit matrix
                </Link>
              </p>
            ) : null}
          </>
        )}
      </QueryState>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete class?"
        description="This fails if the class still has enrolments. Reassign students first."
        confirmLabel="Delete"
        destructive
        isPending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
