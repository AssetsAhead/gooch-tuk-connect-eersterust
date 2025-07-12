-- Enable real-time updates for key tables
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
ALTER TABLE public.rides REPLICA IDENTITY FULL;
ALTER TABLE public.ride_updates REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.driver_reputation REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;  
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_reputation;

-- Create video storage bucket for incident uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('incident-videos', 'incident-videos', false);

-- Create policies for video uploads
CREATE POLICY "Users can upload their own incident videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'incident-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own incident videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'incident-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Police can view all incident videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'incident-videos' AND EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'police'
));

-- Create incident reports table for video uploads
CREATE TABLE public.incident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  incident_type TEXT NOT NULL,
  location TEXT,
  video_url TEXT,
  photo_urls TEXT[],
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'reported',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on incident reports
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for incident reports
CREATE POLICY "Users can create their own incident reports" 
ON public.incident_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own incident reports" 
ON public.incident_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Police can view all incident reports" 
ON public.incident_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'police'
));

CREATE POLICY "Police can update incident reports" 
ON public.incident_reports 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'police'
));

-- Create trigger for automatic timestamp updates on incident reports
CREATE TRIGGER update_incident_reports_updated_at
BEFORE UPDATE ON public.incident_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();