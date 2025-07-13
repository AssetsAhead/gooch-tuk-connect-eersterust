-- Create municipal services table for rates, taxes, water, electricity bills
CREATE TABLE public.municipal_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('rates_taxes', 'water', 'electricity', 'property_valuation')),
  account_number TEXT NOT NULL,
  municipality TEXT NOT NULL,
  property_address TEXT NOT NULL,
  current_balance DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  bill_period TEXT,
  meter_reading TEXT,
  consumption_units TEXT,
  rate_per_unit DECIMAL(10,4),
  document_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid', 'overdue', 'disconnected')),
  auto_pay_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_type, account_number)
);

-- Enable RLS
ALTER TABLE public.municipal_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own municipal services" 
ON public.municipal_services 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create municipal bills table for historical bills
CREATE TABLE public.municipal_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.municipal_services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  consumption DECIMAL(10,2),
  meter_reading TEXT,
  previous_reading TEXT,
  bill_number TEXT,
  document_url TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'overdue', 'partial')),
  payment_date DATE,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bills
ALTER TABLE public.municipal_bills ENABLE ROW LEVEL SECURITY;

-- Create policies for bills
CREATE POLICY "Users can manage their own municipal bills" 
ON public.municipal_bills 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_municipal_services_updated_at
BEFORE UPDATE ON public.municipal_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_municipal_bills_updated_at
BEFORE UPDATE ON public.municipal_bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for municipal documents
INSERT INTO storage.buckets (id, name, public) VALUES ('municipal-documents', 'municipal-documents', false);

-- Create policies for municipal document uploads
CREATE POLICY "Users can upload their own municipal documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'municipal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own municipal documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'municipal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);