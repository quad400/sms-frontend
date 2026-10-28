'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useCreateSubject,
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
  const [createOpen, setCreateOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const create = useCreateSubject();

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

  const submitCreate = () => {
    create.mutate(
      { code: code.trim(), name: name.trim() },
      {
        onSuccess: (row) => {
          toastSuccess('Subject created');
          setCreateOpen(false);
          setCode('');
          setName('');
          setSelectedId(row.id);
        },
        onError: (e) => toastError('Could not create subject', e.message),
      },
    );
  };

  const sessionLabel = activeSession
    ? `${activeSession.name}${activeSession.isActive ? ' Active' : ''}`
    : null;

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
        Academic operations · Curriculum registry
      </p>

      <SubjectsHeader
        sessionLabel={sessionLabel}
        onAdd={() => setCreateOpen(true)}
      />

      <SubjectsSummary total={(subjects.data ?? []).length} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
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
            onSelect={setSelectedId}
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
          />
        ) : (
          <aside className="hidden rounded-xl border border-dashed border-border bg-card/50 p-6 text-center lg:block lg:sticky lg:top-4">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <BookOpen className="size-5" />
            </span>
            <p className="mt-3 font-heading text-sm font-semibold">Inspect a subject</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Select a row to review syllabus coverage, textbooks, faculty, and grading.
            </p>
          </aside>
        )}
      </div>

      <Sheet
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) {
            setCode('');
            setName('');
          }
        }}
      >
        <SheetContent>
          <form
            className="flex h-full flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <SheetHeader className="text-left">
              <SheetTitle>Add subject</SheetTitle>
              <SheetDescription>
                Create a subject code and name for the curriculum registry. Level mapping can
                follow from curriculum tools.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="grid gap-1.5">
                <Label required htmlFor="subject-code">
                  Code
                </Label>
                <Input
                  id="subject-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MTH-201"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-1.5">
                <Label required htmlFor="subject-name">
                  Name
                </Label>
                <Input
                  id="subject-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. General Mathematics"
                  autoComplete="off"
                />
              </div>
            </div>
            <SheetFooter className="mt-auto flex-row gap-2 pt-6 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!code.trim() || !name.trim() || create.isPending}
                className="bg-teal-700 hover:bg-teal-800"
              >
                {create.isPending ? 'Creating…' : 'Add subject'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function SubjectsList() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <SubjectsListInner />
    </Suspense>
  );
}

export { SubjectsList as SubjectsPage };
