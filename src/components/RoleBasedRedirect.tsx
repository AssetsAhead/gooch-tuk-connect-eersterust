import React, { useEffect, useState } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useNavigate } from 'react-router-dom';

export const RoleBasedRedirect: React.FC = () => {
  const { user, loading, isAdmin, getPrimaryRole } = useSecureAuth();
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    console.log('RoleBasedRedirect - Auth state:', { loading, user: !!user });
    
    if (!loading && user && !redirected) {
      // Check if user is admin first (bypasses role check)
      if (isAdmin()) {
        console.log('RoleBasedRedirect - Admin user detected');
        const currentPath = window.location.pathname;
        
        // Only redirect if on root, auth, or dashboard pages
        if (currentPath === '/' || currentPath === '/auth' || currentPath === '/dashboard') {
          setRedirected(true);
          navigate('/admin', { replace: true });
          return;
        }
        
        // If admin is on a specific role path, allow them to stay there
        if (currentPath.startsWith('/auth/')) {
          const rolePath = currentPath.replace('/auth/', '');
          setRedirected(true);
          navigate(`/${rolePath}`, { replace: true });
          return;
        }
        
        // Admin can access any route without further checks
        setRedirected(true);
        return;
      }
      
      const role = getPrimaryRole();
      console.log('RoleBasedRedirect - Detected role:', role);
      
      // If no role found, redirect to auth
      if (!role || role === 'passenger') {
        console.log('RoleBasedRedirect - No role found, redirecting to auth');
        setRedirected(true);
        navigate('/auth', { replace: true });
        return;
      }
      
      setRedirected(true);
      
      // Navigate immediately since we have all the data we need
      switch (role) {
        case 'passenger':
          navigate('/passenger', { replace: true });
          break;
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
          console.log('RoleBasedRedirect - No valid role found, redirecting to auth');
          navigate('/auth', { replace: true });
      }
    } else if (!loading && !user && !redirected) {
      console.log('RoleBasedRedirect - No user, redirecting to auth');
      setRedirected(true);
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate, redirected, isAdmin, getPrimaryRole]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};