-- Trip-level revenue tracking for granular financial intelligence
CREATE TABLE public.trip_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  driver_id UUID REFERENCES public.drivers(user_id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trip_time TIME,
  pickup_location TEXT,
  dropoff_location TEXT,
  route_name TEXT,
  fare_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  rank_access_fee NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  driver_share NUMERIC GENERATED ALWAYS AS (fare_amount * 0.4) STORED,
  owner_share NUMERIC GENERATED ALWAYS AS (fare_amount * 0.6) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX idx_trip_revenue_owner ON public.trip_revenue(owner_id);
CREATE INDEX idx_trip_revenue_driver ON public.trip_revenue(driver_id);
CREATE INDEX idx_trip_revenue_vehicle ON public.trip_revenue(vehicle_id);
CREATE INDEX idx_trip_revenue_date ON public.trip_revenue(trip_date);

-- Enable RLS
ALTER TABLE public.trip_revenue ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own trip records
CREATE POLICY "Owners can manage their trip revenue"
ON public.trip_revenue
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Drivers can view trips they drove
CREATE POLICY "Drivers can view their assigned trips"
ON public.trip_revenue
FOR SELECT
USING (auth.uid() = driver_id);

-- Admins have full access for association-wide views
CREATE POLICY "Admins can view all trip revenue"
ON public.trip_revenue
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Weekly rank access fee tracking
CREATE TABLE public.rank_access_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.drivers(user_id),
  week_starting DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id, week_starting)
);

-- Enable RLS
ALTER TABLE public.rank_access_fees ENABLE ROW LEVEL SECURITY;

-- Owners can manage their fee records
CREATE POLICY "Owners can manage their rank access fees"
ON public.rank_access_fees
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Admins can view all fees
CREATE POLICY "Admins can view all rank access fees"
ON public.rank_access_fees
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Update timestamp trigger
CREATE TRIGGER update_trip_revenue_updated_at
BEFORE UPDATE ON public.trip_revenue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rank_access_fees_updated_at
BEFORE UPDATE ON public.rank_access_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();