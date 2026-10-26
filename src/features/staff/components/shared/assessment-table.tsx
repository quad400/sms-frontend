import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { formatDate } from '../../lib/format';
import type { Assessment } from '../../types';
import { StatusBadge } from './status-badge';

type Counts = Record<number, number | undefined>;

export function AssessmentTable({
  assessments,
  entered,
  roster,
  className,
  subjectName,
  showClass = true,
}: {
  assessments: Assessment[];
  /** Scores recorded per assessment id. */
  entered: Counts;
  /** Active student count per class id. */
  roster: Counts;
  className: (id: number) => string;
  subjectName: (id: number) => string;
  showClass?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[38rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-2.5">Assessment</th>
            <th scope="col" className="px-4 py-2.5">Component</th>
            <th scope="col" className="px-4 py-2.5">Entered</th>
            <th scope="col" className="px-4 py-2.5">Status</th>
            <th scope="col" className="px-4 py-2.5"><span className="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => {
            const done = entered[assessment.id];
            const total = roster[assessment.classId];
            const ratio = done !== undefined && total ? Math.min(1, done / total) : 0;
            const locked = assessment.status !== 'draft';
            return (
              <tr key={assessment.id} className="border-b border-border/70 last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{assessment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {showClass ? `${className(assessment.classId)} · ` : ''}
                    {subjectName(assessment.subjectId)}
                    {assessment.assessmentDate ? ` · ${formatDate(assessment.assessmentDate)}` : ''}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {assessment.componentName}
                  <span className="block font-mono text-xs tabular-nums">
                    max {assessment.maxScore}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono text-sm tabular-nums">
                    {done === undefined ? '—' : done}
                    {total !== undefined ? ` of ${total}` : ''}
                  </p>
                  <div
                    className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Scores entered"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(ratio * 100)}
                  >
                    <div className="h-full bg-academic" style={{ width: `${ratio * 100}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={assessment.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/staff/scores/${assessment.id}`}
                    className={buttonVariants({ variant: locked ? 'ghost' : 'outline', size: 'sm' })}
                  >
                    {locked ? 'View' : 'Enter scores'}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
