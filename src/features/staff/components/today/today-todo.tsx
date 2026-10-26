import Link from 'next/link';
import { CheckSquare, ChevronRight, ClipboardList, GraduationCap, BookOpen, PartyPopper } from 'lucide-react';
import type { ComponentType } from 'react';
import { formatDate, plural } from '../../lib/format';
import type { ApprovalCounts } from '../../hooks/use-approvals';
import type { StaffOverview } from '../../types';
import { EmptyPanel, Panel } from '../shared/panel';

type TodoItem = {
  key: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  count?: number;
};

function buildItems(
  overview: StaffOverview,
  approvals: ApprovalCounts | null,
): TodoItem[] {
  const items: TodoItem[] = [];

  for (const register of overview.openRegisters) {
    items.push({
      key: `register-${register.id}`,
      href: `/staff/attendance/${register.id}`,
      icon: ClipboardList,
      title: `Submit register — ${register.className ?? `Class ${register.classId}`}`,
      detail: `${formatDate(register.date)} · ${plural(register.entryCount, 'student')}`,
    });
  }

  for (const assessment of overview.assessmentsAwaitingScores) {
    items.push({
      key: `assessment-${assessment.id}`,
      href: `/staff/scores/${assessment.id}`,
      icon: GraduationCap,
      title: `Enter scores — ${assessment.title}`,
      detail: `${assessment.className ?? `Class ${assessment.classId}`} · ${
        assessment.subjectName ?? `Subject ${assessment.subjectId}`
      } · ${assessment.scoresEntered} entered`,
    });
  }

  const { draftCount, submittedCount } = overview.lessonPlans;
  if (draftCount > 0) {
    items.push({
      key: 'plans-draft',
      href: '/staff/lessons',
      icon: BookOpen,
      title: 'Lesson plans to submit',
      detail: 'Drafts that still need to be submitted for approval',
      count: draftCount,
    });
  }
  if (submittedCount > 0) {
    items.push({
      key: 'plans-submitted',
      href: '/staff/lessons',
      icon: BookOpen,
      title: 'Lesson plans awaiting approval',
      detail: 'Submitted and waiting for a decision',
      count: submittedCount,
    });
  }

  if (approvals && approvals.total > 0) {
    items.push({
      key: 'approvals',
      href: '/staff/approvals',
      icon: CheckSquare,
      title: 'Approvals waiting for you',
      detail: [
        approvals.results > 0 ? plural(approvals.results, 'result sheet') : null,
        approvals.lessonPlans > 0 ? plural(approvals.lessonPlans, 'lesson plan') : null,
        approvals.leave > 0 ? plural(approvals.leave, 'leave request') : null,
      ]
        .filter(Boolean)
        .join(' · '),
      count: approvals.total,
    });
  }

  return items;
}

export function TodayTodo({
  overview,
  approvals,
}: {
  overview: StaffOverview;
  approvals: ApprovalCounts | null;
}) {
  const items = buildItems(overview, approvals);

  return (
    <Panel title="To do" description="Things that need your attention">
      {items.length === 0 ? (
        <EmptyPanel
          title="You’re all caught up"
          description="No open registers, pending scores or lesson plans right now."
          icon={PartyPopper}
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <item.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
                </span>
                {item.count !== undefined ? (
                  <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold tabular-nums text-brand-foreground">
                    {item.count}
                  </span>
                ) : null}
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
