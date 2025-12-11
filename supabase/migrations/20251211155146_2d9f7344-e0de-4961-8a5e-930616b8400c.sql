-- Create driver_documents table for license and PDP scans
CREATE TABLE public.driver_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('drivers_license', 'pdp', 'id_document', 'other')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  expiry_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Owners can view documents for their drivers"
ON public.driver_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.assigned_driver_id = driver_documents.driver_id
    AND v.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
  OR driver_documents.driver_id = auth.uid()
);

CREATE POLICY "Owners can upload documents for their drivers"
ON public.driver_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.assigned_driver_id = driver_documents.driver_id
    AND v.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Owners can update documents for their drivers"
ON public.driver_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.assigned_driver_id = driver_documents.driver_id
    AND v.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Owners can delete documents for their drivers"
ON public.driver_documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.assigned_driver_id = driver_documents.driver_id
    AND v.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-documents', 'driver-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload driver documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'driver-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their driver documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'driver-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their driver documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'driver-documents'
  AND auth.uid() IS NOT NULL
);

-- Add trigger for updated_at
CREATE TRIGGER update_driver_documents_updated_at
BEFORE UPDATE ON public.driver_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();