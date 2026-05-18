import { getPasswordMeta } from '@/lib/admin-storage';
import ProfileView from '@/components/admin/ProfileView';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const meta = await getPasswordMeta();
  return (
    <ProfileView
      hasCustomPassword={meta.hasCustom}
      passwordUpdatedAt={meta.updatedAt}
      envFallbackEnabled={Boolean(process.env.ADMIN_PASSWORD)}
    />
  );
}
