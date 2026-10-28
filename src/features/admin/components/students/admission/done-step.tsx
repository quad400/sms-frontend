'use client';

import Link from 'next/link';
import { CheckCircle2, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/patterns/status-badge';
import { fullName, type StudentRow } from '../../../types';
import { avatarTone, initials } from '../utils';
import { cn } from '@/lib/utils/cn';

export function DoneStep({
  student,
  onAdmitAnother,
}: {
  student: StudentRow;
  onAdmitAnother: () => void;
}) {
  const status = student.statusCode ?? student.status ?? 'active';

  return (
    <div className="mx-auto max-w-lg space-y-5 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <CheckCircle2 className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Student admitted
        </h2>
        <p className="text-sm text-muted-foreground">
          The record is ready. You can open the full profile or admit another student.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)]">
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold',
            avatarTone(student.genderCode ?? student.gender),
          )}
        >
          {initials(student.firstName, student.lastName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {fullName(student.firstName, student.lastName, student.middleName)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{student.studentNumber}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <StatusBadge status={status} />
            {student.className ? (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {student.className}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="bg-teal-700 hover:bg-teal-800">
          <Link href={`/admin/students/${student.id}`}>View profile</Link>
        </Button>
        <Button type="button" variant="outline" onClick={onAdmitAnother}>
          <Plus className="size-4" />
          Admit another
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/students">
            <Users className="size-4" />
            Directory
          </Link>
        </Button>
      </div>
    </div>
  );
}
