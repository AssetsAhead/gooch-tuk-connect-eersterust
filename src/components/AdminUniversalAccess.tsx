import React from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface AdminAccessContextType {
  hasUniversalAccess: boolean;
  masterPasswordEntered: boolean;
}

const AdminAccessContext = React.createContext<AdminAccessContextType>({
  hasUniversalAccess: false,
  masterPasswordEntered: false
});

export const useAdminAccess = () => React.useContext(AdminAccessContext);

interface AdminUniversalAccessProps {
  children: React.ReactNode;
}

export const AdminUniversalAccess: React.FC<AdminUniversalAccessProps> = ({ children }) => {
  const { isAdmin } = useSecureAuth();
  const [masterPasswordEntered, setMasterPasswordEntered] = React.useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('admin_master_unlocked') === 'true';
  });

  // Listen for master password unlock events
  React.useEffect(() => {
    const handleStorageChange = () => {
      setMasterPasswordEntered(localStorage.getItem('admin_master_unlocked') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case localStorage was updated in same tab
    const interval = setInterval(() => {
      const isUnlocked = localStorage.getItem('admin_master_unlocked') === 'true';
      if (isUnlocked !== masterPasswordEntered) {
        setMasterPasswordEntered(isUnlocked);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [masterPasswordEntered]);

  const contextValue: AdminAccessContextType = {
    hasUniversalAccess: isAdmin() && masterPasswordEntered,
    masterPasswordEntered
  };

  return (
    <AdminAccessContext.Provider value={contextValue}>
      {children}
    </AdminAccessContext.Provider>
  );
};