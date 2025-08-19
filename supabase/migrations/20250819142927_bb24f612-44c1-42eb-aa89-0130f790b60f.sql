-- Create POPIA compliance and security audit tables for enhanced security framework

-- Create enum for data types
CREATE TYPE public.pii_data_type AS ENUM (
  'identity_number',
  'phone_number', 
  'email',
  'address',
  'biometric',
  'financial'
);

-- Create enum for legal basis
CREATE TYPE public.legal_basis AS ENUM (
  'consent',
  'contract',
  'legal_obligation',
  'vital_interests',
  'public_task',
  'legitimate_interests'
);

-- Create enum for data operations
CREATE TYPE public.data_operation AS ENUM (
  'collect',
  'process',
  'store',
  'transmit',
  'delete'
);

-- Create POPIA consent records table
CREATE TABLE public.popia_consent_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  purpose TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  legal_basis legal_basis NOT NULL DEFAULT 'consent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.popia_consent_records ENABLE ROW LEVEL SECURITY;

-- Create policies for POPIA consent records
CREATE POLICY "Users can view their own consent records" 
ON public.popia_consent_records 
FOR SELECT 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can create their own consent records" 
ON public.popia_consent_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own consent records" 
ON public.popia_consent_records 
FOR UPDATE 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Admins can view all consent records" 
ON public.popia_consent_records 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create PII data records table
CREATE TABLE public.pii_data_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data_type pii_data_type NOT NULL,
  encrypted_value TEXT NOT NULL,
  source TEXT NOT NULL,
  purpose TEXT NOT NULL,
  retention_days INTEGER NOT NULL DEFAULT 2555,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pii_data_records ENABLE ROW LEVEL SECURITY;

-- Create policies for PII data records
CREATE POLICY "Users can view their own PII data" 
ON public.pii_data_records 
FOR SELECT 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "System can insert PII data" 
ON public.pii_data_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete their own PII data" 
ON public.pii_data_records 
FOR DELETE 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Admins can view all PII data" 
ON public.pii_data_records 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create data processing logs table
CREATE TABLE public.data_processing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  data_type TEXT NOT NULL,
  operation data_operation NOT NULL,
  purpose TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lawful_basis legal_basis NOT NULL DEFAULT 'consent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.data_processing_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for data processing logs
CREATE POLICY "Users can view their own processing logs" 
ON public.data_processing_logs 
FOR SELECT 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "System can insert processing logs" 
ON public.data_processing_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all processing logs" 
ON public.data_processing_logs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create security audit logs table
CREATE TABLE public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB,
  ip_address TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for security audit logs
CREATE POLICY "Only admins can view security audit logs" 
ON public.security_audit_logs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add government verification flags to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_government_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS popia_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_law_enforcement BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX idx_popia_consent_user_purpose ON public.popia_consent_records(user_id, purpose);
CREATE INDEX idx_pii_data_user_type ON public.pii_data_records(user_id, data_type);
CREATE INDEX idx_processing_logs_user_timestamp ON public.data_processing_logs(user_id, timestamp);
CREATE INDEX idx_security_audit_user_event ON public.security_audit_logs(user_id, event_type);
CREATE INDEX idx_pii_data_expires_at ON public.pii_data_records(expires_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_popia_consent_updated_at
BEFORE UPDATE ON public.popia_consent_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pii_data_updated_at
BEFORE UPDATE ON public.pii_data_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();