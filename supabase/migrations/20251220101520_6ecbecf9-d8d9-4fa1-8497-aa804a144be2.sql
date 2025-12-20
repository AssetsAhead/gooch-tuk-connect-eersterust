-- Fix: Restrict sms_verification_codes table to service role only
-- This prevents the current vulnerability where any authenticated user can read SMS codes

-- Step 1: Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow service role full access" ON public.sms_verification_codes;

-- Step 2: Create restrictive policy - only service_role can access
CREATE POLICY "Service role only access" 
ON public.sms_verification_codes
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Step 3: Invalidate all existing exposed codes as a precaution
UPDATE public.sms_verification_codes 
SET verified = true 
WHERE verified = false;