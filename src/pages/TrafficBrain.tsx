import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  Car,
  MapPin,
  Radio,
  ShieldAlert,
  Users,
  Waypoints,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type SignalKind =
  | "queue"
  | "incident"
  | "infringement"
  | "ride"
  | "panic"
  | "location";

interface Signal {
  id: string;
  kind: SignalKind;
  title: string;
  detail: string;
  severity: "info" | "warning" | "critical";
  ts: string;
  zone?: string | null;
}

interface ZoneStatus {
  id: string;
  name: string;
  depth: number;
  status: "healthy" | "congested" | "stalled" | "idle";
  lastMovementMin: number | null;
}

const KIND_META: Record<
  SignalKind,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  queue: { label: "Zone Queue", icon: Waypoints, color: "text-blue-500" },
  incident: { label: "AI Incident", icon: AlertTriangle, color: "text-amber-500" },
  infringement: { label: "Infringement", icon: ShieldAlert, color: "text-orange-500" },
  ride: { label: "Booking", icon: Car, color: "text-emerald-500" },
  panic: { label: "Panic", icon: Radio, color: "text-red-500" },
  location: { label: "Fleet Move", icon: MapPin, color: "text-purple-500" },
};

const severityVariant: Record<Signal["severity"], "default" | "secondary" | "destructive"> = {
  info: "secondary",
  warning: "default",
  critical: "destructive",
};

export default function TrafficBrain() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [zones, setZones] = useState<ZoneStatus[]>([]);
  const [filter, setFilter] = useState<SignalKind | "all">("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(); // last 6h

    const [
      { data: zoneRows },
      { data: queueRows },
      { data: incidentRows },
      { data: infrRows },
      { data: rideRows },
      { data: panicRows },
      { data: locRows },
    ] = await Promise.all([
      supabase.from("loading_zones").select("id, zone_name").eq("is_active", true),
      supabase
        .from("zone_queue")
        .select("id, zone_id, driver_id, status, joined_at, loading_started_at, departed_at, queue_position")
        .gte("joined_at", since)
        .order("joined_at", { ascending: false })
        .limit(200),
      supabase
        .from("ai_incidents")
        .select("id, incident_type, severity, description, created_at, location")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("road_infringements")
        .select("id, infringement_type, severity, status, created_at, location_description")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("rides")
        .select("id, pickup_location, destination, status, created_at, ride_type")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("panic_alerts")
        .select("id, alert_type, status, created_at, location")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("live_vehicle_locations")
        .select("id, vehicle_id, status, updated_at, latitude, longitude")
        .gte("updated_at", since)
        .order("updated_at", { ascending: false })
        .limit(50),
    ]);

    const zoneMap = new Map((zoneRows ?? []).map((z: any) => [z.id, z.zone_name]));

    const list: Signal[] = [];

    (queueRows ?? []).forEach((r: any) => {
      const ts = r.departed_at || r.loading_started_at || r.joined_at;
      const label =
        r.status === "departed"
          ? "Vehicle departed zone"
          : r.status === "loading"
          ? "Loading passengers"
          : `Joined queue at position #${r.queue_position}`;
      list.push({
        id: `q-${r.id}-${r.status}`,
        kind: "queue",
        title: label,
        detail: zoneMap.get(r.zone_id) || "Unknown zone",
        severity: "info",
        ts,
        zone: zoneMap.get(r.zone_id) as string | undefined,
      });
    });

    (incidentRows ?? []).forEach((r: any) =>
      list.push({
        id: `i-${r.id}`,
        kind: "incident",
        title: r.incident_type || "AI incident",
        detail: r.description || "Detected by camera",
        severity: r.severity === "high" || r.severity === "critical" ? "critical" : "warning",
        ts: r.created_at,
      }),
    );

    (infrRows ?? []).forEach((r: any) =>
      list.push({
        id: `f-${r.id}`,
        kind: "infringement",
        title: r.infringement_type,
        detail: `${r.location_description || "Unknown location"} • ${r.status}`,
        severity: r.severity === "critical" ? "critical" : "warning",
        ts: r.created_at,
      }),
    );

    (rideRows ?? []).forEach((r: any) =>
      list.push({
        id: `r-${r.id}`,
        kind: "ride",
        title: `Ride ${r.status || "requested"}`,
        detail: `${r.pickup_location} → ${r.destination}`,
        severity: "info",
        ts: r.created_at,
      }),
    );

    (panicRows ?? []).forEach((r: any) =>
      list.push({
        id: `p-${r.id}`,
        kind: "panic",
        title: `Panic: ${r.alert_type}`,
        detail: `Status ${r.status}`,
        severity: "critical",
        ts: r.created_at,
      }),
    );

    (locRows ?? []).forEach((r: any) =>
      list.push({
        id: `l-${r.id}-${r.updated_at}`,
        kind: "location",
        title: "Fleet vehicle update",
        detail: `${r.status || "moving"} @ ${Number(r.latitude).toFixed(3)}, ${Number(r.longitude).toFixed(3)}`,
        severity: "info",
        ts: r.updated_at,
      }),
    );

    list.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    setSignals(list);

    // Zone status derivation
    const byZone = new Map<string, { depth: number; lastMove: number | null }>();
    (queueRows ?? []).forEach((r: any) => {
      const key = r.zone_id;
      if (!byZone.has(key)) byZone.set(key, { depth: 0, lastMove: null });
      const b = byZone.get(key)!;
      if (r.status === "waiting") b.depth += 1;
      const moveTs = r.departed_at || r.loading_started_at;
      if (moveTs) {
        const mins = (Date.now() - new Date(moveTs).getTime()) / 60000;
        if (b.lastMove === null || mins < b.lastMove) b.lastMove = mins;
      }
    });

    const zStatuses: ZoneStatus[] = (zoneRows ?? []).map((z: any) => {
      const b = byZone.get(z.id) || { depth: 0, lastMove: null };
      let status: ZoneStatus["status"] = "idle";
      if (b.depth === 0) status = "idle";
      else if (b.lastMove !== null && b.lastMove > 30 && b.depth >= 3) status = "stalled";
      else if (b.depth >= 8) status = "congested";
      else status = "healthy";
      return {
        id: z.id,
        name: z.zone_name,
        depth: b.depth,
        lastMovementMin: b.lastMove,
        status,
      };
    });
    setZones(zStatuses);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 30_000);

    const ch = supabase
      .channel("traffic-brain-fusion")
      .on("postgres_changes", { event: "*", schema: "public", table: "zone_queue" }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ai_incidents" }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "road_infringements" }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "panic_alerts" }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rides" }, load)
      .subscribe();

    return () => {
      clearInterval(iv);
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? signals : signals.filter((s) => s.kind === filter)),
    [signals, filter],
  );

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: signals.length };
    signals.forEach((s) => (base[s.kind] = (base[s.kind] || 0) + 1));
    return base;
  }, [signals]);

  const criticalCount = signals.filter((s) => s.severity === "critical").length;
  const stalledZones = zones.filter((z) => z.status === "stalled").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Traffic Brain</h1>
              <Badge variant="outline" className="ml-2">MVP · v0</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              City-scale situational awareness. Fuses loading-zone queues, AI camera incidents,
              AARTO infringements, bookings, panic alerts and fleet telemetry into one live timeline.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </header>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Signals (6h)" value={signals.length} icon={Activity} />
          <StatCard label="Critical" value={criticalCount} icon={AlertTriangle} tone="destructive" />
          <StatCard label="Active zones" value={zones.length} icon={Waypoints} />
          <StatCard label="Stalled zones" value={stalledZones} icon={Users} tone={stalledZones ? "warning" : "default"} />
        </div>

        {/* Zone strip */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Zone status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {zones.length === 0 && (
                <p className="text-sm text-muted-foreground">No active loading zones.</p>
              )}
              {zones.map((z) => (
                <div
                  key={z.id}
                  className="min-w-[180px] rounded-lg border p-3 flex-shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{z.name}</span>
                    <ZoneBadge status={z.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Queue depth: <span className="font-semibold text-foreground">{z.depth}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last movement:{" "}
                    {z.lastMovementMin === null
                      ? "—"
                      : `${Math.round(z.lastMovementMin)}m ago`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unified timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fused timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <div className="overflow-x-auto">
                <TabsList>
                  <TabsTrigger value="all">All ({counts.all || 0})</TabsTrigger>
                  {(Object.keys(KIND_META) as SignalKind[]).map((k) => (
                    <TabsTrigger key={k} value={k}>
                      {KIND_META[k].label} ({counts[k] || 0})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={filter} className="mt-4">
                <ScrollArea className="h-[520px] pr-3">
                  <ol className="relative border-l border-border ml-3">
                    {filtered.length === 0 && (
                      <li className="ml-4 py-6 text-sm text-muted-foreground">
                        No signals in this window.
                      </li>
                    )}
                    {filtered.map((s) => {
                      const meta = KIND_META[s.kind];
                      const Icon = meta.icon;
                      return (
                        <li key={s.id} className="mb-4 ml-6">
                          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border">
                            <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                          </span>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{s.title}</span>
                                <Badge variant={severityVariant[s.severity]} className="text-[10px] py-0">
                                  {s.severity}
                                </Badge>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {meta.label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {s.detail}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(s.ts), { addSuffix: true })}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Spec */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">MVP spec</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4 leading-relaxed">
            <section>
              <h3 className="font-semibold mb-1">Data sources (live)</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                <li><code>zone_queue</code> + <code>loading_zones</code> — queue depth, movement</li>
                <li><code>ai_incidents</code> — camera-detected events</li>
                <li><code>road_infringements</code> — AARTO-mapped violations</li>
                <li><code>rides</code> + <code>ride_updates</code> — booking + hailing state</li>
                <li><code>panic_alerts</code> + <code>emergency_messages</code> — safety</li>
                <li><code>live_vehicle_locations</code> + <code>fleet_vehicles</code> — telemetry</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold mb-1">Model outputs (v0 — rules)</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                <li>Per-zone status: <em>idle · healthy · congested · stalled</em></li>
                <li>Anomaly flags: queue stalled &gt;30 min with depth ≥3; panic near zone; incident on active route</li>
                <li>Demand signal: rides requested vs queue depth (15 min window)</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold mb-1">First user roles</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                <li><strong>Admin</strong> — full fused view</li>
                <li><strong>Marshall</strong> — zone-scoped operational view</li>
                <li><em>Owner read-only view — phase 2</em></li>
                <li><em>Government portal — deferred (north-star)</em></li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold mb-1">Out of scope for MVP</h3>
              <p className="text-muted-foreground">
                ML forecasting, cross-modal orchestration, automated evidence packs,
                government API push, Tsinglink DVR fusion (pilot-dependent).
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warning" | "destructive";
}) {
  const toneCls =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
      ? "text-amber-500"
      : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${toneCls}`}>{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${toneCls}`} />
      </CardContent>
    </Card>
  );
}

function ZoneBadge({ status }: { status: ZoneStatus["status"] }) {
  const map: Record<ZoneStatus["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    idle: { label: "idle", variant: "outline" },
    healthy: { label: "healthy", variant: "secondary" },
    congested: { label: "congested", variant: "default" },
    stalled: { label: "stalled", variant: "destructive" },
  };
  const m = map[status];
  return <Badge variant={m.variant} className="text-[10px] py-0">{m.label}</Badge>;
}
