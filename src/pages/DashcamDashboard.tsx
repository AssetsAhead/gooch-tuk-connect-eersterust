import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, AlertTriangle, Camera, Compass, MapPin, Maximize2, Radio, Search, Video } from "lucide-react";
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

// Freshness thresholds (ms)
const FRESH_MS = 30_000;        // <30s → live
const STALE_MS = 5 * 60_000;    // 30s–5min → stale; >5min → offline

// GPS quality thresholds (metres)
const ACCURACY_REJECT_M = 150;  // discard fixes worse than this — noise
const ACCURACY_LOW_M = 75;      // worse than this → flag as low confidence (downweighted on map)

// Marker smoothing — easing factor per animation frame (0..1). Higher = snappier, lower = smoother.
const SMOOTH_POS = 0.18;
const SMOOTH_HEADING = 0.22;

type Freshness = "live" | "stale" | "offline" | "demo";

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
  accuracyM: number | null;
  lowConfidence: boolean;
  realGps: boolean;
  lastFixAt: number | null; // ms epoch, real GPS only
  address: string | null;
  addressFetchedAt: number | null;
  addressFetchedLat: number | null;
  addressFetchedLng: number | null;
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

function getFreshness(v: LiveVehicle, now: number): Freshness {
  if (!v.realGps || v.lastFixAt == null) return "demo";
  const age = now - v.lastFixAt;
  if (age < FRESH_MS) return "live";
  if (age < STALE_MS) return "stale";
  return "offline";
}

function freshnessLabel(f: Freshness) {
  return f === "live" ? "Live" : f === "stale" ? "Stale" : f === "offline" ? "Offline" : "Demo";
}

function freshnessClasses(f: Freshness) {
  switch (f) {
    case "live": return { dot: "bg-green-500", text: "text-green-600", bg: "bg-green-500/10 border-green-500/30" };
    case "stale": return { dot: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30" };
    case "offline": return { dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-500/10 border-gray-500/30" };
    case "demo": return { dot: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/30" };
  }
}

function freshnessHex(f: Freshness) {
  return f === "live" ? "#22c55e" : f === "stale" ? "#f59e0b" : f === "offline" ? "#9ca3af" : "#3b82f6";
}

function timeAgo(ms: number | null, now: number): string {
  if (ms == null) return "—";
  const diff = Math.max(0, Math.round((now - ms) / 1000));
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const m = Math.round(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function compass(heading: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(((heading % 360) + 360) % 360 / 45) % 8];
}

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = (aLat - bLat) * 111000;
  const dLng = (aLng - bLng) * 111000 * Math.cos((aLat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

const DashcamDashboard = () => {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchMsg, setSearchMsg] = useState<string | null>(null);
  const searchMarkerRef = useRef<any>(null);
  const [suggestions, setSuggestions] = useState<Array<{ placeId: string; primary: string; secondary: string }>>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const sessionTokenRef = useRef<any>(null);
  const suggestTimerRef = useRef<number | null>(null);
  const suggestSeqRef = useRef(0);
  const [incident, setIncident] = useState<null | {
    id: string;
    vehicleId: string;
    label: string;
    registration: string;
    eNumber: string;
    driver: string;
    address: string | null;
    lat: number;
    lng: number;
    fromSpeed: number;
    toSpeed: number;
    ts: number;
    kind: "sudden_stop" | "crash";
  }>(null);
  const incidentCooldownRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    document.title = "Live Dashcam Dashboard | MojaRide Fleet";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Real-time dashcam feeds and GPS tracking for the MojaRide fleet across Eersterust.");
  }, []);

  // Re-render every 10s so "x seconds ago" stays current
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  const gMapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const infoWindowRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const pendingGeocodeRef = useRef<Set<string>>(new Set());

  // Load fleet + seed any recent real GPS fixes
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

      // Latest live GPS fix per vehicle (window the lookup to the last 24h)
      const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: locs } = await supabase
        .from("live_vehicle_locations")
        .select("vehicle_id,latitude,longitude,speed_kmh,heading,accuracy_m,recorded_at")
        .gte("recorded_at", sinceIso)
        .order("recorded_at", { ascending: false })
        .limit(500);

      const latestByVehicle = new Map<string, { lat: number; lng: number; ts: number; speed: number | null; heading: number | null; accuracy: number | null }>();
      (locs ?? []).forEach((l: any) => {
        // Skip fixes that are too inaccurate to trust
        const acc = l.accuracy_m != null ? Number(l.accuracy_m) : null;
        if (acc != null && acc > ACCURACY_REJECT_M) return;
        if (!latestByVehicle.has(l.vehicle_id)) {
          latestByVehicle.set(l.vehicle_id, {
            lat: Number(l.latitude),
            lng: Number(l.longitude),
            ts: l.recorded_at ? new Date(l.recorded_at).getTime() : Date.now(),
            speed: l.speed_kmh != null ? Number(l.speed_kmh) : null,
            heading: l.heading != null ? Number(l.heading) : null,
            accuracy: acc,
          });
        }
      });

      const live: LiveVehicle[] = rows.map((v, i) => {
        const real = latestByVehicle.get(v.id);
        const off = seededOffset(v.id);
        const lowConfidence = !!real && (real.heading == null || (real.accuracy != null && real.accuracy > ACCURACY_LOW_M));
        return {
          ...v,
          lat: real?.lat ?? EERSTERUST.lat + off.dLat,
          lng: real?.lng ?? EERSTERUST.lng + off.dLng,
          speedKmh: real?.speed ?? 15 + Math.floor(Math.random() * 50),
          heading: real?.heading ?? Math.floor(Math.random() * 360),
          accuracyM: real?.accuracy ?? null,
          lowConfidence,
          realGps: !!real,
          lastFixAt: real?.ts ?? null,
          address: null,
          addressFetchedAt: null,
          addressFetchedLat: null,
          addressFetchedLng: null,
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

  // Realtime: live GPS pings keyed by vehicle_id
  useEffect(() => {
    const prevByVehicle = new Map<string, { lat: number; lng: number; ts: number }>();

    const channel = supabase
      .channel("dashcam-live-vehicle-locations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_vehicle_locations" },
        (payload) => {
          const row: any = payload.new;
          if (!row?.vehicle_id || row.latitude == null || row.longitude == null) return;
          const reportedAccuracy = row.accuracy_m != null ? Number(row.accuracy_m) : null;
          // Hard-reject obviously noisy fixes
          if (reportedAccuracy != null && reportedAccuracy > ACCURACY_REJECT_M) return;
          const lat = Number(row.latitude);
          const lng = Number(row.longitude);
          const ts = row.recorded_at ? new Date(row.recorded_at).getTime() : Date.now();
          const reportedSpeed = row.speed_kmh != null ? Number(row.speed_kmh) : null;
          const reportedHeading = row.heading != null ? Number(row.heading) : null;
          const prev = prevByVehicle.get(row.vehicle_id);
          prevByVehicle.set(row.vehicle_id, { lat, lng, ts });

          setVehicles((list) => list.map((v) => {
            if (v.id !== row.vehicle_id) return v;

            // Derive heading/speed from delta when device didn't supply them
            let heading = reportedHeading ?? v.heading;
            let speedKmh = reportedSpeed ?? v.speedKmh;
            let derivedHeading = reportedHeading == null;
            if ((reportedHeading == null || reportedSpeed == null) && prev) {
              const dLat = lat - prev.lat;
              const dLng = lng - prev.lng;
              const dt = Math.max(0.5, (ts - prev.ts) / 1000);
              const meters = Math.sqrt((dLat * 111000) ** 2 + (dLng * 111000 * Math.cos((lat * Math.PI) / 180)) ** 2);
              // Only trust derived heading when we actually moved
              if (meters > 3) {
                if (reportedHeading == null) { heading = (Math.atan2(dLng, dLat) * 180) / Math.PI; derivedHeading = false; }
                if (reportedSpeed == null) speedKmh = Math.min(120, (meters / dt) * 3.6);
              } else if (reportedSpeed == null) {
                speedKmh = 0;
              }
            }

            const lowConfidence =
              derivedHeading ||
              (reportedAccuracy != null && reportedAccuracy > ACCURACY_LOW_M);

            // Incident detection: sudden stop / crash pattern (only on trusted fixes)
            const drop = v.speedKmh - speedKmh;
            const nowMs = Date.now();
            const lastAlert = incidentCooldownRef.current.get(v.id) ?? 0;
            if (!lowConfidence && v.realGps && drop >= 30 && speedKmh < 8 && v.speedKmh >= 35 && nowMs - lastAlert > 60_000) {
              incidentCooldownRef.current.set(v.id, nowMs);
              const kind: "sudden_stop" | "crash" = drop >= 55 ? "crash" : "sudden_stop";
              setIncident({
                id: `${v.id}-${nowMs}`,
                vehicleId: v.id,
                label: kind === "crash" ? "Possible Crash Detected" : "Sudden Stop Detected",
                kind,
                registration: v.registration ?? "—",
                eNumber: v.e_number ?? "",
                driver: v.driver_name ?? "Unassigned",
                address: v.address,
                lat,
                lng,
                fromSpeed: Math.round(v.speedKmh),
                toSpeed: Math.round(speedKmh),
                ts: nowMs,
              });
            }

            return { ...v, lat, lng, heading, speedKmh, accuracyM: reportedAccuracy, lowConfidence, realGps: true, lastFixAt: ts };
          }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Simulated movement for non-real vehicles
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
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&libraries=places&callback=__initDashcamMap${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.defer = true;
    s.setAttribute("data-dashcam-maps", "true");
    document.head.appendChild(s);
  }, []);

  // Initialize map + InfoWindow + Geocoder
  useEffect(() => {
    if (!mapReady || !mapRef.current || gMapRef.current) return;
    const g = window.google;
    gMapRef.current = new g.maps.Map(mapRef.current, {
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
    infoWindowRef.current = new g.maps.InfoWindow();
    geocoderRef.current = new g.maps.Geocoder();
  }, [mapReady]);

  // Reverse-geocode addresses lazily (when missing or moved >75m, debounced per-vehicle)
  useEffect(() => {
    if (!mapReady || !geocoderRef.current) return;
    const nowTs = Date.now();
    vehicles.forEach((v) => {
      const needs =
        v.address == null ||
        v.addressFetchedLat == null ||
        v.addressFetchedLng == null ||
        distanceMeters(v.lat, v.lng, v.addressFetchedLat, v.addressFetchedLng) > 75;
      const fresh = v.addressFetchedAt != null && nowTs - v.addressFetchedAt < 20_000;
      if (!needs || fresh || pendingGeocodeRef.current.has(v.id)) return;
      pendingGeocodeRef.current.add(v.id);
      geocoderRef.current.geocode(
        { location: { lat: v.lat, lng: v.lng } },
        (results: any[], status: string) => {
          pendingGeocodeRef.current.delete(v.id);
          const addr = status === "OK" && results?.[0]?.formatted_address ? results[0].formatted_address : null;
          setVehicles((prev) => prev.map((p) =>
            p.id === v.id
              ? { ...p, address: addr, addressFetchedAt: Date.now(), addressFetchedLat: v.lat, addressFetchedLng: v.lng }
              : p
          ));
        }
      );
    });
  }, [vehicles, mapReady]);

  // Sync markers
  useEffect(() => {
    if (!mapReady || !gMapRef.current) return;
    const g = window.google;
    const nowTs = now;
    vehicles.forEach((v) => {
      const pos = { lat: v.lat, lng: v.lng };
      const isSel = v.id === selectedId;
      const f = getFreshness(v, nowTs);
      const icon = {
        path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: isSel ? 7 : 5,
        fillColor: freshnessHex(f),
        fillOpacity: f === "offline" ? 0.55 : 1,
        strokeColor: "#ffffff",
        strokeWeight: isSel ? 2 : 1,
        rotation: v.heading,
      };
      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setPosition(pos);
        markersRef.current[v.id].setIcon(icon);
      } else {
        const marker = new g.maps.Marker({
          position: pos,
          map: gMapRef.current,
          title: `${v.e_number ?? ""} ${v.registration ?? ""}`,
          icon,
        });
        marker.addListener("click", () => {
          setSelectedId(v.id);
          openInfoWindow(v.id);
        });
        markersRef.current[v.id] = marker;
      }
    });
  }, [vehicles, selectedId, mapReady, now]);

  // Keep open InfoWindow content up-to-date with latest vehicle data
  useEffect(() => {
    if (!infoWindowRef.current || !selectedId) return;
    const v = vehicles.find((x) => x.id === selectedId);
    const marker = markersRef.current[selectedId];
    if (!v || !marker) return;
    // Only update content if the InfoWindow is already open
    if ((infoWindowRef.current as any).getMap && (infoWindowRef.current as any).getMap()) {
      infoWindowRef.current.setContent(buildInfoContent(v, now));
    }
  }, [vehicles, selectedId, now]);

  const openInfoWindow = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    const marker = markersRef.current[id];
    if (!v || !marker || !infoWindowRef.current) return;
    infoWindowRef.current.setContent(buildInfoContent(v, Date.now()));
    infoWindowRef.current.open({ map: gMapRef.current, anchor: marker });
  };

  // Address / landmark search → geocode and pan
  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    if (!gMapRef.current || !window.google?.maps) {
      setSearchMsg("Map not ready yet");
      return;
    }
    setSearchMsg("Searching…");
    const g = window.google;
    const geocoder = new g.maps.Geocoder();
    // Bias results around the Eersterust area
    const bias = new g.maps.LatLngBounds(
      { lat: EERSTERUST.lat - 0.5, lng: EERSTERUST.lng - 0.5 },
      { lat: EERSTERUST.lat + 0.5, lng: EERSTERUST.lng + 0.5 },
    );
    geocoder.geocode({ address: q, bounds: bias, region: "ZA" }, (results: any[], status: string) => {
      if (status !== "OK" || !results?.[0]) {
        setSearchMsg("No matches found");
        return;
      }
      const r = results[0];
      const loc = r.geometry.location;
      const pos = { lat: loc.lat(), lng: loc.lng() };
      gMapRef.current.panTo(pos);
      gMapRef.current.setZoom(Math.max(gMapRef.current.getZoom() ?? 14, 15));
      if (searchMarkerRef.current) searchMarkerRef.current.setMap(null);
      searchMarkerRef.current = new g.maps.Marker({
        position: pos,
        map: gMapRef.current,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#ef4444",
          fillOpacity: 0.85,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        zIndex: 9999,
      });
      setSearchMsg(r.formatted_address ?? null);
    });
  };

  // Place a marker + pan at a given location with a label
  const panToLocation = (pos: { lat: number; lng: number }, label: string) => {
    if (!gMapRef.current || !window.google?.maps) return;
    const g = window.google;
    gMapRef.current.panTo(pos);
    gMapRef.current.setZoom(Math.max(gMapRef.current.getZoom() ?? 14, 15));
    if (searchMarkerRef.current) searchMarkerRef.current.setMap(null);
    searchMarkerRef.current = new g.maps.Marker({
      position: pos,
      map: gMapRef.current,
      icon: {
        path: g.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#ef4444",
        fillOpacity: 0.85,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      zIndex: 9999,
    });
    setSearchMsg(label);
  };

  // Debounced autocomplete suggestions via Places API (New)
  const fetchSuggestions = (raw: string) => {
    const q = raw.trim();
    if (suggestTimerRef.current) window.clearTimeout(suggestTimerRef.current);
    if (q.length < 2 || !window.google?.maps) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    const seq = ++suggestSeqRef.current;
    suggestTimerRef.current = window.setTimeout(async () => {
      try {
        const places: any = await (window as any).google.maps.importLibrary("places");
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new places.AutocompleteSessionToken();
        }
        const bias = {
          north: EERSTERUST.lat + 0.5,
          south: EERSTERUST.lat - 0.5,
          east: EERSTERUST.lng + 0.5,
          west: EERSTERUST.lng - 0.5,
        };
        const { suggestions: out } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: q,
          sessionToken: sessionTokenRef.current,
          locationBias: bias,
          region: "ZA",
        });
        if (seq !== suggestSeqRef.current) return; // stale
        const mapped = (out || [])
          .map((s: any) => s.placePrediction)
          .filter(Boolean)
          .slice(0, 6)
          .map((p: any) => ({
            placeId: p.placeId,
            primary: p.mainText?.text ?? p.text?.text ?? "",
            secondary: p.secondaryText?.text ?? "",
          }));
        setSuggestions(mapped);
        setSuggestOpen(true);
      } catch (err) {
        if (seq === suggestSeqRef.current) {
          setSuggestions([]);
          setSuggestOpen(false);
        }
      } finally {
        if (seq === suggestSeqRef.current) setSuggestLoading(false);
      }
    }, 220);
  };

  const selectSuggestion = async (s: { placeId: string; primary: string; secondary: string }) => {
    setSuggestOpen(false);
    setSuggestions([]);
    const label = [s.primary, s.secondary].filter(Boolean).join(", ");
    setSearchInput(label);
    setSearchMsg("Loading place…");
    try {
      const places: any = await (window as any).google.maps.importLibrary("places");
      const place = new places.Place({ id: s.placeId });
      await place.fetchFields({ fields: ["location", "formattedAddress", "displayName"] });
      sessionTokenRef.current = null; // session ends after a place selection
      const loc = place.location;
      if (!loc) {
        setSearchMsg("No location for that place");
        return;
      }
      panToLocation({ lat: loc.lat(), lng: loc.lng() }, place.formattedAddress ?? label);
    } catch {
      // Fallback to geocoding the label
      handleSearch();
    }
  };

  // Manual trigger for demoing the SOS popup
  const triggerSimulatedIncident = () => {
    if (!selected) return;
    const now = Date.now();
    incidentCooldownRef.current.set(selected.id, now);
    setIncident({
      id: `${selected.id}-${now}`,
      vehicleId: selected.id,
      label: "Sudden Stop Detected (Simulated)",
      kind: "sudden_stop",
      registration: selected.registration ?? "—",
      eNumber: selected.e_number ?? "",
      driver: selected.driver_name ?? "Unassigned",
      address: selected.address,
      lat: selected.lat,
      lng: selected.lng,
      fromSpeed: Math.round(selected.speedKmh),
      toSpeed: 0,
      ts: now,
    });
  };

  const selected = useMemo(() => vehicles.find((v) => v.id === selectedId), [vehicles, selectedId]);
  const selectedFreshness = selected ? getFreshness(selected, now) : "demo";
  const selectedClasses = freshnessClasses(selectedFreshness);

  // Freshness counts for the legend
  const counts = useMemo(() => {
    const c = { live: 0, stale: 0, offline: 0, demo: 0 };
    vehicles.forEach((v) => { c[getFreshness(v, now)]++; });
    return c;
  }, [vehicles, now]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Live Dashcam Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {counts.live} live · {counts.stale} stale · {counts.offline} offline · {counts.demo} demo
              </p>
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
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${selectedClasses.bg} ${selectedClasses.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${selectedClasses.dot} ${selectedFreshness === "live" ? "animate-pulse" : ""}`} />
                      GPS {freshnessLabel(selectedFreshness)}
                    </span>
                  </div>
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected.address ?? `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`}</span>
                  <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {Math.round(selected.speedKmh)} km/h</span>
                  <span className="flex items-center gap-1"><Compass className="h-3 w-3" /> {compass(selected.heading)} {Math.round(((selected.heading % 360) + 360) % 360)}°</span>
                  <span>Last fix: {timeAgo(selected.lastFixAt, now)}</span>
                </div>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Fleet Map</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Live</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Stale</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400" />Offline</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Demo</span>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if (suggestions[0]) { selectSuggestion(suggestions[0]); } else { handleSearch(e); } }} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => { setSearchInput(e.target.value); fetchSuggestions(e.target.value); }}
                    onFocus={() => { if (suggestions.length) setSuggestOpen(true); }}
                    onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                    onKeyDown={(e) => { if (e.key === "Escape") setSuggestOpen(false); }}
                    placeholder="Search address or landmark (e.g. Volga St, Eersterust Mall)"
                    className="pl-9"
                    aria-label="Search the map"
                    aria-autocomplete="list"
                    aria-expanded={suggestOpen}
                    autoComplete="off"
                  />
                  {suggestOpen && (suggestions.length > 0 || suggestLoading) && (
                    <div className="absolute z-50 mt-1 left-0 right-0 bg-popover border border-border rounded-md shadow-lg max-h-72 overflow-y-auto">
                      {suggestLoading && suggestions.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>
                      )}
                      {suggestions.map((s) => (
                        <button
                          key={s.placeId}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none flex items-start gap-2"
                          onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                        >
                          <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{s.primary}</span>
                            {s.secondary && <span className="block truncate text-xs text-muted-foreground">{s.secondary}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={!mapReady}>Go</Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={triggerSimulatedIncident}
                    disabled={!selected}
                    title="Trigger a demo SOS alert for the selected vehicle"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" /> Simulate SOS
                  </Button>
                </div>
              </form>
              {searchMsg && <p className="text-xs text-muted-foreground truncate">{searchMsg}</p>}
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

        <aside>
          <Card className="p-3">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2 px-1">
              <Camera className="h-4 w-4" /> All Feeds
            </h2>
            <div className="grid grid-cols-2 gap-2 max-h-[720px] overflow-y-auto pr-1">
              {vehicles.map((v) => {
                const isSel = v.id === selectedId;
                const f = getFreshness(v, now);
                const c = freshnessClasses(f);
                return (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedId(v.id); openInfoWindow(v.id); }}
                    className={`group relative rounded-md overflow-hidden border text-left transition ${
                      isSel ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="aspect-video bg-black relative">
                      <video src={v.videoUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
                      <div className="absolute top-1 left-1 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-white">LIVE</span>
                      </div>
                      <div className={`absolute top-1 right-1 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${c.bg} ${c.text} backdrop-blur-sm`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.dot} ${f === "live" ? "animate-pulse" : ""}`} />
                        {freshnessLabel(f)}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/70 text-white text-[10px] flex justify-between">
                        <span className="truncate">{v.e_number}</span>
                        <span>{Math.round(v.speedKmh)}km/h</span>
                      </div>
                    </div>
                    <div className="px-2 py-1.5 bg-card">
                      <div className="text-xs font-medium truncate">{v.registration}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {v.driver_name ?? "Unassigned"} · {timeAgo(v.lastFixAt, now)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>
      </main>

      <Dialog open={!!incident} onOpenChange={(o) => !o && setIncident(null)}>
        <DialogContent className="border-destructive/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              {incident?.label ?? "Incident Detected"}
            </DialogTitle>
            <DialogDescription>
              Automatic detection from GPS telemetry. Verify with the driver and dispatch help if needed.
            </DialogDescription>
          </DialogHeader>
          {incident && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md border bg-destructive/5 p-3 grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Vehicle</div>
                  <div className="font-semibold">{incident.eNumber} · {incident.registration}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Driver</div>
                  <div className="font-semibold">{incident.driver}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Speed Drop</div>
                  <div className="font-semibold">{incident.fromSpeed} → {incident.toSpeed} km/h</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Time</div>
                  <div className="font-semibold">{new Date(incident.ts).toLocaleTimeString()}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Location</div>
                  <div className="font-medium">{incident.address ?? `${incident.lat.toFixed(5)}, ${incident.lng.toFixed(5)}`}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setIncident(null)}>Acknowledge</Button>
            <Button
              onClick={() => {
                if (!incident) return;
                setSelectedId(incident.vehicleId);
                if (gMapRef.current) {
                  gMapRef.current.panTo({ lat: incident.lat, lng: incident.lng });
                  gMapRef.current.setZoom(17);
                }
                openInfoWindow(incident.vehicleId);
                setIncident(null);
              }}
            >
              Open Feed & Locate
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                window.open("tel:0123582124", "_self");
              }}
            >
              Call TMPD War Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function buildInfoContent(v: LiveVehicle, now: number): string {
  const f = getFreshness(v, now);
  const color = freshnessHex(f);
  const headingDeg = Math.round(((v.heading % 360) + 360) % 360);
  const addr = v.address ? escapeHtml(v.address) : `${v.lat.toFixed(5)}, ${v.lng.toFixed(5)}`;
  const reg = escapeHtml(v.registration ?? "—");
  const eNum = escapeHtml(v.e_number ?? "");
  const driver = escapeHtml(v.driver_name ?? "Unassigned");
  return `
    <div style="font-family:system-ui,sans-serif;min-width:220px;max-width:280px;color:#111827;font-size:12px;line-height:1.4">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
        <strong style="font-size:13px">${eNum} · ${reg}</strong>
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;background:${color}1a;color:${color};border:1px solid ${color}55;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.04em">
          <span style="width:6px;height:6px;border-radius:999px;background:${color};display:inline-block"></span>
          ${freshnessLabel(f)}
        </span>
      </div>
      <div style="color:#374151;margin-bottom:4px">📍 ${addr}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;color:#4b5563">
        <div><strong style="color:#111827">Speed:</strong> ${Math.round(v.speedKmh)} km/h</div>
        <div><strong style="color:#111827">Heading:</strong> ${compass(v.heading)} ${headingDeg}°</div>
        <div><strong style="color:#111827">Driver:</strong> ${driver}</div>
        <div><strong style="color:#111827">Last fix:</strong> ${timeAgo(v.lastFixAt, now)}</div>
      </div>
    </div>
  `;
}

export default DashcamDashboard;
