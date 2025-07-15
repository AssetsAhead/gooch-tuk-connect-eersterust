
import React from 'react';
import { SessionMonitor } from './SessionMonitor';
import { PanicTrigger } from './PanicTrigger';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  useSecurityMonitoring();

  return (
    <>
      {children}
      {user && (
        <>
          <SessionMonitor />
          <PanicTrigger />
        </>
      )}
    </>
  );
};
