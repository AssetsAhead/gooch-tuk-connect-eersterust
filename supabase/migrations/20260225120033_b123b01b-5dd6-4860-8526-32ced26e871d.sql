
-- Storage bucket for face photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('face-photos', 'face-photos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for face-photos bucket
CREATE POLICY "Users can upload own face photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'face-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own face photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'face-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all face photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'face-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own face photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'face-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Driver face registrations table
CREATE TABLE public.driver_face_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  photo_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  registered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.driver_face_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can manage own face registration"
ON public.driver_face_registrations FOR ALL
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Admins can view all face registrations"
ON public.driver_face_registrations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Driver clockings table
CREATE TABLE public.driver_clockings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  clocking_type TEXT NOT NULL CHECK (clocking_type IN ('shift_start', 'shift_end', 'trip_start', 'trip_end')),
  photo_path TEXT NOT NULL,
  verification_result JSONB,
  confidence_score NUMERIC(5,4),
  is_verified BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  clocked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.driver_clockings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can insert own clockings"
ON public.driver_clockings FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can view own clockings"
ON public.driver_clockings FOR SELECT
TO authenticated
USING (driver_id = auth.uid());

CREATE POLICY "Admins can view all clockings"
ON public.driver_clockings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view driver clockings"
ON public.driver_clockings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'owner'));

-- Indexes
CREATE INDEX idx_driver_clockings_driver_id ON public.driver_clockings(driver_id);
CREATE INDEX idx_driver_clockings_clocked_at ON public.driver_clockings(clocked_at DESC);
CREATE INDEX idx_driver_face_registrations_driver_id ON public.driver_face_registrations(driver_id);

-- Trigger for updated_at
CREATE TRIGGER update_face_registrations_updated_at
  BEFORE UPDATE ON public.driver_face_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
