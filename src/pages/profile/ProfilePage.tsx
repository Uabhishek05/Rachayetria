import { useAuth } from '@/features/auth/AuthContext';
import { PageTitle } from '@/components/ui/PageTitle';

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="p-4 md:p-6">
      <PageTitle title="User Profile" subtitle="Reading stats, subscription, and social footprint." />
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold">{user?.displayName}</p>
        <p className="text-sm text-slate-500">{user?.email}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Age bracket</p>
            <p className="font-medium">{user?.ageBracket}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Plan</p>
            <p className="font-medium">{user?.subscriptionTier}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
