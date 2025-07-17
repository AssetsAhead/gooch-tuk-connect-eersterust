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
  if (requiredRole) {
    // Admin email has unrestricted access to all routes
    const isAdmin = user.email === 'assetsahead.sa@gmail.com';
    if (isAdmin) {
      return <>{children}</>;
    }
    
    // For non-admin users, check if userProfile exists and has required role
    if (!userProfile) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    
    const userRole = userProfile.role || userProfile.user_metadata?.role;
    if (requiredRole.length > 0 && !requiredRole.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};