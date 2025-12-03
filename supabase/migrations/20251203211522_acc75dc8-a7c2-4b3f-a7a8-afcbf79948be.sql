-- Create table to store SMS verification codes
CREATE TABLE public.sms_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_sms_verification_phone ON public.sms_verification_codes (phone_number, expires_at);

-- Enable RLS but allow public access for verification (edge function handles security)
ALTER TABLE public.sms_verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow insert from edge function (service role)
CREATE POLICY "Allow service role full access" ON public.sms_verification_codes
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-cleanup old codes (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sms_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.sms_verification_codes 
  WHERE expires_at < now() OR verified = true;
END;
$$;