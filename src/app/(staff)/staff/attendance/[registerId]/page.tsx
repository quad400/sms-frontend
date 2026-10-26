import { notFound } from 'next/navigation';
import { StaffAttendanceRegister } from '@/features/staff';

export default async function StaffAttendanceRegisterPage({ params }: { params: Promise<{ registerId: string }> }) {
  const { registerId: raw } = await params;
  const registerId = Number(raw);
  if (!Number.isInteger(registerId) || registerId <= 0) notFound();
  return <StaffAttendanceRegister registerId={registerId} />;
}
