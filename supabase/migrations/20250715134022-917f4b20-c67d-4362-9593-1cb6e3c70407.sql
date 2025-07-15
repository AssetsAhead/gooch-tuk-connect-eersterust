-- Add role field to profiles table for role management
ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'passenger';

-- Create user_roles table for multi-role support
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can manage their own roles" 
ON public.user_roles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Set the admin user role for existing profile
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = '14e66fc2-8a12-4461-9e23-c8b8c157e27d';

-- Insert admin role into user_roles for existing user
INSERT INTO public.user_roles (user_id, role, is_active) 
VALUES ('14e66fc2-8a12-4461-9e23-c8b8c157e27d', 'admin', true);

-- Also add other roles for the admin user for testing
INSERT INTO public.user_roles (user_id, role, is_active) 
VALUES 
  ('14e66fc2-8a12-4461-9e23-c8b8c157e27d', 'driver', false),
  ('14e66fc2-8a12-4461-9e23-c8b8c157e27d', 'owner', false),
  ('14e66fc2-8a12-4461-9e23-c8b8c157e27d', 'passenger', false);