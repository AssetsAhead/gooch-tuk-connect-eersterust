import React, { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminSecurityProviderProps {
  children: React.ReactNode;
  user: User | null;
  userProfile: any | null;
}

export const AdminSecurityProvider: React.FC<AdminSecurityProviderProps> = ({ children, user, userProfile }) => {
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return false;
      const { data } = await supabase.rpc('is_current_user_admin');
      return data === true;
    };

    checkAdminStatus().then(isAdmin => {
      if (!isAdmin || !user) return;

    // Enhanced security logging for admin sessions
    const logAdminAction = async (action: string, details: any = {}) => {
      try {
        await supabase.from('security_logs').insert({
          user_id: user.id,
          event_type: `admin_${action}`,
          details: {
            ...details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        });
      } catch (error) {
        console.error('Admin security logging failed:', error);
      }
    };

    // Log admin session start
    logAdminAction('session_active', {
      email: user.email,
      role: userProfile?.role
    });

    // Monitor admin navigation
    const handleNavigation = () => {
      logAdminAction('navigation', {
        from: document.referrer,
        to: window.location.href
      });
    };

    // Enhanced device fingerprinting for admin with fallbacks
    const generateAdminFingerprint = () => {
      try {
        const fingerprint = {
          userAgent: navigator?.userAgent || 'unknown',
          language: navigator?.language || 'unknown',
          platform: navigator?.platform || 'unknown',
          timezone: (() => {
            try {
              return Intl.DateTimeFormat().resolvedOptions().timeZone;
            } catch {
              return 'unknown';
            }
          })(),
          screen: (() => {
            try {
              return `${screen.width}x${screen.height}`;
            } catch {
              return 'unknown';
            }
          })(),
          colorDepth: (() => {
            try {
              return screen.colorDepth;
            } catch {
              return 'unknown';
            }
          })(),
          timestamp: Date.now()
        };
        
        const adminFingerprint = btoa(JSON.stringify(fingerprint));
        const storedFingerprint = localStorage.getItem('adminFingerprint');
        
        if (storedFingerprint && storedFingerprint !== adminFingerprint) {
          toast({
            title: "Security Alert",
            description: "Admin device fingerprint changed. Enhanced monitoring active.",
            variant: "destructive",
            duration: 10000,
          });
          
          logAdminAction('device_change', {
            previousFingerprint: storedFingerprint,
            newFingerprint: adminFingerprint
          });
        }
        
        localStorage.setItem('adminFingerprint', adminFingerprint);
      } catch (error) {
        // Fallback: use basic session-based tracking
        const fallbackId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('adminFingerprint', fallbackId);
        
        toast({
          title: "Security Notice",
          description: "Device fingerprinting unavailable. Using session-based security.",
          duration: 5000,
        });
        
        logAdminAction('fingerprint_fallback', {
          error: error.message,
          fallbackId
        });
      }
    };

    // Show admin security notice
    toast({
      title: "Enhanced Security Active",
      description: "Admin session with 10-minute timeout and full audit logging",
      duration: 5000,
    });

    generateAdminFingerprint();
    window.addEventListener('beforeunload', handleNavigation);

      return () => {
        window.removeEventListener('beforeunload', handleNavigation);
        logAdminAction('session_end');
      };
    });
  }, [user, userProfile, toast]);

  return <>{children}</>;
};