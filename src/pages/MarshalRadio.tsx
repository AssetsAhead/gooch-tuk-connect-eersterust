import { useEffect, useRef, useState } from "react";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, AlertTriangle, MapPin, Play, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMarshalRadio, type Transmission } from "@/hooks/useMarshalRadio";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Zone = { id: string; name: string };

const TransmissionRow = ({
  t,
  getUrl,
}: {
  t: Transmission;
  getUrl: (p: string) => Promise<string | null>;
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (t.audio_path) getUrl(t.audio_path).then(setUrl);
  }, [t.audio_path, getUrl]);

  // Auto-play emergencies once
  useEffect(() => {
    if (t.is_emergency && url && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [t.is_emergency, url]);

  const mapsHref =
    t.latitude && t.longitude
      ? `https://www.google.com/maps?q=${t.latitude},${t.longitude}`
      : null;

  return (
    <div
      className={`p-3 rounded-lg border ${
        t.is_emergency ? "border-destructive bg-destructive/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          {t.is_emergency ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> EMERGENCY
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Radio className="h-3 w-3" /> PTT
            </Badge>
          )}
          <span className="text-muted-foreground text-xs">
            {new Date(t.created_at).toLocaleTimeString()}
          </span>
          {t.duration_ms ? (
            <span className="text-xs text-muted-foreground">
              {(t.duration_ms / 1000).toFixed(1)}s
            </span>
          ) : null}
        </div>
        {mapsHref && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
          >
            <MapPin className="h-3 w-3" /> Map
          </a>
        )}
      </div>
      {t.message && <p className="text-sm mb-2">{t.message}</p>}
      {url ? (
        <audio ref={audioRef} controls src={url} className="w-full h-9" />
      ) : t.audio_path ? (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Play className="h-3 w-3" /> loading audio…
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">No audio attached.</div>
      )}
    </div>
  );
};

export default function MarshalRadio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneId, setZoneId] = useState<string | null>(null);
  const { transmissions, isRecording, startTalk, stopTalk, getSignedUrl } =
    useMarshalRadio(zoneId);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("loading_zones")
        .select("id,name")
        .eq("is_active", true)
        .order("name");
      if (data) {
        setZones(data as Zone[]);
        if (data.length && !zoneId) setZoneId(data[0].id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressStart = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Marshals must be signed in to broadcast.", variant: "destructive" });
      return;
    }
    await startTalk();
  };
  const onPressEnd = () => stopTalk();
  const onEmergency = async () => {
    if (!user) return;
    if (isRecording) {
      await stopTalk({ emergency: true });
    } else {
      await startTalk();
      setTimeout(() => stopTalk({ emergency: true }), 8000);
    }
    toast({ title: "🚨 Emergency broadcast sent", description: "All marshals notified with your GPS." });
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Radio className="h-7 w-7 text-primary" /> Marshal Radio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Push-to-talk voice channel for marshals on the rank floor. Scoped per loading
            zone; emergencies broadcast to every zone.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active channel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={zoneId ?? ""} onValueChange={(v) => setZoneId(v || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose loading zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.length === 0 && (
                  <SelectItem value="none" disabled>
                    No active zones
                  </SelectItem>
                )}
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col items-center gap-3 py-4">
              <button
                onMouseDown={onPressStart}
                onMouseUp={onPressEnd}
                onMouseLeave={() => isRecording && onPressEnd()}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onPressStart();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onPressEnd();
                }}
                className={`h-32 w-32 rounded-full select-none transition-all flex items-center justify-center text-white font-bold shadow-lg ${
                  isRecording
                    ? "bg-destructive scale-110 animate-pulse"
                    : "bg-primary hover:scale-105"
                }`}
                aria-label="Push to talk"
              >
                {isRecording ? (
                  <Mic className="h-12 w-12" />
                ) : (
                  <MicOff className="h-12 w-12" />
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                {isRecording ? "Recording… release to send (max 30s)" : "Hold to talk"}
              </p>
              <Button
                variant="destructive"
                onClick={onEmergency}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" /> Emergency broadcast + GPS
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent transmissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No traffic yet on this channel.</p>
            ) : (
              transmissions.map((t) => (
                <TransmissionRow key={t.id} t={t} getUrl={getSignedUrl} />
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
