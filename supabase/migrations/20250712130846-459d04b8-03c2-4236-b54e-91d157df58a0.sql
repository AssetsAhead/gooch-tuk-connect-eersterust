-- Create SASSA verification table
CREATE TABLE public.sassa_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  grant_type VARCHAR NOT NULL,
  card_photo_url TEXT,
  verification_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sassa_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own SASSA verifications" 
ON public.sassa_verifications 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own SASSA verifications" 
ON public.sassa_verifications 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own SASSA verifications" 
ON public.sassa_verifications 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create storage bucket for SASSA card photos
INSERT INTO storage.buckets (id, name, public) VALUES ('sassa-cards', 'sassa-cards', false);

-- Create storage policies
CREATE POLICY "Users can upload their own SASSA card photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'sassa-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own SASSA card photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sassa-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for timestamps
CREATE TRIGGER update_sassa_verifications_updated_at
BEFORE UPDATE ON public.sassa_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();