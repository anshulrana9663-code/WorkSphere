import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'Employee' | 'Admin';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'Admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return <Outlet />;
}
