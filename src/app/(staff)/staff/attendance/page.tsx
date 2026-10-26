import { StaffAttendance } from '@/features/staff';

export default async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string | string[] }>;
}) {
  const { classId } = await searchParams;
  const raw = Array.isArray(classId) ? classId[0] : classId;
  const parsed = raw ? Number(raw) : NaN;
  return <StaffAttendance initialClassId={Number.isInteger(parsed) && parsed > 0 ? parsed : undefined} />;
}
