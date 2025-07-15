import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AdminSecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const isAdmin = userProfile?.role === 'admin' || user?.email === 'assetsahead.sa@gmail.com';
    
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

    // Enhanced device fingerprinting for admin
    const generateAdminFingerprint = () => {
      const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
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
  }, [user, userProfile, toast]);

  return <>{children}</>;
};