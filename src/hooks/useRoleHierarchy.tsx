import { useState, useCallback, useEffect } from 'react';
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

  // Check if user has active admin role from database
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdminRole();
  }, [user]);

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
      // For admin, update session storage and log the action
      if (isAdmin) {
        sessionStorage.setItem('admin_active_role', targetRole);
        
        // Log the role switch in audit logs
        await supabase.from('admin_audit_logs').insert({
          admin_id: user?.id,
          action_type: 'ROLE_SWITCH',
          details: { 
            from_role: userProfile?.role,
            to_role: targetRole,
            timestamp: new Date().toISOString()
          }
        });
        
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