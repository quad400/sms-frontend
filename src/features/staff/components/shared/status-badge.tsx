import { Badge, type BadgeProps } from '@/components/ui/badge';
import { statusLabel } from '../../lib/format';

const VARIANTS: Record<string, BadgeProps['variant']> = {
  open: 'soft',
  draft: 'secondary',
  pending: 'soft',
  submitted: 'soft',
  approved: 'success',
  published: 'success',
  rejected: 'danger',
  cancelled: 'secondary',
  absent: 'danger',
  present: 'success',
  late: 'soft',
  excused: 'secondary',
};

/** Status chip: colour plus the word, never colour alone. */
export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={VARIANTS[status] ?? 'outline'}>{statusLabel(status)}</Badge>;
}
