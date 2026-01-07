-- Create table for storing insurance quotes
CREATE TABLE public.insurance_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_type TEXT NOT NULL,
  vehicle_count INTEGER NOT NULL DEFAULT 1,
  coverage_amount TEXT NOT NULL,
  has_claims_history BOOLEAN NOT NULL DEFAULT false,
  include_passenger_liability BOOLEAN NOT NULL DEFAULT true,
  annual_premium_min NUMERIC NOT NULL,
  annual_premium_max NUMERIC NOT NULL,
  monthly_premium_min NUMERIC NOT NULL,
  monthly_premium_max NUMERIC NOT NULL,
  risk_level TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.insurance_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own insurance quotes" 
ON public.insurance_quotes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insurance quotes" 
ON public.insurance_quotes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance quotes" 
ON public.insurance_quotes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insurance quotes" 
ON public.insurance_quotes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_insurance_quotes_updated_at
BEFORE UPDATE ON public.insurance_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_insurance_quotes_user_id ON public.insurance_quotes(user_id);
CREATE INDEX idx_insurance_quotes_quote_date ON public.insurance_quotes(quote_date DESC);