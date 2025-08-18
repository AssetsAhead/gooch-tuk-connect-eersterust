import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  id: string;
  role: string;
  is_active: boolean;
}

export const useSecureAuth = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setUserRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('Failed to fetch user roles:', error);
          setUserRoles([]);
        } else {
          setUserRoles(data || []);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  // Role checking functions
  const hasRole = (role: string): boolean => {
    return userRoles.some(userRole => userRole.role === role && userRole.is_active);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isDriver = (): boolean => hasRole('driver');
  const isPassenger = (): boolean => hasRole('passenger');
  const isOwner = (): boolean => hasRole('owner');
  const isMarshall = (): boolean => hasRole('marshall');
  const isPolice = (): boolean => hasRole('police');
  const isCouncillor = (): boolean => hasRole('councillor');

  // Law enforcement check
  const isLawEnforcement = (): boolean => {
    return isAdmin() || isPolice() || isMarshall();
  };

  // Get all active roles
  const getRoles = (): string[] => {
    return userRoles.filter(role => role.is_active).map(role => role.role);
  };

  // Get primary role (first active role, fallback to passenger)
  const getPrimaryRole = (): string => {
    const roles = getRoles();
    return roles.length > 0 ? roles[0] : 'passenger';
  };

  return {
    user,
    userProfile,
    userRoles,
    loading: authLoading || loading,
    hasRole,
    isAdmin,
    isDriver,
    isPassenger,
    isOwner,
    isMarshall,
    isPolice,
    isCouncillor,
    isLawEnforcement,
    getRoles,
    getPrimaryRole,
  };
};