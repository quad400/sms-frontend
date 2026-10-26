'use client';

import Link from 'next/link';
import { ChevronRight, ClipboardCheck, School } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { useStaffLookups } from '../hooks/use-staff-lookups';
import { useTeachingClasses } from '../hooks/use-teaching-classes';
import { useClassStudentCounts } from '../hooks/use-structure';
import { plural } from '../lib/format';
import { QueryState } from '../lib/shared';
import { EmptyPanel } from './shared/panel';

export function StaffClasses() {
  const teaching = useTeachingClasses();
  const lookups = useStaffLookups();
  const { can } = useSession();
  const cards = teaching.classes;

  const counts = useClassStudentCounts(cards.map((card) => card.classId));

  return (
    <div className="space-y-5">
      <PageHeader
        title="My classes"
        description="Classes and subjects you teach this term."
      />

      <QueryState
        isPending={teaching.isPending}
        error={teaching.error}
        onRetry={teaching.refetch}
        isEmpty={cards.length === 0}
        empty={
          <EmptyPanel
            icon={School}
            title="No classes allocated"
            description="You haven’t been allocated to any classes this term. Contact the school office if this looks wrong."
          />
        }
      >
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const count = counts[card.classId];
            return (
              <li
                key={card.classId}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-heading text-lg font-semibold">
                      {lookups.className(card.classId)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {count === undefined ? '—' : plural(count, 'student')}
                    </p>
                  </div>
                  {card.formTeacher ? <Badge variant="soft">Form teacher</Badge> : null}
                </div>

                {card.subjectIds.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5" aria-label="Subjects taught">
                    {card.subjectIds.map((subjectId) => (
                      <li key={subjectId}>
                        <Badge variant="secondary">{lookups.subjectName(subjectId)}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  {can('attendance.register.open') ? (
                    <Link
                      href={`/staff/attendance?classId=${card.classId}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      <ClipboardCheck aria-hidden />
                      Attendance
                    </Link>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={`/staff/classes/${card.classId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
                  >
                    Open class
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </QueryState>
    </div>
  );
}
