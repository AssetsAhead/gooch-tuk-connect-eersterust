
-- The "Authenticated users can view fleet vehicles" policy already exists from a prior migration.
-- Just need to ensure the old public policy is gone (DROP IF EXISTS is safe to re-run)
DROP POLICY IF EXISTS "Public can view fleet vehicles" ON public.fleet_vehicles;

-- Fix 2: Drop overly permissive SMS verification codes policy
DROP POLICY IF EXISTS "Allow service role full access" ON public.sms_verification_codes;
