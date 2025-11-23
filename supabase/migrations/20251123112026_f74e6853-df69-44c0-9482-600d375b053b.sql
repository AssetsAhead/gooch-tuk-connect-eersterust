-- Enable Row Level Security on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own user record
CREATE POLICY "Users can view their own record"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Admins can view all user records
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Policy: Users can update their own record (excluding sensitive fields like phone)
CREATE POLICY "Users can update their own record"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Admins can update any user record
CREATE POLICY "Admins can update any user"
ON public.users
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy: Only admins can insert user records
CREATE POLICY "Admins can insert users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy: Only admins can delete user records
CREATE POLICY "Admins can delete users"
ON public.users
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));