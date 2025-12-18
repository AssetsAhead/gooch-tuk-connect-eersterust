import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Check, 
  X, 
  Navigation,
  Bell,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapsButton } from '@/components/MapsButton';

interface RideRequest {
  id: string;
  pickup_location: string;
  destination: string;
  price: number;
  ride_type: string;
  created_at: string;
  scheduled_for?: string;
}

interface IncomingRideRequestsProps {
  driverId: string;
  onRideAccepted?: (ride: RideRequest) => void;
}

export const IncomingRideRequests = ({ 
  driverId, 
  onRideAccepted 
}: IncomingRideRequestsProps) => {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'requested')
        .is('driver_id', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching ride requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Real-time subscription
    const channel = supabase
      .channel('ride-requests')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'rides',
          filter: 'status=eq.requested'
        },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAccept = async (ride: RideRequest) => {
    setProcessingId(ride.id);
    try {
      const { error } = await supabase
        .from('rides')
        .update({ 
          driver_id: driverId, 
          status: 'accepted' 
        })
        .eq('id', ride.id)
        .eq('status', 'requested'); // Ensure still available

      if (error) throw error;

      toast({
        title: '✅ Ride Accepted',
        description: `Heading to ${ride.pickup_location}`
      });

      setRequests(prev => prev.filter(r => r.id !== ride.id));
      onRideAccepted?.(ride);
    } catch (error: any) {
      toast({
        title: 'Could not accept ride',
        description: 'This ride may have been taken by another driver',
        variant: 'destructive'
      });
      fetchRequests();
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = (rideId: string) => {
    // Simply remove from local view - doesn't affect DB
    setRequests(prev => prev.filter(r => r.id !== rideId));
    toast({
      title: 'Ride declined',
      description: 'You will not see this ride request again'
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading ride requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Incoming Ride Requests
          </div>
          <Badge variant="outline" className="animate-pulse">
            {requests.length} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Navigation className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No ride requests at the moment</p>
            <p className="text-sm">New requests will appear here automatically</p>
          </div>
        ) : (
          requests.map((ride) => (
            <div 
              key={ride.id}
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-success shrink-0" />
                    <span className="font-medium truncate">{ride.pickup_location}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground truncate">{ride.destination}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-success font-bold">
                      <DollarSign className="h-4 w-4" />
                      R{ride.price}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {getTimeAgo(ride.created_at)}
                    </div>
                    {ride.scheduled_for && (
                      <Badge variant="secondary" className="text-xs">
                        Scheduled
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <MapsButton 
                    destination={ride.pickup_location}
                    variant="outline"
                    size="sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDecline(ride.id)}
                      disabled={processingId === ride.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-success hover:bg-success/90"
                      onClick={() => handleAccept(ride)}
                      disabled={processingId === ride.id}
                    >
                      {processingId === ride.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
