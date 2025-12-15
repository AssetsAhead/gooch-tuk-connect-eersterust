-- Create SMS usage tracking table
CREATE TABLE public.sms_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'otp',
  twilio_sid TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  cost_estimate DECIMAL(10,4) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_usage_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all SMS logs
CREATE POLICY "Admins can view all SMS logs"
ON public.sms_usage_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for efficient queries
CREATE INDEX idx_sms_usage_logs_created_at ON public.sms_usage_logs(created_at DESC);
CREATE INDEX idx_sms_usage_logs_message_type ON public.sms_usage_logs(message_type);