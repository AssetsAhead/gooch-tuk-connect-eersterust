import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Navigation, Loader2, CalendarPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SmartLocationInput } from '@/components/SmartLocationInput';
import { format, addHours, isBefore } from 'date-fns';

interface RideSchedulerProps {
  userId?: string;
  onRideScheduled?: (ride: any) => void;
  discountInfo?: {
    isVerified: boolean;
    discountPercentage: number;
  };
}

export const RideScheduler = ({
  userId,
  onRideScheduled,
  discountInfo
}: RideSchedulerProps) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  // Set minimum date/time (1 hour from now)
  const minDateTime = addHours(new Date(), 1);
  const minDate = format(minDateTime, 'yyyy-MM-dd');
  const minTime = format(minDateTime, 'HH:mm');

  const calculateFare = () => {
    if (!pickup || !destination) return null;
    const baseFare = 15;
    const estimatedKm = Math.random() * 10 + 2;
    let fare = baseFare + Math.round(estimatedKm * 3);
    
    if (discountInfo?.isVerified) {
      fare = Math.round(fare * (1 - discountInfo.discountPercentage / 100));
    }
    return fare;
  };

  const handleSchedule = async () => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to schedule a ride',
        variant: 'destructive'
      });
      return;
    }

    if (!pickup || !destination || !scheduledDate || !scheduledTime) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    
    if (isBefore(scheduledFor, addHours(new Date(), 1))) {
      toast({
        title: 'Invalid time',
        description: 'Please schedule at least 1 hour in advance',
        variant: 'destructive'
      });
      return;
    }

    setIsBooking(true);

    try {
      const fare = calculateFare() || 30;

      const { data: ride, error } = await supabase
        .from('rides')
        .insert({
          passenger_id: userId,
          pickup_location: pickup,
          destination: destination,
          price: fare,
          ride_type: 'scheduled',
          status: 'requested',
          scheduled_for: scheduledFor.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '📅 Ride Scheduled!',
        description: `Your ride is scheduled for ${format(scheduledFor, 'MMM d, h:mm a')}`
      });

      onRideScheduled?.(ride);
      
      // Reset form
      setPickup('');
      setDestination('');
      setScheduledDate('');
      setScheduledTime('');
    } catch (error: any) {
      toast({
        title: 'Scheduling failed',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsBooking(false);
    }
  };

  const estimatedFare = calculateFare();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-primary" />
          Schedule a Ride
        </CardTitle>
        {discountInfo?.isVerified && (
          <Badge className="w-fit bg-success">{discountInfo.discountPercentage}% SASSA Discount</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Pickup Location</Label>
          <div className="mt-1.5">
            <SmartLocationInput
              placeholder="Where should we pick you up?"
              value={pickup}
              onChange={setPickup}
              storageKey="pickup"
              quickSuggestions={['Home', 'Work', 'Taxi Rank']}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Destination</Label>
          <div className="mt-1.5">
            <SmartLocationInput
              placeholder="Where are you going?"
              value={destination}
              onChange={setDestination}
              storageKey="destination"
              quickSuggestions={['Denlyn Mall', 'Municipal Clinic', 'Pick n Pay']}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={minDate}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Time
            </Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={scheduledDate === minDate ? minTime : undefined}
              className="mt-1.5"
            />
          </div>
        </div>

        {estimatedFare && (
          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated fare:</span>
            <span className="text-xl font-bold text-success">R{estimatedFare}</span>
          </div>
        )}

        <Button
          onClick={handleSchedule}
          disabled={!pickup || !destination || !scheduledDate || !scheduledTime || isBooking}
          className="w-full"
        >
          {isBooking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule Ride
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Schedule at least 1 hour in advance. A driver will be assigned closer to your pickup time.
        </p>
      </CardContent>
    </Card>
  );
};
