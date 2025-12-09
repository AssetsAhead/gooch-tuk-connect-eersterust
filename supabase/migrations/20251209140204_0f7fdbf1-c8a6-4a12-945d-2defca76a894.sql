-- Create regulatory_registrations table to track registration status
CREATE TABLE public.regulatory_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_code text NOT NULL,
  organization_name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started',
  registration_number text,
  submitted_date date,
  approved_date date,
  deadline date,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_code)
);

-- Create regulatory_documents table for document uploads with version tracking
CREATE TABLE public.regulatory_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.regulatory_registrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  file_type text,
  version integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  document_type text,
  notes text,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create deadline_reminders table for tracking reminders
CREATE TABLE public.deadline_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  registration_id uuid REFERENCES public.regulatory_registrations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  deadline_date date NOT NULL,
  reminder_days integer[] DEFAULT '{30, 14, 7, 1}',
  last_reminder_sent timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regulatory_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadline_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for regulatory_registrations
CREATE POLICY "Users can view their own registrations"
  ON public.regulatory_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations"
  ON public.regulatory_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON public.regulatory_registrations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations"
  ON public.regulatory_registrations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON public.regulatory_registrations FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for regulatory_documents
CREATE POLICY "Users can view their own documents"
  ON public.regulatory_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents"
  ON public.regulatory_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.regulatory_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.regulatory_documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all documents"
  ON public.regulatory_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for deadline_reminders
CREATE POLICY "Users can view their own reminders"
  ON public.deadline_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
  ON public.deadline_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON public.deadline_reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON public.deadline_reminders FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reminders"
  ON public.deadline_reminders FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for regulatory documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('regulatory-documents', 'regulatory-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for regulatory-documents bucket
CREATE POLICY "Users can upload their own regulatory documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'regulatory-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own regulatory documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'regulatory-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own regulatory documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'regulatory-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own regulatory documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'regulatory-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can access all regulatory documents"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'regulatory-documents' 
    AND has_role(auth.uid(), 'admin')
  );

-- Update trigger for timestamps
CREATE TRIGGER update_regulatory_registrations_updated_at
  BEFORE UPDATE ON public.regulatory_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deadline_reminders_updated_at
  BEFORE UPDATE ON public.deadline_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();