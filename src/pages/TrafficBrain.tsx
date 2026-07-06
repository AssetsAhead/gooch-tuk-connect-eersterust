import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatDistanceToNow, format } from "date-fns";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet + bundlers)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  table: string;
  rowId: string;
  raw: Record<string, unknown>;
  coords?: { lat: number; lng: number } | null;
}

interface ZoneStatus {
  id: string;
  name: string;
  depth: number;
  status: "healthy" | "congested" | "stalled" | "idle";
  lastMovementMin: number | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
}

interface VehiclePoint {
  id: string;
  vehicle_id: string;
  lat: number;
  lng: number;
  status: string | null;
  updated_at: string;
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

// Robust coord extractor for varying `location` shapes: {lat,lng} | {latitude,longitude} | "lat,lng"
function extractCoords(loc: unknown): { lat: number; lng: number } | null {
  if (!loc) return null;
  if (typeof loc === "string") {
    const m = loc.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    try {
      return extractCoords(JSON.parse(loc));
    } catch {
      return null;
    }
  }
  if (typeof loc === "object") {
    const o = loc as Record<string, unknown>;
    const lat = Number(o.lat ?? o.latitude);
    const lng = Number(o.lng ?? o.lon ?? o.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}

export default function TrafficBrain() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [zones, setZones] = useState<ZoneStatus[]>([]);
  const [vehicles, setVehicles] = useState<VehiclePoint[]>([]);
  const [filter, setFilter] = useState<SignalKind | "all">("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Signal | null>(null);

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
      supabase
        .from("loading_zones")
        .select("id, zone_name, latitude, longitude, radius_meters")
        .eq("is_active", true),
      supabase
        .from("zone_queue")
        .select("*")
        .gte("joined_at", since)
        .order("joined_at", { ascending: false })
        .limit(200),
      supabase
        .from("ai_incidents")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("road_infringements")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("rides")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("panic_alerts")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("live_vehicle_locations")
        .select("*")
        .gte("updated_at", since)
        .order("updated_at", { ascending: false })
        .limit(100),
    ]);

    const zoneMap = new Map((zoneRows ?? []).map((z: any) => [z.id, z]));
    const list: Signal[] = [];

    (queueRows ?? []).forEach((r: any) => {
      const ts = r.departed_at || r.loading_started_at || r.joined_at;
      const label =
        r.status === "departed"
          ? "Vehicle departed zone"
          : r.status === "loading"
          ? "Loading passengers"
          : `Joined queue at position #${r.queue_position}`;
      const z = zoneMap.get(r.zone_id) as any;
      list.push({
        id: `q-${r.id}-${r.status}`,
        kind: "queue",
        title: label,
        detail: z?.zone_name || "Unknown zone",
        severity: "info",
        ts,
        zone: z?.zone_name,
        table: "zone_queue",
        rowId: r.id,
        raw: r,
        coords: z ? { lat: Number(z.latitude), lng: Number(z.longitude) } : null,
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
        table: "ai_incidents",
        rowId: r.id,
        raw: r,
        coords: extractCoords(r.location),
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
        table: "road_infringements",
        rowId: r.id,
        raw: r,
        coords: extractCoords(r.location) ?? (r.latitude && r.longitude ? { lat: Number(r.latitude), lng: Number(r.longitude) } : null),
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
        table: "rides",
        rowId: r.id,
        raw: r,
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
        table: "panic_alerts",
        rowId: r.id,
        raw: r,
        coords: extractCoords(r.location),
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
        table: "live_vehicle_locations",
        rowId: r.id,
        raw: r,
        coords: { lat: Number(r.latitude), lng: Number(r.longitude) },
      }),
    );

    list.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    setSignals(list);

    // Latest per vehicle for map
    const seen = new Set<string>();
    const vpts: VehiclePoint[] = [];
    (locRows ?? []).forEach((r: any) => {
      if (seen.has(r.vehicle_id)) return;
      seen.add(r.vehicle_id);
      vpts.push({
        id: r.id,
        vehicle_id: r.vehicle_id,
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        status: r.status,
        updated_at: r.updated_at,
      });
    });
    setVehicles(vpts);

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
        latitude: z.latitude !== null ? Number(z.latitude) : null,
        longitude: z.longitude !== null ? Number(z.longitude) : null,
        radius_meters: z.radius_meters !== null ? Number(z.radius_meters) : null,
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

  // Map center — first zone with coords, else Pretoria/Eersterust default
  const mapCenter = useMemo<[number, number]>(() => {
    const z = zones.find((x) => x.latitude !== null && x.longitude !== null);
    if (z) return [z.latitude!, z.longitude!];
    return [-25.7297, 28.3187]; // Eersterust default
  }, [zones]);

  const incidentPoints = signals.filter((s) => s.kind === "incident" && s.coords);
  const panicPoints = signals.filter((s) => s.kind === "panic" && s.coords);

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Signals (6h)" value={signals.length} icon={Activity} />
          <StatCard label="Critical" value={criticalCount} icon={AlertTriangle} tone="destructive" />
          <StatCard label="Active zones" value={zones.length} icon={Waypoints} />
          <StatCard label="Stalled zones" value={stalledZones} icon={Users} tone={stalledZones ? "warning" : "default"} />
        </div>

        {/* Live map */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Live map (6h window)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] w-full rounded-lg overflow-hidden border">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LayersControl position="topright">
                  <LayersControl.Overlay checked name="Loading zones">
                    <LayerGroup>
                      {zones
                        .filter((z) => z.latitude !== null && z.longitude !== null)
                        .map((z) => (
                          <Circle
                            key={z.id}
                            center={[z.latitude!, z.longitude!]}
                            radius={z.radius_meters ?? 100}
                            pathOptions={{
                              color:
                                z.status === "stalled"
                                  ? "#ef4444"
                                  : z.status === "congested"
                                  ? "#f59e0b"
                                  : z.status === "healthy"
                                  ? "#10b981"
                                  : "#6b7280",
                              fillOpacity: 0.15,
                              weight: 2,
                            }}
                          >
                            <Popup>
                              <div className="text-xs">
                                <div className="font-semibold">{z.name}</div>
                                <div>Status: {z.status}</div>
                                <div>Depth: {z.depth}</div>
                                <div>
                                  Last move:{" "}
                                  {z.lastMovementMin === null
                                    ? "—"
                                    : `${Math.round(z.lastMovementMin)}m ago`}
                                </div>
                              </div>
                            </Popup>
                          </Circle>
                        ))}
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay checked name="Fleet vehicles">
                    <LayerGroup>
                      {vehicles.map((v) => (
                        <Marker key={v.id} position={[v.lat, v.lng]}>
                          <Popup>
                            <div className="text-xs">
                              <div className="font-semibold">Vehicle {v.vehicle_id.slice(0, 8)}</div>
                              <div>Status: {v.status || "—"}</div>
                              <div>Updated: {formatDistanceToNow(new Date(v.updated_at), { addSuffix: true })}</div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay checked name="AI incidents">
                    <LayerGroup>
                      {incidentPoints.map((s) => (
                        <Circle
                          key={s.id}
                          center={[s.coords!.lat, s.coords!.lng]}
                          radius={150}
                          pathOptions={{ color: "#f59e0b", fillOpacity: 0.25, weight: 1 }}
                          eventHandlers={{ click: () => setSelected(s) }}
                        >
                          <Popup>
                            <div className="text-xs">
                              <div className="font-semibold">{s.title}</div>
                              <div>{s.detail}</div>
                              <div>{format(new Date(s.ts), "PPpp")}</div>
                            </div>
                          </Popup>
                        </Circle>
                      ))}
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay checked name="Panic alerts">
                    <LayerGroup>
                      {panicPoints.map((s) => (
                        <Circle
                          key={s.id}
                          center={[s.coords!.lat, s.coords!.lng]}
                          radius={250}
                          pathOptions={{ color: "#ef4444", fillOpacity: 0.3, weight: 2 }}
                          eventHandlers={{ click: () => setSelected(s) }}
                        >
                          <Popup>
                            <div className="text-xs">
                              <div className="font-semibold text-red-600">{s.title}</div>
                              <div>{s.detail}</div>
                              <div>{format(new Date(s.ts), "PPpp")}</div>
                            </div>
                          </Popup>
                        </Circle>
                      ))}
                    </LayerGroup>
                  </LayersControl.Overlay>
                </LayersControl>
              </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Zone rings colored by status. Amber = AI incidents (150m). Red = panic (250m). Click any item for details.
            </p>
          </CardContent>
        </Card>

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
                <div key={z.id} className="min-w-[180px] rounded-lg border p-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{z.name}</span>
                    <ZoneBadge status={z.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Queue depth: <span className="font-semibold text-foreground">{z.depth}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last movement:{" "}
                    {z.lastMovementMin === null ? "—" : `${Math.round(z.lastMovementMin)}m ago`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
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
                          <button
                            type="button"
                            onClick={() => setSelected(s)}
                            className="w-full text-left rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                          >
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
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.detail}</p>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(s.ts), { addSuffix: true })}
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <SignalDetailDialog signal={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}

function SignalDetailDialog({
  signal,
  onOpenChange,
}: {
  signal: Signal | null;
  onOpenChange: (open: boolean) => void;
}) {
  const timestampFields = [
    "created_at",
    "updated_at",
    "joined_at",
    "loading_started_at",
    "departed_at",
    "resolved_at",
    "confirmed_at",
    "detected_at",
    "occurred_at",
  ];

  return (
    <Dialog open={!!signal} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {signal && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {signal.title}
                <Badge variant={severityVariant[signal.severity]} className="text-[10px]">
                  {signal.severity}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Source table: <code className="text-xs">{signal.table}</code> · row{" "}
                <code className="text-xs">{signal.rowId}</code>
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-4">
                <section>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Timestamps
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {timestampFields
                      .filter((k) => signal.raw[k])
                      .map((k) => (
                        <div key={k} className="rounded border p-2">
                          <div className="text-muted-foreground">{k}</div>
                          <div className="font-mono">
                            {format(new Date(signal.raw[k] as string), "yyyy-MM-dd HH:mm:ss")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(signal.raw[k] as string), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                {signal.coords && (
                  <section>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Location
                    </h4>
                    <div className="text-xs font-mono">
                      {signal.coords.lat.toFixed(6)}, {signal.coords.lng.toFixed(6)}
                    </div>
                  </section>
                )}

                <section>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Underlying row
                  </h4>
                  <div className="rounded-md border bg-muted/30 p-3 overflow-x-auto">
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all font-mono">
                      {JSON.stringify(signal.raw, null, 2)}
                    </pre>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
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
  const map: Record<
    ZoneStatus["status"],
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    idle: { label: "idle", variant: "outline" },
    healthy: { label: "healthy", variant: "secondary" },
    congested: { label: "congested", variant: "default" },
    stalled: { label: "stalled", variant: "destructive" },
  };
  const m = map[status];
  return (
    <Badge variant={m.variant} className="text-[10px] py-0">
      {m.label}
    </Badge>
  );
}
