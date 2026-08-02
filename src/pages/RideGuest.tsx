import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Users, Clock, RefreshCw, Shield, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FareEstimator } from '@/components/hailing/FareEstimator';
import { GlobalHeader } from '@/components/GlobalHeader';
import { Link } from 'react-router-dom';

type PublicZone = {
  zone_id: string;
  zone_name: string;
  zone_type: string;
  municipality: string | null;
  address: string | null;
  has_marshal: boolean;
  drivers_waiting: number;
  departures_last_hour: number;
  estimated_wait_minutes: number | null;
};

/**
 * Guest ride page — no account, no OTP, no login wall.
 * Passengers (including cash/card riders and elderly users) can check fares and
 * rank availability freely. Signing in is only offered for booking in-app.
 */
export default function RideGuest() {
  const [zones, setZones] = useState<PublicZone[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc('get_public_zone_availability');
    if (!error && data) setZones(data as PublicZone[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <header className="text-center pt-2">
          <h1 className="text-3xl font-bold mb-2">Find a ride</h1>
          <p className="text-muted-foreground">
            No account needed. Check the fare, see which rank has vehicles waiting, then pay
            the driver in cash or by card.
          </p>
        </header>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Vehicles waiting at ranks
                </CardTitle>
                <CardDescription>Updated every 30 seconds</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && zones.length === 0 ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : zones.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active ranks listed yet.
              </p>
            ) : (
              zones.map((zone) => (
                <div
                  key={zone.zone_id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{zone.zone_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {zone.address || zone.municipality || zone.zone_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {zone.has_marshal && (
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        <Shield className="h-3 w-3 mr-1" />
                        Marshal
                      </Badge>
                    )}
                    <Badge variant={zone.drivers_waiting > 0 ? 'default' : 'outline'}>
                      <Users className="h-3 w-3 mr-1" />
                      {zone.drivers_waiting}
                    </Badge>
                    {zone.estimated_wait_minutes !== null && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        ~{zone.estimated_wait_minutes}m
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <FareEstimator />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5 text-primary" />
              Paying without the app
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Cash and card are always accepted. The marshal on duty records the trip, so you
              never need a phone, an account or a verification code to ride.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="outline" size="sm">
                <Link to="/passenger-rights">Know your rights</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth">Sign in to book in-app</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
