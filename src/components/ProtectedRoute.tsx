import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, userProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && userProfile) {
    const userRole = userProfile.role || userProfile.user_metadata?.role;
    const isAdmin = userRole === 'admin' || user.email === 'assetsahead.sa@gmail.com';
    
    // Admin has unrestricted access to all routes
    if (isAdmin) {
      return <>{children}</>;
    }
    
    if (requiredRole.length > 0 && !requiredRole.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};