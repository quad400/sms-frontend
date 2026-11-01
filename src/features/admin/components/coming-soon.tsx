import { EmptyState } from '@/components/patterns/empty-state';
import { PageHeader } from '@/components/patterns/page-header';

export function ComingSoon({
  title,
  wave,
  description,
}: {
  title: string;
  wave: string;
  description?: string;
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={description ?? `This area ships in ${wave}. Navigation is live so permissions can be verified.`}
      />
      <EmptyState
        title={`Coming in ${wave}`}
        description={description ?? `This area ships in ${wave}.`}
        className="bg-muted/30"
      />
    </div>
  );
}
