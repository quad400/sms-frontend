'use client';

import { AttentionList, type AttentionItem } from '@/components/patterns/attention-list';
import { SectionCard } from '@/components/patterns/section-card';

export function NeedsAttention({ items }: { items: AttentionItem[] }) {
  return (
    <SectionCard
      title="Needs attention"
      description="Items that usually block the school day"
      badge={
        items.length > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white">
            {items.length}
          </span>
        ) : null
      }
    >
      <AttentionList items={items} />
    </SectionCard>
  );
}
