import { useState, useEffect } from 'react';
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
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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

    setLoading(true);
    try {
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

      // Update the primary role in profiles
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', user.id);

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

  const currentRole = userProfile?.role;
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