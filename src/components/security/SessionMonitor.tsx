
import React, { useEffect, useState, useRef } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SessionMonitor = () => {
  const { user, isAdmin } = useSecureAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const { toast } = useToast();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!user || isInitialized.current) return;
    
    isInitialized.current = true;

    // Admin gets shorter session timeout for enhanced security
    const isAdminUser = isAdmin();
    const SESSION_TIMEOUT = isAdminUser ? 10 * 60 * 1000 : 30 * 60 * 1000; // 10 min for admin, 30 for others
    const WARNING_TIME = isAdminUser ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2 min warning for admin

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimeout = () => {
      setLastActivity(Date.now());
      
      clearTimeout(timeoutId);
      clearTimeout(warningId);

      // Show warning before timeout
      warningId = setTimeout(() => {
        const warningTime = isAdminUser ? "2 minutes" : "5 minutes";
        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${warningTime}. Click anywhere to extend.`,
          duration: 10000,
        });
      }, SESSION_TIMEOUT - WARNING_TIME);

      // Auto logout after timeout
      timeoutId = setTimeout(async () => {
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity",
          variant: "destructive",
        });
        await supabase.auth.signOut();
      }, SESSION_TIMEOUT);
    };

    // Monitor user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetTimeout();
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timeout
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      isInitialized.current = false;
    };
  }, [user?.id]); // Only depend on user.id to prevent loops

  return null; // This component only monitors, doesn't render anything
};
