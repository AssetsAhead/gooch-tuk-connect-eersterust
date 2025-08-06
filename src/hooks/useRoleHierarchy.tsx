import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface RoleHierarchy {
  admin: string[];
  marshall: string[];
  owner: string[];
  driver: string[];
  passenger: string[];
  police: string[];
}

// Define role hierarchy and override capabilities
const ROLE_HIERARCHY: RoleHierarchy = {
  admin: ['admin', 'marshall', 'owner', 'driver', 'passenger'], // Admin can access all roles except police
  marshall: ['marshall', 'driver', 'passenger'], // Marshall can override driver in emergencies
  owner: ['owner', 'driver', 'passenger'], // Owner can access driver and passenger
  driver: ['driver', 'passenger'], // Driver can switch to passenger
  passenger: ['passenger'], // Passenger only has their role
  police: ['police'], // Police is standalone, only admin can access
};

export const useRoleHierarchy = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.email === 'assetsahead.sa@gmail.com';

  const getAccessibleRoles = useCallback(() => {
    if (isAdmin) {
      return ['admin', 'marshall', 'owner', 'driver', 'passenger', 'police'];
    }
    
    const currentRole = userProfile?.role;
    if (!currentRole) return [];
    
    return ROLE_HIERARCHY[currentRole as keyof RoleHierarchy] || [];
  }, [isAdmin, userProfile?.role]);

  const canAccessRole = useCallback((targetRole: string) => {
    const accessibleRoles = getAccessibleRoles();
    return accessibleRoles.includes(targetRole);
  }, [getAccessibleRoles]);

  const switchToRole = useCallback(async (targetRole: string) => {
    if (!canAccessRole(targetRole)) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to access the ${targetRole} role.`,
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // For admin, no database update needed, just UI change
      if (isAdmin) {
        // Store temporary role in session storage for UI purposes
        sessionStorage.setItem('admin_active_role', targetRole);
        toast({
          title: "Role Switched",
          description: `Now viewing as ${targetRole}`,
        });
        setLoading(false);
        return true;
      }

      // For non-admin users, update their active role in database
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      if (error) throw error;

      const { error: activateError } = await supabase
        .from('user_roles')
        .update({ is_active: true })
        .eq('user_id', user?.id)
        .eq('role', targetRole);

      if (activateError) throw activateError;

      await refreshProfile();
      
      toast({
        title: "Role Switched",
        description: `Successfully switched to ${targetRole}`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [canAccessRole, isAdmin, user?.id, refreshProfile, toast]);

  const getCurrentActiveRole = useCallback(() => {
    if (isAdmin) {
      return sessionStorage.getItem('admin_active_role') || 'admin';
    }
    return userProfile?.role || null;
  }, [isAdmin, userProfile?.role]);

  const assignRole = useCallback(async (userId: string, role: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can assign roles.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: userId,
            role,
            is_active: false
          }
        ]);

      if (error) throw error;

      toast({
        title: "Role Assigned",
        description: `Successfully assigned ${role} role.`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, toast]);

  return {
    getAccessibleRoles,
    canAccessRole,
    switchToRole,
    getCurrentActiveRole,
    assignRole,
    loading,
    isAdmin,
    roleHierarchy: ROLE_HIERARCHY,
  };
};