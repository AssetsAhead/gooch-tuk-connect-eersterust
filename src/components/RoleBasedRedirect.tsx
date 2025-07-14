import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RoleBasedRedirect: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Get role from userProfile first, fallback to user metadata
      const role = userProfile?.role || user.user_metadata?.role;
      
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
          navigate('/passenger', { replace: true });
      }
    } else if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, userProfile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};