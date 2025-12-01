-- Create vehicles table for fleet management
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE,
  route_number TEXT,
  vehicle_type TEXT NOT NULL DEFAULT 'tuk_tuk',
  color TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  insurance_expiry DATE,
  roadworthy_expiry DATE,
  operating_license_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Owners can manage their own vehicles
CREATE POLICY "Owners can manage their own vehicles"
ON public.vehicles
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Assigned drivers can view their assigned vehicle
CREATE POLICY "Drivers can view assigned vehicles"
ON public.vehicles
FOR SELECT
USING (auth.uid() = assigned_driver_id);

-- Admins can manage all vehicles
CREATE POLICY "Admins can manage all vehicles"
ON public.vehicles
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Police and marshalls can view all vehicles for enforcement
CREATE POLICY "Law enforcement can view all vehicles"
ON public.vehicles
FOR SELECT
USING (has_role(auth.uid(), 'police') OR has_role(auth.uid(), 'marshall'));

-- Create updated_at trigger
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();