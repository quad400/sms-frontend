import { z } from 'zod';

const scopeShape = {
  classId: z.string().min(1, 'Choose a class'),
  subjectId: z.string().min(1, 'Choose a subject'),
  termId: z.string().min(1, 'Choose a term'),
};

export const lessonPlanSchema = z.object({
  ...scopeShape,
  weekNumber: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 60), {
      message: 'Use a whole number from 1 to 60',
    }),
  title: z.string().trim().min(1, 'Add a title').max(200, 'Keep the title under 200 characters'),
  objectives: z.string().max(10_000, 'Too long'),
  content: z.string().trim().min(1, 'Add the lesson content').max(50_000, 'Too long'),
});
export type LessonPlanValues = z.infer<typeof lessonPlanSchema>;

export const lessonNoteSchema = z.object({
  ...scopeShape,
  title: z.string().trim().min(1, 'Add a title').max(200, 'Keep the title under 200 characters'),
  body: z.string().trim().min(1, 'Write the note').max(50_000, 'Too long'),
});
export type LessonNoteValues = z.infer<typeof lessonNoteSchema>;

export const leaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, 'Choose a leave type'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a start date'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose an end date'),
    reason: z.string().max(1000, 'Keep the reason under 1000 characters'),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });
export type LeaveRequestValues = z.infer<typeof leaveRequestSchema>;
