'use client';

import { PageHeader } from '@/components/patterns/page-header';
import { usePortalMedical } from '../hooks/use-portal-medical';
import { QueryState } from './query-state';
import { asArray, asRecord, str } from '@/lib/utils/record';

export function StudentMedical() {
  const query = usePortalMedical();
  const data = asRecord(query.data);
  const visits = asArray(data?.recentVisits);
  const immunizations = asArray(data?.immunizations);
  const emergencies = asArray(data?.emergencyContacts);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health Center"
        description="Confidential clinic summary, immunizations, and verified medical absence records."
      />

      <QueryState isPending={query.isPending} error={query.error}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Health File Status"
            value={str(data?.statusLabel, 'On file')}
            hint={str(data?.clearanceLabel, 'Sports, boarding & lab')}
          />
          <Stat
            label="Blood & Genotype"
            value={[str(data?.bloodGroup), str(data?.genotype)].filter(Boolean).join(' / ') || '—'}
            hint="From school clinic record"
          />
          <Stat
            label="Allergies & Alerts"
            value={str(data?.allergiesSummary, 'None recorded')}
            hint="Shown to clinic staff"
          />
          <Stat
            label="Infirmary Visits"
            value={`${visits.length} recorded`}
            hint="This academic year"
          />
        </div>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-6">
          <h2 className="font-heading text-lg font-semibold">Clinic visit history</h2>
          {visits.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No clinic visits on record.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {visits.map((row, index) => {
                const visit = asRecord(row);
                return (
                  <li
                    key={str(visit?.id, String(index))}
                    className="rounded-xl border border-border bg-muted/40 px-4 py-3"
                  >
                    <p className="font-medium">{str(visit?.summary, 'Clinic visit')}</p>
                    <p className="text-sm text-muted-foreground">
                      {[str(visit?.visitedAt), str(visit?.slipNumber)].filter(Boolean).join(' · ')}
                    </p>
                    {str(visit?.notes) ? (
                      <p className="mt-2 text-sm text-foreground">{str(visit?.notes)}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-6">
            <h2 className="font-heading text-lg font-semibold">Immunizations</h2>
            {immunizations.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No immunization records yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {immunizations.map((row, index) => {
                  const item = asRecord(row);
                  return (
                    <li
                      key={str(item?.id, String(index))}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                    >
                      <span>{str(item?.name, 'Vaccine')}</span>
                      <span className="font-mono text-[11px] font-semibold uppercase text-academic">
                        {str(item?.statusLabel, 'Recorded')}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-6">
            <h2 className="font-heading text-lg font-semibold">Emergency contacts</h2>
            {emergencies.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Ask the school office to update emergency contacts.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {emergencies.map((row, index) => {
                  const contact = asRecord(row);
                  return (
                    <li key={str(contact?.id, String(index))} className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="font-medium">{str(contact?.name, 'Contact')}</p>
                      <p className="text-sm text-muted-foreground">
                        {[str(contact?.relationship), str(contact?.phone)].filter(Boolean).join(' · ')}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </QueryState>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
