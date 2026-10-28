'use client';

import { Award, BookOpen, IdCard, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { SUBJECTS_UI_MOCK } from './ui-mock';

export function SubjectsSummary({ total }: { total: number }) {
  const s = SUBJECTS_UI_MOCK.summary;
  const displayTotal = total || s.junior + s.senior;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total Subjects"
        value={String(displayTotal).padStart(2, '0')}
        icon={<BookOpen className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{s.junior}</span> Junior (JSS) ·{' '}
          <span className="font-semibold text-foreground">{s.senior}</span> Senior (SSS)
        </p>
      </SummaryCard>

      <SummaryCard
        label="Core Compulsory"
        value={String(s.coreCompulsory).padStart(2, '0')}
        icon={<Award className="size-4" />}
        iconClass="bg-amber-50 text-amber-800"
      >
        <p className="text-xs text-muted-foreground">
          {s.coreExamples}{' '}
          <span className="font-semibold text-amber-800">Mandatory</span>
        </p>
      </SummaryCard>

      <SummaryCard
        label="Faculty Specialists"
        value={String(s.facultySpecialists)}
        icon={<IdCard className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <Badge variant="successSoft" size="sm">
          Allocated load · {s.staffedPct}% Staffed
        </Badge>
      </SummaryCard>

      <SummaryCard
        label="Syllabus Completion"
        value={`${s.syllabusCompletion}%`}
        icon={<Target className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Week 8 Target: {s.weekTarget}%</span>
            <Badge variant="successSoft" size="sm">
              On Track
            </Badge>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-emerald-600"
              style={{ width: `${Math.min(100, s.syllabusCompletion)}%` }}
            />
          </div>
        </div>
      </SummaryCard>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            iconClass,
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
