import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserRole {
  id: string;
  role: string;
  is_active: boolean;
}

export const useRoleSwitching = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [availableRoles, setAvailableRoles] = React.useState<UserRole[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      fetchUserRoles();
    }
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .order('role');

      if (error) throw error;
      setAvailableRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const switchRole = async (newRole: string) => {
    if (!user || loading) return;

    // Check if user has admin role via server-verified method
    const { data: isAdmin } = await supabase.rpc('is_current_user_admin');
    
    setLoading(true);
    try {
      if (isAdmin) {
        // Admin doesn't need to switch roles in database, just navigate
        toast({
          title: "Admin Access",
          description: `Accessing ${newRole} dashboard with full privileges`,
        });
        
        // Admin can access any dashboard directly
        const dashboardRoutes: { [key: string]: string } = {
          passenger: '/passenger',
          driver: '/driver', 
          owner: '/owner',
          marshall: '/marshall',
          admin: '/admin',
          police: '/police'
        };
        
        if (dashboardRoutes[newRole]) {
          window.location.href = dashboardRoutes[newRole];
        }
        return;
      }
      // Update all roles to inactive first
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate the selected role
      await supabase
        .from('user_roles')
        .update({ is_active: true })
        .eq('user_id', user.id)
        .eq('role', newRole);

      // SECURITY FIX: Removed profiles.role update - roles stored only in user_roles table
      // The role change is complete after updating user_roles table above

      // Refresh the profile to get updated role
      await refreshProfile();

      toast({
        title: "Role Switched",
        description: `Successfully switched to ${newRole} role`,
      });

      // Reload the page to trigger proper redirect
      window.location.reload();

    } catch (error: any) {
      console.error('Error switching role:', error);
      toast({
        title: "Error",
        description: "Failed to switch role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (role: string) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: role,
          is_active: false
        });

      if (error) throw error;

      await fetchUserRoles();
      
      toast({
        title: "Role Added",
        description: `${role} role has been added to your account`,
      });

    } catch (error: any) {
      console.error('Error adding role:', error);
      toast({
        title: "Error",
        description: "Failed to add role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // SECURITY: Role comes from user_roles table only, not from userProfile
  const currentRole = availableRoles.find(r => r.is_active)?.role;
  const activeRole = availableRoles.find(r => r.is_active);

  return {
    availableRoles,
    currentRole,
    activeRole,
    loading,
    switchRole,
    addRole,
    refreshRoles: fetchUserRoles
  };
};