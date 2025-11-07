import React from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';

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
      } else {
        setMasterPasswordEntered(data === true);
      }
    } catch (error) {
      console.error('Failed to check admin session:', error);
      setMasterPasswordEntered(false);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

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