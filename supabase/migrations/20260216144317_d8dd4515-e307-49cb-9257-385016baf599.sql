-- Fix: Restrict association_executives to authenticated users only (was publicly readable with PII like phone/email)
DROP POLICY IF EXISTS "Everyone can view executives" ON public.association_executives;

CREATE POLICY "Authenticated users can view executives"
ON public.association_executives
FOR SELECT
TO authenticated
USING (true);