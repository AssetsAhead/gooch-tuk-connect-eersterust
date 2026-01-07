-- Create table for owner group members/contacts
CREATE TABLE public.owner_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone_number TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.owner_group_members ENABLE ROW LEVEL SECURITY;

-- Allow admins and owners to view
CREATE POLICY "Admins and owners can view group members"
  ON public.owner_group_members
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Allow admins to manage
CREATE POLICY "Admins can manage group members"
  ON public.owner_group_members
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_owner_group_members_updated_at
  BEFORE UPDATE ON public.owner_group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with extracted phone numbers from owner's group
INSERT INTO public.owner_group_members (name, phone_number, role) VALUES
  ('Fila', '+27137329383', 'owner'),
  ('Leolin', '+27858658279', 'owner'),
  ('Oom', '+27168569567', 'owner'),
  ('Reese', '+27677681184', 'owner'),
  ('Robby', '+27237398672', 'owner'),
  ('Vernon', '+27831060579', 'owner'),
  (NULL, '+27091211768', 'owner'),
  (NULL, '+27535641164', 'owner'),
  (NULL, '+27453513262', 'owner'),
  (NULL, '+27419742756', 'owner'),
  (NULL, '+27565315176', 'owner'),
  (NULL, '+27666765279', 'owner'),
  (NULL, '+27771355683', 'owner'),
  (NULL, '+27629240979', 'owner'),
  (NULL, '+27690740561', 'owner'),
  (NULL, '+27763359321', 'owner'),
  (NULL, '+27061818371', 'owner'),
  (NULL, '+27492102775', 'owner'),
  (NULL, '+27480305976', 'owner'),
  (NULL, '+27688067576', 'owner'),
  (NULL, '+27055327379', 'owner'),
  (NULL, '+27098973124', 'owner'),
  (NULL, '+27143981276', 'owner'),
  (NULL, '+27856234827', 'owner'),
  (NULL, '+27566440483', 'owner'),
  (NULL, '+27356615079', 'owner'),
  (NULL, '+27338233722', 'owner'),
  (NULL, '+27246865724', 'owner'),
  (NULL, '+27088900827', 'owner'),
  (NULL, '+27815886974', 'owner'),
  (NULL, '+27170595482', 'owner');