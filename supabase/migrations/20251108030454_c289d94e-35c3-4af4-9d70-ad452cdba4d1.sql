-- Fix drivers table RLS policies to restrict data access
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Passengers view assigned drivers" ON public.drivers;
DROP POLICY IF EXISTS "Law enforcement view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_le_test_20251107" ON public.drivers;

-- Create restrictive SELECT policy: Only drivers see their own data, admins/police/marshalls see all
CREATE POLICY "Drivers view own data, law enforcement views all"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'police') 
  OR has_role(auth.uid(), 'marshall')
);

-- Passengers can only view driver basic info when they have an active ride with that driver
CREATE POLICY "Passengers view assigned driver info only"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.rides
    WHERE rides.driver_id = drivers.user_id
      AND rides.passenger_id = auth.uid()
      AND rides.status IN ('requested', 'assigned', 'in_progress')
  )
);