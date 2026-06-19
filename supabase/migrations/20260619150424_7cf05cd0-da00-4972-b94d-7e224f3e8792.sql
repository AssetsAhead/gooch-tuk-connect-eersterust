CREATE POLICY enrollments_driver_apply ON public.drive_to_own_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid() AND status = 'applied');

CREATE POLICY enrollments_driver_update_own_pending ON public.drive_to_own_enrollments
  FOR UPDATE TO authenticated
  USING (driver_id = auth.uid() AND status = 'applied')
  WITH CHECK (driver_id = auth.uid() AND status = 'applied');