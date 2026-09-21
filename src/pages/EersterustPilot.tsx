import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Users,
  Video,
  Siren,
  ShieldAlert,
  Radio,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Counts = {
  zones: number;
  waiting: number;
  loadedToday: number;
  pings24h: number;
  panics24h: number;
  incidents: number;
  radio24h: number;
};

type ZoneRow = { id: string; zone_name: string; has_marshal: boolean | null; municipality: string | null };

const since = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString();

export default function EersterustPilot() {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [counts, setCounts] = useState<Counts>({
    zones: 0,
    waiting: 0,
    loadedToday: 0,
    pings24h: 0,
    panics24h: 0,
    incidents: 0,
    radio24h: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const day = since(24);

      const [zoneRes, waiting, loaded, pings, panics, incidents, radio] = await Promise.all([
        supabase
          .from("loading_zones")
          .select("id, zone_name, has_marshal, municipality")
          .eq("is_active", true)
          .order("zone_name"),
        supabase.from("zone_queue").select("id", { count: "exact", head: true }).eq("status", "waiting"),
        supabase
          .from("zone_queue")
          .select("id", { count: "exact", head: true })
          .gte("created_at", day),
        supabase
          .from("live_vehicle_locations")
          .select("id", { count: "exact", head: true })
          .gte("recorded_at", day),
        supabase.from("panic_alerts").select("id", { count: "exact", head: true }).gte("created_at", day),
        supabase.from("ai_incidents").select("id", { count: "exact", head: true }),
        supabase
          .from("marshal_radio_transmissions")
          .select("id", { count: "exact", head: true })
          .gte("created_at", day),
      ]);

      if (cancelled) return;

      setZones(zoneRes.data ?? []);
      setCounts({
        zones: zoneRes.data?.length ?? 0,
        waiting: waiting.count ?? 0,
        loadedToday: loaded.count ?? 0,
        pings24h: pings.count ?? 0,
        panics24h: panics.count ?? 0,
        incidents: incidents.count ?? 0,
        radio24h: radio.count ?? 0,
      });
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const stations = [
    {
      icon: Users,
      title: "1. Rank queue",
      who: "Driver joins, marshal loads and departs",
      to: "/marshall",
      alt: { label: "Driver view", to: "/driver" },
      live: `${counts.waiting} waiting now · ${counts.loadedToday} queue events today`,
      ready: counts.zones > 0,
      readyNote: counts.zones > 0 ? `${counts.zones} active zones` : "No active loading zones",
    },
    {
      icon: Video,
      title: "2. Dashcam & GPS",
      who: "Owner watches vehicles and routes",
      to: "/dashcam",
      live: `${counts.pings24h} location pings in 24h`,
      ready: counts.pings24h > 0,
      readyNote: counts.pings24h > 0 ? "Receiving live positions" : "No device reporting yet",
    },
    {
      icon: Siren,
      title: "3. Panic",
      who: "Driver or passenger raises an alert",
      to: "/community-safety",
      live: `${counts.panics24h} alerts in 24h`,
      ready: true,
      readyNote: "Panic button is live app-wide",
    },
    {
      icon: ShieldAlert,
      title: "4. Incident review",
      who: "Marshal or police confirm what happened",
      to: "/infringement-monitoring",
      live: `${counts.incidents} incidents on record`,
      ready: counts.incidents > 0,
      readyNote: counts.incidents > 0 ? "Incidents captured" : "Nothing captured yet",
    },
    {
      icon: Radio,
      title: "5. Marshal radio",
      who: "Zone voice channel and emergency broadcast",
      to: "/marshal-radio",
      live: `${counts.radio24h} transmissions in 24h`,
      ready: counts.radio24h > 0,
      readyNote: counts.radio24h > 0 ? "Channel in use" : "Channel quiet",
    },
  ];

  const walkthrough = [
    "Marshal opens the rank screen and confirms the zone for the shift.",
    "Driver arrives inside the zone and joins the queue on their phone.",
    "Marshal loads the first vehicle and marks it departed.",
    "Owner sees that vehicle moving on the dashcam map.",
    "Anyone presses panic — the alert lands with position and reaches the zone radio.",
    "Marshal or police open the incident and record the outcome.",
  ];

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <div className="container mx-auto px-4 py-6 pt-16 max-w-5xl space-y-6">
        <div>
          <Badge variant="secondary" className="mb-2">
            Eersterust pilot
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold">Pilot operations</h1>
          <p className="text-muted-foreground mt-1">
            One place to run and check the five screens the pilot depends on, with what each one is
            actually reporting right now.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking live activity…
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Zones in the pilot
                </CardTitle>
                <CardDescription>Active loading zones the queue runs on.</CardDescription>
              </CardHeader>
              <CardContent>
                {zones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No active zones yet. Add a zone before the first shift.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {zones.map((z) => (
                      <Badge key={z.id} variant={z.has_marshal ? "default" : "outline"}>
                        {z.zone_name}
                        {z.has_marshal ? " · marshal" : ""}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {stations.map((s) => (
                <Card key={s.title}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <s.icon className="h-4 w-4" /> {s.title}
                    </CardTitle>
                    <CardDescription>{s.who}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      {s.ready ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={s.ready ? "" : "text-muted-foreground"}>{s.readyNote}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.live}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link to={s.to}>
                          Open <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                      {s.alt && (
                        <Button asChild size="sm" variant="outline">
                          <Link to={s.alt.to}>{s.alt.label}</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">The shift, start to finish</CardTitle>
                <CardDescription>Run these six steps to test the whole pilot in one pass.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {walkthrough.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-none h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Anything marked as quiet or not reporting simply means no real activity has come
                through yet — the screen itself is live and will fill up on the first shift.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </div>
  );
}
