import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Shield, Loader2, AlertTriangle } from 'lucide-react';

interface DriverInfo {
  name: string;
  vehicle: string;
  location: string;
  status: string | null;
  rating: number | null;
  updated_at: string | null;
}

const LiveTrack = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const parseLocation = (loc: string): { lat: number; lng: number } | null => {
    if (!loc) return null;
    const parts = loc.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  };

  useEffect(() => {
    if (!driverId) { setError('No driver ID provided'); setLoading(false); return; }

    const fetchDriver = async () => {
      const { data, error: err } = await supabase
        .from('drivers')
        .select('name, vehicle, location, status, rating, updated_at')
        .eq('user_id', driverId)
        .single();

      if (err || !data) {
        setError('Driver not found or not currently sharing location.');
        setLoading(false);
        return;
      }

      setDriver(data);
      setCoords(parseLocation(data.location));
      setLastUpdate(data.updated_at ? new Date(data.updated_at) : null);
      setLoading(false);
    };

    fetchDriver();

    // Real-time subscription
    const channel = supabase
      .channel(`driver-track-${driverId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'drivers',
        filter: `user_id=eq.${driverId}`,
      }, (payload) => {
        const d = payload.new as any;
        setDriver(prev => prev ? { ...prev, location: d.location, status: d.status, updated_at: d.updated_at } : prev);
        setCoords(parseLocation(d.location));
        setLastUpdate(d.updated_at ? new Date(d.updated_at) : null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [driverId]);

  const timeSinceUpdate = () => {
    if (!lastUpdate) return 'Unknown';
    const diff = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Tracking Unavailable</h2>
            <p className="text-muted-foreground">{error || 'Driver not found.'}</p>
            <p className="text-xs text-muted-foreground">The driver may have ended their shift or the link may have expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOnline = driver.status === 'online';
  const googleMapsUrl = coords 
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` 
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            <span className="font-bold text-sm">MojaRide Live Tracking</span>
          </div>
          <Badge variant={isOnline ? "secondary" : "outline"} className={isOnline ? "bg-[hsl(var(--success))] text-primary-foreground" : ""}>
            {isOnline ? '● LIVE' : '○ Offline'}
          </Badge>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Driver info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🚐</span>
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">{driver.name}</h2>
                <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                {driver.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-sm font-medium">{driver.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeSinceUpdate()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map embed */}
        {coords ? (
          <Card className="overflow-hidden">
            <div className="relative">
              <iframe
                title="Driver Location"
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`}
              />
              <div className="absolute bottom-3 right-3">
                <a 
                  href={googleMapsUrl!} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-1.5"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Maps
                </a>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </span>
                <span className="text-xs text-muted-foreground">Auto-refreshing</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Waiting for driver's GPS signal...</p>
            </CardContent>
          </Card>
        )}

        {/* Safety notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Shield className="h-4 w-4 flex-shrink-0" />
          <span>This tracking link is active while the driver is on shift. Location updates every few seconds via MojaRide.</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTrack;
