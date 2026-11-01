'use client';

import { KeyRound, MonitorSmartphone, ShieldAlert, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/components/patterns/summary-card';
import { ACCESS_UI_MOCK } from './ui-mock';

export function UsersSummary({ total }: { total: number }) {
  const s = ACCESS_UI_MOCK.usersSummary;
  const displayTotal = total || s.total;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total System Users"
        value={String(displayTotal)}
        icon={<Users className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        <p className="text-xs text-muted-foreground">
          Active: <span className="font-semibold text-foreground">{s.active}</span> · Suspended:{' '}
          <span className="font-semibold text-foreground">{s.suspended}</span> · Pending:{' '}
          <span className="font-semibold text-foreground">{s.pending}</span>
        </p>
      </SummaryCard>
      <SummaryCard
        label="MFA Adoption Rate"
        value={`${s.mfaRate}%`}
        icon={<KeyRound className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <p className="text-xs font-semibold text-teal-700">{s.mfaDelta}</p>
        <Badge variant="successSoft" size="sm" className="mt-1">
          {s.mfaNote}
        </Badge>
      </SummaryCard>
      <SummaryCard
        label="Active Sessions"
        value={String(s.sessions)}
        icon={<MonitorSmartphone className="size-4" />}
        iconClass="bg-violet-50 text-violet-700"
      >
        <p className="text-xs text-muted-foreground">
          Web: <span className="font-semibold text-foreground">{s.web}</span> · Mobile:{' '}
          <span className="font-semibold text-foreground">{s.mobile}</span>
        </p>
      </SummaryCard>
      <SummaryCard
        label="Failed Logins (24H)"
        value={`${String(s.failedLogins).padStart(2, '0')} Flagged`}
        icon={<ShieldAlert className="size-4" />}
        iconClass="bg-rose-50 text-rose-800"
        valueClass="text-lg"
      >
        <Badge variant="dangerSoft" size="sm">
          {s.failedNote}
        </Badge>
      </SummaryCard>
    </div>
  );
}

