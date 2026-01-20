import React, { useEffect, useState } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useNavigate } from 'react-router-dom';

export const RoleBasedRedirect: React.FC = () => {
  const { user, loading, isAdmin, getPrimaryRole, userRoles } = useSecureAuth();
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    console.log('RoleBasedRedirect - Auth state:', { loading, user: !!user, userRoles, redirected });
    
    // Wait until loading is complete
    if (loading) {
      return;
    }
    
    // If no user and not loading, redirect to auth
    if (!user) {
      console.log('RoleBasedRedirect - No user, redirecting to auth');
      if (!redirected) {
        setRedirected(true);
        navigate('/auth', { replace: true });
      }
      return;
    }
    
    // User exists and loading is complete
    if (!redirected) {
      // Check if user is admin first (bypasses role check)
      if (isAdmin()) {
        console.log('RoleBasedRedirect - Admin user detected');
        setRedirected(true);
        navigate('/admin', { replace: true });
        return;
      }
      
      const role = getPrimaryRole();
      console.log('RoleBasedRedirect - Detected role:', role);
      
      setRedirected(true);
      
      // Navigate based on highest assigned role, fallback to passenger
      switch (role) {
        case 'driver':
          navigate('/driver', { replace: true });
          break;
        case 'owner':
          navigate('/owner', { replace: true });
          break;
        case 'marshall':
          navigate('/marshall', { replace: true });
          break;
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'police':
          navigate('/police', { replace: true });
          break;
        default:
          // Default: all users can access passenger portal
          navigate('/passenger', { replace: true });
      }
    }
  }, [user, loading, navigate, redirected, isAdmin, getPrimaryRole, userRoles]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};