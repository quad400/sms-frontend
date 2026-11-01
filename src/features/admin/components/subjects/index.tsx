'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  useCurriculumSubjects,
  useLevels,
  useSessions,
  useSubjects,
} from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { SubjectDetailPanel } from './subject-detail-panel';
import { SubjectsHeader } from './subjects-header';
import { SubjectsSummary } from './subjects-summary';
import { SubjectsTable } from './subjects-table';
import { SUBJECTS_UI_MOCK, subjectExtraForId } from './ui-mock';

const PAGE_SIZE = 8;

function SubjectsListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campusQuery, density } = useAdminCampus();

  const subjects = useSubjects();
  const levels = useLevels();
  const curriculum = useCurriculumSubjects();
  const sessions = useSessions(campusQuery);
  const activeSession = (sessions.data ?? []).find((s) => s.isActive);

  const subjectIdParam = searchParams.get('subjectId');
  const selectedId =
    subjectIdParam && Number.isFinite(Number(subjectIdParam))
      ? Number(subjectIdParam)
      : null;

  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [tier, setTier] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(qInput.trim().toLowerCase());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const curriculumBySubject = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const row of curriculum.data ?? []) {
      const list = map.get(row.subjectId) ?? [];
      list.push(row.levelId);
      map.set(row.subjectId, list);
    }
    return map;
  }, [curriculum.data]);

  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of subjects.data ?? []) {
      const { departmentId } = subjectExtraForId(s.id, s.code);
      counts[departmentId] = (counts[departmentId] ?? 0) + 1;
    }
    return counts;
  }, [subjects.data]);

  const filtered = useMemo(() => {
    let rows = subjects.data ?? [];
    if (department) {
      rows = rows.filter(
        (s) => subjectExtraForId(s.id, s.code).departmentId === department,
      );
    }
    if (tier) {
      rows = rows.filter((s) => subjectExtraForId(s.id, s.code).tier === tier);
    }
    if (q) {
      rows = rows.filter((s) => {
        const hay = `${s.name} ${s.code}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return rows;
  }, [subjects.data, department, tier, q]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSafe = Math.min(page, pages);
  const pageRows = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  const selected = useMemo(
    () => (subjects.data ?? []).find((s) => s.id === selectedId) ?? null,
    [subjects.data, selectedId],
  );

  const setSelectedId = (id: number | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id == null) next.delete('subjectId');
    else next.set('subjectId', String(id));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const sessionLabel = activeSession
    ? `${activeSession.name}${activeSession.isActive ? ' Active' : ''}`
    : null;

  return (
    <div className="space-y-5">

      <SubjectsHeader sessionLabel={sessionLabel} />

      <SubjectsSummary total={(subjects.data ?? []).length} />

      <div
        className={cn(
          'grid gap-4',
          selected
            ? 'lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]'
            : 'grid-cols-1',
        )}
      >
        <div className="space-y-4">
          <SubjectsTable
            rows={pageRows}
            allCount={(subjects.data ?? []).length}
            departmentCounts={departmentCounts}
            isPending={subjects.isPending}
            error={subjects.error}
            onRetry={() => void subjects.refetch()}
            density={density}
            q={qInput}
            onQChange={setQInput}
            department={department}
            onDepartmentChange={(v) => {
              setDepartment(v);
              setPage(1);
            }}
            tier={tier}
            onTierChange={(v) => {
              setTier(v);
              setPage(1);
            }}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
            page={pageSafe}
            pages={pages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />

          <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950 shadow-[var(--shadow-card)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <RefreshCw className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">Continuous Syllabus Pacing Sync</p>
              <p className="mt-0.5 text-xs text-sky-900/80">
                {SUBJECTS_UI_MOCK.pacingNote}
              </p>
            </div>
          </div>
        </div>

        {selected ? (
          <SubjectDetailPanel
            subject={selected}
            levels={levels.data ?? []}
            curriculumLevelIds={curriculumBySubject.get(selected.id) ?? []}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

export function SubjectsList() {
  return (
    <Suspense fallback={<Loader />}>
      <SubjectsListInner />
    </Suspense>
  );
}

export { SubjectsList as SubjectsPage };
