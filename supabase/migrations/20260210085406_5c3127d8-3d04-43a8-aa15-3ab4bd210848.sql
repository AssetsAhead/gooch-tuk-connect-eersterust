-- Fix: Restrict loading_zones SELECT to authenticated users only
-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Loading zones are publicly readable" ON public.loading_zones;
DROP POLICY IF EXISTS "Anyone can view active loading zones" ON public.loading_zones;
DROP POLICY IF EXISTS "Public can view active loading zones" ON public.loading_zones;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view loading zones"
  ON public.loading_zones
  FOR SELECT
  TO authenticated
  USING (true);