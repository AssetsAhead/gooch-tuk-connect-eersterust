import { useState, useEffect, useCallback, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  LogOut, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Target
} from "lucide-react";
import { useZoneQueue, LoadingZone } from '@/hooks/useZoneQueue';
import { AuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const DriverQueueStatus = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const { 
    zones, 
    joinQueue, 
    leaveQueue, 
    updateLocation, 
    isWithinZone,
    calculateDistance 
  } = useZoneQueue();

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyZones, setNearbyZones] = useState<(LoadingZone & { distance: number })[]>([]);
  const [activeQueueEntry, setActiveQueueEntry] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Check for active queue entry
  const checkActiveQueue = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('zone_queue')
      .select(`
        *,
        loading_zones (
          zone_name,
          zone_type,
          latitude,
          longitude,
          radius_meters
        )
      `)
      .eq('driver_id', user.id)
      .in('status', ['waiting', 'loading'])
      .maybeSingle();

    setActiveQueueEntry(data);
  }, [user?.id]);

  // Start location tracking
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setLocationError(null);

        // Update location in active queue entry
        if (activeQueueEntry) {
          updateLocation(activeQueueEntry.id, location);
        }

        // Calculate nearby zones
        const nearby = zones
          .map(zone => ({
            ...zone,
            distance: calculateDistance(zone.latitude, zone.longitude, location.lat, location.lng)
          }))
          .filter(zone => zone.distance <= 500) // Within 500m
          .sort((a, b) => a.distance - b.distance);

        setNearbyZones(nearby);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError(
          error.code === 1 
            ? 'Location access denied. Please enable GPS.' 
            : 'Unable to get your location'
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    setWatchId(id);
  }, [zones, activeQueueEntry, updateLocation, calculateDistance]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Handle joining queue
  const handleJoinQueue = async (zoneId: string) => {
    if (!user?.id || !currentLocation) return;

    setIsJoining(true);
    try {
      await joinQueue(zoneId, user.id, currentLocation);
      await checkActiveQueue();
    } finally {
      setIsJoining(false);
    }
  };

  // Handle leaving queue
  const handleLeaveQueue = async () => {
    if (!activeQueueEntry) return;
    await leaveQueue(activeQueueEntry.id);
    setActiveQueueEntry(null);
  };

  useEffect(() => {
    checkActiveQueue();
    startLocationTracking();

    return () => {
      stopLocationTracking();
    };
  }, [user?.id]);

  useEffect(() => {
    // Re-calculate nearby zones when zones or location change
    if (currentLocation && zones.length > 0) {
      const nearby = zones
        .map(zone => ({
          ...zone,
          distance: calculateDistance(zone.latitude, zone.longitude, currentLocation.lat, currentLocation.lng)
        }))
        .filter(zone => zone.distance <= 500)
        .sort((a, b) => a.distance - b.distance);

      setNearbyZones(nearby);
    }
  }, [zones, currentLocation, calculateDistance]);

  // Subscribe to queue updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`driver-queue-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'zone_queue',
          filter: `driver_id=eq.${user.id}`
        },
        () => {
          checkActiveQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, checkActiveQueue]);

  const getZoneTypeIcon = (type: string) => {
    switch (type) {
      case 'station': return '🚉';
      case 'mall': return '🏬';
      case 'hospital': return '🏥';
      case 'rank': return '🚕';
      default: return '📍';
    }
  };

  if (locationError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {locationError}
          <Button 
            variant="link" 
            className="ml-2 p-0 h-auto" 
            onClick={startLocationTracking}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Queue Status */}
      {activeQueueEntry && (
        <Card className="border-2 border-success">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center text-success">
                <CheckCircle className="mr-2 h-5 w-5" />
                You're In Queue
              </span>
              <Badge className="text-lg px-4 py-1 bg-success">
                #{activeQueueEntry.queue_position}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {getZoneTypeIcon(activeQueueEntry.loading_zones?.zone_type)}
                  </span>
                  <div>
                    <p className="font-medium">{activeQueueEntry.loading_zones?.zone_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Joined {new Date(activeQueueEntry.joined_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {activeQueueEntry.is_gps_verified ? (
                    <Badge className="bg-success">
                      <Navigation className="h-3 w-3 mr-1" />
                      GPS OK
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Outside Zone
                    </Badge>
                  )}
                </div>
              </div>

              {activeQueueEntry.status === 'loading' && (
                <Alert className="bg-warning/10 border-warning">
                  <AlertDescription className="text-warning font-medium">
                    🚗 It's your turn! Start loading passengers.
                  </AlertDescription>
                </Alert>
              )}

              {activeQueueEntry.queue_position === 1 && activeQueueEntry.status === 'waiting' && (
                <Alert className="bg-success/10 border-success">
                  <AlertDescription className="text-success font-medium">
                    ⏳ You're next! Get ready to load.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                variant="outline" 
                className="w-full text-destructive border-destructive"
                onClick={handleLeaveQueue}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Queue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby Zones (if not in queue) */}
      {!activeQueueEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Nearby Loading Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentLocation ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Getting your location...</span>
              </div>
            ) : nearbyZones.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No loading zones within 500m</p>
                <p className="text-sm">Move closer to a zone to join its queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyZones.map((zone) => {
                  const canJoin = zone.distance <= zone.radius_meters;
                  
                  return (
                    <div 
                      key={zone.id} 
                      className={`p-4 rounded-lg border-2 ${
                        canJoin ? 'border-success bg-success/5' : 'border-transparent bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getZoneTypeIcon(zone.zone_type)}</span>
                          <div>
                            <p className="font-medium">{zone.zone_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(zone.distance)}m away
                              {canJoin && (
                                <span className="text-success ml-2">• Within range</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={!canJoin || isJoining}
                          className={canJoin ? 'bg-success hover:bg-success/90' : ''}
                          onClick={() => handleJoinQueue(zone.id)}
                        >
                          {isJoining ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : canJoin ? (
                            'Join Queue'
                          ) : (
                            `${Math.round(zone.distance - zone.radius_meters)}m to go`
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
