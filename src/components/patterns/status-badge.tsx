import { CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const VARIANTS: Record<string, BadgeProps['variant']> = {
  open: 'soft',
  draft: 'secondary',
  pending: 'warning',
  submitted: 'warning',
  upcoming: 'warning',
  overdue: 'warning',
  approved: 'success',
  published: 'success',
  completed: 'success',
  rejected: 'danger',
  cancelled: 'secondary',
  active: 'success',
  inactive: 'secondary',
  transferred: 'soft',
  graduated: 'success',
  withdrawn: 'secondary',
  archived: 'secondary',
  withheld: 'secondary',
  hold: 'secondary',
  held: 'secondary',
  fee_hold: 'secondary',
  clearance_required: 'secondary',
};

const ATTENDANCE_STATES = {
  present: {
    icon: CheckCircle2,
    className: 'bg-success/15 text-success',
  },
  late: {
    icon: Clock3,
    className: 'bg-warning/15 text-warning',
  },
  excused: {
    icon: ShieldCheck,
    className: 'bg-info/15 text-info',
  },
  absent: {
    icon: XCircle,
    className: 'bg-danger/15 text-danger',
  },
} as const;

function statusLabel(status: string): string {
  if (!status) return '—';
  return status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Status chip: colour plus the word, never colour alone. */
export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge variant="outline">—</Badge>;
  const key = status.toLowerCase().replace(/-/g, '_');
  const attendance = ATTENDANCE_STATES[key as keyof typeof ATTENDANCE_STATES];
  if (attendance) {
    const Icon = attendance.icon;
    return (
      <Badge variant="outline" className={`gap-1.5 border-transparent ${attendance.className}`}>
        <Icon className="size-3.5" aria-hidden />
        <span>{statusLabel(status)}</span>
      </Badge>
    );
  }
  return <Badge variant={VARIANTS[key] ?? 'outline'}>{statusLabel(status)}</Badge>;
}
