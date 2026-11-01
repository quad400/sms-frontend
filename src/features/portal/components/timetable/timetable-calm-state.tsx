'use client';

import { CalendarOff } from 'lucide-react';
import { EmptyState } from '@/components/patterns/empty-state';

export function TimetableCalmState({ title, body }: { title: string; body: string }) {
  return (
    <EmptyState
      icon={CalendarOff}
      title={title}
      description={body}
      className="bg-card"
    />
  );
}
