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
      const locationName = `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
      const pickupLocation = `My Location (${locationName})`;

      // Use AI-powered smart matching to find the best driver
      console.log('Invoking smart-match-driver...');
      const { data: matchResult, error: matchError } = await supabase.functions.invoke('smart-match-driver', {
        body: {
          passengerId: userId,
          pickupLocation: pickupLocation,
          destination: 'Quick Hail - To be confirmed',
          userLocation: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          },
          preferences: {
            prioritizeETA: true // For quick hail, prioritize nearest driver
          }
        }
      });

      if (matchError) {
        console.error('Smart match error:', matchError);
        throw matchError;
      }

      if (!matchResult?.success || !matchResult?.bestMatch) {
        toast({
          title: 'No drivers available',
          description: matchResult?.recommendation || 'Please try again in a moment',
          variant: 'destructive'
        });
        return;
      }

      const bestDriver = matchResult.bestMatch.driver;
      console.log('Smart match found:', bestDriver.name, 'Score:', matchResult.bestMatch.score);

      // Create the ride with the AI-matched driver
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .insert({
          passenger_id: userId,
          driver_id: bestDriver.user_id,
          pickup_location: pickupLocation,
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

      // Show AI recommendation if available
      const description = matchResult.bestMatch.aiRecommendation 
        ? matchResult.bestMatch.aiRecommendation
        : `${bestDriver.name} is on the way. ETA: ~${bestDriver.estimated_eta || 5} min`;

      toast({
        title: '🚗 Smart Match Found!',
        description: description,
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
