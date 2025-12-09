import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface DriverLocation {
  id: string;
  user_id: string;
  name: string;
  vehicle: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  eta_seconds: number;
  distance_meters: number;
  last_updated: string;
}

interface PresenceState {
  [key: string]: DriverLocation[];
}

export const useDriverPresence = (
  userLocation?: { latitude: number; longitude: number }
) => {
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverLocation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // Earth radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    },
    []
  );

  // Calculate ETA based on distance (assuming 30 km/h average in township)
  const calculateETA = useCallback((distanceMeters: number): number => {
    const avgSpeedMs = 30 * 1000 / 3600; // 30 km/h in m/s
    return Math.round(distanceMeters / avgSpeedMs);
  }, []);

  useEffect(() => {
    const driverChannel = supabase.channel('drivers-location', {
      config: {
        presence: {
          key: 'drivers',
        },
      },
    });

    driverChannel
      .on('presence', { event: 'sync' }, () => {
        const state = driverChannel.presenceState() as PresenceState;
        const allDrivers: DriverLocation[] = [];
        
        Object.values(state).forEach((presences) => {
          presences.forEach((driver) => {
            if (driver.status === 'available' && userLocation) {
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                driver.latitude,
                driver.longitude
              );
              const eta = calculateETA(distance);
              
              allDrivers.push({
                ...driver,
                distance_meters: distance,
                eta_seconds: eta,
              });
            } else if (driver.status === 'available') {
              allDrivers.push(driver);
            }
          });
        });

        // Sort by distance
        allDrivers.sort((a, b) => a.distance_meters - b.distance_meters);
        setNearbyDrivers(allDrivers.slice(0, 10)); // Top 10 nearest
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Driver joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Driver left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Connected to driver presence channel');
        }
      });

    setChannel(driverChannel);

    return () => {
      driverChannel.unsubscribe();
    };
  }, [userLocation, calculateDistance, calculateETA]);

  // Function for drivers to broadcast their location
  const broadcastDriverLocation = useCallback(
    async (driverData: Omit<DriverLocation, 'distance_meters' | 'eta_seconds'>) => {
      if (channel) {
        await channel.track(driverData);
      }
    },
    [channel]
  );

  return {
    nearbyDrivers,
    isConnected,
    broadcastDriverLocation,
    getNearestDriver: () => nearbyDrivers[0] || null,
  };
};
