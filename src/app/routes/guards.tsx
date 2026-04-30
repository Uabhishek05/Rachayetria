import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';

export function RequireAuth({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="space-y-3 p-5">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }
  if (user === null) {
    return <Navigate to="/auth" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}

export function RequireAdmin({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-5">Loading admin space...</div>;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
