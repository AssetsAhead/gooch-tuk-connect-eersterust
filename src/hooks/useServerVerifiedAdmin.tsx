import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Server-verified admin check using Supabase RPC.
 * NEVER checks localStorage, sessionStorage, or client-side data.
 * Always validates against the database using a security definer function.
 */
export const useServerVerifiedAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Call the is_current_user_admin RPC function
        // This function uses SECURITY DEFINER to check user_roles table
        const { data, error } = await supabase.rpc('is_current_user_admin');
        
        if (error) {
          console.error('Error verifying admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Failed to verify admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
