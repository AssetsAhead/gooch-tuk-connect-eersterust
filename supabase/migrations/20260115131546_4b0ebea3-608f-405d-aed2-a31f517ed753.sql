-- Drop the overly permissive policy that allows all authenticated users to view fleet vehicles
DROP POLICY IF EXISTS "Authenticated users can view fleet vehicles" ON public.fleet_vehicles;

-- Create a new restrictive policy that only allows owners and admins to view fleet vehicles
CREATE POLICY "Owners and admins can view fleet vehicles"
ON public.fleet_vehicles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::text) OR 
  has_role(auth.uid(), 'admin'::text)
);