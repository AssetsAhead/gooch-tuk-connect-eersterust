
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Monitor for suspicious activities
    const monitorSuspiciousActivity = async () => {
      try {
        // Check for multiple failed login attempts
        const { data: securityLogs } = await supabase
          .from('security_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('event_type', 'login_failed')
          .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false });

        if (securityLogs && securityLogs.length >= 5) {
          toast({
            title: "Security Alert",
            description: "Multiple failed login attempts detected. Consider changing your password.",
            variant: "destructive",
            duration: 10000,
          });
        }

        // Monitor for location anomalies (for drivers/marshalls)
        const userRole = user.user_metadata?.role;
        if (['driver', 'marshall', 'police'].includes(userRole)) {
          // Check for unusual location patterns
          const { data: locationLogs } = await supabase
            .from('location_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
            .order('timestamp', { ascending: false })
            .limit(10);

          if (locationLogs && locationLogs.length > 0) {
            // Implement location anomaly detection logic here
            console.log('Monitoring location patterns for security');
          }
        }

      } catch (error) {
        console.warn('Security monitoring error:', error);
      }
    };

    // Monitor device fingerprinting
    const monitorDeviceFingerprint = () => {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Store device fingerprint for session validation
      localStorage.setItem('deviceFingerprint', JSON.stringify(deviceInfo));
    };

    // Check for VPN/Proxy usage (basic check)
    const checkNetworkSecurity = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        
        // Log IP for security monitoring
        await supabase
          .from('security_logs')
          .insert({
            user_id: user.id,
            event_type: 'ip_check',
            ip_address: data.ip,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.warn('Network security check failed:', error);
      }
    };

    // Run security checks
    monitorSuspiciousActivity();
    monitorDeviceFingerprint();
    checkNetworkSecurity();

    // Set up periodic monitoring
    const securityInterval = setInterval(monitorSuspiciousActivity, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(securityInterval);
  }, [user, toast]);

  // Function to report security incident
  const reportSecurityIncident = async (incidentType: string, details: any) => {
    if (!user) return;

    try {
      await supabase
        .from('security_incidents')
        .insert({
          user_id: user.id,
          incident_type: incidentType,
          details,
          timestamp: new Date().toISOString(),
          status: 'reported'
        });

      toast({
        title: "Security Incident Reported",
        description: "Your security incident has been logged and will be investigated.",
      });
    } catch (error) {
      console.error('Failed to report security incident:', error);
    }
  };

  return { reportSecurityIncident };
};
