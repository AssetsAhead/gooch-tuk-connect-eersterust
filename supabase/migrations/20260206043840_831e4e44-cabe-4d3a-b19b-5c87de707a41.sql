-- Allow public read access to fleet_vehicles for demo/presentation purposes
CREATE POLICY "Public can view fleet vehicles"
ON public.fleet_vehicles
FOR SELECT
USING (true);

-- Drop the restrictive select policy
DROP POLICY "Owners and admins can view fleet vehicles" ON public.fleet_vehicles;