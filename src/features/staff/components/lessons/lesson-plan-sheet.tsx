'use client';

import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useSession } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useCreateLessonPlan,
  useSubmitLessonPlan,
  useUpdateLessonPlan,
} from '../../hooks/use-lessons';
import { lessonPlanSchema, type LessonPlanValues } from '../../schemas';
import type { LessonPlan } from '../../types';
import { TextAreaField } from '../shared/fields';
import { StatusBadge } from '../shared/status-badge';
import { ScopeFields } from './scope-fields';

export function LessonPlanSheet({
  open,
  onOpenChange,
  plan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: LessonPlan | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <PlanForm key={plan?.id ?? 'new'} plan={plan} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function PlanForm({ plan, onDone }: { plan: LessonPlan | null; onDone: () => void }) {
  const ids = { week: useId(), title: useId(), objectives: useId(), content: useId() };
  const { can } = useSession();
  const create = useCreateLessonPlan();
  const update = useUpdateLessonPlan();
  const submitPlan = useSubmitLessonPlan();

  const readOnly = !!plan && plan.status !== 'draft';
  const editing = !!plan;

  const form = useForm<LessonPlanValues>({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues: {
      classId: plan ? String(plan.classId) : '',
      subjectId: plan ? String(plan.subjectId) : '',
      termId: plan ? String(plan.termId) : '',
      weekNumber: plan?.weekNumber ? String(plan.weekNumber) : '',
      title: plan?.title ?? '',
      objectives: plan?.objectives ?? '',
      content: plan?.content ?? '',
    },
  });
  const { errors, isSubmitted } = form.formState;
  const scope = {
    classId: form.watch('classId'),
    subjectId: form.watch('subjectId'),
    termId: form.watch('termId'),
  };
  const busy = create.isPending || update.isPending || submitPlan.isPending;

  async function persist(values: LessonPlanValues): Promise<LessonPlan> {
    const weekNumber = values.weekNumber === '' ? undefined : Number(values.weekNumber);
    if (plan) {
      return update.mutateAsync({
        id: plan.id,
        patch: {
          title: values.title,
          objectives: values.objectives.trim() === '' ? null : values.objectives,
          content: values.content,
          weekNumber: weekNumber ?? null,
        },
      });
    }
    return create.mutateAsync({
      classId: Number(values.classId),
      subjectId: Number(values.subjectId),
      termId: Number(values.termId),
      weekNumber,
      title: values.title,
      objectives: values.objectives.trim() === '' ? undefined : values.objectives,
      content: values.content,
    });
  }

  function run(submitAfter: boolean) {
    return form.handleSubmit(async (values) => {
      try {
        const saved = await persist(values);
        if (submitAfter) await submitPlan.mutateAsync(saved.id);
        toastSuccess(plan ? 'Lesson plan updated' : 'Lesson plan saved', 'Your lesson plan has been saved.');
        onDone();
      } catch (error) {
        toastError('Could not save lesson plan', error instanceof Error ? error.message : 'Could not save the lesson plan.');
      }
    });
  }

  return (
    <form onSubmit={run(false)} className="flex min-h-full flex-col gap-4">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          {editing ? 'Lesson plan' : 'New lesson plan'}
          {plan ? <StatusBadge status={plan.status} /> : null}
        </SheetTitle>
        <SheetDescription>
          {readOnly
            ? 'Submitted plans can’t be edited.'
            : 'Save a draft any time. Submit it when it’s ready for approval.'}
        </SheetDescription>
      </SheetHeader>

      <ScopeFields
        value={scope}
        disabled={editing}
        errors={{
          classId: errors.classId?.message,
          subjectId: errors.subjectId?.message,
          termId: errors.termId?.message,
        }}
        onChange={(next) => {
          const options = { shouldValidate: isSubmitted };
          form.setValue('classId', next.classId, options);
          form.setValue('subjectId', next.subjectId, options);
          form.setValue('termId', next.termId, options);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="grid gap-1.5">
          <Label htmlFor={ids.title}>Title</Label>
          <Input id={ids.title} disabled={readOnly} {...form.register('title')} />
          {errors.title ? <p className="text-xs text-danger">{errors.title.message}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={ids.week}>Week</Label>
          <Input
            id={ids.week}
            inputMode="numeric"
            placeholder="Optional"
            disabled={readOnly}
            {...form.register('weekNumber')}
          />
          {errors.weekNumber ? (
            <p className="text-xs text-danger">{errors.weekNumber.message}</p>
          ) : null}
        </div>
      </div>

      <TextAreaField
        id={ids.objectives}
        label="Objectives"
        rows={3}
        disabled={readOnly}
        hint={errors.objectives?.message}
        {...form.register('objectives')}
      />
      <TextAreaField
        id={ids.content}
        label="Content"
        rows={10}
        disabled={readOnly}
        hint={errors.content?.message}
        {...form.register('content')}
      />


      {readOnly ? null : (
        <div className="mt-auto flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onDone} disabled={busy}>
            Cancel
          </Button>
          {can(editing ? 'academics.lesson-plan.update' : 'academics.lesson-plan.create') ? (
            <Button type="submit" variant="outline" disabled={busy}>
              {busy ? 'Saving…' : 'Save draft'}
            </Button>
          ) : null}
          {can('academics.lesson-plan.submit') &&
          can(editing ? 'academics.lesson-plan.update' : 'academics.lesson-plan.create') ? (
            <Button type="button" disabled={busy} onClick={() => void run(true)()}>
              Save &amp; submit
            </Button>
          ) : null}
        </div>
      )}
    </form>
  );
}
