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
          navigate('/admin');
          return;
        }
        
        // If admin is on a specific role path, allow them to stay there
        if (currentPath.startsWith('/auth/')) {
          const rolePath = currentPath.replace('/auth/', '');
          setRedirected(true);
          navigate(`/${rolePath}`);
          return;
        }
        
        // Admin can access any route without further checks
        setRedirected(true);
        return;
      }
      
      const role = getPrimaryRole();
      console.log('RoleBasedRedirect - Detected role:', role);
      
      // All authenticated users get passenger access by default
      setRedirected(true);
      
      // Navigate based on highest assigned role, fallback to passenger
      switch (role) {
        case 'driver':
          navigate('/driver');
          break;
        case 'owner':
          navigate('/owner');
          break;
        case 'marshall':
          navigate('/marshall');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'police':
          navigate('/police');
          break;
        default:
          // Default: all users can access passenger portal
          navigate('/passenger');
      }
    } else if (!loading && !user && !redirected) {
      // No authentication required for public portals
      const currentPath = window.location.pathname;
      if (currentPath === '/business-portal' || currentPath === '/community-safety') {
        console.log('RoleBasedRedirect - Public portal access allowed');
        setRedirected(true);
        return;
      }
      
      console.log('RoleBasedRedirect - No user, redirecting to auth');
      setRedirected(true);
      navigate('/auth');
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