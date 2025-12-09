import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickHailButtonProps {
  userId?: string;
  onHailSuccess?: (ride: any) => void;
  className?: string;
  disabled?: boolean;
}

export const QuickHailButton = ({
  userId,
  onHailSuccess,
  className,
  disabled
}: QuickHailButtonProps) => {
  const [isHailing, setIsHailing] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const { toast } = useToast();

  // Get user's current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords);
          setLocationError(null);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Enable location for quick hailing');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleQuickHail = async () => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to hail a ride',
        variant: 'destructive'
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: 'Location required',
        description: 'Please enable location services',
        variant: 'destructive'
      });
      return;
    }

    setIsHailing(true);
    setPulseAnimation(true);

    try {
      // Get nearby available drivers
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'online')
        .limit(5);

      if (driversError) throw driversError;

      if (!drivers || drivers.length === 0) {
        toast({
          title: 'No drivers available',
          description: 'Please try again in a moment',
          variant: 'destructive'
        });
        return;
      }

      // Pick the first available driver (in production, use smart matching)
      const selectedDriver = drivers[0];

      // Create the ride with current location
      const locationName = `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
      
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .insert({
          passenger_id: userId,
          driver_id: selectedDriver.user_id,
          pickup_location: `My Location (${locationName})`,
          destination: 'To be confirmed',
          price: 15, // Base fare
          ride_type: 'quick_hail',
          status: 'requested'
        })
        .select()
        .single();

      if (rideError) throw rideError;

      // Log the location
      await supabase.from('location_logs').insert({
        user_id: userId,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy
      });

      toast({
        title: '🚗 Ride Requested!',
        description: `${selectedDriver.name} is on the way. ETA: ~${selectedDriver.eta || 5} min`,
      });

      onHailSuccess?.(ride);
    } catch (error) {
      console.error('Quick hail error:', error);
      toast({
        title: 'Hailing failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsHailing(false);
      setTimeout(() => setPulseAnimation(false), 1000);
    }
  };

  return (
    <div className="relative">
      {/* Pulse ring animation */}
      {pulseAnimation && (
        <>
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
        </>
      )}
      
      <Button
        onClick={handleQuickHail}
        disabled={disabled || isHailing || !userLocation}
        className={cn(
          'relative z-10 h-20 w-20 rounded-full text-lg font-bold shadow-lg',
          'bg-gradient-to-br from-primary via-primary to-primary/80',
          'hover:from-primary/90 hover:to-primary/70',
          'active:scale-95 transition-all duration-200',
          'disabled:opacity-50',
          className
        )}
      >
        {isHailing ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : locationError ? (
          <MapPin className="h-8 w-8" />
        ) : (
          <Zap className="h-8 w-8" />
        )}
      </Button>

      {/* Status text */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
        {isHailing ? 'Finding driver...' : locationError || 'Tap to hail'}
      </div>
    </div>
  );
};
