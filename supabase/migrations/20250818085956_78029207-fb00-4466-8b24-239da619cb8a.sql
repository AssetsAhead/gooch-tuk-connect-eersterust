-- Create user registration table with phone-based authentication
CREATE TABLE public.user_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT,
  drivers_license_number TEXT,
  pdp_number TEXT,
  registration_status TEXT NOT NULL DEFAULT 'trial',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create phone numbers table to support multiple numbers per user
CREATE TABLE public.user_phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(phone_number)
);

-- Create portal access table for admin control
CREATE TABLE public.portal_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portal_type TEXT NOT NULL, -- 'driver', 'passenger', 'admin', etc.
  access_granted BOOLEAN NOT NULL DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, portal_type)
);

-- Enable RLS
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_registrations
CREATE POLICY "Users can view their own registration" 
ON public.user_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registration" 
ON public.user_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registration" 
ON public.user_registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations" 
ON public.user_registrations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for user_phone_numbers
CREATE POLICY "Users can manage their own phone numbers" 
ON public.user_phone_numbers 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all phone numbers" 
ON public.user_phone_numbers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for portal_access
CREATE POLICY "Users can view their own portal access" 
ON public.portal_access 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all portal access" 
ON public.portal_access 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Triggers for updated_at
CREATE TRIGGER update_user_registrations_updated_at
  BEFORE UPDATE ON public.user_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_phone_numbers_updated_at
  BEFORE UPDATE ON public.user_phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_access_updated_at
  BEFORE UPDATE ON public.portal_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();