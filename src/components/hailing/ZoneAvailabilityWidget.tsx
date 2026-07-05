import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Users, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Zone = {
  id: string;
  zone_name: string;
  municipality: string | null;
  has_marshal: boolean | null;
};

type QueueRow = {
  id: string;
  driver_id: string;
  vehicle_id: string | null;
  queue_position: number;
  joined_at: string;
  is_gps_verified: boolean | null;
  distance_from_zone: number | null;
};

type Availability = {
  zone: Zone;
  drivers_waiting: number;
  gps_verified_waiting: number;
  next_in_line: QueueRow | null;
  departures_last_hour: number;
  estimated_wait_minutes: number | null;
  status: "no_drivers_available" | "limited" | "available";
  queue: QueueRow[];
  generated_at: string;
};

/**
 * Loading-zone availability widget.
 *
 * Uses the same query shape as the `get_zone_availability` MCP tool
 * (zone_queue + loading_zones), so numbers here match what external
 * agents see over MCP.
 */
export function ZoneAvailabilityWidget() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneId, setZoneId] = useState<string>("");
  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load zones once.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("loading_zones")
        .select("id,zone_name,municipality,has_marshal")
        .eq("is_active", true)
        .order("zone_name", { ascending: true });
      if (!alive) return;
      if (error) {
        setError(error.message);
        return;
      }
      const list = (data ?? []) as Zone[];
      setZones(list);
      if (list.length > 0 && !zoneId) setZoneId(list[0].id);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAvailability(id: string) {
    setLoading(true);
    setError(null);
    try {
      const zone = zones.find((z) => z.id === id);
      if (!zone) throw new Error("Zone not found");

      const [{ data: queue, error: qErr }, { data: departures, error: dErr }] = await Promise.all([
        supabase
          .from("zone_queue")
          .select("id,driver_id,vehicle_id,queue_position,joined_at,is_gps_verified,distance_from_zone")
          .eq("zone_id", id)
          .eq("status", "waiting")
          .order("queue_position", { ascending: true }),
        supabase
          .from("zone_queue")
          .select("id,departed_at")
          .eq("zone_id", id)
          .not("departed_at", "is", null)
          .gte("departed_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()),
      ]);
      if (qErr) throw qErr;
      if (dErr) throw dErr;

      const waiting = (queue ?? []) as QueueRow[];
      const departuresPerHour = departures?.length ?? 0;
      const estimated =
        departuresPerHour > 0 ? Math.round((waiting.length / departuresPerHour) * 60) : null;

      setData({
        zone,
        drivers_waiting: waiting.length,
        gps_verified_waiting: waiting.filter((r) => r.is_gps_verified).length,
        next_in_line: waiting[0] ?? null,
        departures_last_hour: departuresPerHour,
        estimated_wait_minutes: estimated,
        status:
          waiting.length === 0 ? "no_drivers_available" : waiting.length < 3 ? "limited" : "available",
        queue: waiting,
        generated_at: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load availability");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // Refetch on zone change and every 30s.
  useEffect(() => {
    if (!zoneId) return;
    fetchAvailability(zoneId);
    const t = setInterval(() => fetchAvailability(zoneId), 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId, zones.length]);

  const statusBadge = useMemo(() => {
    if (!data) return null;
    if (data.status === "available")
      return (
        <Badge className="bg-green-600 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Available
        </Badge>
      );
    if (data.status === "limited")
      return (
        <Badge className="bg-amber-500 hover:bg-amber-500">
          <AlertCircle className="h-3 w-3 mr-1" /> Limited
        </Badge>
      );
    return (
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3 mr-1" /> No drivers
      </Badge>
    );
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" /> Zone availability
            </CardTitle>
            <CardDescription>
              Live queue depth, next-in-line and estimated wait — refreshes every 30s.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a loading zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.zone_name}
                    {z.municipality ? ` — ${z.municipality}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => zoneId && fetchAvailability(zoneId)}
              disabled={loading || !zoneId}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading && !data ? (
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : data ? (
          <>
            <div className="flex items-center gap-2">
              {statusBadge}
              {data.zone.has_marshal && <Badge variant="outline">Marshal on site</Badge>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> Queue depth
                </div>
                <div className="text-2xl font-semibold mt-1">{data.drivers_waiting}</div>
                <div className="text-xs text-muted-foreground">
                  {data.gps_verified_waiting} GPS-verified
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> Est. wait
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {data.estimated_wait_minutes == null
                    ? "—"
                    : `${data.estimated_wait_minutes}m`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.departures_last_hour}/hr departing
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Car className="h-3 w-3" /> Next in line
                </div>
                <div className="text-sm font-mono mt-1 truncate">
                  {data.next_in_line
                    ? `#${data.next_in_line.queue_position} · ${data.next_in_line.driver_id.slice(0, 8)}`
                    : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.next_in_line
                    ? `Joined ${new Date(data.next_in_line.joined_at).toLocaleTimeString()}`
                    : "Queue empty"}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Same data source as the <code>get_zone_availability</code> MCP tool ·{" "}
              {new Date(data.generated_at).toLocaleTimeString()}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select a zone to view availability.</p>
        )}
      </CardContent>
    </Card>
  );
}

// Local icon (avoids extra import churn).
function Car(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}
