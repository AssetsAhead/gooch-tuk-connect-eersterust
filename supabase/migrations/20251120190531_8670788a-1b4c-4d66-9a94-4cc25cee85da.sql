-- Fix drivers table SELECT policies to be more restrictive
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Law enforcement view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Passengers view assigned driver during active ride" ON public.drivers;

-- Create more secure policies for drivers table
CREATE POLICY "Admins can view all drivers"
ON public.drivers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Police and marshalls can view all drivers"
ON public.drivers  
FOR SELECT
USING (
  public.has_role(auth.uid(), 'police') OR 
  public.has_role(auth.uid(), 'marshall')
);

CREATE POLICY "Passengers can view assigned driver during active rides only"
ON public.drivers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rides
    WHERE rides.driver_id = drivers.user_id
    AND rides.passenger_id = auth.uid()
    AND rides.status IN ('assigned', 'in_progress')
  )
);

-- Fix emergency_messages table to prevent unauthorized public access
DROP POLICY IF EXISTS "Everyone can view emergency messages" ON public.emergency_messages;

CREATE POLICY "Authenticated users can view emergency messages"
ON public.emergency_messages
FOR SELECT
USING (auth.uid() IS NOT NULL);