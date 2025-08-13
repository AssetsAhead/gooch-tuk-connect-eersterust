import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, loading, userProfile } = useAuth();
  const location = useLocation();

  // Client-side demo mode flags
  const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true';
  const demoRole = (typeof window !== 'undefined' && localStorage.getItem('demo_role')) || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, allow demo users to pass; otherwise redirect to auth
  if (!user && !demoMode) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole) {
    // If real user is present, keep existing logic
    if (user) {
      // Admin email has unrestricted access to all routes
      const isAdmin = user.email === 'assetsahead.sa@gmail.com';
      if (isAdmin) {
        return <>{children}</>;
      }
      
      // For non-admin users, check if userProfile exists and has required role
      if (!userProfile) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
      }
      
      const userRole = (userProfile as any).role || (userProfile as any).user_metadata?.role;
      if (requiredRole.length > 0 && !requiredRole.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else if (demoMode) {
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
      {demoMode ? <DemoModeBanner /> : null}
      {children}
    </>
  );
};
