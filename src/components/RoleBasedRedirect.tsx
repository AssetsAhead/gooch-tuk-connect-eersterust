import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const RoleBasedRedirect: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    console.log('RoleBasedRedirect - Auth state:', { loading, user: !!user, userProfile, userMetadata: user?.user_metadata });
    
    if (!loading && user && !redirected) {
      // Ensure we have the user profile loaded, otherwise wait
      if (!userProfile) {
        console.log('RoleBasedRedirect - Waiting for userProfile to load...');
        return;
      }

      // Check if user is admin first (bypasses role check)
      const isAdmin = user?.email === 'assetsahead.sa@gmail.com';
      
      if (isAdmin) {
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
      
      const role = userProfile?.role;
      console.log('RoleBasedRedirect - Detected role:', role);
      
      // If no role found, redirect to auth
      if (!role) {
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
          console.log('RoleBasedRedirect - No valid role found, defaulting to admin');
          navigate('/admin', { replace: true });
      }
    } else if (!loading && !user && !redirected) {
      console.log('RoleBasedRedirect - No user, redirecting to auth');
      setRedirected(true);
      navigate('/auth', { replace: true });
    }
  }, [user, userProfile, loading, navigate, redirected]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};