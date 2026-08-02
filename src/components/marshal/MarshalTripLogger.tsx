import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardCheck, Loader2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Zone = { id: string; zone_name: string };
type QueueRow = {
  id: string;
  driver_id: string;
  vehicle_id: string | null;
  queue_position: number;
  status: string;
};
type DriverRow = { user_id: string; name: string; vehicle: string };

/**
 * Marshal trip logger — captures trips for passengers with no phone or no account.
 * Writes to trip_revenue stamped with the marshal's id (logged_by), which is what
 * the RLS insert policy checks.
 */
export const MarshalTripLogger = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [zones, setZones] = useState<Zone[]>([]);
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [zoneId, setZoneId] = useState<string>('');
  const [driverId, setDriverId] = useState<string>('');
  const [fare, setFare] = useState<string>('15');
  const [passengers, setPassengers] = useState<string>('1');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [destination, setDestination] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loggedToday, setLoggedToday] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('loading_zones')
        .select('id, zone_name')
        .eq('is_active', true)
        .order('zone_name');
      setZones(data || []);
      if (data?.length) setZoneId(data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!zoneId) return;
    (async () => {
      const { data: queueRows } = await supabase
        .from('zone_queue')
        .select('id, driver_id, vehicle_id, queue_position, status')
        .eq('zone_id', zoneId)
        .in('status', ['waiting', 'loading'])
        .order('queue_position');
      setQueue(queueRows || []);

      const ids = (queueRows || []).map((row) => row.driver_id);
      if (ids.length) {
        const { data: driverRows } = await supabase
          .from('drivers')
          .select('user_id, name, vehicle')
          .in('user_id', ids);
        setDrivers(driverRows || []);
      } else {
        setDrivers([]);
      }
      setDriverId(queueRows?.[0]?.driver_id || '');
    })();
  }, [zoneId]);

  const refreshCount = async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await (supabase as any)
      .from('trip_revenue')
      .select('id', { count: 'exact', head: true })
      .eq('logged_by', user.id)
      .eq('trip_date', today);
    setLoggedToday(count || 0);
  };

  useEffect(() => {
    refreshCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const driverName = useMemo(() => {
    const driver = drivers.find((d) => d.user_id === driverId);
    return driver ? `${driver.name} (${driver.vehicle})` : '';
  }, [drivers, driverId]);

  const zoneName = useMemo(
    () => zones.find((z) => z.id === zoneId)?.zone_name || '',
    [zones, zoneId]
  );

  const logTrip = async () => {
    if (!user) return;
    const fareAmount = Number(fare);
    const passengerCount = Number(passengers);

    if (!zoneId || !driverId) {
      toast({
        title: 'Pick a rank and a vehicle',
        description: 'Select the loading zone and the driver who took the trip.',
        variant: 'destructive',
      });
      return;
    }
    if (!Number.isFinite(fareAmount) || fareAmount <= 0 || fareAmount > 2000) {
      toast({
        title: 'Check the fare',
        description: 'Enter a fare between R1 and R2000.',
        variant: 'destructive',
      });
      return;
    }
    if (!Number.isInteger(passengerCount) || passengerCount < 1 || passengerCount > 20) {
      toast({
        title: 'Check passenger count',
        description: 'Enter between 1 and 20 passengers.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const queueEntry = queue.find((row) => row.driver_id === driverId);

      // Trip revenue belongs to the vehicle owner; fall back to the marshal
      // when the queue entry has no vehicle linked yet.
      let ownerId = user.id;
      if (queueEntry?.vehicle_id) {
        const { data: vehicle } = await supabase
          .from('vehicles')
          .select('owner_id')
          .eq('id', queueEntry.vehicle_id)
          .maybeSingle();
        if (vehicle?.owner_id) ownerId = vehicle.owner_id;
      }

      const { error } = await (supabase as any).from('trip_revenue').insert({
        owner_id: ownerId,
        driver_id: driverId,
        vehicle_id: queueEntry?.vehicle_id ?? null,
        fare_amount: fareAmount,
        payment_method: paymentMethod,
        passenger_count: passengerCount,
        logged_by: user.id,
        pickup_location: zoneName,
        dropoff_location: destination.trim().slice(0, 120) || null,
        trip_time: new Date().toTimeString().slice(0, 8),
        notes: 'Logged by marshal for passenger without app account',
      });

      if (error) throw error;

      toast({
        title: 'Trip logged',
        description: `R${fareAmount.toFixed(2)} · ${passengerCount} passenger(s) · ${paymentMethod}`,
      });
      setDestination('');
      setPassengers('1');
      refreshCount();
    } catch (error: any) {
      toast({
        title: 'Could not log trip',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Log a trip (cash / card passenger)
            </CardTitle>
            <CardDescription>
              For riders with no phone or no app account — the data still counts.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Users className="h-3 w-3 mr-1" />
            {loggedToday} today
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Loading zone</Label>
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.zone_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Driver / vehicle</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={queue.length ? 'Select driver' : 'Queue empty'} />
              </SelectTrigger>
              <SelectContent>
                {queue.map((row) => {
                  const driver = drivers.find((d) => d.user_id === row.driver_id);
                  return (
                    <SelectItem key={row.id} value={row.driver_id}>
                      #{row.queue_position} {driver?.name || 'Driver'}
                      {driver?.vehicle ? ` · ${driver.vehicle}` : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="marshal-fare">Fare (R)</Label>
            <Input
              id="marshal-fare"
              inputMode="decimal"
              value={fare}
              onChange={(e) => setFare(e.target.value.replace(/[^\d.]/g, ''))}
              className="mt-1 h-12 text-lg"
            />
          </div>

          <div>
            <Label htmlFor="marshal-passengers">Passengers</Label>
            <Input
              id="marshal-passengers"
              inputMode="numeric"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value.replace(/\D/g, ''))}
              className="mt-1 h-12 text-lg"
            />
          </div>

          <div>
            <Label>Payment</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="app">In-app</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="marshal-destination">Destination (optional)</Label>
            <Input
              id="marshal-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Denlyn Mall"
              maxLength={120}
              className="mt-1 h-12"
            />
          </div>
        </div>

        <Button onClick={logTrip} disabled={saving} className="w-full h-12 text-base">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {saving ? 'Saving…' : `Log trip${driverName ? ` — ${driverName}` : ''}`}
        </Button>
      </CardContent>
    </Card>
  );
};
