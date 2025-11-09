-- Fix: Driver Personal Information Exposure
-- Drop existing overly permissive policies and create strict access control

-- Drop all existing SELECT policies on drivers table
DROP POLICY IF EXISTS "Drivers view own data, law enforcement views all" ON public.drivers;
DROP POLICY IF EXISTS "Passengers view assigned driver info only" ON public.drivers;
DROP POLICY IF EXISTS "drivers_manage_test_20251107" ON public.drivers;

-- Create strict, non-overlapping SELECT policies
-- 1. Drivers can view ONLY their own data
CREATE POLICY "Drivers view own data only"
ON public.drivers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Law enforcement can view all drivers
CREATE POLICY "Law enforcement view all drivers"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'police') OR 
  has_role(auth.uid(), 'marshall')
);

-- 3. Passengers can view ONLY their currently assigned driver during active rides
CREATE POLICY "Passengers view assigned driver during active ride"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rides
    WHERE rides.driver_id = drivers.user_id
      AND rides.passenger_id = auth.uid()
      AND rides.status IN ('assigned', 'in_progress')
  )
);