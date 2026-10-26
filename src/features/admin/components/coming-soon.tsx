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
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        Coming in {wave}
      </p>
    </div>
  );
}
