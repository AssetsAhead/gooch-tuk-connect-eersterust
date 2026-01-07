import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LoadingZone {
  id: string;
  zone_name: string;
  zone_type: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  municipality: string | null;
  ward: string | null;
  address: string | null;
  has_marshal: boolean;
  is_active: boolean;
}

export interface QueueEntry {
  id: string;
  zone_id: string;
  driver_id: string;
  vehicle_id: string | null;
  fleet_vehicle_id: string | null;
  queue_position: number;
  status: 'waiting' | 'loading' | 'departed' | 'skipped' | 'removed';
  joined_at: string;
  loading_started_at: string | null;
  departed_at: string | null;
  latitude: number | null;
  longitude: number | null;
  last_location_update: string | null;
  is_gps_verified: boolean;
  distance_from_zone: number | null;
  skip_count: number;
  notes: string | null;
  // Joined data
  driver_name?: string;
  vehicle_registration?: string;
}

interface UseZoneQueueOptions {
  zoneId?: string;
  autoRefresh?: boolean;
}

export const useZoneQueue = (options: UseZoneQueueOptions = {}) => {
  const { zoneId, autoRefresh = true } = options;
  const { toast } = useToast();
  
  const [zones, setZones] = useState<LoadingZone[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<LoadingZone | null>(null);

  // Fetch all active loading zones
  const fetchZones = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('loading_zones')
        .select('*')
        .eq('is_active', true)
        .order('zone_name');

      if (error) throw error;
      setZones(data || []);
      
      // Auto-select zone if zoneId provided
      if (zoneId && data) {
        const zone = data.find(z => z.id === zoneId);
        if (zone) setSelectedZone(zone);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  }, [zoneId]);

  // Fetch queue for a specific zone
  const fetchQueue = useCallback(async (targetZoneId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('zone_queue')
        .select(`
          *,
          drivers:driver_id (
            name,
            vehicle
          ),
          fleet_vehicles:fleet_vehicle_id (
            registration,
            driver_name
          )
        `)
        .eq('zone_id', targetZoneId)
        .eq('status', 'waiting')
        .order('queue_position', { ascending: true });

      if (error) throw error;

      const formattedQueue: QueueEntry[] = (data || []).map((entry: any) => ({
        ...entry,
        driver_name: entry.drivers?.name || entry.fleet_vehicles?.driver_name || 'Unknown',
        vehicle_registration: entry.fleet_vehicles?.registration || entry.drivers?.vehicle || 'N/A'
      }));

      setQueue(formattedQueue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if coordinates are within a zone
  const isWithinZone = (zone: LoadingZone, lat: number, lng: number): boolean => {
    const distance = calculateDistance(zone.latitude, zone.longitude, lat, lng);
    return distance <= zone.radius_meters;
  };

  // Join queue at a zone (driver action)
  const joinQueue = useCallback(async (
    targetZoneId: string, 
    driverId: string, 
    location: { lat: number; lng: number },
    vehicleId?: string,
    fleetVehicleId?: string
  ) => {
    try {
      const zone = zones.find(z => z.id === targetZoneId);
      if (!zone) throw new Error('Zone not found');

      const distance = calculateDistance(zone.latitude, zone.longitude, location.lat, location.lng);
      const isVerified = distance <= zone.radius_meters;

      if (!isVerified) {
        toast({
          title: "Too far from zone",
          description: `You must be within ${zone.radius_meters}m of the zone to join the queue. Current distance: ${Math.round(distance)}m`,
          variant: "destructive"
        });
        return null;
      }

      // Get next queue position
      const { data: positionData } = await supabase.rpc('get_next_queue_position', { _zone_id: targetZoneId });
      const nextPosition = positionData || 1;

      const { data, error } = await supabase
        .from('zone_queue')
        .insert({
          zone_id: targetZoneId,
          driver_id: driverId,
          vehicle_id: vehicleId || null,
          fleet_vehicle_id: fleetVehicleId || null,
          queue_position: nextPosition,
          latitude: location.lat,
          longitude: location.lng,
          last_location_update: new Date().toISOString(),
          is_gps_verified: isVerified,
          distance_from_zone: distance,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Joined queue",
        description: `You are now #${nextPosition} in the queue at ${zone.zone_name}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error joining queue:', error);
      toast({
        title: "Failed to join queue",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  }, [zones, toast]);

  // Update driver location in queue
  const updateLocation = useCallback(async (
    queueEntryId: string, 
    location: { lat: number; lng: number }
  ) => {
    try {
      const entry = queue.find(q => q.id === queueEntryId);
      if (!entry) return;

      const zone = zones.find(z => z.id === entry.zone_id);
      if (!zone) return;

      const distance = calculateDistance(zone.latitude, zone.longitude, location.lat, location.lng);
      const isVerified = distance <= zone.radius_meters;

      await supabase
        .from('zone_queue')
        .update({
          latitude: location.lat,
          longitude: location.lng,
          last_location_update: new Date().toISOString(),
          is_gps_verified: isVerified,
          distance_from_zone: distance
        })
        .eq('id', queueEntryId);

      // Warn if driver left zone
      if (!isVerified && entry.is_gps_verified) {
        toast({
          title: "Left zone boundary",
          description: "Return to the zone or you may lose your queue position",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, [queue, zones, toast]);

  // Mark driver as loading (marshal action)
  const startLoading = useCallback(async (queueEntryId: string) => {
    try {
      const { error } = await supabase
        .from('zone_queue')
        .update({
          status: 'loading',
          loading_started_at: new Date().toISOString()
        })
        .eq('id', queueEntryId);

      if (error) throw error;

      toast({ title: "Loading started", description: "Driver is now loading passengers" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  // Mark driver as departed (marshal action)
  const markDeparted = useCallback(async (queueEntryId: string) => {
    try {
      const { error } = await supabase
        .from('zone_queue')
        .update({
          status: 'departed',
          departed_at: new Date().toISOString()
        })
        .eq('id', queueEntryId);

      if (error) throw error;

      toast({ title: "Departed", description: "Driver marked as departed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  // Skip a driver (marshal action)
  const skipDriver = useCallback(async (queueEntryId: string, reason?: string) => {
    try {
      const entry = queue.find(q => q.id === queueEntryId);
      if (!entry) return;

      // Get the last position
      const lastPosition = Math.max(...queue.map(q => q.queue_position));

      const { error } = await supabase
        .from('zone_queue')
        .update({
          queue_position: lastPosition + 1,
          skip_count: entry.skip_count + 1,
          notes: reason ? `Skipped: ${reason}` : entry.notes
        })
        .eq('id', queueEntryId);

      if (error) throw error;

      toast({ 
        title: "Driver skipped", 
        description: `Moved to position ${lastPosition + 1}` 
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [queue, toast]);

  // Remove driver from queue (marshal action)
  const removeFromQueue = useCallback(async (queueEntryId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('zone_queue')
        .update({
          status: 'removed',
          notes: reason ? `Removed: ${reason}` : null
        })
        .eq('id', queueEntryId);

      if (error) throw error;

      toast({ title: "Removed from queue", description: reason || "Driver removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  // Leave queue (driver action)
  const leaveQueue = useCallback(async (queueEntryId: string) => {
    try {
      const { error } = await supabase
        .from('zone_queue')
        .update({ status: 'departed' })
        .eq('id', queueEntryId);

      if (error) throw error;

      toast({ title: "Left queue", description: "You have left the queue" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  // Set up realtime subscription
  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    const targetZoneId = selectedZone?.id || zoneId;
    if (!targetZoneId) return;

    fetchQueue(targetZoneId);

    if (!autoRefresh) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`zone-queue-${targetZoneId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'zone_queue',
          filter: `zone_id=eq.${targetZoneId}`
        },
        () => {
          fetchQueue(targetZoneId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedZone?.id, zoneId, fetchQueue, autoRefresh]);

  return {
    zones,
    queue,
    isLoading,
    selectedZone,
    setSelectedZone,
    fetchQueue,
    joinQueue,
    updateLocation,
    startLoading,
    markDeparted,
    skipDriver,
    removeFromQueue,
    leaveQueue,
    isWithinZone,
    calculateDistance
  };
};
