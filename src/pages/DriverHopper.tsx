import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, UserMinus, MapPin, Banknote, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SEATS = 4;
const FULL_LOAD_MIN = 45;
const FULL_LOAD_MAX = 60;
const SHIFT_KEY = "hopper_shift_id_v1";

interface ExchangeEvent {
  id: string;
  event_type: "board" | "alight";
  passenger_count: number;
  occupancy_after: number;
  latitude: number | null;
  longitude: number | null;
  fare_amount: number;
  payment_method: string;
  created_at: string;
}

export default function DriverHopper() {
  const { user } = useAuth();
  const [shiftId, setShiftId] = useState<string>(() => {
    const s = localStorage.getItem(SHIFT_KEY) ?? crypto.randomUUID();
    localStorage.setItem(SHIFT_KEY, s);
    return s;
  });
  const [events, setEvents] = useState<ExchangeEvent[]>([]);
  const [fare, setFare] = useState(15);
  const [pay, setPay] = useState<"cash" | "card">("cash");
  const [busy, setBusy] = useState(false);
  const pos = useRef<GeolocationPosition | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => { pos.current = p; }, () => {}, { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("hopper_exchange_events" as any).select("*")
      .eq("driver_user_id", user.id).eq("shift_id", shiftId)
      .order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setEvents((data as any) ?? []));
  }, [user, shiftId]);

  const occupancy = events[0]?.occupancy_after ?? 0;
  const revenue = events.filter((e) => e.event_type === "board").reduce((s, e) => s + Number(e.fare_amount), 0);
  const boarded = events.filter((e) => e.event_type === "board").reduce((s, e) => s + e.passenger_count, 0);

  const log = async (type: "board" | "alight", count: number) => {
    if (!user) { toast.error("Please sign in as a driver first."); return; }
    const next = type === "board" ? occupancy + count : occupancy - count;
    if (next > SEATS) { toast.error(`Only ${SEATS} seats.`); return; }
    if (next < 0) { toast.error("No passengers on board."); return; }
    const p = pos.current;
    setBusy(true);
    const row = {
      driver_user_id: user.id, shift_id: shiftId, event_type: type, passenger_count: count,
      occupancy_after: next,
      latitude: p?.coords.latitude ?? null, longitude: p?.coords.longitude ?? null,
      accuracy_m: p?.coords.accuracy ?? null,
      fare_amount: type === "board" ? fare * count : 0,
      payment_method: pay,
    };
    const { data, error } = await supabase.from("hopper_exchange_events" as any).insert(row).select().single();
    setBusy(false);
    if (error) { toast.error("Could not save. " + error.message); return; }
    navigator.vibrate?.(40);
    setEvents((prev) => [data as any, ...prev]);
    if (!p) toast.warning("Saved without GPS — location not available yet.");
  };

  const endShift = () => {
    const s = crypto.randomUUID();
    localStorage.setItem(SHIFT_KEY, s);
    setShiftId(s); setEvents([]);
    toast.success("Shift closed. New shift started.");
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="mx-auto max-w-md space-y-4">
        <Link to="/driver" className="inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Driver screen
        </Link>
        <h1 className="text-2xl font-bold">On-board passengers</h1>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In the vehicle</p>
                <p className="text-5xl font-bold">{occupancy}<span className="text-2xl text-muted-foreground">/{SEATS}</span></p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: SEATS }).map((_, i) => (
                  <div key={i} className={`h-10 w-6 rounded ${i < occupancy ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div><p className="text-xs text-muted-foreground">Fares</p><p className="font-bold">R{revenue.toFixed(0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Passengers</p><p className="font-bold">{boarded}</p></div>
              <div><p className="text-xs text-muted-foreground">Full load</p><p className="font-bold">R{FULL_LOAD_MIN}–{FULL_LOAD_MAX}</p></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Fare each:</span>
          {[10, 15, 20].map((f) => (
            <Button key={f} size="sm" variant={fare === f ? "default" : "outline"} onClick={() => setFare(f)}>R{f}</Button>
          ))}
          <div className="ml-auto flex gap-1">
            <Button size="icon" variant={pay === "cash" ? "default" : "outline"} onClick={() => setPay("cash")} aria-label="Cash"><Banknote className="h-4 w-4" /></Button>
            <Button size="icon" variant={pay === "card" ? "default" : "outline"} onClick={() => setPay("card")} aria-label="Card"><CreditCard className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button className="h-20 text-lg" disabled={busy} onClick={() => log("board", 1)}><UserPlus className="mr-2 h-6 w-6" />+1 On</Button>
          <Button className="h-20 text-lg" disabled={busy} onClick={() => log("board", 2)}><UserPlus className="mr-2 h-6 w-6" />+2 On</Button>
          <Button variant="secondary" className="h-20 text-lg" disabled={busy} onClick={() => log("alight", 1)}><UserMinus className="mr-2 h-6 w-6" />−1 Off here</Button>
          <Button variant="secondary" className="h-20 text-lg" disabled={busy} onClick={() => log("alight", 2)}><UserMinus className="mr-2 h-6 w-6" />−2 Off here</Button>
        </div>
        <p className="text-xs text-muted-foreground">Every tap saves the time and the exact GPS spot — at a loading zone or anywhere along the road.</p>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">This shift</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {events.length === 0 && <p className="text-sm text-muted-foreground">No passengers logged yet.</p>}
            {events.slice(0, 30).map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b pb-2 text-sm last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant={e.event_type === "board" ? "default" : "secondary"}>
                    {e.event_type === "board" ? `+${e.passenger_count}` : `−${e.passenger_count}`}
                  </Badge>
                  <span>{new Date(e.created_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <span className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3" />
                  {e.latitude != null ? `${Number(e.latitude).toFixed(5)}, ${Number(e.longitude).toFixed(5)}` : "no GPS"}
                </span>
                <span className="w-12 text-right">{e.fare_amount > 0 ? `R${Number(e.fare_amount).toFixed(0)}` : ""}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={endShift}>Close shift</Button>
      </div>
    </div>
  );
}
