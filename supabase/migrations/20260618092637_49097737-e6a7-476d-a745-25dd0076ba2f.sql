
CREATE TABLE IF NOT EXISTS public.live_vehicle_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  speed_kmh numeric(6,2),
  heading numeric(6,2),
  accuracy_m numeric(8,2),
  source text NOT NULL DEFAULT 'driver_app',
  recorded_by uuid,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_vehicle_locations_vehicle_recorded_idx
  ON public.live_vehicle_locations (vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS live_vehicle_locations_recorded_idx
  ON public.live_vehicle_locations (recorded_at DESC);

GRANT SELECT, INSERT ON public.live_vehicle_locations TO authenticated;
GRANT ALL ON public.live_vehicle_locations TO service_role;

ALTER TABLE public.live_vehicle_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read live vehicle locations"
  ON public.live_vehicle_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert their own fixes"
  ON public.live_vehicle_locations FOR INSERT
  TO authenticated
  WITH CHECK (recorded_by = auth.uid());

CREATE POLICY "Service role manages live vehicle locations"
  ON public.live_vehicle_locations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_vehicle_locations;
ALTER TABLE public.live_vehicle_locations REPLICA IDENTITY FULL;
