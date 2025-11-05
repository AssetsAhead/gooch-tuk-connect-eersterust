-- Fix drivers table RLS - restrict to authorized access only
DROP POLICY IF EXISTS "Drivers can view their own data" ON drivers;
DROP POLICY IF EXISTS "Drivers can update their own data" ON drivers;
DROP POLICY IF EXISTS "Drivers see own data" ON drivers;
DROP POLICY IF EXISTS "Law enforcement sees all drivers" ON drivers;
DROP POLICY IF EXISTS "Passengers see assigned drivers" ON drivers;

-- Drivers can view and update their own data
CREATE POLICY "Drivers manage own data"
ON drivers FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Passengers can only view drivers assigned to their active rides
CREATE POLICY "Passengers view assigned drivers"
ON drivers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rides
    WHERE rides.driver_id = drivers.user_id
      AND rides.passenger_id = auth.uid()
      AND rides.status IN ('requested', 'assigned', 'in_progress')
  )
);

-- Law enforcement can view all drivers using security definer function
CREATE POLICY "Law enforcement view all drivers"
ON drivers FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'police') OR 
  has_role(auth.uid(), 'marshall')
);

-- Only admins can manage all driver records
CREATE POLICY "Admins manage all drivers"
ON drivers FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));