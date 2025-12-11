-- Create fleet revenue tracking table
CREATE TABLE public.fleet_revenue_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trips_completed INTEGER NOT NULL DEFAULT 0,
  gross_revenue NUMERIC NOT NULL DEFAULT 0,
  fuel_cost NUMERIC NOT NULL DEFAULT 0,
  maintenance_cost NUMERIC NOT NULL DEFAULT 0,
  other_costs NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id, tracking_date)
);

-- Enable RLS
ALTER TABLE public.fleet_revenue_tracking ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own tracking records
CREATE POLICY "Owners can manage their own revenue tracking"
ON public.fleet_revenue_tracking
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Admins can view all tracking records
CREATE POLICY "Admins can view all revenue tracking"
ON public.fleet_revenue_tracking
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_fleet_revenue_tracking_owner ON public.fleet_revenue_tracking(owner_id);
CREATE INDEX idx_fleet_revenue_tracking_date ON public.fleet_revenue_tracking(tracking_date);
CREATE INDEX idx_fleet_revenue_tracking_vehicle ON public.fleet_revenue_tracking(vehicle_id);

-- Add trigger for updated_at
CREATE TRIGGER update_fleet_revenue_tracking_updated_at
BEFORE UPDATE ON public.fleet_revenue_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();