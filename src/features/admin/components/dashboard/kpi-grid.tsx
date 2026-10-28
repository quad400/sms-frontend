'use client';

import type { ReactNode } from 'react';
import { StatCard, type StatCardAccent } from '@/components/patterns/stat-card';
import { StatCardGrid } from '@/components/patterns/stat-card-grid';

export type DashboardKpi = {
  id: string;
  label: string;
  value: ReactNode;
  href: string;
  icon?: ReactNode;
  accent?: StatCardAccent;
  tone?: 'default' | 'warning';
  updated?: string | null;
  hint?: ReactNode;
};

export function DashboardKpiGrid({
  kpis,
  loading,
}: {
  kpis: DashboardKpi[];
  loading: boolean;
}) {
  return (
    <StatCardGrid skeletonCount={loading ? Math.max(kpis.length, 4) : 0}>
      {kpis.map((k) => (
        <StatCard
          key={k.id}
          label={k.label}
          value={k.value}
          href={k.href}
          updated={k.updated}
          hint={k.hint}
          icon={k.icon}
          accent={k.accent}
          tone={k.tone}
        />
      ))}
    </StatCardGrid>
  );
}
