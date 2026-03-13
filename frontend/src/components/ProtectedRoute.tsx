import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Still reading localStorage — don't redirect yet
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
