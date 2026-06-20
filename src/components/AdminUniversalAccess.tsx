import React from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const WHITELISTED_ADMIN_EMAILS = [
  'assetsahead.sa@gmail.com',
  'realone.mel@gmail.com',
  'aggapo.johnston450@gmail.com',
  'chibalef@gmail.com',
];

interface AdminAccessContextType {
  hasUniversalAccess: boolean;
  masterPasswordEntered: boolean;
  refreshSession: () => Promise<void>;
}

const AdminAccessContext = React.createContext<AdminAccessContextType>({
  hasUniversalAccess: false,
  masterPasswordEntered: false,
  refreshSession: async () => {}
});

export const useAdminAccess = () => React.useContext(AdminAccessContext);

interface AdminUniversalAccessProps {
  children: React.ReactNode;
}

export const AdminUniversalAccess: React.FC<AdminUniversalAccessProps> = ({ children }) => {
  const { isAdmin } = useSecureAuth();
  const { user } = useAuth();
  const [masterPasswordEntered, setMasterPasswordEntered] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Check server-side session status
  const checkAdminSession = React.useCallback(async () => {
    if (!isAdmin()) {
      setMasterPasswordEntered(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_valid_admin_session');

      if (error) {
        console.error('Error checking admin session:', error);
        setMasterPasswordEntered(false);
      } else if (data === true) {
        setMasterPasswordEntered(true);
      } else {
        // Try whitelisted bypass for trusted admin emails
        const email = user?.email?.toLowerCase();
        if (email && WHITELISTED_ADMIN_EMAILS.includes(email)) {
          const { error: bypassError } = await supabase.rpc(
            'create_admin_session_whitelisted' as any,
            { _ip_address: null, _user_agent: navigator.userAgent }
          );
          if (bypassError) {
            console.warn('Whitelisted admin bypass failed:', bypassError);
            setMasterPasswordEntered(false);
          } else {
            setMasterPasswordEntered(true);
          }
        } else {
          setMasterPasswordEntered(false);
        }
      }
    } catch (error) {
      console.error('Failed to check admin session:', error);
      setMasterPasswordEntered(false);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user]);

  // Initial check and periodic refresh
  React.useEffect(() => {
    checkAdminSession();
    
    // Check every 60 seconds to detect expiration
    const interval = setInterval(checkAdminSession, 60000);

    return () => clearInterval(interval);
  }, [checkAdminSession]);

  const contextValue: AdminAccessContextType = {
    hasUniversalAccess: isAdmin() && masterPasswordEntered,
    masterPasswordEntered,
    refreshSession: checkAdminSession
  };

  // Show loading state briefly to prevent flash of unauthorized content
  if (loading && isAdmin()) {
    return <>{children}</>;
  }

  return (
    <AdminAccessContext.Provider value={contextValue}>
      {children}
    </AdminAccessContext.Provider>
  );
};