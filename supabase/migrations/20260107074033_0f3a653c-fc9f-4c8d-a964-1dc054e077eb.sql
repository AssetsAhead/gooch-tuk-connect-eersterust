
-- =====================================================
-- 1. FILE 13 DRIVER TRANSFER REQUESTS TABLE
-- =====================================================
CREATE TABLE public.file_13_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_name TEXT NOT NULL,
  driver_nickname TEXT,
  driver_photo_url TEXT,
  driver_phone TEXT,
  current_owner_id UUID,
  requesting_owner_id UUID,
  status TEXT NOT NULL DEFAULT 'available',
  reason TEXT,
  notes TEXT,
  posted_by UUID,
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.file_13_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins can view file 13 requests"
ON public.file_13_requests FOR SELECT
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can create file 13 requests"
ON public.file_13_requests FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can update their own requests"
ON public.file_13_requests FOR UPDATE
USING (auth.uid() = posted_by OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete file 13 requests"
ON public.file_13_requests FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_file_13_requests_updated_at
BEFORE UPDATE ON public.file_13_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data for File 13
INSERT INTO public.file_13_requests (driver_name, driver_nickname, driver_photo_url, status, notes)
VALUES 
  ('Courage', NULL, '/lovable-uploads/driver-courage.jpeg', 'available', 'Posted on owner WhatsApp group for File 13 transfer'),
  ('Marcus', 'Pax', '/lovable-uploads/driver-marcus-pax.jpeg', 'available', 'Posted on owner WhatsApp group for File 13 transfer');

-- =====================================================
-- 2. ASSOCIATION EXECUTIVES TABLE
-- =====================================================
CREATE TABLE public.association_executives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  user_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  term_start DATE,
  term_end DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.association_executives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view executives"
ON public.association_executives FOR SELECT
USING (true);

CREATE POLICY "Admins can manage executives"
ON public.association_executives FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_association_executives_updated_at
BEFORE UPDATE ON public.association_executives
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data for Association Executives
INSERT INTO public.association_executives (position, name)
VALUES 
  ('Chair', 'Reece Solomons'),
  ('Deputy Chair', 'Mr Koos'),
  ('Treasurer', 'Roechdeen'),
  ('Secretary', 'Esther'),
  ('Deputy Secretary', 'Esther'),
  ('Disciplinary Officer', 'Avian');

-- =====================================================
-- 3. FLAGGED INDIVIDUALS WATCHLIST TABLE
-- =====================================================
CREATE TABLE public.flagged_individuals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  person_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  flag_level TEXT NOT NULL DEFAULT 'red',
  photo_url TEXT,
  phone TEXT,
  id_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  flagged_by UUID,
  flagged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flagged_individuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and owners can view flagged individuals"
ON public.flagged_individuals FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage flagged individuals"
ON public.flagged_individuals FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_flagged_individuals_updated_at
BEFORE UPDATE ON public.flagged_individuals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data for Flagged Individuals
INSERT INTO public.flagged_individuals (name, person_type, reason, flag_level, notes)
VALUES 
  ('Vernon', 'mechanic', 'Deceptive and bad practices', 'red', 'Known for dishonest dealings - avoid at all costs');
