CREATE TABLE public.hopper_exchange_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_user_id uuid NOT NULL,
  shift_id uuid NOT NULL,
  event_type text NOT NULL,
  passenger_count integer NOT NULL DEFAULT 1,
  occupancy_after integer NOT NULL DEFAULT 0,
  latitude numeric,
  longitude numeric,
  accuracy_m numeric,
  location_label text,
  fare_amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.hopper_exchange_events TO authenticated;
GRANT ALL ON public.hopper_exchange_events TO service_role;

ALTER TABLE public.hopper_exchange_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers log their own exchanges"
ON public.hopper_exchange_events FOR INSERT TO authenticated
WITH CHECK (driver_user_id = auth.uid());

CREATE POLICY "Drivers read their own exchanges"
ON public.hopper_exchange_events FOR SELECT TO authenticated
USING (driver_user_id = auth.uid());

CREATE POLICY "Admins and owners read exchanges"
ON public.hopper_exchange_events FOR SELECT TO authenticated
USING (public.is_current_user_admin() OR public.has_role(auth.uid(), 'owner'));

CREATE OR REPLACE FUNCTION public.validate_hopper_event()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.event_type NOT IN ('board','alight') THEN
    RAISE EXCEPTION 'event_type must be board or alight';
  END IF;
  IF NEW.passenger_count < 1 OR NEW.passenger_count > 8 THEN
    RAISE EXCEPTION 'passenger_count out of range';
  END IF;
  IF NEW.occupancy_after < 0 OR NEW.occupancy_after > 8 THEN
    RAISE EXCEPTION 'occupancy_after out of range';
  END IF;
  IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN
    RAISE EXCEPTION 'invalid latitude';
  END IF;
  IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN
    RAISE EXCEPTION 'invalid longitude';
  END IF;
  IF NEW.fare_amount < 0 OR NEW.fare_amount > 1000 THEN
    RAISE EXCEPTION 'fare out of range';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_validate_hopper_event
BEFORE INSERT ON public.hopper_exchange_events
FOR EACH ROW EXECUTE FUNCTION public.validate_hopper_event();

CREATE INDEX idx_hopper_events_driver_time ON public.hopper_exchange_events (driver_user_id, created_at DESC);
CREATE INDEX idx_hopper_events_shift ON public.hopper_exchange_events (shift_id, created_at);