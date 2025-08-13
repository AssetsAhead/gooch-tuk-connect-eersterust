-- Fix security vulnerability: Restrict driver data access to authenticated users only
-- Remove the overly permissive policy that allows everyone to view driver locations
DROP POLICY IF EXISTS "Everyone can view driver locations" ON public.drivers;

-- Create a new policy that only allows authenticated users to view driver data
-- This ensures only logged-in passengers can see available drivers
CREATE POLICY "Authenticated users can view driver locations" 
ON public.drivers 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: Further restrict to only passengers and relevant roles
-- Uncomment the following if you want to be more restrictive:
-- DROP POLICY IF EXISTS "Authenticated users can view driver locations" ON public.drivers;
-- CREATE POLICY "Passengers and relevant roles can view driver locations" 
-- ON public.drivers 
-- FOR SELECT 
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM user_roles 
--     WHERE user_id = auth.uid() 
--     AND role IN ('passenger', 'admin', 'marshall', 'police')
--   )
-- );