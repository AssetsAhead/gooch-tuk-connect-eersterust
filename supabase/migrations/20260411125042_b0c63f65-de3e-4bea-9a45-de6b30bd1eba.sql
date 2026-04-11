
-- Create WhatsApp intel messages table
CREATE TABLE public.whatsapp_intel_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_number TEXT NOT NULL,
  message_body TEXT,
  media_url TEXT,
  twilio_sid TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  review_notes TEXT,
  reviewed_by UUID,
  forwarded_from TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_intel_messages ENABLE ROW LEVEL SECURITY;

-- Admins and owners can view all intel
CREATE POLICY "Admins and owners can view intel messages"
ON public.whatsapp_intel_messages
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner')
);

-- Admins can update (categorise, review)
CREATE POLICY "Admins can update intel messages"
ON public.whatsapp_intel_messages
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role inserts (edge function) — no authenticated insert policy needed
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS

-- Index for category filtering and date queries
CREATE INDEX idx_whatsapp_intel_category ON public.whatsapp_intel_messages(category);
CREATE INDEX idx_whatsapp_intel_received ON public.whatsapp_intel_messages(received_at DESC);
CREATE INDEX idx_whatsapp_intel_reviewed ON public.whatsapp_intel_messages(is_reviewed);

-- Timestamp trigger
CREATE TRIGGER update_whatsapp_intel_updated_at
BEFORE UPDATE ON public.whatsapp_intel_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
