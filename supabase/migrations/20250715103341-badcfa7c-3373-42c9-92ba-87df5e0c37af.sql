-- Create security tables for enhanced monitoring
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  details JSONB
);

CREATE TABLE public.panic_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location JSONB,
  alert_type TEXT NOT NULL DEFAULT 'manual_panic',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.location_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  accuracy DECIMAL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  incident_type TEXT NOT NULL,
  details JSONB,
  status TEXT NOT NULL DEFAULT 'reported',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own security logs" 
ON public.security_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create panic alerts" 
ON public.panic_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own panic alerts" 
ON public.panic_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own panic alerts" 
ON public.panic_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create location logs" 
ON public.location_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own location logs" 
ON public.location_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create security incidents" 
ON public.security_incidents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own security incidents" 
ON public.security_incidents 
FOR SELECT 
USING (auth.uid() = user_id);