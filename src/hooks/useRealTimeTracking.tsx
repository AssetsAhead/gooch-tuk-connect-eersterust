import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RideUpdate {
  id: string;
  ride_id: string;
  driver_location: any;
  estimated_arrival: string | null;
  status_message: string | null;
  created_at: string;
}

interface Ride {
  id: string;
  passenger_id: string | null;
  driver_id: string | null;
  pickup_location: string;
  destination: string;
  price: number;
  ride_type: string;
  status: string | null;
  created_at: string | null;
}

export const useRealTimeTracking = (userId?: string, userType?: 'driver' | 'passenger') => {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [rideUpdates, setRideUpdates] = useState<RideUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch current active ride
  useEffect(() => {
    if (!userId || !userType) return;

    const fetchActiveRide = async () => {
      const column = userType === 'driver' ? 'driver_id' : 'passenger_id';
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq(column, userId)
        .in('status', ['requested', 'accepted', 'in_progress'])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active ride:', error);
        toast({
          title: "Error",
          description: "Failed to fetch active ride",
          variant: "destructive",
        });
      } else if (data) {
        setActiveRide(data);
      }
      setIsLoading(false);
    };

    fetchActiveRide();
  }, [userId, userType, toast]);

  // Fetch ride updates for active ride
  useEffect(() => {
    if (!activeRide) return;

    const fetchRideUpdates = async () => {
      const { data, error } = await supabase
        .from('ride_updates')
        .select('*')
        .eq('ride_id', activeRide.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ride updates:', error);
      } else {
        setRideUpdates((data || []).map(update => ({
          ...update,
          driver_location: update.driver_location as any
        })));
      }
    };

    fetchRideUpdates();
  }, [activeRide]);

  // Subscribe to real-time ride updates
  useEffect(() => {
    if (!activeRide) return;

    const rideChannel = supabase
      .channel('ride-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${activeRide.id}`,
        },
        (payload) => {
          setActiveRide(payload.new as Ride);
          toast({
            title: "Ride Update",
            description: `Ride status changed to: ${payload.new.status}`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ride_updates',
          filter: `ride_id=eq.${activeRide.id}`,
        },
        (payload) => {
          const newUpdate = payload.new as RideUpdate;
          setRideUpdates(prev => [newUpdate, ...prev]);
          
          if (newUpdate.status_message) {
            toast({
              title: "Driver Update",
              description: newUpdate.status_message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rideChannel);
    };
  }, [activeRide, toast]);

  // Function to update driver location (for drivers)
  const updateDriverLocation = async (location: { lat: number; lng: number }, estimatedArrival?: Date, statusMessage?: string) => {
    if (!activeRide || userType !== 'driver') return;

    const { error } = await supabase
      .from('ride_updates')
      .insert({
        ride_id: activeRide.id,
        driver_location: location,
        estimated_arrival: estimatedArrival?.toISOString(),
        status_message: statusMessage,
      });

    if (error) {
      console.error('Error updating driver location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    }
  };

  // Function to update ride status
  const updateRideStatus = async (status: string) => {
    if (!activeRide) return;

    const { error } = await supabase
      .from('rides')
      .update({ status })
      .eq('id', activeRide.id);

    if (error) {
      console.error('Error updating ride status:', error);
      toast({
        title: "Error",
        description: "Failed to update ride status",
        variant: "destructive",
      });
    }
  };

  // Function to accept a ride (for drivers)
  const acceptRide = async (rideId: string) => {
    if (!userId || userType !== 'driver') return;

    const { error } = await supabase
      .from('rides')
      .update({ 
        driver_id: userId,
        status: 'accepted'
      })
      .eq('id', rideId)
      .eq('status', 'requested');

    if (error) {
      console.error('Error accepting ride:', error);
      toast({
        title: "Error",
        description: "Failed to accept ride",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Ride Accepted",
      description: "You have successfully accepted the ride",
    });
    return true;
  };

  // Function to create a new ride (for passengers)
  const createRide = async (pickupLocation: string, destination: string, rideType: string, price: number) => {
    if (!userId || userType !== 'passenger') return;

    const { data, error } = await supabase
      .from('rides')
      .insert({
        passenger_id: userId,
        pickup_location: pickupLocation,
        destination: destination,
        ride_type: rideType,
        price: price,
        status: 'requested'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ride:', error);
      toast({
        title: "Error",
        description: "Failed to create ride request",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Ride Requested",
      description: "Your ride request has been sent to nearby drivers",
    });
    setActiveRide(data);
    return data;
  };

  return {
    activeRide,
    rideUpdates,
    isLoading,
    updateDriverLocation,
    updateRideStatus,
    acceptRide,
    createRide,
  };
};