import { Badge, type BadgeProps } from '@/components/ui/badge';

const VARIANTS: Record<string, BadgeProps['variant']> = {
  open: 'soft',
  draft: 'secondary',
  pending: 'soft',
  submitted: 'soft',
  approved: 'success',
  published: 'success',
  rejected: 'danger',
  cancelled: 'secondary',
  active: 'success',
  inactive: 'secondary',
  transferred: 'soft',
  graduated: 'success',
  withdrawn: 'secondary',
  archived: 'secondary',
};

function statusLabel(status: string): string {
  if (!status) return '—';
  return status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Status chip: colour plus the word, never colour alone. */
export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge variant="outline">—</Badge>;
  const key = status.toLowerCase();
  return <Badge variant={VARIANTS[key] ?? 'outline'}>{statusLabel(status)}</Badge>;
}
