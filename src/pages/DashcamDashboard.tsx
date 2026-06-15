import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Camera, MapPin, Maximize2, Radio, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Eersterust center
const EERSTERUST = { lat: -25.7286, lng: 28.3479 };

// Royalty-free demo loop videos (Google sample bucket, always available)
const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
];

interface FleetVehicle {
  id: string;
  e_number: string | null;
  registration: string | null;
  driver_name: string | null;
  owner_name: string | null;
  status: string | null;
}

interface LiveVehicle extends FleetVehicle {
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  realGps: boolean;
  videoUrl: string;
}

declare global {
  interface Window {
    google: any;
    __initDashcamMap?: () => void;
  }
}

function seededOffset(seed: string, range = 0.025) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand1 = ((h % 1000) / 1000 - 0.5) * 2;
  const rand2 = (((h >> 10) % 1000) / 1000 - 0.5) * 2;
  return { dLat: rand1 * range, dLng: rand2 * range };
}

const DashcamDashboard = () => {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const gMapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  // Load fleet + try realtime gps fallback
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("fleet_vehicles")
        .select("id,e_number,registration,driver_name,owner_name,status")
        .order("e_number", { ascending: true })
        .limit(24);

      const rows: FleetVehicle[] = data && data.length > 0 ? data : Array.from({ length: 6 }).map((_, i) => ({
        id: `demo-${i}`,
        e_number: `E${100 + i}`,
        registration: `MOJA ${i + 1}00 GP`,
        driver_name: ["T. Mokoena", "S. Dlamini", "P. Sithole", "N. Khumalo", "L. Maseko", "R. Ndlovu"][i],
        owner_name: "MojaRide Fleet",
        status: "active",
      }));

      // try to pull most recent location_logs (one per user)
      const { data: locs } = await supabase
        .from("location_logs")
        .select("user_id,latitude,longitude,timestamp")
        .order("timestamp", { ascending: false })
        .limit(50);

      const latestByUser = new Map<string, { lat: number; lng: number }>();
      (locs ?? []).forEach((l: any) => {
        if (!latestByUser.has(l.user_id)) {
          latestByUser.set(l.user_id, { lat: Number(l.latitude), lng: Number(l.longitude) });
        }
      });
      const realPool = Array.from(latestByUser.values());

      const live: LiveVehicle[] = rows.map((v, i) => {
        const real = realPool[i];
        const off = seededOffset(v.id);
        return {
          ...v,
          lat: real?.lat ?? EERSTERUST.lat + off.dLat,
          lng: real?.lng ?? EERSTERUST.lng + off.dLng,
          speedKmh: 15 + Math.floor(Math.random() * 50),
          heading: Math.floor(Math.random() * 360),
          realGps: !!real,
          videoUrl: DEMO_VIDEOS[i % DEMO_VIDEOS.length],
        };
      });

      if (!cancelled) {
        setVehicles(live);
        setSelectedId(live[0]?.id ?? null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Simulated movement tick
  useEffect(() => {
    const id = setInterval(() => {
      setVehicles((prev) => prev.map((v) => {
        if (v.realGps) return v;
        const rad = (v.heading * Math.PI) / 180;
        const step = 0.00015 + Math.random() * 0.00015;
        return {
          ...v,
          lat: v.lat + Math.cos(rad) * step,
          lng: v.lng + Math.sin(rad) * step,
          heading: (v.heading + (Math.random() - 0.5) * 30 + 360) % 360,
          speedKmh: Math.max(0, Math.min(80, v.speedKmh + (Math.random() - 0.5) * 8)),
        };
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Load Google Maps JS
  useEffect(() => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) return;
    if (window.google?.maps) { setMapReady(true); return; }

    window.__initDashcamMap = () => setMapReady(true);
    const existing = document.querySelector<HTMLScriptElement>("script[data-dashcam-maps]");
    if (existing) return;

    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__initDashcamMap${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.defer = true;
    s.setAttribute("data-dashcam-maps", "true");
    document.head.appendChild(s);
  }, []);

  // Initialize map once ready
  useEffect(() => {
    if (!mapReady || !mapRef.current || gMapRef.current) return;
    gMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: EERSTERUST,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1f2937" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#374151" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1220" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
      ],
    });
  }, [mapReady]);

  // Sync markers
  useEffect(() => {
    if (!mapReady || !gMapRef.current) return;
    const g = window.google;
    vehicles.forEach((v) => {
      const pos = { lat: v.lat, lng: v.lng };
      const isSel = v.id === selectedId;
      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setPosition(pos);
        markersRef.current[v.id].setIcon({
          path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: isSel ? 7 : 5,
          fillColor: v.realGps ? "#22c55e" : "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: isSel ? 2 : 1,
          rotation: v.heading,
        });
      } else {
        const marker = new g.maps.Marker({
          position: pos,
          map: gMapRef.current,
          title: `${v.e_number ?? ""} ${v.registration ?? ""}`,
          icon: {
            path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: v.realGps ? "#22c55e" : "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 1,
            rotation: v.heading,
          },
        });
        marker.addListener("click", () => setSelectedId(v.id));
        markersRef.current[v.id] = marker;
      }
    });
  }, [vehicles, selectedId, mapReady]);

  const selected = useMemo(() => vehicles.find((v) => v.id === selectedId), [vehicles, selectedId]);

  return (
    <>
      <Helmet>
        <title>Live Dashcam Dashboard | MojaRide Fleet</title>
        <meta name="description" content="Real-time dashcam feeds and GPS tracking for the MojaRide fleet across Eersterust." />
        <link rel="canonical" href="https://tukconnect.lovable.app/dashcam" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Live Dashcam Dashboard</h1>
                <p className="text-xs text-muted-foreground">{vehicles.length} vehicles · simulated feeds for pilot demo</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </Badge>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            {/* Featured player */}
            {selected && (
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-black">
                  <video
                    key={selected.id}
                    src={selected.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600 hover:bg-red-600 gap-1">
                        <Radio className="h-3 w-3" /> LIVE
                      </Badge>
                      <span className="text-white font-semibold text-sm">{selected.e_number} · {selected.registration}</span>
                    </div>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</span>
                    <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {Math.round(selected.speedKmh)} km/h</span>
                    <span>Driver: {selected.driver_name ?? "—"}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Map */}
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Fleet Map</h2>
                <span className="text-xs text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1" /> real GPS
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 ml-3 mr-1" /> simulated
                </span>
              </div>
              <div ref={mapRef} className="h-[420px] w-full bg-muted">
                {!mapReady && (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    {import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY ? "Loading map…" : "Google Maps key not configured"}
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* Side grid of feeds */}
          <aside>
            <Card className="p-3">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2 px-1">
                <Camera className="h-4 w-4" /> All Feeds
              </h2>
              <div className="grid grid-cols-2 gap-2 max-h-[720px] overflow-y-auto pr-1">
                {vehicles.map((v) => {
                  const isSel = v.id === selectedId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className={`group relative rounded-md overflow-hidden border text-left transition ${
                        isSel ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="aspect-video bg-black relative">
                        <video
                          src={v.videoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-1 left-1 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-white">LIVE</span>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/70 text-white text-[10px] flex justify-between">
                          <span className="truncate">{v.e_number}</span>
                          <span>{Math.round(v.speedKmh)}km/h</span>
                        </div>
                      </div>
                      <div className="px-2 py-1.5 bg-card">
                        <div className="text-xs font-medium truncate">{v.registration}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{v.driver_name ?? "Unassigned"}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </aside>
        </main>
      </div>
    </>
  );
};

export default DashcamDashboard;
