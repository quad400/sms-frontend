import { AdminNotifications } from '@/features/admin/components/admin-notifications';
import { fetchPublicSchoolProfile } from '@/lib/school/public-profile';

export default async function Page() {
  const school = await fetchPublicSchoolProfile();
  return <AdminNotifications timeZone={school.timezone} />;
}
