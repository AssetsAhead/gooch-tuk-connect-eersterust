
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';
import { WhatsAppLocationShare } from '@/components/location/WhatsAppLocationShare';

export const PanicTrigger = () => {
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Get current location for emergency services
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.warn('Location access denied:', error)
      );
    }
  }, []);

  const triggerPanicAlert = async () => {
    if (!user) return;

    setIsActive(true);
    
    try {
      // Panic alert logging temporarily disabled until types are updated
      console.log('Panic alert triggered for user:', user.id);

      // Notify emergency contacts and authorities
      await supabase.functions.invoke('emergency-alert', {
        body: {
          userId: user.id,
          alertType: 'panic',
          location: location ? {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          } : null
        }
      });

      toast({
        title: "Emergency Alert Sent",
        description: "Emergency services and contacts have been notified",
        variant: "default",
      });

      // Auto-deactivate after 5 minutes
      setTimeout(() => setIsActive(false), 300000);
      
    } catch (error: any) {
      toast({
        title: "Alert Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsActive(false);
    }
  };

  const deactivatePanic = async () => {
    if (!user) return;

    try {
      await supabase.functions.invoke('emergency-alert', {
        body: {
          userId: user.id,
          alertType: 'panic_cancel',
          location: null
        }
      });

      setIsActive(false);
      
      toast({
        title: "Alert Deactivated",
        description: "Emergency alert has been cancelled",
      });
    } catch (error: any) {
      toast({
        title: "Deactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isActive) {
    return (
      <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">EMERGENCY ACTIVE</span>
        </div>
        <p className="text-sm mb-3">Emergency services notified</p>
        <div className="space-y-2">
          <WhatsAppLocationShare
            variant="compact"
            message="🚨 EMERGENCY — I need help! Here is my location:"
          />
          <Button 
            onClick={deactivatePanic}
            variant="outline"
            size="sm"
            className="w-full bg-background text-foreground hover:bg-muted"
          >
            Cancel Alert
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={triggerPanicAlert}
      className="fixed bottom-4 right-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground h-16 w-16 rounded-full shadow-lg"
      size="lg"
    >
      <AlertTriangle className="h-8 w-8" />
    </Button>
  );
};
