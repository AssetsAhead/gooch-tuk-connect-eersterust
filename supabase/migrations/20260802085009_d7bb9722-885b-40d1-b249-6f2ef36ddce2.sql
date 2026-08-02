ALTER TABLE public.trip_revenue
  ADD COLUMN IF NOT EXISTS logged_by uuid,
  ADD COLUMN IF NOT EXISTS passenger_count integer NOT NULL DEFAULT 1;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_revenue TO authenticated;
GRANT ALL ON public.trip_revenue TO service_role;

DROP POLICY IF EXISTS "Marshals and admins can log trips" ON public.trip_revenue;
CREATE POLICY "Marshals and admins can log trips"
ON public.trip_revenue
FOR INSERT
TO authenticated
WITH CHECK (
  logged_by = auth.uid()
  AND (
    public.has_role(auth.uid(), 'marshall')
    OR public.has_role(auth.uid(), 'marshal')
    OR public.has_role(auth.uid(), 'admin')
  )
);

DROP POLICY IF EXISTS "Marshals and admins can view logged trips" ON public.trip_revenue;
CREATE POLICY "Marshals and admins can view logged trips"
ON public.trip_revenue
FOR SELECT
TO authenticated
USING (
  logged_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);