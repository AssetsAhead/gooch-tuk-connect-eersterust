-- Enable Row Level Security on existing tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_reputation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Create RLS policies for drivers table
CREATE POLICY "Drivers can view their own data" 
ON public.drivers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own data" 
ON public.drivers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view driver locations" 
ON public.drivers 
FOR SELECT 
USING (true);

-- Create RLS policies for rides table
CREATE POLICY "Users can view their own rides" 
ON public.rides 
FOR SELECT 
USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

CREATE POLICY "Passengers can create rides" 
ON public.rides 
FOR INSERT 
WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers can update rides assigned to them" 
ON public.rides 
FOR UPDATE 
USING (auth.uid() = driver_id);

-- Create RLS policies for transactions table
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.rides 
    WHERE rides.id = transactions.ride_id 
    AND (rides.passenger_id = auth.uid() OR rides.driver_id = auth.uid())
  )
);

-- Create RLS policies for driver_reputation table
CREATE POLICY "Everyone can view driver reputation" 
ON public.driver_reputation 
FOR SELECT 
USING (true);

CREATE POLICY "Drivers can update their own reputation" 
ON public.driver_reputation 
FOR UPDATE 
USING (auth.uid() = driver_id);

-- Create ride_updates table for real-time tracking
CREATE TABLE public.ride_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_location JSONB,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  status_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ride_updates
ALTER TABLE public.ride_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view updates for their rides" 
ON public.ride_updates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.rides 
    WHERE rides.id = ride_updates.ride_id 
    AND (rides.passenger_id = auth.uid() OR rides.driver_id = auth.uid())
  )
);

CREATE POLICY "Drivers can create updates for their rides" 
ON public.ride_updates 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rides 
    WHERE rides.id = ride_updates.ride_id 
    AND rides.driver_id = auth.uid()
  )
);

-- Enable realtime for ride tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;

-- Set replica identity for real-time updates
ALTER TABLE public.rides REPLICA IDENTITY FULL;
ALTER TABLE public.ride_updates REPLICA IDENTITY FULL;
ALTER TABLE public.drivers REPLICA IDENTITY FULL;

-- Create function to automatically create driver reputation when driver is created
CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.driver_reputation (driver_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new drivers
CREATE TRIGGER on_driver_created
  AFTER INSERT ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_driver();