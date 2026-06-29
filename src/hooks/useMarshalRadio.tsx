import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Transmission = {
  id: string;
  zone_id: string | null;
  sender_id: string;
  audio_path: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  is_emergency: boolean;
  duration_ms: number | null;
  message: string | null;
  created_at: string;
};

const BUCKET = "marshal-radio";

async function getPosition(): Promise<GeolocationPosition | null> {
  if (!("geolocation" in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 5000 }
    );
  });
}

async function recordAudio(maxMs: number): Promise<{ blob: Blob; durationMs: number } | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    const chunks: BlobPart[] = [];
    const started = Date.now();
    return await new Promise((resolve) => {
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolve({ blob: new Blob(chunks, { type: mime }), durationMs: Date.now() - started });
      };
      rec.start();
      setTimeout(() => rec.state !== "inactive" && rec.stop(), maxMs);
    });
  } catch (e) {
    console.warn("recordAudio failed", e);
    return null;
  }
}

export async function sendEmergencyBroadcast(opts: {
  userId: string;
  zoneId?: string | null;
  message?: string;
}) {
  const pos = await getPosition();
  const audio = await recordAudio(15000);
  let audioPath: string | null = null;
  if (audio) {
    audioPath = `${opts.userId}/${Date.now()}-sos.webm`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(audioPath, audio.blob, { contentType: audio.blob.type, upsert: false });
    if (error) {
      console.warn("audio upload failed", error);
      audioPath = null;
    }
  }
  await supabase.from("marshal_radio_transmissions").insert({
    sender_id: opts.userId,
    zone_id: opts.zoneId ?? null,
    audio_path: audioPath,
    latitude: pos?.coords.latitude ?? null,
    longitude: pos?.coords.longitude ?? null,
    accuracy_m: pos?.coords.accuracy ?? null,
    duration_ms: audio?.durationMs ?? null,
    is_emergency: true,
    message: opts.message ?? "🚨 Emergency PTT broadcast",
  });
}

export function useMarshalRadio(zoneId: string | null) {
  const { user } = useAuth();
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Load + subscribe
  useEffect(() => {
    let active = true;
    (async () => {
      let q = supabase
        .from("marshal_radio_transmissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40);
      if (zoneId) q = q.or(`zone_id.eq.${zoneId},is_emergency.eq.true`);
      const { data } = await q;
      if (active && data) setTransmissions(data as Transmission[]);
    })();

    const ch = supabase
      .channel(`marshal-radio-${zoneId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "marshal_radio_transmissions" },
        (payload) => {
          const t = payload.new as Transmission;
          if (zoneId && t.zone_id && t.zone_id !== zoneId && !t.is_emergency) return;
          setTransmissions((prev) => [t, ...prev].slice(0, 40));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [zoneId]);

  const getSignedUrl = useCallback(async (path: string) => {
    const cached = audioCacheRef.current.get(path);
    if (cached) return cached;
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300);
    if (data?.signedUrl) audioCacheRef.current.set(path, data.signedUrl);
    return data?.signedUrl ?? null;
  }, []);

  const startTalk = useCallback(async () => {
    if (!user || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.start();
      recorderRef.current = rec;
      streamRef.current = stream;
      startedAtRef.current = Date.now();
      setIsRecording(true);
      // Hard cap 30s
      setTimeout(() => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      }, 30000);
    } catch (e) {
      console.warn("mic denied", e);
    }
  }, [user, isRecording]);

  const stopTalk = useCallback(
    async (opts?: { emergency?: boolean }) => {
      const rec = recorderRef.current;
      if (!rec || !user) return;
      const mime = rec.mimeType;
      const blob: Blob = await new Promise((resolve) => {
        rec.onstop = () => resolve(new Blob(chunksRef.current, { type: mime }));
        if (rec.state !== "inactive") rec.stop();
      });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const durationMs = Date.now() - startedAtRef.current;
      recorderRef.current = null;
      streamRef.current = null;
      setIsRecording(false);

      if (blob.size < 1000) return; // ignore taps

      const path = `${user.id}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: mime });
      const pos = await getPosition();
      await supabase.from("marshal_radio_transmissions").insert({
        sender_id: user.id,
        zone_id: zoneId,
        audio_path: upErr ? null : path,
        latitude: pos?.coords.latitude ?? null,
        longitude: pos?.coords.longitude ?? null,
        accuracy_m: pos?.coords.accuracy ?? null,
        duration_ms: durationMs,
        is_emergency: !!opts?.emergency,
        message: null,
      });
    },
    [user, zoneId]
  );

  return { transmissions, isRecording, startTalk, stopTalk, getSignedUrl };
}
