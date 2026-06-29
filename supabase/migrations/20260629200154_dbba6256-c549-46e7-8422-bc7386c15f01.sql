
CREATE TABLE public.marshal_radio_transmissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.loading_zones(id) ON DELETE SET NULL,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_path text,
  latitude numeric,
  longitude numeric,
  accuracy_m numeric,
  is_emergency boolean NOT NULL DEFAULT false,
  duration_ms integer,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mrt_zone_created ON public.marshal_radio_transmissions (zone_id, created_at DESC);
CREATE INDEX idx_mrt_emergency ON public.marshal_radio_transmissions (is_emergency, created_at DESC) WHERE is_emergency = true;

GRANT SELECT, INSERT, DELETE ON public.marshal_radio_transmissions TO authenticated;
GRANT ALL ON public.marshal_radio_transmissions TO service_role;

ALTER TABLE public.marshal_radio_transmissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read transmissions"
  ON public.marshal_radio_transmissions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can post own transmissions"
  ON public.marshal_radio_transmissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Sender or admin can delete transmissions"
  ON public.marshal_radio_transmissions FOR DELETE
  TO authenticated USING (auth.uid() = sender_id OR public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.marshal_radio_transmissions;
ALTER TABLE public.marshal_radio_transmissions REPLICA IDENTITY FULL;

CREATE POLICY "Auth users can upload PTT audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'marshal-radio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Auth users can read PTT audio"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'marshal-radio');

CREATE POLICY "Owner can delete PTT audio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'marshal-radio' AND auth.uid()::text = (storage.foldername(name))[1]);
