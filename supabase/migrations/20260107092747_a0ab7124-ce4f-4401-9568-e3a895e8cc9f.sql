-- Create loading zones table (ranks, stations, malls, etc.)
CREATE TABLE public.loading_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name TEXT NOT NULL,
  zone_type TEXT NOT NULL DEFAULT 'rank', -- rank, station, mall, hospital, other
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 50, -- GPS boundary radius
  municipality TEXT,
  ward TEXT,
  address TEXT,
  operating_hours JSONB, -- {"start": "05:00", "end": "22:00"}
  has_marshal BOOLEAN DEFAULT false,
  marshal_user_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zone queue table for driver queue management
CREATE TABLE public.zone_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.loading_zones(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  fleet_vehicle_id UUID REFERENCES public.fleet_vehicles(id),
  queue_position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, loading, departed, skipped, removed
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  loading_started_at TIMESTAMP WITH TIME ZONE,
  departed_at TIMESTAMP WITH TIME ZONE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  last_location_update TIMESTAMP WITH TIME ZONE,
  is_gps_verified BOOLEAN DEFAULT false,
  distance_from_zone DECIMAL(10, 2), -- meters from zone center
  skip_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_driver_active_queue UNIQUE (driver_id, zone_id, status) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Create index for faster queue lookups
CREATE INDEX idx_zone_queue_zone_status ON public.zone_queue(zone_id, status);
CREATE INDEX idx_zone_queue_driver ON public.zone_queue(driver_id);
CREATE INDEX idx_zone_queue_position ON public.zone_queue(zone_id, queue_position) WHERE status = 'waiting';
CREATE INDEX idx_loading_zones_location ON public.loading_zones(latitude, longitude);
CREATE INDEX idx_loading_zones_active ON public.loading_zones(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.loading_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_queue ENABLE ROW LEVEL SECURITY;

-- Loading zones policies (viewable by all authenticated users)
CREATE POLICY "Anyone can view active loading zones"
  ON public.loading_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins and marshals can manage loading zones"
  ON public.loading_zones FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'marshal')
  );

-- Zone queue policies
CREATE POLICY "Drivers can view queue at any zone"
  ON public.zone_queue FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Drivers can join/update their own queue entry"
  ON public.zone_queue FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own queue entry"
  ON public.zone_queue FOR UPDATE
  USING (auth.uid() = driver_id);

CREATE POLICY "Marshals and admins can manage all queue entries"
  ON public.zone_queue FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'marshal')
  );

-- Trigger for updated_at
CREATE TRIGGER update_loading_zones_updated_at
  BEFORE UPDATE ON public.loading_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zone_queue_updated_at
  BEFORE UPDATE ON public.zone_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get next queue position for a zone
CREATE OR REPLACE FUNCTION public.get_next_queue_position(_zone_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(queue_position), 0) + 1
  FROM public.zone_queue
  WHERE zone_id = _zone_id AND status = 'waiting';
$$;

-- Function to check if driver is within zone boundary
CREATE OR REPLACE FUNCTION public.is_within_zone(_zone_id UUID, _lat DECIMAL, _lng DECIMAL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.loading_zones
    WHERE id = _zone_id
    AND is_active = true
    AND (
      6371000 * acos(
        cos(radians(_lat)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(_lng)) + 
        sin(radians(_lat)) * sin(radians(latitude))
      )
    ) <= radius_meters
  );
$$;

-- Enable realtime for queue updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.zone_queue;
ALTER TABLE public.zone_queue REPLICA IDENTITY FULL;

-- Insert some initial loading zones (Pretoria area examples)
INSERT INTO public.loading_zones (zone_name, zone_type, latitude, longitude, radius_meters, municipality, address) VALUES
  ('Waltloo Station', 'station', -25.7461, 28.2874, 75, 'City of Tshwane', 'Waltloo Station, Pretoria'),
  ('Eersterust Station', 'station', -25.7234, 28.3156, 75, 'City of Tshwane', 'Eersterust Station, Pretoria'),
  ('Mamelodi Main Rank', 'rank', -25.7089, 28.3547, 100, 'City of Tshwane', 'Mamelodi West, Pretoria'),
  ('Bosman Station', 'station', -25.7516, 28.1889, 100, 'City of Tshwane', 'Bosman Street, Pretoria CBD');