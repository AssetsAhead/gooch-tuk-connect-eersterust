-- Allow authenticated passengers to view online drivers for hailing
CREATE POLICY "Authenticated users can view online drivers for hailing"
ON public.drivers
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND status = 'online'
);

-- Ensure passengers can insert rides 
CREATE POLICY "Passengers can create ride requests"
ON public.rides
FOR INSERT
WITH CHECK (auth.uid() = passenger_id);

-- Allow passengers to view their own rides
CREATE POLICY "Passengers can view their own rides"
ON public.rides
FOR SELECT
USING (auth.uid() = passenger_id);

-- Allow passengers to update their own pending rides (cancel)
CREATE POLICY "Passengers can update their own pending rides"
ON public.rides
FOR UPDATE
USING (auth.uid() = passenger_id AND status IN ('requested', 'pending'))
WITH CHECK (auth.uid() = passenger_id);