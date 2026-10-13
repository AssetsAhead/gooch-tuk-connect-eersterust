import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Mic, MicOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  VERIFIED_HUBS, VERIFIED_SECTORS, resolveVerifiedLocation, type VerifiedLocation,
} from "@/lib/eersterustLocations";

export interface PickedLocation {
  label: string;
  source: "gps" | "hub" | "sector" | "typed";
  lat?: number;
  lng?: number;
  accuracy?: number;
  locationId?: string;
  detail?: string;
}

interface Props {
  title: string;
  allowGps?: boolean;
  value: PickedLocation | null;
  onChange: (loc: PickedLocation | null) => void;
}

export function SafeLocationPicker({ title, allowGps = false, value, onChange }: Props) {
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [sector, setSector] = useState<VerifiedLocation | null>(null);
  const [sectorStreet, setSectorStreet] = useState("");
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<{ text: string; matches: VerifiedLocation[] } | null>(null);

  const useGps = () => {
    if (!navigator.geolocation) { setGpsError("This phone cannot share its location."); return; }
    setGpsBusy(true); setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGpsBusy(false);
        onChange({
          label: "My current location (GPS pin)",
          source: "gps",
          lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy,
          detail: `±${Math.round(p.coords.accuracy)} m`,
        });
      },
      () => { setGpsBusy(false); setGpsError("Location permission denied or unavailable. Pick an area below."); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const pickHub = (h: VerifiedLocation) =>
    onChange({ label: h.name, source: "hub", locationId: h.id, detail: h.streetLabel });

  const confirmSector = () => {
    if (!sector || sectorStreet.trim().length < 2) return;
    onChange({
      label: `${sectorStreet.trim()}, ${sector.name}`,
      source: "sector", locationId: sector.id, detail: "Street given by passenger",
    });
    setSector(null); setSectorStreet("");
  };

  const listen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setHeard({ text: "Voice is not supported on this phone.", matches: [] }); return; }
    const rec = new SR();
    rec.lang = "en-ZA"; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      setHeard({ text, matches: resolveVerifiedLocation(text).matches });
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true); setHeard(null); rec.start();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {value && (
          <div className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">{value.label}</p>
              {value.detail && <p className="text-sm text-muted-foreground">{value.detail}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>Change</Button>
          </div>
        )}

        {!value && (
          <>
            {allowGps && (
              <Button className="w-full h-14 text-base" onClick={useGps} disabled={gpsBusy}>
                <Crosshair className="mr-2 h-5 w-5" />
                {gpsBusy ? "Finding you…" : "Use my current location"}
              </Button>
            )}
            {gpsError && <p className="text-sm text-destructive">{gpsError}</p>}

            <Button variant="outline" className="w-full h-12" onClick={listen} disabled={listening}>
              {listening ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
              {listening ? "Listening…" : "Say the place"}
            </Button>

            {heard && (
              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-sm">We heard: <span className="font-semibold">"{heard.text}"</span></p>
                {heard.matches.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">Tap to confirm:</p>
                    <div className="flex flex-wrap gap-2">
                      {heard.matches.map((m) => (
                        <Button key={m.id} size="sm" variant="secondary"
                          onClick={() => m.kind === "hub" ? pickHub(m) : setSector(m)}>
                          {m.icon} {m.name}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    Not a confirmed place. Please tap a place below or type the street.
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Popular places</p>
              <div className="grid grid-cols-2 gap-2">
                {VERIFIED_HUBS.map((h) => (
                  <button key={h.id} onClick={() => pickHub(h)}
                    className="rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-accent">
                    <p className="font-semibold">{h.icon} {h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.streetLabel}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Area (you'll name the street)</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {VERIFIED_SECTORS.map((s) => (
                  <Badge key={s.id} variant={sector?.id === s.id ? "default" : "outline"}
                    className="cursor-pointer whitespace-nowrap px-3 py-2 text-sm" onClick={() => setSector(s)}>
                    {s.name}
                  </Badge>
                ))}
              </div>
              {sector && (
                <div className="mt-2 flex gap-2">
                  <Input placeholder={`Street or corner in ${sector.name}`} value={sectorStreet}
                    onChange={(e) => setSectorStreet(e.target.value)} maxLength={80} />
                  <Button onClick={confirmSector} disabled={sectorStreet.trim().length < 2}>OK</Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
