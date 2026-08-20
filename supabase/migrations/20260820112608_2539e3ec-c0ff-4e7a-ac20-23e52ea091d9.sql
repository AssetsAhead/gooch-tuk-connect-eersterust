-- 1. driver_clockings: restrict owner visibility to their own fleet drivers
DROP POLICY IF EXISTS "Owners can view driver clockings" ON public.driver_clockings;
CREATE POLICY "Owners can view clockings for their fleet drivers"
ON public.driver_clockings FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'owner') AND EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.drivers d ON d.id = v.assigned_driver_id
    WHERE v.owner_id = auth.uid() AND d.user_id = driver_clockings.driver_id
  )
);

-- 2. driver_reputation: drivers can no longer edit their own scores
DROP POLICY IF EXISTS "Drivers can update their own reputation" ON public.driver_reputation;
CREATE POLICY "Admins can update driver reputation"
ON public.driver_reputation FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. admin_audit_logs: only real admins may insert
DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_insert_test_20251107" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- 4. live_vehicle_locations: scope reads
DROP POLICY IF EXISTS "Authenticated can read live vehicle locations" ON public.live_vehicle_locations;
CREATE POLICY "Authorized users can read live vehicle locations"
ON public.live_vehicle_locations FOR SELECT TO authenticated
USING (
  recorded_by = auth.uid()
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'police')
  OR has_role(auth.uid(), 'marshall')
  OR EXISTS (
    SELECT 1 FROM public.vehicles v
    WHERE v.id = live_vehicle_locations.vehicle_id
      AND (v.owner_id = auth.uid()
           OR v.assigned_driver_id IN (SELECT d.id FROM public.drivers d WHERE d.user_id = auth.uid()))
  )
);

-- 5. marshal_radio_transmissions: scope reads to marshals/admin/police or sender
DROP POLICY IF EXISTS "Authenticated can read transmissions" ON public.marshal_radio_transmissions;
CREATE POLICY "Authorized users can read transmissions"
ON public.marshal_radio_transmissions FOR SELECT TO authenticated
USING (
  auth.uid() = sender_id
  OR has_role(auth.uid(), 'marshall')
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'police')
);

-- 6. Lock down SECURITY DEFINER / internal functions
REVOKE EXECUTE ON FUNCTION public.apply_infringement_to_reputation() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_driver() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_role_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_role_request_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_changes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_admin_sessions() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_sms_codes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, uuid, text) FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.create_admin_session(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_admin_session_whitelisted(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.revoke_admin_session() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_valid_admin_session() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_next_queue_position(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_within_zone(uuid, numeric, numeric) FROM anon;
REVOKE EXECUTE ON FUNCTION public.calculate_drive_to_own_eligibility(uuid) FROM anon;