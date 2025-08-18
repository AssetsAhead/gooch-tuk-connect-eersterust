-- Phase 1: Critical RLS Security Fixes

-- First, create a secure function to check user roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  );
$$;

-- Function to check if current user has admin role
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;

-- Create secure user_roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage user roles - insert" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Only admins can manage user roles - update" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can manage user roles - delete" 
ON public.user_roles 
FOR DELETE 
USING (public.is_current_user_admin());

-- Fix profiles table policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile or admins can view all" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_current_user_admin());

-- Update profiles policy to prevent role changes by non-admins
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger to prevent role changes in profiles by non-admins
CREATE OR REPLACE FUNCTION public.prevent_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow role changes only for admins
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_changes_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_changes();

-- Fix camera_installations policies
DROP POLICY IF EXISTS "Everyone can view camera installations" ON public.camera_installations;

CREATE POLICY "Law enforcement can view camera installations" 
ON public.camera_installations 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR 
       public.has_role(auth.uid(), 'police') OR 
       public.has_role(auth.uid(), 'marshall'));

-- Fix geofence_zones policies  
DROP POLICY IF EXISTS "Everyone can view geofence zones" ON public.geofence_zones;

CREATE POLICY "Law enforcement can view geofence zones" 
ON public.geofence_zones 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR 
       public.has_role(auth.uid(), 'police') OR 
       public.has_role(auth.uid(), 'marshall'));

-- Fix driver_reputation policies
DROP POLICY IF EXISTS "Everyone can view driver reputation" ON public.driver_reputation;

CREATE POLICY "Drivers can view their own reputation and law enforcement can view all" 
ON public.driver_reputation 
FOR SELECT 
USING (auth.uid() = driver_id OR 
       public.has_role(auth.uid(), 'admin') OR 
       public.has_role(auth.uid(), 'police') OR 
       public.has_role(auth.uid(), 'marshall'));

-- Phase 4: Fix existing functions with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.driver_reputation (driver_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$;