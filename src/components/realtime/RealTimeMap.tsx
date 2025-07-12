import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  id: string;
  name: string;
  location: string;
  status: string;
  rating: number;
  eta: number;
}

interface RideUpdate {
  id: string;
  driver_location: any;
  estimated_arrival: string | null;
  status_message: string | null;
  created_at: string;
}

interface RealTimeMapProps {
  rideId?: string;
  userType: 'driver' | 'passenger';
  showDrivers?: boolean;
}

export const RealTimeMap = ({ rideId, userType, showDrivers = true }: RealTimeMapProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rideUpdates, setRideUpdates] = useState<RideUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch nearby drivers
  const fetchNearbyDrivers = async () => {
    if (!showDrivers) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'online')
      .limit(10);

    if (error) {
      console.error('Error fetching drivers:', error);
    } else if (data) {
      setDrivers(data.map(driver => ({
        id: driver.id,
        name: driver.name,
        location: driver.location,
        status: driver.status || 'offline',
        rating: driver.rating || 4.5,
        eta: driver.eta || 5
      })));
    }
    setIsLoading(false);
  };

  // Fetch ride updates for active ride
  const fetchRideUpdates = async () => {
    if (!rideId) return;

    const { data, error } = await supabase
      .from('ride_updates')
      .select('*')
      .eq('ride_id', rideId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching ride updates:', error);
    } else if (data) {
      setRideUpdates(data);
    }
  };

  useEffect(() => {
    fetchNearbyDrivers();
    fetchRideUpdates();

    // Subscribe to real-time updates
    const driversChannel = supabase
      .channel('drivers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers',
        },
        () => {
          fetchNearbyDrivers();
        }
      )
      .subscribe();

    let rideUpdatesChannel;
    if (rideId) {
      rideUpdatesChannel = supabase
        .channel('ride-updates-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ride_updates',
            filter: `ride_id=eq.${rideId}`,
          },
          (payload) => {
            setRideUpdates(prev => [payload.new as RideUpdate, ...prev.slice(0, 4)]);
            
            if (payload.new.status_message) {
              toast({
                title: "Ride Update",
                description: payload.new.status_message,
              });
            }
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(driversChannel);
      if (rideUpdatesChannel) {
        supabase.removeChannel(rideUpdatesChannel);
      }
    };
  }, [rideId, showDrivers]);

  return (
    <div className="space-y-6">
      {/* Live Driver Map */}
      {showDrivers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Live Driver Map
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-success/10 text-success">
                  <Users className="h-3 w-3 mr-1" />
                  {drivers.length} online
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={fetchNearbyDrivers}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simulated Map Area */}
            <div className="relative h-64 bg-gradient-to-br from-primary/5 to-muted/20 rounded-lg border overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              
              {/* Map markers for drivers */}
              {drivers.slice(0, 8).map((driver, index) => {
                const positions = [
                  { top: '20%', left: '15%' },
                  { top: '30%', left: '70%' },
                  { top: '60%', left: '25%' },
                  { top: '45%', left: '80%' },
                  { top: '75%', left: '40%' },
                  { top: '15%', left: '60%' },
                  { top: '80%', left: '75%' },
                  { top: '35%', left: '45%' }
                ];
                
                return (
                  <div
                    key={driver.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={positions[index]}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                        🚗
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                      
                      {/* Driver info tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-background border rounded-lg p-2 shadow-lg whitespace-nowrap">
                          <div className="text-xs font-medium">{driver.name}</div>
                          <div className="text-xs text-muted-foreground">★ {driver.rating} • {driver.eta}min</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* User location */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-danger rounded-full border-2 border-background shadow-lg"></div>
                <div className="absolute inset-0 bg-danger/30 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Driver List */}
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {drivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{driver.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ★ {driver.rating} • {driver.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        driver.status === 'online' ? 'border-success text-success' : 'border-muted text-muted-foreground'
                      }`}
                    >
                      {driver.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{driver.eta}min</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Ride Updates */}
      {rideId && rideUpdates.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="h-5 w-5 mr-2 text-primary" />
              Live Tracking Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rideUpdates.map((update) => (
                <div key={update.id} className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    {update.status_message && (
                      <p className="text-sm font-medium">{update.status_message}</p>
                    )}
                    {update.estimated_arrival && (
                      <p className="text-xs text-muted-foreground">
                        ETA: {new Date(update.estimated_arrival).toLocaleTimeString()}
                      </p>
                    )}
                    {update.driver_location && typeof update.driver_location === 'object' && update.driver_location.lat && (
                      <p className="text-xs text-muted-foreground">
                        Location updated: {update.driver_location.lat.toFixed(4)}, {update.driver_location.lng.toFixed(4)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(update.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};