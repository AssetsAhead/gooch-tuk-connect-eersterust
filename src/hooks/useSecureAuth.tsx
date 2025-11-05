import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useServerVerifiedAdmin } from './useServerVerifiedAdmin';

interface UserRole {
  id: string;
  role: string;
  is_active: boolean;
}

export const useSecureAuth = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin: serverVerifiedAdmin, loading: adminLoading } = useServerVerifiedAdmin();

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

  // SECURITY: Only use verified roles from user_roles table
  // NO fallbacks to user_metadata or profile.role (client-modifiable)
  const getEffectiveRoles = (): string[] => {
    return userRoles
      .filter((r) => r.is_active)
      .map((r) => r.role);
  };

  const hasRole = (role: string): boolean => {
    const roles = getEffectiveRoles();
    return roles.includes(role);
  };

  // Server-verified admin check (NEVER use client-side storage)
  const isAdmin = (): boolean => serverVerifiedAdmin;
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
    const roles = getEffectiveRoles();
    return roles.length > 0 ? roles : [];
  };

  // Get primary role (first active role, or empty if none assigned)
  const getPrimaryRole = (): string => {
    const roles = getEffectiveRoles();
    return roles.length > 0 ? roles[0] : '';
  };
  return {
    user,
    userProfile,
    userRoles,
    loading: authLoading || loading || adminLoading,
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