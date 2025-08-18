import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Loader2 } from 'lucide-react';
import { DemoModeBanner } from '@/components/DemoModeBanner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, hasRole, isAdmin } = useSecureAuth();
  const { isDemo, role: demoRole } = useDemoMode();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, allow demo users to pass; otherwise redirect to auth
  if (!user && !isDemo) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole) {
    // If real user is present, use secure role checking
    if (user) {
      // Admin has unrestricted access to all routes
      if (isAdmin()) {
        return <>{children}</>;
      }
      
      // For non-admin users, check if they have required role
      const hasRequiredRole = requiredRole.some(role => hasRole(role));
      if (!hasRequiredRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else if (isDemo) {
      const isDemoAdmin = demoRole === 'admin';
      if (isDemoAdmin) {
        return (<>
          <DemoModeBanner />
          {children}
        </>);
      }
      if (requiredRole.length > 0 && !requiredRole.includes(demoRole as string)) {
        return <Navigate to="/unauthorized" replace />;
      }
      return (<>
        <DemoModeBanner />
        {children}
      </>);
    }
  }

  return (
    <>
      {isDemo ? <DemoModeBanner /> : null}
      {children}
    </>
  );
};
