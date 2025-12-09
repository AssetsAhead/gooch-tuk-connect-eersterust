import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SmartLocationInput } from '@/components/SmartLocationInput';
import { QuickHailButton } from './QuickHailButton';
import { LiveDriverMap } from './LiveDriverMap';
import {
  MapPin,
  Navigation,
  Clock,
  Star,
  Zap,
  Car,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartHailCardProps {
  userId?: string;
  onRideCreated?: (ride: any) => void;
  discountInfo?: {
    isVerified: boolean;
    discountPercentage: number;
  };
}

export const SmartHailCard = ({
  userId,
  onRideCreated,
  discountInfo
}: SmartHailCardProps) => {
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const { toast } = useToast();

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => setUserLocation(position.coords),
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Calculate estimated fare based on distance
  useEffect(() => {
    if (pickup && destination) {
      // Simple fare calculation (in production, use distance API)
      const baseFare = 15;
      const randomDistance = Math.random() * 10 + 1;
      const farePerKm = 3;
      let fare = baseFare + Math.round(randomDistance * farePerKm);
      
      if (discountInfo?.isVerified) {
        fare = Math.round(fare * (1 - discountInfo.discountPercentage / 100));
      }
      
      setEstimatedFare(fare);
    } else {
      setEstimatedFare(null);
    }
  }, [pickup, destination, discountInfo]);

  const quickDestinations = [
    { name: 'Denlyn Mall', fare: 15, time: 5, icon: '🏬' },
    { name: 'Municipal Clinic', fare: 20, time: 8, icon: '🏥' },
    { name: 'Pick n Pay', fare: 15, time: 6, icon: '🛒' },
    { name: 'Taxi Rank', fare: 10, time: 3, icon: '🚕' },
  ];

  const handleQuickDestination = async (dest: typeof quickDestinations[0]) => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book a ride',
        variant: 'destructive'
      });
      return;
    }

    setIsBooking(true);
    
    try {
      const pickupLocation = userLocation 
        ? `My Location (${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)})`
        : 'Current Location';

      const { data: ride, error } = await supabase
        .from('rides')
        .insert({
          passenger_id: userId,
          pickup_location: pickupLocation,
          destination: dest.name,
          price: discountInfo?.isVerified 
            ? Math.round(dest.fare * (1 - discountInfo.discountPercentage / 100))
            : dest.fare,
          ride_type: 'quick_destination',
          status: 'requested'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '🎉 Ride Booked!',
        description: `Heading to ${dest.name}. Driver on the way!`,
      });

      onRideCreated?.(ride);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleCustomBooking = async () => {
    if (!userId || !pickup || !destination) {
      toast({
        title: 'Missing information',
        description: 'Please enter pickup and destination',
        variant: 'destructive'
      });
      return;
    }

    setIsBooking(true);

    try {
      const { data: ride, error } = await supabase
        .from('rides')
        .insert({
          passenger_id: userId,
          driver_id: selectedDriver?.user_id || null,
          pickup_location: pickup,
          destination: destination,
          price: estimatedFare || 20,
          ride_type: 'custom',
          status: 'requested'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '🚗 Ride Requested!',
        description: selectedDriver 
          ? `${selectedDriver.name} will pick you up soon`
          : 'Finding the best driver for you...',
      });

      onRideCreated?.(ride);
      setPickup('');
      setDestination('');
      setSelectedDriver(null);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Hail a Ride
          </CardTitle>
          {discountInfo?.isVerified && (
            <Badge className="bg-success text-white">
              {discountInfo.discountPercentage}% SASSA Discount
            </Badge>
          )}
        </div>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 mt-3">
          <Button
            variant={mode === 'quick' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('quick')}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-1" />
            Quick Hail
          </Button>
          <Button
            variant={mode === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('custom')}
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Custom Trip
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {mode === 'quick' ? (
          <>
            {/* One-Tap Hail Button */}
            <div className="flex flex-col items-center py-6">
              <QuickHailButton
                userId={userId}
                onHailSuccess={onRideCreated}
                disabled={isBooking}
              />
              <p className="text-sm text-muted-foreground mt-10 text-center">
                Instantly hail the nearest available driver
              </p>
            </div>

            {/* Quick Destinations */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Popular Destinations
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickDestinations.map((dest) => (
                  <Button
                    key={dest.name}
                    variant="outline"
                    className="h-auto py-3 px-3 justify-start hover:border-primary/50"
                    onClick={() => handleQuickDestination(dest)}
                    disabled={isBooking}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xl">{dest.icon}</span>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{dest.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="text-success font-medium">
                            R{discountInfo?.isVerified 
                              ? Math.round(dest.fare * (1 - discountInfo.discountPercentage / 100))
                              : dest.fare}
                          </span>
                          <span>•</span>
                          <span>{dest.time} min</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Custom Trip Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Pickup</label>
                <SmartLocationInput
                  placeholder="Where are you?"
                  value={pickup}
                  onChange={setPickup}
                  storageKey="pickup"
                  quickSuggestions={['Current Location', 'Home', 'Work']}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Destination</label>
                <SmartLocationInput
                  placeholder="Where to?"
                  value={destination}
                  onChange={setDestination}
                  storageKey="destination"
                  quickSuggestions={quickDestinations.map(d => d.name)}
                />
              </div>
            </div>

            {/* Live Driver Map */}
            <LiveDriverMap
              onSelectDriver={setSelectedDriver}
              selectedDriverId={selectedDriver?.id}
              userLocation={userLocation ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
              } : undefined}
            />

            {/* Fare Estimate & Book Button */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {estimatedFare && (
                  <div>
                    <span className="text-sm text-muted-foreground">Estimated fare:</span>
                    <span className="text-xl font-bold text-success ml-2">R{estimatedFare}</span>
                    {discountInfo?.isVerified && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        SASSA discount applied
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={handleCustomBooking}
                disabled={!pickup || !destination || isBooking}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Car className="h-4 w-4 mr-2" />
                    Book Ride
                  </>
                )}
              </Button>
            </div>

            {selectedDriver && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {selectedDriver.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{selectedDriver.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span>{selectedDriver.rating}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{selectedDriver.eta} min away</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
