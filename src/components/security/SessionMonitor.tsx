
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SessionMonitor = () => {
  const { user, session } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !session) return;

    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimeout = () => {
      setLastActivity(Date.now());
      
      clearTimeout(timeoutId);
      clearTimeout(warningId);

      // Show warning 5 minutes before timeout
      warningId = setTimeout(() => {
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire in 5 minutes. Click anywhere to extend.",
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

    // Log security events
    const logSecurityEvent = async (event: string) => {
      try {
        await supabase
          .from('security_logs')
          .insert({
            user_id: user.id,
            event_type: event,
            timestamp: new Date().toISOString(),
            ip_address: await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip)
              .catch(() => 'unknown'),
            user_agent: navigator.userAgent
          });
      } catch (error) {
        console.warn('Failed to log security event:', error);
      }
    };

    // Log session start
    logSecurityEvent('session_start');

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      logSecurityEvent('session_end');
    };
  }, [user, session, toast]);

  return null; // This component only monitors, doesn't render anything
};
