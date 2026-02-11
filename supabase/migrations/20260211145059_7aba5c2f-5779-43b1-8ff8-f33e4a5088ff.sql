-- Fix: Remove overly permissive public SELECT policy on fleet_vehicles
DROP POLICY IF EXISTS "Public can view fleet vehicles" ON public.fleet_vehicles;

-- Replace with authenticated role-based access
CREATE POLICY "Authenticated users can view fleet vehicles"
ON public.fleet_vehicles
FOR SELECT
USING (auth.uid() IS NOT NULL);