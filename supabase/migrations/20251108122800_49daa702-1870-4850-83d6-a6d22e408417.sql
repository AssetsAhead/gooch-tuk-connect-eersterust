-- Create role_requests table for secure role elevation workflow
CREATE TABLE public.role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL,
  justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_requested_role CHECK (requested_role IN ('driver', 'owner', 'marshall', 'councillor')),
  CONSTRAINT justification_min_length CHECK (char_length(trim(justification)) >= 50),
  CONSTRAINT verification_notes_max_length CHECK (char_length(verification_notes) <= 1000),
  CONSTRAINT one_pending_request_per_role UNIQUE (user_id, requested_role, status)
);

-- Add comment
COMMENT ON TABLE public.role_requests IS 'Role elevation requests. Users request elevated roles (driver, owner, marshall, councillor) which must be approved by admins. Police and admin roles cannot be requested.';

-- Enable RLS
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own role requests
CREATE POLICY "Users can create their own role requests"
ON public.role_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND status = 'pending'
  AND requested_role IN ('driver', 'owner', 'marshall', 'councillor')
);

-- Users can view their own role requests
CREATE POLICY "Users can view their own role requests"
ON public.role_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all role requests
CREATE POLICY "Admins can view all role requests"
ON public.role_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update role requests (approve/reject)
CREATE POLICY "Admins can update role requests"
ON public.role_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_role_requests_updated_at
BEFORE UPDATE ON public.role_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_role_requests_user_id ON public.role_requests(user_id);
CREATE INDEX idx_role_requests_status ON public.role_requests(status);
CREATE INDEX idx_role_requests_created_at ON public.role_requests(created_at DESC);